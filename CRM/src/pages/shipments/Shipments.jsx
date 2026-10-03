import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Shipments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tracking Sync State
  const [trackingSteps, setTrackingSteps] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const fetchShipments = async () => {
    try {
      const res = await API.get("/shipments/admin/list");
      setShipments(res.data || []);
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Sync Live Tracking from Aramex
  const handleSyncTracking = async (shId, courierTrackingNumber) => {
    if (!courierTrackingNumber) {
      alert("No AWB assigned to this shipment yet.");
      return;
    }
    setSyncing(true);
    try {
      const res = await API.get(`/tracking/${courierTrackingNumber}`);
      setTrackingSteps(res.data.trackingSteps || []);
      fetchShipments(); // Refresh list to catch any new status updates from Aramex
    } catch (error) {
      alert("Failed to synchronize live tracking data.");
    } finally {
      setSyncing(false);
    }
  };

  // Open the drawer and automatically fetch tracking
  const handleOpenDrawer = (shipment) => {
    setSelectedShipment(shipment);
    setTrackingSteps(shipment.statusHistory || []);
    if (shipment.courierTrackingNumber) {
      handleSyncTracking(shipment._id, shipment.courierTrackingNumber);
    }
  };

  const filteredShipments = shipments.filter(s => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
        (s.shipmentId || "").toLowerCase().includes(searchString) ||
        (s.courierTrackingNumber || "").toLowerCase().includes(searchString) ||
        (s.store || "").toLowerCase().includes(searchString) ||
        (s.customer || "").toLowerCase().includes(searchString);

    const matchesStatus = statusFilter === "all" || (s.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Helper to colorize status badges
  const getStatusBadgeColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return "bg-green-100 text-green-700 border-green-200";
    if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200";
    if (s === "in transit" || s === "out for delivery") return "bg-orange-100 text-orange-700 border-orange-200";
    if (s === "pickup scheduled") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-blue-100 text-blue-700 border-blue-200"; // Booked / Draft
  };

  return (
      <div className="space-y-8 select-none">
        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Global Shipment Control</h1>
            <p className="text-sm text-[#687280]">Administer logistical routing, inspect profit margins, and manage courier AWBs.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
                type="text"
                placeholder="Search AWB, Shipment ID, Store..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 w-full md:w-auto">
            {["all", "Booked", "Pickup Scheduled", "In Transit", "Delivered", "Cancelled"].map((status) => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shrink-0 ${
                        statusFilter === status
                            ? "bg-[#FF6A00] text-[#0A1F44] font-bold border-transparent"
                            : "bg-[#E5E7EB]/40 text-[#687280] hover:text-[#0A1F44] border-[#687280]/20"
                    }`}
                >
                  {status === "all" ? "All Shipments" : status}
                </button>
            ))}
          </div>
        </div>

        {/* Main Table */}
        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">SHIPMENT ID / AWB</th>
                <th className="pb-3 font-semibold">MERCHANT STORE</th>
                <th className="pb-3 font-semibold">DESTINATION</th>
                <th className="pb-3 font-semibold text-center">WEIGHT</th>
                <th className="pb-3 font-semibold text-right">ARAMEX COST</th>
                <th className="pb-3 font-semibold text-right">OUR MARGIN</th>
                <th className="pb-3 font-semibold text-right">SELLER BILLED</th>
                <th className="pb-3 font-semibold text-center">STATUS</th>
                <th className="pb-3 font-semibold text-center">ACTIONS</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-gray-500">Loading logistical bookings list...</td>
                  </tr>
              ) : (
                  filteredShipments.map((s) => (
                      <tr key={s._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                        <td className="py-4 cursor-pointer" onClick={() => handleOpenDrawer(s)}>
                          <span className="font-mono font-bold text-[#FF6A00]/80 block">{s.shipmentId}</span>
                          <span className="font-mono text-[10px] text-gray-500 block">AWB: {s.courierTrackingNumber || "Pending"}</span>
                        </td>
                        <td className="py-4 font-semibold text-[#0A1F44]">{s.store}</td>
                        <td className="py-4 text-[#0A1F44]">{s.receiverCountry}</td>
                        <td className="py-4 text-center font-mono font-bold">{s.weight} kg</td>

                        <td className="py-4 text-right font-mono font-semibold text-red-500">₹{s.aramexBaseCost?.toFixed(2) || "0.00"}</td>
                        <td className="py-4 text-right font-mono font-bold text-green-600">₹{s.marginAmount?.toFixed(2) || "0.00"}</td>
                        <td className="py-4 text-right font-mono font-semibold text-[#0A1F44]">₹{s.invoiceTotal?.toFixed(2) || "0.00"}</td>

                        {/* Read-Only Status Badge */}
                        <td className="py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${getStatusBadgeColor(s.status)}`}>
                            {s.status}
                          </span>
                        </td>

                        <td className="py-4 text-center">
                          <button
                              onClick={() => handleOpenDrawer(s)}
                              className="p-1.5 px-3 bg-[#0A1F44] hover:bg-[#FF6A00] text-white rounded text-[10px] font-bold transition-all"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                  ))
              )}
              {filteredShipments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-gray-500 font-semibold">🔍 No shipments found.</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipment Details & Tracking Drawer (Centered Modal) */}
        {selectedShipment && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="bg-[#0A1F44] px-6 py-5 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Admin Inspection</h3>
                    <p className="text-[11px] text-[#FF6A00] font-mono mt-1">ID: {selectedShipment.shipmentId} | AWB: {selectedShipment.courierTrackingNumber || "N/A"}</p>
                  </div>
                  <button onClick={() => setSelectedShipment(null)} className="text-white/50 hover:text-white transition">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                  {/* Financials Block */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Financial Ledger</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-600">Aramex Base Cost:</span>
                        <span className="font-mono text-red-600 font-semibold">₹{selectedShipment.aramexBaseCost?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-600">Profit Margin:</span>
                        <span className="font-mono text-green-600 font-bold">₹{selectedShipment.marginAmount?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-600">GST (18%):</span>
                        <span className="font-mono text-gray-800">₹{selectedShipment.gstAmount?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1 bg-[#0A1F44]/5 px-1">
                        <span className="font-bold text-[#0A1F44]">Billed to Seller:</span>
                        <span className="font-mono text-[#0A1F44] font-bold">₹{selectedShipment.invoiceTotal?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Package Specs */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Package Specifications</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <div><span className="text-gray-500">Declared Weight:</span> <span className="font-bold">{selectedShipment.weight} kg</span></div>
                      <div><span className="text-gray-500">Volumetric:</span> <span className="font-bold">{selectedShipment.volumetricWeight} kg</span></div>
                      <div><span className="text-gray-500">Product Group:</span> <span className="font-bold">{selectedShipment.productGroup}</span></div>
                      <div><span className="text-gray-500">Service Type:</span> <span className="font-bold">{selectedShipment.productType}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Customs Value:</span> <span className="font-bold">{selectedShipment.shipmentValue} {selectedShipment.currency}</span></div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Tracking Timeline</h4>
                      <button
                          onClick={() => handleSyncTracking(selectedShipment._id, selectedShipment.courierTrackingNumber)}
                          disabled={syncing || !selectedShipment.courierTrackingNumber}
                          className="text-[10px] bg-[#FF6A00]/10 text-[#FF6A00] px-2 py-1 rounded font-bold hover:bg-[#FF6A00] hover:text-white transition disabled:opacity-50"
                      >
                        {syncing ? "Syncing..." : "Force Sync API"}
                      </button>
                    </div>

                    <div className="relative pl-4 space-y-4">
                      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                      {trackingSteps.length > 0 ? (
                          trackingSteps.map((step, idx) => (
                              <div key={idx} className="relative text-xs">
                                <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 bg-[#FF6A00] rounded-full border-2 border-white"></div>
                                <p className="font-bold text-[#0A1F44]">{step.status} <span className="text-gray-500 font-normal ml-1">{step.location ? `(${step.location})` : ""}</span></p>
                                <p className="text-gray-500 text-[10px] mt-0.5">{step.description}</p>
                                <p className="text-[9px] text-gray-400 font-mono mt-0.5">{new Date(step.eventTime || step.time).toLocaleString()}</p>
                              </div>
                          ))
                      ) : (
                          <p className="text-xs text-gray-500 italic">No tracking events found in database.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default Shipments;