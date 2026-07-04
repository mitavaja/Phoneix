import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Pickups = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newSlot, setNewSlot] = useState("");
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    try {
      const res = await API.get("/shipments/list");
      const mapped = res.data.map(sh => {
        const addr = sh.pickupAddressId 
          ? `${sh.pickupAddressId.address}, ${sh.pickupAddressId.city}, ${sh.pickupAddressId.state}, ${sh.pickupAddressId.pincode}`
          : sh.from || "No pickup address";
        
        let displayStatus = "Scheduled";
        if (sh.status === "Picked Up" || sh.status === "In Transit" || sh.status === "Delivered") {
          displayStatus = "Picked Up";
        } else if (sh.status === "Pickup Requested" || sh.status === "Pickup Scheduled") {
          displayStatus = "Dispatched";
        } else if (sh.status === "Failed Delivery" || sh.status === "Cancelled") {
          displayStatus = "Exception";
        }

        return {
          id: sh.shipmentId,
          _id: sh._id,
          store: sh.store || "Merchant Store",
          address: addr,
          packages: sh.weight ? Math.ceil(sh.weight) : 1,
          courier: sh.courierName || sh.courier || "BlueDart Express",
          timeSlot: sh.pickupDate ? new Date(sh.pickupDate).toLocaleString() : "Pending Schedule",
          status: displayStatus,
          rider: sh.pickupManifestId ? sh.pickupManifestId : "Not Assigned"
        };
      });
      setPickups(mapped);
    } catch (error) {
      console.error("Failed to fetch pickups list.", error);
      setPickups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleAssignRider = async (id, _id) => {
    const riderName = prompt("Enter courier rider/driver name to assign:", "Rider Michael");
    if (!riderName) return;
    
    try {
      await API.put(`/shipments/${_id}/status`, { 
        status: "Pickup Requested", 
        pickupManifestId: riderName 
      });
      alert(`Success: Assigned pickup cargo sheet ${id} to logistics driver ${riderName}.`);
      fetchPickups();
    } catch (error) {
      alert(`Error assigning rider: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newSlot) {
      alert("Please specify a valid rescheduled date and hour range.");
      return;
    }

    try {
      await API.put(`/shipments/${selectedPickup._id}/status`, { 
        status: "Pickup Scheduled", 
        pickupDate: newSlot 
      });
      alert(`Success: Pickup schedule updated to ${newSlot}.`);
      setIsRescheduling(false);
      setSelectedPickup(null);
      setNewSlot("");
      fetchPickups();
    } catch (error) {
      alert(`Error updating pickup schedule: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredPickups = pickups.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.courier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Logistical Pickup Dispatcher</h1>
          <p className="text-sm text-[#687280]">Schedule courier cargo pickup tickets, delegate fleet drivers, and coordinate bulk package merchant intakes.</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl border border-[#FF6A00]/20 text-[#FF6A00] text-center font-bold text-sm">
          {pickups.filter(p => p.status === "Scheduled" || p.status === "Exception").length} Actions Needed
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Pickup ID, Store, Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {["all", "Scheduled", "Dispatched", "Picked Up", "Exception"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border shrink-0 ${
                statusFilter === status
                  ? "bg-[#FF6A00] text-[#0A1F44] font-bold border-transparent"
                  : "bg-[#E5E7EB]/40 text-[#687280] hover:text-[#0A1F44] border-[#687280]/20"
              }`}
            >
              {status === "all" ? "All Pickup Requests" : status}
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
                <th className="pb-3 font-semibold">TICKET ID</th>
                <th className="pb-3 font-semibold">MERCHANT STORE</th>
                <th className="pb-3 font-semibold">PICKUP ADDRESS</th>
                <th className="pb-3 font-semibold text-center">PACKAGES count</th>
                <th className="pb-3 font-semibold">COURIER SERVICE</th>
                <th className="pb-3 font-semibold">SCHEDULED SLOT</th>
                <th className="pb-3 font-semibold">ASSIGNED RIDER</th>
                <th className="pb-3 font-semibold text-center">STATUS</th>
                <th className="pb-3 font-semibold text-right">DISPATCH OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {filteredPickups.map((p) => (
                <tr key={p.id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                  <td className="py-4 font-mono font-bold text-[#FF6A00]/80 cursor-pointer" onClick={() => setSelectedPickup(p)}>
                    {p.id}
                  </td>
                  <td className="py-4 font-semibold text-[#0A1F44]">{p.store}</td>
                  <td className="py-4 text-[#687280] max-w-xs truncate">{p.address}</td>
                  <td className="py-4 text-center font-mono font-bold">{p.packages} items</td>
                  <td className="py-4 text-[#687280]">{p.courier}</td>
                  <td className="py-4 font-mono text-[10px] text-[#687280]">{p.timeSlot}</td>
                  <td className="py-4 font-semibold text-[#FF6A00]/80">{p.rider}</td>
                  <td className="py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        p.status === "Picked Up"
                          ? "bg-green-100 text-green-600"
                          : p.status === "Dispatched"
                          ? "bg-blue-100 text-blue-600"
                          : p.status === "Scheduled"
                          ? "bg-[#FF6A00]/10 text-[#FF6A00] animate-pulse"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleAssignRider(p.id, p._id)}
                        disabled={p.status === "Picked Up"}
                        className={`p-1 px-2.5 rounded text-[10px] font-bold border transition-colors ${
                          p.status === "Picked Up"
                            ? "bg-gray-700/50 text-gray-500 border-transparent cursor-not-allowed"
                            : "bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 text-[#0A1F44] border-[#687280]/20"
                        }`}
                      >
                        Assign Driver
                      </button>
                      <button
                        onClick={() => { setSelectedPickup(p); setIsRescheduling(true); }}
                        disabled={p.status === "Picked Up"}
                        className={`p-1 px-2.5 rounded text-[10px] font-bold transition-all border ${
                          p.status === "Picked Up"
                            ? "bg-gray-700/50 text-gray-500 border-transparent cursor-not-allowed"
                            : "bg-[#FF6A00]/10 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black border-[#FF6A00]/20 hover:border-transparent shadow-md"
                        }`}
                      >
                        Reschedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPickups.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500 font-semibold">
                    🔍 No scheduled pickups found matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Glass Overlay Modal */}
      {isRescheduling && selectedPickup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Header */}
            <div className="bg-[#0A1F44] px-6 py-4 border-b border-[#687280]/20 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#0A1F44]">Reschedule Logistics Intake</h3>
                <p className="text-[10px] text-[#FF6A00] font-semibold">{selectedPickup.id} ({selectedPickup.store})</p>
              </div>
              <button
                onClick={() => { setIsRescheduling(false); setSelectedPickup(null); }}
                className="text-[#687280] hover:text-[#0A1F44] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="block text-[10px] text-gray-500 font-bold uppercase">Current Logistics Slot</span>
                <span className="font-semibold text-[#0A1F44] font-mono">{selectedPickup.timeSlot}</span>
              </div>

              <div className="space-y-1.5 border-t border-[#687280]/20 pt-3">
                <label className="block text-[#687280] font-semibold">Specify New Pickup Slot *</label>
                <input
                  type="text"
                  placeholder="e.g. May 26, 2026 (10:00 AM - 01:00 PM)"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-mono"
                  required
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#687280]/20 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setIsRescheduling(false); setSelectedPickup(null); }}
                  className="px-4 py-2 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 text-[#0A1F44] font-bold rounded-lg border border-[#687280]/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6A00] hover:bg-orange-500 text-black font-extrabold rounded-lg transition-all"
                >
                  Commit Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pickups;
