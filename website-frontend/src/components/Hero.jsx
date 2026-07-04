import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Wallet,
  Package,
  Plus,
  Clock,
  CheckCircle,
  MapPin,
  Compass
} from "lucide-react";

const HeroSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [balance, setBalance] = useState(4582.50);
  const [shipmentCount, setShipmentCount] = useState(12);
  const [depositEffect, setDepositEffect] = useState(false);
  const [shipmentEffect, setShipmentEffect] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulated shipment list in hero card
  const [simulatedList, setSimulatedList] = useState([
    { id: "PHX-SH-93821", to: "Mumbai, MH", charge: 18.50, status: "In Transit" },
    { id: "PHX-SH-88273", to: "Delhi, DL", charge: 12.80, status: "Delivered" },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("jwt");
      if (!token) return;

      try {
        // 1. Verify user profile to ensure active merchant session
        const userRes = await API.get("/auth/me");
        if (userRes.data && (userRes.data.role === "Seller" || userRes.data.role === "Admin")) {
          setIsLoggedIn(true);

          // 2. Fetch Wallet Balance
          const walletRes = await API.get("/wallet/me");
          if (walletRes.data && walletRes.data.wallet) {
            setBalance(walletRes.data.wallet.availableBalance);
          }

          // 3. Fetch Shipments
          const shipmentsRes = await API.get("/shipments/list");
          if (shipmentsRes.data && Array.isArray(shipmentsRes.data)) {
            const shs = shipmentsRes.data;
            // Calculate active dispatches
            const active = shs.filter(s => s.status !== "Delivered" && s.status !== "Cancelled").length;
            setShipmentCount(active);

            // Display latest 2 shipments
            if (shs.length > 0) {
              const recent = shs.slice(0, 2).map(sh => ({
                id: sh.shipmentId,
                to: sh.receiverCity ? `${sh.receiverCity}, ${sh.receiverCountry}` : sh.to || "Unknown",
                charge: sh.invoiceTotal,
                status: sh.status
              }));
              setSimulatedList(recent);
            } else {
              setSimulatedList([]);
            }
          }
        }
      } catch (err) {
        console.warn("Hero dynamic data fetch failed:", err.message);
      }
    };

    fetchData();
  }, []);

  const handleSimulateDeposit = () => {
    setBalance((prev) => prev + 250);
    setDepositEffect(true);
    setTimeout(() => setDepositEffect(false), 800);
  };

  const handleSimulateNewShipment = () => {
    setShipmentCount((prev) => prev + 1);
    setShipmentEffect(true);
    setTimeout(() => setShipmentEffect(false), 800);

    const cities = ["Bangalore, KA", "Chennai, TN", "Kolkata, WB", "Pune, MH"];
    const newShip = {
      id: `PHX-SH-${Math.floor(10000 + Math.random() * 90000)}`,
      to: cities[Math.floor(Math.random() * cities.length)],
      charge: parseFloat((15 + Math.random() * 20).toFixed(2)),
      status: "Booked",
    };

    setSimulatedList((prev) => [newShip, prev[0]]); // Keep list size constrained to fit layout
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Booked":
        return <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20">Booked</span>;
      case "In Transit":
        return <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">In Transit</span>;
      case "Delivered":
        return <span className="px-2 py-0.5 rounded-full text-[9px] bg-green-500/10 text-green-400 border border-green-500/20">Delivered</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] bg-gray-500/10 text-gray-400 border border-gray-500/20">Active</span>;
    }
  };

  return (
    <section className="relative bg-[#0A1F44] text-white overflow-hidden pb-12">

      {/* 🔥 Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0A1F44] via-[#0A1F44]/90 to-black opacity-90"></div>

      {/* 🔥 Floating Blur Circle */}
      <div className="absolute w-96 h-96 bg-[#FF6A00]/10 blur-[120px] rounded-full top-[-100px] left-[-100px] animate-pulse pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}
        <div className="space-y-6 animate-fadeIn">
          
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            {data?.title ? (
              data.title.includes(" At ") ? (
                <>
                  {data.title.split(" At ")[0]} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-orange-500">
                    {"At " + data.title.split(" At ")[1]}
                  </span>
                </>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-orange-500">
                  {data.title}
                </span>
              )
            ) : (
              <>
                Ship Globally <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-orange-500">At Lowest Slabs</span>
              </>
            )}
          </h1>

          <p className="text-gray-300 text-base md:text-lg max-w-lg leading-relaxed">
            {data?.description || "Phreight International Courier Company helps you automate logistics booking, reconcile weight discrepancies, and ship smarter with real-time dynamic pricing rates."}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">

            {/* CTA 1 */}
            <Link to="/register" className="bg-gradient-to-r from-[#FF6A00] to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold transition duration-300 hover:brightness-110 hover:shadow-lg active:scale-95">
              {data?.cta1 || "Start Shipping"}
            </Link>

            {/* CTA 2 */}
            <Link to="/rate" className="border border-white/20 bg-white/5 backdrop-blur-md px-8 py-3.5 rounded-xl font-semibold transition duration-300 hover:bg-white hover:text-black">
              {data?.cta2 || "Calculate Rate"}
            </Link>

          </div>
        </div>

        {/* RIGHT IMAGE / INTERACTIVE CARD */}
        <div className="relative w-full max-w-lg mx-auto">
          
          {/* Neon outline styling */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6A00] to-[#687280] rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>

          <div className="relative bg-[#0A1F44]/95 border border-white/5 rounded-2xl p-5 shadow-2xl transition duration-500">

            {/* Simulated Dashboard Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition ${
                    activeTab === "overview" ? "bg-[#FF6A00] text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  OVERVIEW
                </button>
                <button
                  onClick={() => setActiveTab("map")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition ${
                    activeTab === "map" ? "bg-[#FF6A00] text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  LIVE ROUTE
                </button>
              </div>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 relative overflow-hidden">
                    <span className="text-[9px] text-gray-500 uppercase block font-bold">Wallet Balance</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-black text-[#FF6A00] transition-transform ${depositEffect ? "scale-110" : ""}`}>
                        {isLoggedIn ? "₹" : "$"}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            localStorage.setItem("dashboard_active_tab", "wallet");
                            navigate("/dashboard");
                          } else {
                            handleSimulateDeposit();
                          }
                        }}
                        className="bg-[#FF6A00] text-white p-0.5 rounded hover:scale-105 active:scale-95 transition"
                      >
                        <Plus size={10} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 relative overflow-hidden">
                    <span className="text-[9px] text-gray-500 uppercase block font-bold">Active Dispatches</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-black text-blue-400 transition-transform ${shipmentEffect ? "scale-110" : ""}`}>
                        {shipmentCount}
                      </span>
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            localStorage.setItem("dashboard_active_tab", "single");
                            navigate("/dashboard");
                          } else {
                            handleSimulateNewShipment();
                          }
                        }}
                        className="bg-blue-400 text-black p-0.5 rounded hover:scale-105 active:scale-95 transition"
                      >
                        <Plus size={10} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Shipments */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase block font-extrabold tracking-widest">
                    {isLoggedIn ? "Live Dispatches" : "Sandbox Dispatches"}
                  </span>
                  {simulatedList.length > 0 ? (
                    simulatedList.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`bg-white/5 p-2.5 rounded-lg border border-white/5 flex justify-between items-center text-[11px] transition ${
                          idx === 0 && shipmentEffect ? "border-blue-500/30 animate-pulse bg-blue-500/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-[#FF6A00]" />
                          <div>
                            <span className="font-semibold block text-white font-mono">{item.id}</span>
                            <span className="text-[9px] text-gray-400">To: {item.to}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-300">
                            {isLoggedIn ? `₹${item.charge.toFixed(2)}` : `$${item.charge.toFixed(2)}`}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/5 text-center text-xs text-gray-400 leading-relaxed">
                      No dispatches recorded yet.<br/>
                      <span className="text-[#FF6A00] hover:underline cursor-pointer font-bold" onClick={() => {
                        localStorage.setItem("dashboard_active_tab", "single");
                        navigate("/dashboard");
                      }}>Click here to book your first shipment!</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: MAP */}
            {activeTab === "map" && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>GPS Tracking Node Slabs</span>
                  <span className="text-green-400 flex items-center gap-1 animate-pulse">● System online</span>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-xl p-2 h-44 flex items-center justify-center relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <path d="M40 110 Q 110 40 180 90 T 260 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                    <path d="M80 90 L 160 55 L 220 100" fill="none" stroke="rgba(255, 106, 0, 0.2)" strokeWidth="1.5" strokeDasharray="4,4" />
                    
                    {/* Glowing dots */}
                    <circle cx="80" cy="90" r="4" fill="#FF6A00" />
                    <circle cx="160" cy="55" r="5" fill="#3b82f6" className="animate-pulse" />
                    <circle cx="220" cy="100" r="4" fill="#10b981" />
                    
                    <text x="70" y="105" fill="#6b7280" fontSize="7">MUM</text>
                    <text x="150" y="45" fill="#3b82f6" fontSize="7" fontWeight="bold">DELHI</text>
                    <text x="210" y="115" fill="#6b7280" fontSize="7">BLR</text>
                  </svg>

                  <div className="absolute bottom-2 right-2 bg-black/95 border border-white/10 rounded-lg p-1.5 text-[8px] space-y-0.5">
                    <span className="text-[#FF6A00] font-bold block">Consignment Route: MUM-DEL</span>
                    <span className="text-gray-400 block">Delhivery Air: 6 Hours ETA</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* 🔥 Bottom Curve */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#0A1F44] to-transparent pointer-events-none"></div>

    </section>
  );
};

export default HeroSection;