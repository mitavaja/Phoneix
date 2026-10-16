import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Wallet, Package, Bell } from "lucide-react";

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
        switch (status) {
            case "Booked":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20">Booked</span>;
            case "Pickup Scheduled":
            case "Pickup Requested":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">Pickup Scheduled</span>;
            case "Picked Up":
            case "In Transit":
            case "Out For Delivery":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">In Transit</span>;
            case "Delivered":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">Delivered</span>;
            case "Cancelled":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">Cancelled</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">{status}</span>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Row Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Balance Split Card */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute right-4 bottom-4 opacity-5 text-[#FF6A00] group-hover:scale-110 transition duration-500">
                        <Wallet size={120} />
                    </div>
                    <span className="text-xs text-[#687280] uppercase tracking-widest font-semibold block mb-1">Store Wallet Ledger</span>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-[#687280] block">Available Booking Balance</span>
                            <h3 className="text-3xl font-black text-[#FF6A00]">₹{wallet ? wallet.availableBalance.toFixed(2) : "0.00"}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-[#687280]/20 pt-3">
                            <div>
                                <span className="text-[10px] text-gray-500 block">Reserved Holds</span>
                                <span className="text-xs font-bold text-amber-500">₹{wallet ? wallet.holdBalance.toFixed(2) : "0.00"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 block">Total Ledger balance</span>
                                <span className="text-xs font-bold text-gray-400">₹{wallet ? wallet.totalBalance.toFixed(2) : "0.00"}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/wallet")}
                        className="w-full mt-4 bg-white/5 border border-white/10 text-white font-bold py-2 rounded-xl text-xs hover:bg-[#FF6A00] hover:text-white transition"
                    >
                        Top Up Balance
                    </button>
                </div>

                {/* Total Shipments */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between">
                    <div className="absolute right-4 bottom-4 opacity-5 text-blue-500 group-hover:scale-110 transition duration-500">
                        <Package size={120} />
                    </div>
                    <div>
                        <span className="text-xs text-[#687280] uppercase tracking-widest font-semibold block mb-1">Total Manifest Shipments</span>
                        <h3 className="text-4xl font-black text-blue-500">{shipments.length}</h3>
                        <p className="text-xs text-gray-500 mt-2">Overall parcels booked on Phoenix Node.</p>
                    </div>
                    <div className="border-t border-[#687280]/20 pt-3 mt-4 flex gap-4">
                        <div>
                            <span className="text-[10px] text-gray-500 block">Delivered</span>
                            <span className="text-xs font-bold text-green-500">{shipments.filter(s => s.status === "Delivered").length}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-500 block">Transit Dispatch</span>
                            <span className="text-xs font-bold text-[#FF6A00]">
                {shipments.filter(s => ["Booked", "In Transit", "Pickup Scheduled"].includes(s.status)).length}
              </span>
                        </div>
                    </div>
                </div>

                {/* Notifications & KYC Info */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                        <span className="text-xs text-[#687280] uppercase tracking-widest font-semibold block mb-1">Merchant Details</span>
                        <div className="space-y-2 mt-2 text-sm">
                            <p className="flex justify-between"><span className="text-gray-500">Owner:</span><span className="font-semibold">{user?.name}</span></p>
                            <p className="flex justify-between"><span className="text-gray-500">Mobile:</span><span className="font-semibold">{user?.mobileNumber || "N/A"}</span></p>
                            <p className="flex justify-between"><span className="text-gray-500">GST Registration:</span><span className="font-semibold">{user?.gstType}</span></p>
                        </div>
                    </div>
                    <div className="border-t border-[#687280]/20 pt-3 mt-4 flex items-center justify-between text-xs">
                        <span className="text-[#687280]">Verification Audit:</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${user?.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-[#FF6A00]/10 text-[#FF6A00]"}`}>
              {user?.status}
            </span>
                    </div>
                </div>

            </div>

            {/* Second Row: Latest Shipments & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Latest Shipments List */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Package size={20} className="text-[#FF6A00]" /> Recent Bookings
                        </h3>
                        <button onClick={() => navigate("/dashboard/shipments")} className="text-xs text-[#FF6A00] hover:underline">
                            View All Shipments
                        </button>
                    </div>

                    <div className="space-y-3">
                        {shipments.slice(0, 5).map(sh => (
                            <div key={sh._id} className="bg-white/5 border border-white/10 hover:border-[#FF6A00]/30 rounded-2xl p-4 flex justify-between items-center transition">
                                <div>
                                    <span className="font-semibold font-mono text-[#FF6A00] block">{sh.shipmentId}</span>
                                    <span className="text-[11px] text-gray-500 block mt-0.5">{sh.customer} | {sh.to}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold block text-sm">₹{sh.invoiceTotal.toFixed(2)}</span>
                                    <span className="block mt-1">{getStatusBadge(sh.status)}</span>
                                </div>
                            </div>
                        ))}
                        {shipments.length === 0 && <p className="text-gray-500 text-center py-6 text-sm">No shipments booked yet.</p>}
                    </div>
                </div>

                {/* Notifications Center Panel */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <Bell size={20} className="text-[#FF6A00]" /> Alerts Center
                        </h3>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {notifications.filter(n => !n.isRead).slice(0, 5).map(n => (
                                <div key={n._id} className="bg-black/20 border border-white/5 rounded-xl p-3 space-y-1 relative">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-[#FF6A00]">{n.title}</span>
                                        <button onClick={() => handleMarkNotificationRead(n._id)} className="text-[9px] text-[#687280] hover:text-[#FF6A00]">
                                            Dismiss
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-[#687280]">{n.message}</p>
                                    <span className="text-[9px] text-gray-500 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {notifications.filter(n => !n.isRead).length === 0 && <p className="text-gray-500 text-center py-10 text-xs">No unread notifications.</p>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Overview;