import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Delivered = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDelivered = async () => {
      try {
        const res = await API.get("/shipments/delivered");
        setDeliveries(res.data);
      } catch (error) {
        console.warn("Express API delivered shipments unreachable. Using simulated logs.", error.message);
        setDeliveries([
          { _id: "647a3e80f12c9c381a4b9051", shipmentId: "PHX-SH-09380", store: "HoloWear Tech", customer: "Sarah Connor", courier: "Delhivery Air", weight: 1.20, deliveryTime: "3 Days (Fast)", feedback: "⭐⭐⭐⭐⭐ (5/5)", dateDelivered: "2026-05-23T10:00:00Z", podRef: "POD-HW8204" },
          { _id: "647a3e80f12c9c381a4b9056", shipmentId: "PHX-SH-09375", store: "Luxe Couture", customer: "Bruce Wayne", courier: "BlueDart Express", weight: 0.90, deliveryTime: "2 Days (Express)", feedback: "⭐⭐⭐⭐⭐ (5/5)", dateDelivered: "2026-05-22T10:00:00Z", podRef: "POD-LX9102" },
          { _id: "647a3e80f12c9c381a4b9057", shipmentId: "PHX-SH-09370", store: "ElectroSphere", customer: "Nikola Tesla", courier: "Delhivery Air", weight: 2.40, deliveryTime: "4 Days (Normal)", feedback: "⭐⭐⭐⭐ (4/5)", dateDelivered: "2026-05-19T10:00:00Z", podRef: "POD-EL0392" },
          { _id: "647a3e80f12c9c381a4b9058", shipmentId: "PHX-SH-09365", store: "Zara Store Ind", customer: "John Adams", courier: "BlueDart Express", weight: 1.10, deliveryTime: "3 Days (Fast)", feedback: "⭐⭐⭐⭐⭐ (5/5)", dateDelivered: "2026-05-18T10:00:00Z", podRef: "POD-ZR9301" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDelivered();
  }, []);

  const filteredDeliveries = deliveries.filter(d => {
    return d.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) || 
           d.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
           d.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
           d.podRef.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Delivered Shipments Ledger</h1>
          <p className="text-sm text-[#687280]">Roster of compliance-completed deliveries, transit duration speed ratios, and digital proof-of-delivery (POD) audits.</p>
        </div>
        <button
          onClick={() => alert("Downloading global transit analysis sheets...")}
          className="px-4 py-2 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Transit Analysis Reports
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Shipment, Store, POD Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="glass-card px-4 py-2 rounded-xl border border-green-500/20 text-green-600 text-center font-bold text-xs bg-green-500/5">
          {deliveries.length} Packages Dispatched & Closed
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">SHIPMENT ID</th>
                <th className="pb-3 font-semibold">MERCHANT STORE</th>
                <th className="pb-3 font-semibold">CUSTOMER</th>
                <th className="pb-3 font-semibold">COURIER</th>
                <th className="pb-3 font-semibold text-center">CARGO WEIGHT</th>
                <th className="pb-3 font-semibold">TRANSIT SPEED</th>
                <th className="pb-3 font-semibold">POD RECEIPT ID</th>
                <th className="pb-3 font-semibold">DELIVERY DATE</th>
                <th className="pb-3 font-semibold text-right">FEEDBACK RATIO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">
                    Loading delivered bookings ledger...
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((d) => (
                  <tr key={d._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#FF6A00]/80">{d.shipmentId}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{d.store}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{d.customer}</td>
                    <td className="py-4 text-[#687280]">{d.courier}</td>
                    <td className="py-4 text-center font-mono font-bold">{d.weight} kg</td>
                    <td className="py-4">
                      <span className="inline-flex px-2.5 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                        {d.deliveryTime || "3 Days (Fast)"}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-[#FF6A00]/80 cursor-pointer underline" onClick={() => alert(`Opening Proof of Delivery image preview for ${d.podRef || "POD-GENERIC"}...`)}>
                      {d.podRef || "POD-GENERIC"}
                    </td>
                    <td className="py-4 text-[#687280]">{d.dateDelivered ? new Date(d.dateDelivered).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                    <td className="py-4 text-right font-semibold text-[#0A1F44]">{d.feedback || "⭐⭐⭐⭐⭐ (5/5)"}</td>
                  </tr>
                ))
              )}
              {!loading && filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500 font-semibold">
                    🔍 No delivered shipments match that query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Delivered;
