import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Shipments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCountryCode = (s) => {
    if (s.receiverCountry) return s.receiverCountry;
    const toStr = (s.to || "").toUpperCase().trim();
    if (toStr.endsWith("US") || toStr.includes("UNITED STATES") || toStr.includes("NEW YORK") || toStr.includes("MALIBU") || toStr.includes("LOS ANGELES")) return "US";
    if (toStr.endsWith("IN") || toStr.includes("INDIA") || toStr.includes("DELHI") || toStr.includes("MUMBAI")) return "IN";
    if (toStr.endsWith("UK") || toStr.includes("UNITED KINGDOM") || toStr.includes("LONDON")) return "GB";
    if (toStr.endsWith("JP") || toStr.includes("JAPAN") || toStr.includes("TOKYO")) return "JP";
    if (toStr.endsWith("DE") || toStr.includes("GERMANY") || toStr.includes("FRANKFURT")) return "DE";
    return "IN";
  };

  const formatTariff = (chargeVal, s) => {
    const amount = parseFloat(chargeVal || 0);
    const country = getCountryCode(s).toUpperCase().trim();
    const shouldConvert = amount > 15;

    switch (country) {
      case "IN":
      case "INDIA":
        return `₹${amount.toFixed(2)}`;
      case "US":
      case "USA":
      case "UNITED STATES":
        const usdVal = shouldConvert ? amount * 0.012 : amount;
        return `$${usdVal.toFixed(2)}`;
      case "GB":
      case "UK":
      case "UNITED KINGDOM":
        const gbpVal = shouldConvert ? amount * 0.0094 : amount;
        return `£${gbpVal.toFixed(2)}`;
      case "DE":
      case "FR":
      case "IT":
      case "ES":
      case "NL":
      case "BE":
      case "AT":
      case "IE":
      case "GERMANY":
      case "FRANCE":
        const eurVal = shouldConvert ? amount * 0.011 : amount;
        return `€${eurVal.toFixed(2)}`;
      case "CA":
      case "CANADA":
        const cadVal = shouldConvert ? amount * 0.016 : amount;
        return `C$${cadVal.toFixed(2)}`;
      case "AU":
      case "AUSTRALIA":
        const audVal = shouldConvert ? amount * 0.018 : amount;
        return `A$${audVal.toFixed(2)}`;
      case "JP":
      case "JAPAN":
        const jpyVal = shouldConvert ? amount * 1.88 : amount;
        return `¥${jpyVal.toFixed(2)}`;
      default:
        const defVal = shouldConvert ? amount * 0.012 : amount;
        return `$${defVal.toFixed(2)}`;
    }
  };

  const fetchShipments = async () => {
    try {
      const res = await API.get("/shipments/list");
      setShipments(res.data);
    } catch (error) {
      console.warn("Express API shipments list unreachable. Using simulated cargo register.", error.message);
      setShipments([
        { _id: "647a3e80f12c9c381a4b9050", shipmentId: "PHX-SH-09381", store: "ElectroSphere", customer: "John Doe", courier: "BlueDart Express", weight: 0.45, from: "N. Virginia, US", to: "New York, US", charge: 1.50, status: "In Transit", createdAt: "2026-05-24T10:00:00Z" },
        { _id: "647a3e80f12c9c381a4b9051", shipmentId: "PHX-SH-09380", store: "HoloWear Tech", customer: "Sarah Connor", courier: "Delhivery Air", weight: 1.20, from: "Tokyo, JP", to: "Los Angeles, US", charge: 8.64, status: "Delivered", createdAt: "2026-05-23T10:00:00Z" },
        { _id: "647a3e80f12c9c381a4b9052", shipmentId: "PHX-SH-09379", store: "Luxe Couture", customer: "Bruce Wayne", courier: "BlueDart Express", weight: 2.10, from: "Frankfurt, DE", to: "Gotham, US", charge: 15.22, status: "Out for Delivery", createdAt: "2026-05-24T10:00:00Z" },
        { _id: "647a3e80f12c9c381a4b9053", shipmentId: "PHX-SH-09378", store: "Zara Store Ind", customer: "Tony Stark", courier: "Delhivery Air", weight: 0.50, from: "New Delhi, IN", to: "Malibu, US", charge: 4.10, status: "Cancelled", createdAt: "2026-05-21T10:00:00Z" },
        { _id: "647a3e80f12c9c381a4b9054", shipmentId: "PHX-SH-09377", store: "Aura Essentials", customer: "Clark Kent", courier: "BlueDart Express", weight: 0.80, from: "Metropolis, US", to: "Smallville, US", charge: 3.90, status: "Booked", createdAt: "2026-05-25T10:00:00Z" },
        { _id: "647a3e80f12c9c381a4b9055", shipmentId: "PHX-SH-09376", store: "ElectroSphere", customer: "Diana Prince", courier: "Delhivery Air", weight: 1.80, from: "Themyscira", to: "London, UK", charge: 13.80, status: "In Transit", createdAt: "2026-05-22T10:00:00Z" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/shipments/${id}/status`, { status: newStatus });
      alert(`Success: Updated shipment status to ${newStatus.toUpperCase()}.`);
      fetchShipments();
    } catch (error) {
      alert(`Error updating shipment status: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.courier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Global Shipment Control</h1>
          <p className="text-sm text-[#687280]">Track and adjust logistical routing matrices, inspect courier assignments, and manage cargo operational phases.</p>
        </div>
        <button
          onClick={() => alert("Printing cargo manifest lists...")}
          className="px-4 py-2 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Shipping Manifests
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Shipment, Store, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 w-full md:w-auto">
          {["all", "Booked", "In Transit", "Out for Delivery", "Delivered", "Cancelled"].map((status) => (
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
                <th className="pb-3 font-semibold">SHIPMENT ID</th>
                <th className="pb-3 font-semibold">MERCHANT STORE</th>
                <th className="pb-3 font-semibold">CUSTOMER</th>
                <th className="pb-3 font-semibold">LOGISTICS PARTNER</th>
                <th className="pb-3 font-semibold text-center">WEIGHT</th>
                <th className="pb-3 font-semibold text-center">TARIFF</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold text-right">OPERATIONS CONTROL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    Loading logistical bookings list...
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#FF6A00]/80 cursor-pointer" onClick={() => setSelectedShipment(s)}>
                      {s.shipmentId}
                    </td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{s.store}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{s.customer}</td>
                    <td className="py-4 text-[#687280]">{s.courier}</td>
                    <td className="py-4 text-center font-mono font-bold">{s.weight} kg</td>
                    <td className="py-4 text-center font-mono font-semibold text-[#FF6A00]/80">{formatTariff(s.charge, s)}</td>
                    <td className="py-4">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#E5E7EB] border border-[#687280]/20 text-[#0A1F44] cursor-pointer focus:outline-none focus:border-[#FF6A00]/50 ${
                          s.status === "Delivered"
                            ? "text-green-600 border-green-500/20"
                            : s.status === "Cancelled"
                            ? "text-red-600 border-red-500/20"
                            : s.status === "In Transit" || s.status === "Out for Delivery"
                            ? "text-[#FF6A00] border-[#FF6A00]/20"
                            : "text-blue-600 border-blue-500/20"
                        }`}
                      >
                        <option value="Booked" className="bg-[#0A1F44]">Booked</option>
                        <option value="In Transit" className="bg-[#0A1F44]">In Transit</option>
                        <option value="Out for Delivery" className="bg-[#0A1F44]">Out for Delivery</option>
                        <option value="Delivered" className="bg-[#0A1F44]">Delivered</option>
                        <option value="Cancelled" className="bg-[#0A1F44]">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedShipment(s)}
                          className="p-1 px-2.5 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 hover:text-[#0A1F44] rounded text-[10px] font-bold border border-[#687280]/20 transition-all"
                        >
                          Tracking Info
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 font-semibold">
                    🔍 No shipments found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details & Tracking Drawer */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Header */}
            <div className="bg-[#0A1F44] px-6 py-4 border-b border-[#687280]/20 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#0A1F44]">Logistics Routing Sheet</h3>
                <p className="text-[10px] text-[#FF6A00] font-semibold">{selectedShipment.shipmentId}</p>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
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
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Booking Store</span>
                  <span className="font-semibold text-[#0A1F44]">{selectedShipment.store}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Customer Name</span>
                  <span className="font-semibold text-[#0A1F44]">{selectedShipment.customer}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#687280]/20 pt-3">
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Logistics Courier</span>
                  <span className="font-semibold text-[#0A1F44]">{selectedShipment.courier}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Billing Charge</span>
                  <span className="font-bold text-[#FF6A00] font-mono">{formatTariff(selectedShipment.charge, selectedShipment)}</span>
                </div>
              </div>

              <div className="border-t border-[#687280]/20 pt-3">
                <span className="block text-[10px] text-gray-500 font-bold uppercase mb-2">Transit Path Details</span>
                <div className="bg-[#E5E7EB] p-3 rounded-xl border border-[#687280]/20 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#687280]">ORIGIN:</span>
                    <span className="font-semibold text-[#0A1F44] font-mono">{selectedShipment.from}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#687280]">DESTINATION:</span>
                    <span className="font-semibold text-[#0A1F44] font-mono">{selectedShipment.to}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#687280]">BOOKING DATE:</span>
                    <span className="font-semibold text-[#0A1F44] font-mono">{new Date(selectedShipment.createdAt || selectedShipment.dateBooked).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Simple Custom Transit Tracking Steps */}
              <div className="border-t border-[#687280]/20 pt-3 space-y-3">
                <span className="block text-[10px] text-gray-500 font-bold uppercase">Live Delivery Status Steps</span>
                <div className="relative pl-5 space-y-4">
                  {/* Vertical bar */}
                  <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-[#FF6A00]/20"></div>

                  <div className="relative">
                    <span className={`absolute -left-[18px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0D244E] ${selectedShipment.status !== "Cancelled" ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></span>
                    <p className="font-semibold text-[#0A1F44]">Current Status: {selectedShipment.status}</p>
                    <p className="text-[9px] text-gray-500">Last updated recently via Courier Sync APIs</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[18px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#FF6A00] border-2 border-[#0D244E]"></span>
                    <p className="font-semibold text-[#687280]">Carrier Dispatched Manifest</p>
                    <p className="text-[9px] text-gray-500">Manifest details synchronized successfully</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[18px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#FF6A00] border-2 border-[#0D244E]"></span>
                    <p className="font-semibold text-[#687280]">Shipment Booking Confirmed</p>
                    <p className="text-[9px] text-[#687280]">{new Date(selectedShipment.createdAt || selectedShipment.dateBooked).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#0A1F44]/50 border-t border-[#687280]/20 flex gap-2">
              <button
                onClick={() => alert(`Synchronizing telemetry nodes for ${selectedShipment.shipmentId}...`)}
                className="flex-1 py-2 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 text-[#0A1F44] text-[10px] font-bold rounded-lg border border-[#687280]/20 transition-all text-center"
              >
                Sync Courier API
              </button>
              <button
                onClick={() => setSelectedShipment(null)}
                className="flex-1 py-2 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 text-[10px] font-bold rounded-lg transition-all text-center"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;
