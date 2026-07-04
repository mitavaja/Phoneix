import React, { useState, useEffect } from "react";
import API from "../../services/api";

const AllUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [orderBook, setOrderBook] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Express API user registry unreachable.", error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const handleBlockToggle = async (id, name, currentStatus, role) => {
    if (role === "Admin" && currentStatus === "Active") {
      alert("Security Lock: Administrator accounts cannot be suspended.");
      return;
    }
    const nextStatus = currentStatus === "Active" ? "Blocked" : "Active";
    try {
      await API.put(`/users/${id}/status`, { status: nextStatus });
      alert(`Account ${name} status updated to ${nextStatus.toUpperCase()}`);
      fetchUsers();
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (error) {
      alert(`Error updating account status: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditRole = async (id, name, currentRole) => {
    const nextRole = prompt(`Modify system authorization role for ${name} (Buyer, Seller, Moderator, Admin):`, currentRole);
    if (!nextRole) return;
    if (!["Buyer", "Seller", "Moderator", "Admin"].includes(nextRole)) {
      alert("Invalid role selected. Must be Buyer, Seller, Moderator, or Admin.");
      return;
    }

    try {
      await API.put(`/users/${id}/role`, { role: nextRole });
      alert(`Role for ${name} successfully changed to ${nextRole}`);
      fetchUsers();
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(prev => prev ? { ...prev, role: nextRole } : null);
      }
    } catch (error) {
      alert(`Error updating user role: ${error.response?.data?.message || error.message}`);
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

  const filteredUsers = users.filter(u => {
    const nameMatch = u.name ? u.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesSearch = nameMatch || emailMatch;
    const matchesRole = roleFilter === "all" || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

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
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">System User Directory</h1>
        <p className="text-sm text-[#687280]">View and manage roles, status indicators, balances, and complete order books for all registered users.</p>
      </div>

      {/* Filter Options */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search name, email, credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Roles Filter */}
        <div className="flex gap-2">
          {["all", "Seller", "Buyer", "Moderator", "Admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                roleFilter === role
                  ? "bg-[#FF6A00] text-[#0A1F44] font-bold border-transparent"
                  : "bg-[#E5E7EB]/40 text-[#687280] hover:text-[#0A1F44] border-[#687280]/20"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl bg-white">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">USER ID</th>
                <th className="pb-3 font-semibold">FULL NAME</th>
                <th className="pb-3 font-semibold">EMAIL</th>
                <th className="pb-3 font-semibold">SYSTEM ROLE</th>
                <th className="pb-3 font-semibold">WALLET BALANCE</th>
                <th className="pb-3 font-semibold">ORDERS (DEL/ALL)</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold text-right">ADMIN OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    Loading accounts from database...
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#FF6A00]/80">USR-{user._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4">
                      <div className="font-semibold text-[#0A1F44] hover:underline cursor-pointer" onClick={() => handleOpenDetails(user)}>{user.name}</div>
                      {user.companyName && <div className="text-[10px] text-gray-500 font-medium">{user.companyName}</div>}
                    </td>
                    <td className="py-4 font-mono text-[#687280]">{user.email}</td>
                    <td className="py-4 font-semibold">{user.role}</td>
                    <td className="py-4">
                      <div className="font-bold text-[#0A1F44]">₹{(user.wallet?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-[9px] text-[#687280]">Total: ₹{(user.wallet?.totalBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </td>
                    <td className="py-4">
                      <button 
                        onClick={() => handleOpenDetails(user)}
                        className="px-2.5 py-1 rounded bg-[#FF6A00]/5 hover:bg-[#FF6A00]/10 text-[#FF6A00] font-bold transition-all border border-[#FF6A00]/10 flex items-center gap-1.5"
                      >
                        <span className="text-[11px]">{user.orders?.delivered ?? 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-[11px] font-semibold text-gray-500">{user.orders?.total ?? 0}</span>
                      </button>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-600"
                            : user.status === "Pending"
                            ? "bg-[#FF6A00]/10 text-[#FF6A00]"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(user)}
                          className="p-1 px-2.5 bg-[#0A1F44]/5 hover:bg-[#0A1F44] text-[#0A1F44] hover:text-white rounded text-[10px] font-bold border border-[#0A1F44]/10 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleEditRole(user._id, user.name, user.role)}
                          className="p-1 px-2.5 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 hover:text-[#0A1F44] rounded text-[10px] font-bold border border-[#687280]/20 transition-colors"
                        >
                          Role
                        </button>
                        <button
                          onClick={() => handleBlockToggle(user._id, user.name, user.status, user.role)}
                          className={`p-1 px-2.5 rounded text-[10px] font-bold transition-all border ${
                            user.status === "Active"
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-500/10 hover:border-transparent"
                              : "bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-500/10 hover:border-transparent"
                          }`}
                        >
                          {user.status === "Active" ? "Block" : "Unblock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                        <span className="text-gray-400 block">Company Name</span>
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
                    {/* Search inside order book */}
                    <input 
                      type="text"
                      placeholder="Search ID, customer, AWB..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 focus:outline-none rounded w-full sm:w-48 text-[#0A1F44]"
                    />

                    {/* Filter inside order book */}
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

export default AllUsers;
