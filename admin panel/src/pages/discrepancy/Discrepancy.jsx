import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Discrepancy = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      const res = await API.get("/shipments/discrepancies/list");
      setDisputes(res.data);
    } catch (error) {
      console.warn("Express API discrepancies list unreachable. Using simulated dispute logs.", error.message);
      setDisputes([
        { _id: "647a3e80f12c9c381a4b9060", shipmentId: "PHX-SH-09381", store: "ElectroSphere", weight: 0.50, scannedWeight: 1.65, deltaCost: 3.70, courier: "BlueDart Express", discrepancyStatus: "Pending", discrepancyDetails: "Declared package as document flyer; Courier scan registered heavy carton." },
        { _id: "647a3e80f12c9c381a4b9061", shipmentId: "PHX-SH-09372", store: "Apex Spares", weight: 2.50, scannedWeight: 3.40, deltaCost: 2.80, courier: "BlueDart Express", discrepancyStatus: "Pending", discrepancyDetails: "Differential due to heavy mechanical packaging material added." },
        { _id: "647a3e80f12c9c381a4b9062", shipmentId: "PHX-SH-09368", store: "Zara Store Ind", weight: 1.00, scannedWeight: 1.10, deltaCost: 0.0, courier: "Delhivery Air", discrepancyStatus: "Approved (Merchant)", discrepancyDetails: "Acceptable volumetric moisture variance within 100 grams." },
        { _id: "647a3e80f12c9c381a4b9063", shipmentId: "PHX-SH-09360", store: "Luxe Couture", weight: 0.50, scannedWeight: 2.10, deltaCost: 8.40, courier: "Delhivery Air", discrepancyStatus: "Approved (Courier)", discrepancyDetails: "Merchant accepted courier weight slab automatically after audit timeout." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id, resolution) => {
    try {
      const backendResolution = resolution === "merchant" ? "reject" : "approve";
      await API.put(`/shipments/${id}/resolve-discrepancy`, { resolution: backendResolution });
      if (resolution === "merchant") {
        alert(`Dispute resolved. Waived weight penalty surcharge for merchant.`);
      } else {
        alert(`Dispute resolved. Confirmed courier dimensions; merchant charged weight penalty surcharge.`);
      }
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error) {
      alert(`Error resolving dispute: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredDisputes = disputes.filter(d => {
    const matchesSearch = d.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.discrepancyDetails && d.discrepancyDetails.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "Pending" && d.discrepancyStatus === "Pending") ||
                          (statusFilter === "Resolved" && d.discrepancyStatus !== "Pending");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Weight Discrepancy Manager</h1>
          <p className="text-sm text-[#687280]">Moderate conflicts between merchant weight declarations and logistical courier weight slab scans. Approve or waive charges.</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl border border-[#FF6A00]/20 text-[#FF6A00] text-center font-bold text-xs">
          {disputes.filter(d => d.discrepancyStatus === "Pending").length} Disputes Pending Audit
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Dispute ID, Shipment, Store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {["all", "Pending", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                statusFilter === status
                  ? "bg-[#FF6A00] text-[#0A1F44] font-bold border-transparent"
                  : "bg-[#E5E7EB]/40 text-[#687280] hover:text-[#0A1F44] border-[#687280]/20"
              }`}
            >
              {status === "all" ? "All Disputes" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">DISPUTE ID</th>
                <th className="pb-3 font-semibold">SHIPMENT ID</th>
                <th className="pb-3 font-semibold">MERCHANT STORE</th>
                <th className="pb-3 font-semibold">COURIER</th>
                <th className="pb-3 font-semibold text-center">DECLARED WEIGHT</th>
                <th className="pb-3 font-semibold text-center">COURIER SCANNED</th>
                <th className="pb-3 font-semibold text-center">PENALTY AMOUNT</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold text-right">COMPLIANCE DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">
                    Loading discrepancy records...
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((d) => (
                  <tr key={d._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#FF6A00]/80 cursor-pointer" onClick={() => setSelectedDispute(d)}>
                      DISP-{d._id.slice(-4).toUpperCase()}
                    </td>
                    <td className="py-4 font-mono text-[#687280]">{d.shipmentId}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{d.store}</td>
                    <td className="py-4 text-[#687280]">{d.courier}</td>
                    <td className="py-4 text-center text-[#687280] font-mono font-semibold">{d.weight} kg</td>
                    <td className="py-4 text-center text-red-600 font-mono font-bold">{d.scannedWeight} kg</td>
                    <td className="py-4 text-center font-mono font-extrabold text-[#FF6A00]/80">${parseFloat(d.deltaCost).toFixed(2)}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          d.discrepancyStatus === "Pending"
                            ? "bg-[#FF6A00]/10 text-[#FF6A00]"
                            : d.discrepancyStatus.includes("Merchant")
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {d.discrepancyStatus}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setSelectedDispute(d)}
                        className="p-1 px-3 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 hover:text-[#0A1F44] rounded text-[10px] font-bold border border-[#687280]/20 transition-all"
                      >
                        Audit Dispute
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredDisputes.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500 font-semibold">
                    🎉 Outstanding! No weight discrepancy disputes require attention.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispute Audit Glass Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Header */}
            <div className="bg-[#0A1F44] px-6 py-4 border-b border-[#687280]/20 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#0A1F44]">Weight Discrepancy Audit</h3>
                <p className="text-[10px] text-[#FF6A00] font-semibold">DISP-{selectedDispute._id.slice(-4).toUpperCase()} ({selectedDispute.shipmentId})</p>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-[#687280] hover:text-[#0A1F44] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Merchant Node</span>
                  <span className="font-semibold text-[#0A1F44]">{selectedDispute.store}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Logistics Courier</span>
                  <span className="font-semibold text-[#0A1F44]">{selectedDispute.courier}</span>
                </div>
              </div>

              {/* Weight Comparison Panel */}
              <div className="p-4 bg-[#E5E7EB] rounded-xl border border-[#687280]/20 grid grid-cols-3 gap-2 items-center text-center font-mono">
                <div>
                  <span className="block text-[9px] text-gray-500 font-bold uppercase">DECLARED</span>
                  <span className="text-sm font-bold text-[#0A1F44]">{selectedDispute.weight} kg</span>
                </div>
                <div className="text-[#FF6A00] text-sm font-bold">VS</div>
                <div>
                  <span className="block text-[9px] text-red-600 font-bold uppercase">COURIER SCAN</span>
                  <span className="text-sm font-bold text-red-600">{selectedDispute.scannedWeight} kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#687280]/20 pt-3">
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Weight Variance</span>
                  <span className="font-semibold text-red-600">
                    +{(parseFloat(selectedDispute.scannedWeight) - parseFloat(selectedDispute.weight)).toFixed(2)} kg
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">differential surcharge</span>
                  <span className="font-extrabold text-[#FF6A00]">${parseFloat(selectedDispute.deltaCost).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-[#687280]/20 pt-3">
                <span className="block text-[10px] text-gray-500 font-bold uppercase">Discrepancy Audit Details</span>
                <p className="text-[#687280] font-semibold mt-1 leading-relaxed">{selectedDispute.discrepancyDetails || "No additional logs provided."}</p>
              </div>

              {/* Simulating image scan validation */}
              <div className="border-t border-[#687280]/20 pt-3 space-y-2">
                <span className="block text-[10px] text-gray-500 font-bold uppercase">Courier Dimension Scans</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-[#E5E7EB]/30 rounded-lg border border-[#687280]/20 text-center text-[10px] text-[#687280]">
                    <span className="block font-bold text-[#0A1F44] mb-1">Declared Dimension</span>
                    15cm x 10cm x 5cm
                  </div>
                  <div className="p-3 bg-[#E5E7EB]/30 rounded-lg border border-[#687280]/20 text-center text-[10px] text-red-600/90">
                    <span className="block font-bold text-[#0A1F44] mb-1">Courier Dimension</span>
                    35cm x 25cm x 15cm
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with compliance resolution controls */}
            <div className="px-6 py-4 bg-[#0A1F44]/50 border-t border-[#687280]/20 flex gap-2">
              {selectedDispute.discrepancyStatus === "Pending" ? (
                <>
                  <button
                    onClick={() => handleResolve(selectedDispute._id, "merchant")}
                    className="flex-1 py-2 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white text-[10px] font-bold rounded-lg border border-green-500/20 hover:border-transparent transition-all"
                  >
                    Accept Merchant (Waive)
                  </button>
                  <button
                    onClick={() => handleResolve(selectedDispute._id, "courier")}
                    className="flex-1 py-2 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 text-[10px] font-bold rounded-lg transition-all"
                  >
                    Accept Courier (Charge)
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="w-full py-2 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 text-[#0A1F44] text-[10px] font-bold rounded-lg border border-[#687280]/20 transition-all"
                >
                  Dismiss Audit Viewer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discrepancy;
