import React, { useState, useEffect } from "react";
import API from "../services/api";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Package, PlusCircle, UploadCloud, Wallet, Home,
    ShieldAlert, HelpCircle, Calculator, UserRoundKey, AlertTriangle, LogOut, User
} from "lucide-react";

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const fetchGlobalData = async () => {
        setLoading(true);
        try {
            const userRes = await API.get("/auth/me");
            if (userRes.data.role !== "Seller" && userRes.data.role !== "Admin") {
                setError("Only registered sellers can access the logistics dashboard.");
                setLoading(false); return;
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
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="bg-[#0A1F44] text-white min-h-screen flex flex-col items-center justify-center px-6">
                <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#687280]">Loading Seller Workspace Node...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#0A1F44] text-white min-h-screen flex flex-col items-center justify-center px-6">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Workspace Error</h2>
                <p className="text-[#687280] text-center max-w-md mb-6">{error}</p>
                <button onClick={() => navigate("/login")} className="bg-[#FF6A00] text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition">
                    Return to Portal Access
                </button>
            </div>
        );
    }

    const navLinkClass = ({ isActive }) =>
        `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"}`;

    return (
        <div className="bg-[#0A1F44] text-white min-h-screen flex">
            {/* 🧭 SIDEBAR NAVIGATION */}
            <aside className="w-64 shrink-0 bg-[#071630] border-r border-[#687280]/20 pt-8 flex flex-col justify-between select-none hidden md:flex sticky top-0 h-screen">
                <div className="p-4 space-y-6">
                    <div className="px-3">
                        <span className="text-[10px] text-[#687280] uppercase tracking-widest font-bold">Seller Portal</span>
                        <h2 className="text-lg font-bold text-white truncate">{wallet?.storeName || user?.name}</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className={`w-2 h-2 rounded-full ${user?.status === "Active" ? "bg-green-500" : "bg-orange-500 animate-pulse"}`}></span>
                            <span className="text-xs text-[#687280] font-semibold">{user?.status} Merchant</span>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <NavLink to="/dashboard/overview" className={navLinkClass}>
                            <LayoutDashboard size={18}/> Overview Stats
                        </NavLink>
                        <NavLink to="/dashboard/shipments" className={navLinkClass}>
                            <Package size={18} /> Shipments Register
                        </NavLink>
                        <NavLink to="/dashboard/calculator" className={navLinkClass}>
                            <Calculator size={18} /> Rate Calculator
                        </NavLink>
                        <NavLink to="/dashboard/single-booking" className={navLinkClass}>
                            <PlusCircle size={18} /> Single Booking
                        </NavLink>
                        <NavLink to="/dashboard/bulk-upload" className={navLinkClass}>
                            <UploadCloud size={18} /> Bulk CSV Upload
                        </NavLink>
                        <NavLink to="/dashboard/wallet" className={navLinkClass}>
                            <Wallet size={18} /> Wallet & Ledger
                        </NavLink>
                        <NavLink to="/dashboard/warehouses" className={navLinkClass}>
                            <Home size={18} /> Warehouses
                        </NavLink>
                        <NavLink to="/dashboard/customers" className={navLinkClass}>
                            <UserRoundKey size={18} /> Recipient Customer
                        </NavLink>
                        <NavLink to="/dashboard/claims" className={navLinkClass}>
                            <ShieldAlert size={18} /> Insurance Claims
                        </NavLink>
                        <NavLink to="/dashboard/tickets" className={navLinkClass}>
                            <HelpCircle size={18} /> Helpdesk Tickets
                        </NavLink>
                    </nav>
                </div>
                <div className="p-4 border-t border-[#687280]/20 space-y-4">
                    <NavLink to="/dashboard/profile" className={navLinkClass}>
                        <User size={18} /> My Profile
                    </NavLink>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#687280] transition hover:bg-red-500/10 hover:text-red-500">
                        <LogOut size={18} /> Secure Logout
                    </button>
                    <div className="text-xs text-gray-500 text-center font-medium">Phoenix Aggregator v1.1</div>
                </div>
            </aside>

            {/* 🖥️ MAIN CONTENT CONTAINER */}
            <main className="flex-1 min-h-screen pt-8 pb-20 px-6 lg:px-12 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Global Warnings */}
                    {user && user.status === "Pending" && (
                        <div className="bg-[#FF6A00]/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-[#FF6A00] shrink-0 animate-pulse" />
                            <div>
                                <h4 className="font-semibold text-amber-500 text-sm">KYC Documents Compliance Check Pending</h4>
                                <p className="text-[#687280] text-xs mt-0.5">Your store document checks are in queue. API features are locked.</p>
                            </div>
                        </div>
                    )}
                    {user && user.status === "Blocked" && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-red-500 text-sm">Merchant Portal Suspended</h4>
                                <p className="text-[#687280] text-xs mt-0.5">Administrative holds are placed on this merchant account.</p>
                            </div>
                        </div>
                    )}

                    {/* Render Active Route Content */}
                    <Outlet context={{ user, wallet, fetchWalletData }} />

                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;