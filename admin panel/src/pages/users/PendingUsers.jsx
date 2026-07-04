import React, { useState, useEffect } from "react";
import API from "../../services/api";

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal details state (shares details dashboard modal with AllUsers)
  const [selectedUser, setSelectedUser] = useState(null);
  const [orderBook, setOrderBook] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const fetchPendingUsers = async () => {
    try {
      const res = await API.get("/users/pending");
      setUsers(res.data);
    } catch (error) {
      console.warn("Express API pending users list unreachable. Using simulated fallback data.", error.message);
      setUsers([
        {
          _id: "pending_usr_1",
          name: "George Washington",
          email: "george@mountvernon.us",
          role: "Seller",
          companyName: "Mount Vernon Trade",
          mobileNumber: "9876543210",
          gstType: "Non-GST",
          createdAt: "2026-06-25T10:00:00Z",
          wallet: { availableBalance: 0, totalBalance: 0, holdBalance: 0 },
          orders: { total: 0, delivered: 0, pending: 0 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleOpenDetails = async (user) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    setOrderBook([]);
    try {
      const res = await API.get(`/users/${user._id}/order-book`);
      setOrderBook(res.data);
    } catch (error) {
      console.error("Failed to load user order book", error.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAction = async (id, name, isApproved) => {
    const nextStatus = isApproved ? "Active" : "Blocked";
    if (!isApproved) {
      const reason = prompt(`Provide rejection reason for ${name}:`, "Business description too vague.");
      if (!reason) return;
    }

    try {
      await API.put(`/users/${id}/status`, { status: nextStatus });
      alert(`Success: Account registration for ${name} has been ${isApproved ? "Approved" : "Rejected"}.`);
      fetchPendingUsers();
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(null);
      }
    } catch (error) {
      alert(`Error updating user status: ${error.response?.data?.message || error.message}`);
    }
  };

  const downloadInvoice = async (shipmentId, invoiceNumber) => {
    try {
      const res = await API.get(`/shipments/${shipmentId}/invoice`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${invoiceNumber || shipmentId}.pdf`;
      link.click();
    } catch (error) {
      alert("Failed to download PDF invoice file");
    }
  };

  const filteredOrders = orderBook.filter(o => {
    const matchesSearch = 
      (o.shipmentId && o.shipmentId.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.customer && o.customer.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.courierTrackingNumber && o.courierTrackingNumber.toLowerCase().includes(orderSearch.toLowerCase()));
    
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Pending Registration Approvals</h1>
          <p className="text-sm text-[#687280]">Review newly registered platform merchants, authorize privileges, or decline applications.</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl border border-[#FF6A00]/20 text-[#FF6A00] text-center font-bold text-sm">
          {users.length} Pending
        </div>
      </div>

      {/* Queue Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl bg-white">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">TICKET ID</th>
                <th className="pb-3 font-semibold">FULL NAME</th>
                <th className="pb-3 font-semibold">EMAIL</th>
                <th className="pb-3 font-semibold">REQUESTED ROLE</th>
                <th className="pb-3 font-semibold">STORE DETAILS</th>
                <th className="pb-3 font-semibold">WALLET BALANCE</th>
                <th className="pb-3 font-semibold">ORDERS (DEL/ALL)</th>
                <th className="pb-3 font-semibold">REGISTERED DATE</th>
                <th className="pb-3 font-semibold text-right">OPERATIONAL DECISIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">
                    Loading pending users queue...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#FF6A00]/80">USR-{u._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4">
                      <div className="font-semibold text-[#0A1F44] hover:underline cursor-pointer" onClick={() => handleOpenDetails(u)}>{u.name}</div>
                    </td>
                    <td className="py-4 font-mono text-[#687280]">{u.email}</td>
                    <td className="py-4 font-semibold">{u.role}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">
                      <div>{u.companyName || u.name}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{u.mobileNumber || "No Phone"} ({u.gstType || "Non-GST"})</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-[#0A1F44]">₹{(u.wallet?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td className="py-4">
                      <button 
                        onClick={() => handleOpenDetails(u)}
                        className="px-2.5 py-1 rounded bg-[#FF6A00]/5 hover:bg-[#FF6A00]/10 text-[#FF6A00] font-bold transition-all border border-[#FF6A00]/10 flex items-center gap-1"
                      >
                        <span>{u.orders?.delivered ?? 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500 font-semibold">{u.orders?.total ?? 0}</span>
                      </button>
                    </td>
                    <td className="py-4 text-[#687280]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(u)}
                          className="p-1 px-2.5 bg-[#0A1F44]/5 hover:bg-[#0A1F44] text-[#0A1F44] hover:text-white rounded text-[10px] font-bold border border-[#0A1F44]/10 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleAction(u._id, u.name, false)}
                          className="p-1 px-3 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded text-[10px] font-bold border border-red-500/20 hover:border-transparent transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(u._id, u.name, true)}
                          className="p-1 px-3 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 rounded text-[10px] font-bold transition-all shadow-md"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500 font-semibold">
                    🎉 Outstanding! No pending registration approvals in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details & Order Book Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0A1F44] text-white flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span>Merchant Workspace:</span>
                  <span className="text-[#FF6A00]">{selectedUser.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white uppercase tracking-wider font-semibold">{selectedUser.role}</span>
                </h2>
                <p className="text-[11px] text-gray-300 font-mono mt-0.5">UID: {selectedUser._id}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content Wrapper */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile & Wallet Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Profile */}
                <div className="md:col-span-1 border border-gray-200/80 rounded-xl p-4 bg-gray-50/50 space-y-3">
                  <h3 className="text-xs font-bold text-[#0A1F44] border-b pb-2 uppercase tracking-wide">Registry Details</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-400 block">Email Address</span>
                      <span className="font-semibold text-gray-700 font-mono">{selectedUser.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Contact Phone</span>
                      <span className="font-semibold text-gray-700">{selectedUser.mobileNumber || "N/A"}</span>
                    </div>
                    {selectedUser.companyName && (
                      <div>
                        <span className="text-gray-400 block font-semibold text-gray-700">Company Name</span>
                        <span className="font-semibold text-gray-700">{selectedUser.companyName}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 block">GST Designation</span>
                      <span className="font-semibold text-gray-700">{selectedUser.gstType || "Non-GST"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Registered On</span>
                      <span className="font-semibold text-gray-700">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Balance Cards */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-green-200/80 rounded-xl p-4 bg-green-50/20 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Available Balance</span>
                      <h4 className="text-2xl font-black text-green-700 mt-2">
                        ₹{(selectedUser.wallet?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h4>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4">Instantly deployable for bookings</p>
                  </div>

                  <div className="border border-orange-200/80 rounded-xl p-4 bg-orange-50/20 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Funds On Hold</span>
                      <h4 className="text-2xl font-black text-orange-700 mt-2">
                        ₹{(selectedUser.wallet?.holdBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h4>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4">Locked in draft / pending shipments</p>
                  </div>

                  <div className="border border-blue-200/80 rounded-xl p-4 bg-blue-50/20 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Cumulative Balance</span>
                      <h4 className="text-2xl font-black text-blue-700 mt-2">
                        ₹{(selectedUser.wallet?.totalBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h4>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4">Total historical net ledger</p>
                  </div>
                </div>
              </div>

              {/* Order Book Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#0A1F44] uppercase tracking-wide">Live Order Book</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Telemetry log of shipments processed by this user account.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <input 
                      type="text"
                      placeholder="Search ID, customer, AWB..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 focus:outline-none rounded w-full sm:w-48 text-[#0A1F44]"
                    />

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none text-[#0A1F44]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Booked">Booked</option>
                      <option value="Label Generated">Label Generated</option>
                      <option value="Pickup Scheduled">Pickup Scheduled</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                        <th className="p-3 font-semibold">SHIPMENT ID</th>
                        <th className="p-3 font-semibold">CUSTOMER</th>
                        <th className="p-3 font-semibold">ROUTE</th>
                        <th className="p-3 font-semibold">CARRIER / AWB</th>
                        <th className="p-3 font-semibold">CHARGEABLE WT</th>
                        <th className="p-3 font-semibold">COST (WITH GST)</th>
                        <th className="p-3 font-semibold">STATUS</th>
                        <th className="p-3 font-semibold text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      {loadingOrders ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-gray-400">
                            Retrieving order book logs...
                          </td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-gray-400">
                            No shipments found matching the filters.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => (
                          <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 font-mono font-bold text-[#FF6A00]">{order.shipmentId}</td>
                            <td className="p-3">
                              <span className="font-semibold text-gray-800">{order.customer}</span>
                            </td>
                            <td className="p-3 text-[11px]">
                              <div>{order.to}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-gray-800">{order.courierName}</div>
                              {order.courierTrackingNumber ? (
                                <div className="font-mono text-[10px] text-gray-400">{order.courierTrackingNumber}</div>
                              ) : (
                                <div className="text-[10px] text-amber-600 font-medium">No AWB Assigned</div>
                              )}
                            </td>
                            <td className="p-3 font-medium">{order.chargeableWeight} kg</td>
                            <td className="p-3">
                              <div className="font-bold text-gray-800">₹{order.invoiceTotal?.toFixed(2)}</div>
                              <div className="text-[9px] text-gray-400">Tax: ₹{order.gstAmount?.toFixed(2)}</div>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                order.status === "Delivered"
                                  ? "bg-green-50 text-green-600 border border-green-200"
                                  : order.status === "Cancelled"
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : "bg-orange-50 text-orange-600 border border-orange-200"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {order.status !== "Draft" && (
                                <button 
                                  onClick={() => downloadInvoice(order._id, order.invoiceNumber)}
                                  className="px-2 py-1 text-[10px] font-bold text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white rounded border border-[#0A1F44]/20 transition-all"
                                >
                                  Invoice
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-5 py-1.5 bg-[#0A1F44] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Close Workstation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingUsers;
