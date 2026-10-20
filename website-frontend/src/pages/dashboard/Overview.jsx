import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Wallet, Package, Bell, ArrowRight } from "lucide-react";

const Overview = () => {
    const { user, wallet } = useOutletContext();
    const navigate = useNavigate();
    const [shipments, setShipments] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const [shipRes, notifRes] = await Promise.all([
                    API.get("/shipments/list"),
                    API.get("/notifications")
                ]);
                setShipments(shipRes.data?.shipments || []);
                setNotifications(notifRes.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOverview();
    }, []);

    const handleMarkNotificationRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {}
    };

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "delivered") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">Delivered</span>;
        }
        if (s === "cancelled" || s === "hold" || s === "hold shipment") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Hold Shipment</span>;
        }
        if (s === "in transit" || s === "out for delivery") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">In Transit</span>;
        }
        if (s === "pickup scheduled" || s === "pickup requested") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">Pickup Scheduled</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">{status || "Booked"}</span>;
    };

    return (
        <div className="space-y-8 select-none">
            {/* Title & Subtitle matching CRM */}
            <div>
                <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Merchant Operations Overview</h1>
                <p className="text-sm text-[#687280]">Live logistics activity, wallet reserve breakdown, and manifest notifications.</p>
            </div>

            {/* Top Row Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Balance Split Card */}
                <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all flex flex-col justify-between">
                    <div className="absolute right-4 bottom-4 opacity-5 text-[#FF6A00] group-hover:scale-110 transition duration-500 pointer-events-none">
                        <Wallet size={120} />
                    </div>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-[#687280] uppercase tracking-wide">Store Wallet Ledger</span>
                            <div className="p-2 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00]">
                                <Wallet size={18} />
                            </div>
                        </div>
                        <span className="text-xs text-[#687280] block">Available Booking Balance</span>
                        <h3 className="text-3xl font-black text-[#0A1F44] mt-1">₹{wallet ? wallet.availableBalance.toFixed(2) : "0.00"}</h3>

                        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#687280]/15">
                            <div className="bg-[#E5E7EB]/40 p-2.5 rounded-xl border border-[#687280]/10">
                                <span className="text-[10px] text-[#687280] block font-semibold">Reserved Holds</span>
                                <span className="text-xs font-bold text-amber-600">₹{wallet ? wallet.holdBalance.toFixed(2) : "0.00"}</span>
                            </div>
                            <div className="bg-[#E5E7EB]/40 p-2.5 rounded-xl border border-[#687280]/10">
                                <span className="text-[10px] text-[#687280] block font-semibold">Total Ledger</span>
                                <span className="text-xs font-bold text-[#0A1F44]">₹{wallet ? wallet.totalBalance.toFixed(2) : "0.00"}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/wallet")}
                        className="w-full mt-5 bg-[#0A1F44] hover:bg-[#FF6A00] text-white font-bold py-2.5 rounded-xl text-xs transition duration-300 shadow-sm"
                    >
                        Top Up Wallet Balance
                    </button>
                </div>

                {/* Total Shipments */}
                <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all flex flex-col justify-between">
                    <div className="absolute right-4 bottom-4 opacity-5 text-blue-600 group-hover:scale-110 transition duration-500 pointer-events-none">
                        <Package size={120} />
                    </div>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-[#687280] uppercase tracking-wide">Total Manifest Shipments</span>
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <Package size={18} />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-blue-600 mt-1">{shipments.length}</h3>
                        <p className="text-xs text-[#687280] mt-2">Overall parcels booked on Phoenix Node.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#687280]/15">
                        <div className="bg-[#E5E7EB]/40 p-2.5 rounded-xl border border-[#687280]/10">
                            <span className="text-[10px] text-[#687280] block font-semibold">Delivered</span>
                            <span className="text-xs font-bold text-green-600">{shipments.filter(s => s.status === "Delivered").length}</span>
                        </div>
                        <div className="bg-[#E5E7EB]/40 p-2.5 rounded-xl border border-[#687280]/10">
                            <span className="text-[10px] text-[#687280] block font-semibold">Transit Dispatch</span>
                            <span className="text-xs font-bold text-[#FF6A00]">
                                {shipments.filter(s => ["Booked", "In Transit", "Pickup Scheduled"].includes(s.status)).length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Merchant Details */}
                <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-all">
                    <div>
                        <span className="text-xs font-semibold text-[#687280] uppercase tracking-wide block mb-3">Merchant Profile</span>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-[#687280]/10">
                                <span className="text-[#687280]">Account Owner:</span>
                                <span className="font-bold text-[#0A1F44]">{user?.name}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-[#687280]/10">
                                <span className="text-[#687280]">Mobile Contact:</span>
                                <span className="font-bold text-[#0A1F44]">{user?.mobileNumber || "N/A"}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-[#687280]/10">
                                <span className="text-[#687280]">GST Filing Type:</span>
                                <span className="font-bold text-[#0A1F44]">{user?.gstType || "Registered"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-[#687280]/15 pt-3 mt-4 flex items-center justify-between text-xs">
                        <span className="text-[#687280] font-medium">Compliance Verification:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            user?.status === "Active" 
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : "bg-orange-100 text-orange-700 border-orange-200"
                        }`}>
                            {user?.status || "Active"}
                        </span>
                    </div>
                </div>

            </div>

            {/* Second Row: Latest Shipments & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Latest Shipments List */}
                <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[#687280]/15">
                        <h3 className="text-base font-bold text-[#0A1F44] flex items-center gap-2">
                            <Package size={18} className="text-[#FF6A00]" /> Recent Bookings
                        </h3>
                        <button 
                            onClick={() => navigate("/dashboard/shipments")} 
                            className="text-xs text-[#FF6A00] hover:text-[#0A1F44] font-bold transition flex items-center gap-1"
                        >
                            View All Shipments <ArrowRight size={13} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {shipments.slice(0, 5).map(sh => (
                            <div 
                                key={sh._id} 
                                onClick={() => navigate("/dashboard/shipments")}
                                className="bg-[#E5E7EB]/30 hover:bg-[#E5E7EB]/60 border border-[#687280]/15 hover:border-[#FF6A00]/40 rounded-xl p-4 flex justify-between items-center transition cursor-pointer"
                            >
                                <div>
                                    <span className="font-semibold font-mono text-[#FF6A00] block text-xs">{sh.shipmentId}</span>
                                    <span className="text-[11px] text-[#687280] block mt-0.5 font-medium">{sh.customer} | {sh.to}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-extrabold block text-sm text-[#0A1F44]">₹{sh.invoiceTotal?.toFixed(2)}</span>
                                    <span className="block mt-1">{getStatusBadge(sh.status)}</span>
                                </div>
                            </div>
                        ))}
                        {shipments.length === 0 && (
                            <p className="text-[#687280] text-center py-8 text-xs font-semibold">No shipments booked yet.</p>
                        )}
                    </div>
                </div>

                {/* Notifications Center Panel */}
                <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 pb-3 border-b border-[#687280]/15 mb-4">
                            <Bell size={18} className="text-[#FF6A00]" />
                            <h3 className="text-base font-bold text-[#0A1F44]">Alerts Center</h3>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {notifications.filter(n => !n.isRead).slice(0, 5).map(n => (
                                <div key={n._id} className="bg-[#E5E7EB]/40 border border-[#687280]/15 rounded-xl p-3 space-y-1 relative">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-[#0A1F44]">{n.title}</span>
                                        <button 
                                            onClick={() => handleMarkNotificationRead(n._id)} 
                                            className="text-[10px] text-[#FF6A00] hover:text-[#0A1F44] font-semibold"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-[#687280] leading-relaxed">{n.message}</p>
                                    <span className="text-[9px] text-gray-500 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {notifications.filter(n => !n.isRead).length === 0 && (
                                <p className="text-[#687280] text-center py-10 text-xs font-medium">No unread notifications.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Overview;