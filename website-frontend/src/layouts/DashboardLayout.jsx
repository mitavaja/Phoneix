import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Outlet } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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
            <div className="bg-[#E5E7EB] text-[#0A1F44] min-h-screen flex flex-col items-center justify-center px-6">
                <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#687280] font-medium text-sm">Loading Seller Workspace...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#E5E7EB] min-h-screen flex flex-col items-center justify-center px-6">
                <div className="glass-card p-8 rounded-3xl border border-[#687280]/20 shadow-2xl text-center max-w-md">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[#0A1F44] mb-2">Workspace Error</h2>
                    <p className="text-[#687280] text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-[#FF6A00] text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition shadow-lg shadow-[#FF6A00]/20"
                    >
                        Return to Portal Access
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#E5E7EB] min-h-screen">
            {/* 🧭 SIDEBAR NAVIGATION (Matching CRM / Admin Panel) */}
            <Sidebar user={user} wallet={wallet} handleLogout={handleLogout} />

            {/* 🖥️ MAIN CONTENT CONTAINER */}
            <div className="ml-64 flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* 🔝 TOP NAVBAR (Header matching CRM / Admin Panel) */}
                <header className="h-20 border-b border-[#687280]/20 bg-white px-8 flex items-center justify-between sticky top-0 z-30 select-none shadow-sm">
                    {/* Welcome Info */}
                    <div>
                        <h1 className="text-sm font-semibold text-[#0A1F44]">Seller Console</h1>
                        <p className="text-xs text-[#FF6A00]/80 font-medium">{currentDate}</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-6">
                        {/* Wallet Balance Chip */}
                        <div className="flex items-center gap-2 bg-[#E5E7EB]/50 px-3.5 py-1.5 rounded-xl border border-[#687280]/20 text-xs font-semibold">
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
                                className="w-72 px-4 py-2 pl-10 text-xs bg-white border border-[#687280]/30 focus:border-[#FF6A00]/50 rounded-xl text-[#0A1F44] focus:outline-none transition-all"
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

                        {/* Notifications */}
                        <button
                            onClick={() => navigate("/dashboard/overview")}
                            className="relative p-2 rounded-xl bg-[#E5E7EB] hover:bg-[#E5E7EB]/80 text-[#687280] hover:text-[#FF6A00] transition-all group border border-[#687280]/10"
                            title="Notifications"
                        >
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6A00] rounded-full animate-ping"></span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6A00] rounded-full"></span>
                            <svg className="w-5 h-5 text-[#687280] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* User Profile */}
                        <div
                            onClick={() => navigate("/dashboard/profile")}
                            className="flex items-center gap-3 border-l border-[#687280]/20 pl-6 cursor-pointer group"
                        >
                            <div className="text-right hidden sm:block">
                                <span className="block text-xs font-semibold text-[#0A1F44] group-hover:text-[#FF6A00] transition-colors">{user ? user.name : "Merchant"}</span>
                                <span className="block text-[10px] text-green-600 font-bold uppercase tracking-wider">{user ? `${user.status} Merchant` : "Seller"}</span>
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
                                <div>
                                    <h4 className="font-bold text-[#0A1F44] text-sm">KYC Documents Compliance Check Pending</h4>
                                    <p className="text-[#687280] text-xs mt-0.5">Your store document checks are in queue. API features are locked.</p>
                                </div>
                            </div>
                        )}
                        {user && user.status === "Blocked" && (
                            <div className="glass-card border-l-4 border-l-red-500 rounded-2xl p-4 flex items-center gap-3 shadow-md">
                                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-600 text-sm">Merchant Portal Suspended</h4>
                                    <p className="text-[#687280] text-xs mt-0.5">Administrative holds are placed on this merchant account.</p>
                                </div>
                            </div>
                        )}

                        {/* Render Active Route Content */}
                        <Outlet context={{ user, wallet, fetchWalletData }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;