import React, { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { useNavigate, Outlet } from "react-router-dom";
import { AlertTriangle, Bell, Check, CheckCheck, Clock, X } from "lucide-react";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);
    const navigate = useNavigate();

    const fetchGlobalData = async () => {
        setLoading(true);
        try {
            const userRes = await API.get("/auth/me");
            if (userRes.data.role !== "Seller" && userRes.data.role !== "Admin") {
                setError("Only registered sellers can access the logistics dashboard.");
                setLoading(false);
                return;
            }
            setUser(userRes.data);
            await fetchWalletData();
            await fetchNotifications();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to initialize Dashboard.");
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletData = async () => {
        try {
            const walletRes = await API.get(`/wallet/me?page=1&limit=1&currency=INR`);
            const activeWallet = walletRes.data.wallets?.find(w => w.currency === "INR") || walletRes.data.wallets[0];
            setWallet(activeWallet);
        } catch (err) {
            console.error("Wallet global load error", err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const notifRes = await API.get("/notifications");
            const list = notifRes.data || [];
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.isRead).length);
        } catch (err) {
            console.warn("Notifications load error", err);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Mark notification read failed", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        for (const n of unread) {
            try {
                await API.put(`/notifications/${n._id}/read`);
            } catch (err) {}
        }
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    // Close notifications panel on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token") || localStorage.getItem("jwt");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchGlobalData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        navigate("/login");
    };

    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const getMonogram = () => {
        if (!user || !user.name) return "SP";
        return user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#E5E7EB]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A1F44] border-t-transparent shadow-md"></div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0A1F44]">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#E5E7EB] p-4">
                <div className="max-w-md bg-white border border-red-200 p-6 rounded-2xl shadow-xl text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1F44]">Access Restricted</h3>
                    <p className="text-xs text-[#687280]">{error}</p>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-[#0A1F44] text-white text-xs font-bold rounded-xl hover:bg-black transition"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#E5E7EB] min-h-screen">
            {/* 📁 SIDEBAR NAVIGATION */}
            <Sidebar user={user} wallet={wallet} handleLogout={handleLogout} />

            {/* 🚀 MAIN CONTENT CONTAINER */}
            <div className="ml-64 flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* 🧭 TOP NAVBAR */}
                <header className="h-20 border-b border-[#687280]/20 bg-white px-8 flex items-center justify-between sticky top-0 z-30 select-none shadow-sm">
                    {/* Date and Platform Header */}
                    <div>
                        <h2 className="text-base font-bold text-[#0A1F44]">Merchant Logistics Hub</h2>
                        <span className="text-[11px] font-medium text-[#687280]">{currentDate}</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-6">
                        {/* Wallet Balance Chip */}
                        <div
                            onClick={() => navigate("/dashboard/wallet")}
                            className="flex items-center gap-2 bg-[#E5E7EB]/50 hover:bg-[#E5E7EB] px-3.5 py-1.5 rounded-xl border border-[#687280]/20 text-xs font-semibold cursor-pointer transition"
                            title="Manage Wallet Ledger"
                        >
                            <span className="text-[#687280]">Wallet:</span>
                            <span className="text-[#FF6A00] font-bold">
                                ₹{wallet?.availableBalance !== undefined ? wallet.availableBalance.toFixed(2) : "0.00"}
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Search shipments, orders, records..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.target.value.trim()) {
                                        navigate(`/dashboard/shipments?search=${encodeURIComponent(e.target.value.trim())}`);
                                    }
                                }}
                                className="w-72 px-4 py-2 pl-10 text-xs bg-white border border-[#687280]/30 focus:border-[#FF6A00]/50 rounded-xl text-[#0A1F44] focus:outline-none transition-all shadow-sm"
                            />
                            <svg
                                className="w-4 h-4 text-gray-500 absolute left-3 top-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Notifications Dropdown Toggle */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) fetchNotifications();
                                }}
                                className="relative p-2 rounded-xl bg-[#E5E7EB] hover:bg-[#E5E7EB]/80 text-[#687280] hover:text-[#FF6A00] transition-all group border border-[#687280]/10"
                                title="Notifications"
                            >
                                {unreadCount > 0 && (
                                    <>
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6A00] rounded-full animate-ping"></span>
                                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#FF6A00] text-white text-[9px] font-bold rounded-full shadow-sm">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    </>
                                )}
                                <Bell className="w-5 h-5 text-[#687280] group-hover:scale-110 transition-transform" />
                            </button>

                            {/* Notifications Popover Panel */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#687280]/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                                    <div className="p-4 border-b border-[#687280]/15 flex items-center justify-between bg-[#0A1F44] text-white">
                                        <div className="flex items-center gap-2">
                                            <Bell size={16} className="text-[#FF6A00]" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider">Notifications</h4>
                                            {unreadCount > 0 && (
                                                <span className="bg-[#FF6A00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                                    {unreadCount} New
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="text-[11px] text-[#FF6A00] hover:underline font-semibold flex items-center gap-1"
                                            >
                                                <CheckCheck size={13} /> Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                                        {notifications.length === 0 ? (
                                            <div className="py-12 text-center text-[#687280] text-xs">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#687280]" />
                                                <p className="font-semibold">No notifications right now.</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Updates on your bookings and wallet will appear here.</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                                    className={`p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3 ${
                                                        !n.isRead ? "bg-orange-50/40" : ""
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                                            !n.isRead ? "bg-[#FF6A00]" : "bg-gray-300"
                                                        }`}
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-xs font-bold text-[#0A1F44]">{n.title}</h5>
                                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {new Date(n.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-[#687280] leading-relaxed">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div
                            onClick={() => navigate("/dashboard/profile")}
                            className="flex items-center gap-3 border-l border-[#687280]/20 pl-6 cursor-pointer group"
                        >
                            <div className="text-right hidden sm:block">
                                <span className="block text-xs font-semibold text-[#0A1F44] group-hover:text-[#FF6A00] transition-colors">
                                    {user ? user.name : "Merchant"}
                                </span>
                                <span className="block text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                    {user ? `${user.status} Merchant` : "Seller"}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6A00] to-orange-500 flex items-center justify-center font-extrabold text-black shadow-lg text-sm transition-transform hover:scale-105 select-none">
                                {getMonogram()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* 📄 DYNAMIC PAGE CONTENT WRAPPER */}
                <main className="flex-1 p-8 bg-[#E5E7EB] text-[#0A1F44]">
                    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
                        {/* Global Warnings */}
                        {user && user.status === "Pending" && (
                            <div className="glass-card border-l-4 border-l-[#FF6A00] rounded-2xl p-4 flex items-center gap-3 shadow-md">
                                <div className="p-2 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00]">
                                    <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
                                </div>
                                <div className="text-xs">
                                    <span className="font-bold text-[#0A1F44] block">Account Verification Pending</span>
                                    <span className="text-[#687280]">
                                        Your submitted KYC documents are undergoing compliance audit. Standard tariff rates and mock testing features remain accessible.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Render Active Route Content */}
                        <Outlet context={{ user, wallet, fetchWalletData, fetchNotifications }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
