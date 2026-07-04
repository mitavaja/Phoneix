import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Wallet,
  Package,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Globe,
  MapPin,
  List
} from "lucide-react";

const DashboardPreviewSection = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [walletBalance, setWalletBalance] = useState(4582.50);
  const [shipmentCount, setShipmentCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Simulated list inside mockup
  const [simulatedShipments, setSimulatedShipments] = useState([
    { id: "PHX-SH-93821", name: "Ramesh Kumar", to: "Mumbai, MH", courier: "BlueDart Express", charge: 18.50, status: "In Transit" },
    { id: "PHX-SH-88273", name: "Anjali Gupta", to: "New Delhi, DL", courier: "Delhivery Air", charge: 12.80, status: "Delivered" },
    { id: "PHX-SH-74628", name: "Vikram Malhotra", to: "Bangalore, KA", courier: "BlueDart Express", charge: 24.00, status: "Out for Delivery" },
  ]);

  const [depositEffect, setDepositEffect] = useState(false);
  const [shipmentEffect, setShipmentEffect] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("jwt");
      if (!token) return;

      try {
        const userRes = await API.get("/auth/me");
        if (userRes.data && (userRes.data.role === "Seller" || userRes.data.role === "Admin")) {
          setIsLoggedIn(true);

          // Fetch Wallet
          const walletRes = await API.get("/wallet/me");
          if (walletRes.data && walletRes.data.wallet) {
            setWalletBalance(walletRes.data.wallet.availableBalance);
          }

          // Fetch Shipments
          const shipmentsRes = await API.get("/shipments/list");
          if (shipmentsRes.data && Array.isArray(shipmentsRes.data)) {
            const shs = shipmentsRes.data;
            setShipmentCount(shs.length);

            // Display latest 3 shipments in list (the preview displays 3 by default)
            if (shs.length > 0) {
              const recent = shs.slice(0, 3).map(sh => ({
                id: sh.shipmentId,
                name: sh.customer,
                to: sh.receiverCity ? `${sh.receiverCity}, ${sh.receiverCountry}` : sh.to || "Unknown",
                courier: sh.courierName || "Aramex",
                charge: sh.invoiceTotal,
                status: sh.status
              }));
              setSimulatedShipments(recent);
            } else {
              setSimulatedShipments([]);
            }
          }
        }
      } catch (err) {
        console.warn("DashboardPreviewSection dynamic data fetch failed:", err.message);
      }
    };

    fetchData();
  }, []);

  const handleSimulateDeposit = () => {
    setWalletBalance((prev) => prev + 500);
    setDepositEffect(true);
    setTimeout(() => setDepositEffect(false), 1000);
  };

  const handleSimulateNewShipment = () => {
    setShipmentCount((prev) => prev + 1);
    setShipmentEffect(true);
    setTimeout(() => setShipmentEffect(false), 1000);

    const names = ["Kabir Singh", "Priya Sharma", "Aravind Nair", "Divya Patel"];
    const cities = ["Chennai, TN", "Kolkata, WB", "Hyderabad, TG", "Pune, MH"];
    const couriers = ["BlueDart Express", "Delhivery Air"];

    const newShip = {
      id: `PHX-SH-${Math.floor(10000 + Math.random() * 90000)}`,
      name: names[Math.floor(Math.random() * names.length)],
      to: cities[Math.floor(Math.random() * cities.length)],
      courier: couriers[Math.floor(Math.random() * couriers.length)],
      charge: parseFloat((10 + Math.random() * 30).toFixed(2)),
      status: "Booked",
    };

    setSimulatedShipments((prev) => [newShip, ...prev]);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Booked":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20">Booked</span>;
      case "In Transit":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">In Transit</span>;
      case "Out for Delivery":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">Out for Delivery</span>;
      case "Delivered":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">Delivered</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-500/10 text-gray-400 border border-gray-500/20">Active</span>;
    }
  };

  const filteredMockShipments = simulatedShipments.filter(
    (s) =>
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="bg-[#E5E7EB] text-[#0A1F44] py-20 px-6 relative overflow-hidden border-t border-[#687280]/20">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#FF6A00]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-orange-500">
          Supercharged Logistics Dashboard
        </h2>
        <p className="text-[#687280] mt-4 max-w-2xl mx-auto text-sm md:text-base">
          Experience real-time analytics, automated tariff calculators, and seamless shipment tracking. Play with our live simulator dashboard below!
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* PREMIUM SIMULATION DECK CONTAINER */}
        <div className="relative bg-white border border-[#687280]/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* SIMULATED SIDEBAR */}
          <div className="w-full md:w-56 bg-[#0A1F44] border-b md:border-b-0 md:border-r border-[#687280]/20 p-5 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-2 mb-4 hidden md:flex">
              <div className="w-7 h-7 bg-[#FF6A00] text-white rounded-full flex items-center justify-center font-bold text-xs">P</div>
              <span className="font-extrabold text-white tracking-wide text-sm">PHREIGHT CONSOLE</span>
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold w-full transition ${
                activeTab === "overview" 
                  ? "bg-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/10" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Globe size={15} />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("shipments")}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold w-full transition ${
                activeTab === "shipments" 
                  ? "bg-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/10" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <List size={15} />
              Manifest Register
            </button>

            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold w-full transition ${
                activeTab === "map" 
                  ? "bg-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/10" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MapPin size={15} />
              Live Route Maps
            </button>
          </div>

          {/* SIMULATED AREA */}
          <div className="flex-1 p-6 bg-[#E5E7EB] text-[#0A1F44] flex flex-col justify-between">
            
            {/* OVERVIEW PANEL */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Balance */}
                  <div className="bg-white border border-[#687280]/20 p-4 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] text-[#687280] uppercase font-bold tracking-wider block mb-1">Store Balance</span>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-sm md:text-lg font-black text-[#FF6A00] transition-transform duration-300 ${depositEffect ? "scale-110" : ""}`}>
                        {isLoggedIn ? "₹" : "$"}{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h4>
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            localStorage.setItem("dashboard_active_tab", "wallet");
                            navigate("/dashboard");
                          } else {
                            handleSimulateDeposit();
                          }
                        }}
                        className="bg-[#FF6A00] hover:scale-105 active:scale-95 transition text-white p-1 rounded-lg flex items-center justify-center shrink-0"
                        title="Simulate Deposit"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                    {depositEffect && (
                      <span className="absolute right-2 top-2 text-[10px] text-green-600 font-bold animate-bounce">+$500.00</span>
                    )}
                  </div>

                  {/* Shipments */}
                  <div className="bg-white border border-[#687280]/20 p-4 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] text-[#687280] uppercase font-bold tracking-wider block mb-1">Total Dispatches</span>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-sm md:text-lg font-black text-blue-600 transition-transform duration-300 ${shipmentEffect ? "scale-110" : ""}`}>
                        {shipmentCount}
                      </h4>
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            localStorage.setItem("dashboard_active_tab", "single");
                            navigate("/dashboard");
                          } else {
                            handleSimulateNewShipment();
                          }
                        }}
                        className="bg-blue-600 hover:scale-105 active:scale-95 transition text-white p-1 rounded-lg flex items-center justify-center shrink-0"
                        title="Simulate Booking"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                    {shipmentEffect && (
                      <span className="absolute right-2 top-2 text-[10px] text-blue-600 font-bold animate-bounce">+1 Ship</span>
                    )}
                  </div>

                  {/* Success Rate */}
                  <div className="bg-white border border-[#687280]/20 p-4 rounded-2xl">
                    <span className="text-[10px] text-[#687280] uppercase font-bold tracking-wider block mb-1">Success SLA</span>
                    <h4 className="text-sm md:text-lg font-black text-green-600">97.8%</h4>
                    <span className="text-[9px] text-green-600 flex items-center mt-1">● Optimal flow</span>
                  </div>
                </div>

                {/* Simulated Recent register */}
                <div>
                  <h3 className="text-xs font-extrabold text-[#687280] uppercase tracking-widest mb-3">
                    {isLoggedIn ? "Recent Manifests" : "Live Dispatches"}
                  </h3>
                  <div className="space-y-2.5">
                    {simulatedShipments.length > 0 ? (
                      simulatedShipments.map((sh, idx) => (
                        <div
                          key={sh.id}
                          className={`bg-white border border-[#687280]/15 rounded-xl p-3 flex justify-between items-center text-xs transition duration-300 hover:bg-gray-50 ${
                            idx === 0 && shipmentEffect ? "animate-pulse border-blue-500/30" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Package className="text-[#FF6A00] shrink-0" size={16} />
                            <div>
                              <span className="font-semibold block text-[#0A1F44]">{sh.id}</span>
                              <span className="text-[10px] text-[#687280]">To: {sh.to} | {sh.courier}</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className="font-bold text-[#0A1F44]">
                              {isLoggedIn ? `₹${sh.charge.toFixed(2)}` : `$${sh.charge.toFixed(2)}`}
                            </span>
                            {getStatusBadge(sh.status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white border border-[#687280]/15 p-5 rounded-xl text-center text-xs text-[#687280] leading-relaxed">
                        No dispatches recorded yet.<br/>
                        <span className="text-[#FF6A00] hover:underline cursor-pointer font-bold" onClick={() => {
                          localStorage.setItem("dashboard_active_tab", "single");
                          navigate("/dashboard");
                        }}>Click here to create your first dispatch!</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* MANIFEST REGISTER TAB */}
            {activeTab === "shipments" && (
              <div className="space-y-4 animate-fade-in">
                
                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-xs font-extrabold text-[#687280] uppercase tracking-widest">Consignment Manifest</h3>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                    <input
                      type="text"
                      placeholder="Filter Ramesh, Mumbai..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1 bg-white border border-[#687280]/30 focus:ring-1 focus:ring-[#FF6A00] rounded-lg text-[11px] outline-none text-[#0A1F44] w-48 focus:border-[#FF6A00]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl border border-[#687280]/15">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-[#687280]/15 text-[#687280] uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3">Destination</th>
                        <th className="py-2.5 px-3 text-right">Tariff</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#687280]/10 text-[#0A1F44]">
                      {filteredMockShipments.map((sh) => (
                        <tr key={sh.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-mono text-[#FF6A00] font-semibold">{sh.id}</td>
                          <td className="py-2 px-3 text-[#0A1F44]">{sh.name}</td>
                          <td className="py-2 px-3">{sh.to}</td>
                          <td className="py-2 px-3 text-right font-bold">
                            {isLoggedIn ? `₹${sh.charge.toFixed(2)}` : `$${sh.charge.toFixed(2)}`}
                          </td>
                          <td className="py-2 px-3 text-center">{getStatusBadge(sh.status)}</td>
                        </tr>
                      ))}
                      {filteredMockShipments.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-gray-500">
                            {isLoggedIn ? "No consignments match your filter." : "No mock consignments match your filter."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ROUTE MAP TAB */}
            {activeTab === "map" && (
              <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-[#687280] uppercase tracking-widest mb-1">Active Transit Slabs Map</h3>
                  <span className="text-[10px] text-[#687280]">Real-time GPS routing mapping between hubs</span>
                </div>

                {/* Simulated SVG Map */}
                <div className="bg-white border border-[#687280]/20 rounded-2xl flex-1 min-h-[220px] relative overflow-hidden flex items-center justify-center p-4">
                  
                  {/* Glowing Lines & Pulsars */}
                  <svg className="w-full h-full max-h-[200px]" viewBox="0 0 400 200">
                    {/* Background paths simulating geography */}
                    <path d="M50 150 Q 150 50 250 120 T 350 40" fill="none" stroke="rgba(10,31,68,0.05)" strokeWidth="6" />
                    
                    {/* Routing paths */}
                    <path d="M100 120 L 220 70 L 300 130" fill="none" stroke="rgba(255, 106, 0, 0.2)" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
                    <path d="M220 70 L 330 60" fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" />

                    {/* Nodes */}
                    <circle cx="100" cy="120" r="5" fill="#FF6A00" />
                    <circle cx="220" cy="70" r="6" fill="#3b82f6" className="animate-pulse" />
                    <circle cx="300" cy="130" r="4" fill="#a78bfa" />
                    <circle cx="330" cy="60" r="5" fill="#10b981" />

                    {/* Monograms */}
                    <text x="85" y="140" fill="#9ca3af" fontSize="8" fontFamily="sans-serif">MUMBAI</text>
                    <text x="210" y="55" fill="#3b82f6" fontSize="8" fontFamily="sans-serif" fontWeight="bold">DELHI HUB</text>
                    <text x="290" y="150" fill="#9ca3af" fontSize="8" fontFamily="sans-serif">BLR</text>
                    <text x="320" y="48" fill="#10b981" fontSize="8" fontFamily="sans-serif">KOL</text>
                  </svg>

                  {/* Pulsar Overlay Card */}
                  <div className="absolute bottom-3 left-3 bg-[#0A1F44]/95 border border-[#687280]/20 rounded-lg p-2.5 text-[9px] space-y-1 text-white shadow-xl">
                    <span className="text-[#FF6A00] font-bold block">Consignment Route: MUM-DEL</span>
                    <span className="text-gray-300 block">Status: Departing hub (In Transit)</span>
                    <span className="text-gray-400 block">ETA: 6 Hours (Delhivery Air)</span>
                  </div>

                </div>

              </div>
            )}

            {/* FOOTER AUDIT NOTE */}
            <div className="mt-4 pt-3 border-t border-[#687280]/10 flex items-center justify-between text-[9px] text-[#687280]">
              <span>Phreight Sandbox Simulator v2.1</span>
              <span>Secure Cryptographic Ledger Hash Verified</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default DashboardPreviewSection;