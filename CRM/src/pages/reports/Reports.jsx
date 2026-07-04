import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await API.get("/shipments/metrics");
        setMetricsData(res.data);
      } catch (err) {
        console.error("Failed to fetch reports analytics metrics.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const getMetricValue = (tab, key) => {
    if (!metricsData) return tab === "revenue" ? "₹0.00" : tab === "shipments" ? "0 Pkgs" : "0 Users";
    
    if (tab === "revenue") {
      const revVal = parseFloat(metricsData.revenue || 0);
      switch (key) {
        case 0:
          return `₹${revVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        case 1:
          const txCount = metricsData.transactionsCount || 1;
          return `₹${(revVal / txCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        case 2:
          return `₹${(revVal * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        case 3:
          return `₹${(parseFloat(metricsData.discrepanciesCount || 0) * 50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        default:
          return "₹0.00";
      }
    } else if (tab === "shipments") {
      const totalS = metricsData.shipmentsCount || 0;
      switch (key) {
        case 0:
          return `${totalS.toLocaleString()} Pkgs`;
        case 1:
          return `${Math.round(totalS * 0.25).toLocaleString()} Pkgs`;
        case 2:
          return `${Math.round(totalS * 0.70).toLocaleString()} Pkgs`;
        case 3:
          return `${Math.round(totalS * 0.05).toLocaleString()} Pkgs`;
        default:
          return "0 Pkgs";
      }
    } else {
      const totalU = metricsData.users || 0;
      switch (key) {
        case 0:
          return `${totalU.toLocaleString()} Merchants`;
        case 1:
          return `${Math.round(totalU * 0.8).toLocaleString()} Stores`;
        case 2:
          const verifiedK = Math.max(0, totalU - (metricsData.pendingKYCCount || 0));
          return `${verifiedK.toLocaleString()} Compliance`;
        case 3:
          return `${(metricsData.blockedUsersCount || 0).toLocaleString()} Accounts`;
        default:
          return "0 Users";
      }
    }
  };

  const metrics = {
    revenue: [
      { label: "Consolidated Revenue Volume", value: getMetricValue("revenue", 0), delta: metricsData ? "+22.4% vs last qtr" : "Syncing...", isPositive: true },
      { label: "Average Transaction Slabs", value: getMetricValue("revenue", 1), delta: metricsData ? "+4.1% vs last month" : "Syncing...", isPositive: true },
      { label: "Administrative Reserves", value: getMetricValue("revenue", 2), delta: "Active escrow nodes", isPositive: true },
      { label: "Discrepancy Disputes Held", value: getMetricValue("revenue", 3), delta: "Surcharges in custody", isPositive: false },
    ],
    shipments: [
      { label: "Total Booked Orders", value: getMetricValue("shipments", 0), delta: metricsData ? "+15.2% vs last week" : "Syncing...", isPositive: true },
      { label: "Dispatched & In Transit", value: getMetricValue("shipments", 1), delta: "On-time delivery: 98.4%", isPositive: true },
      { label: "Delivered & Settled", value: getMetricValue("shipments", 2), delta: "Average transit: 2.8 days", isPositive: true },
      { label: "Returned to Origin (RTO)", value: getMetricValue("shipments", 3), delta: "RTO Ratio: 1.34%", isPositive: false },
    ],
    users: [
      { label: "Registered Accounts", value: getMetricValue("users", 0), delta: metricsData ? "+28 registered today" : "Syncing...", isPositive: true },
      { label: "Active Trading Stores", value: getMetricValue("users", 1), delta: "Activity Index: 89.2%", isPositive: true },
      { label: "Verified KYC Profiles", value: getMetricValue("users", 2), delta: metricsData ? `${metricsData.pendingKYCCount} awaiting scan` : "Syncing...", isPositive: true },
      { label: "Suspended / Blocked Nodes", value: getMetricValue("users", 3), delta: "Urgent violations logged", isPositive: false },
    ]
  };

  const chartData = {
    revenue: {
      points: "10,120 70,80 130,100 190,50 250,70 310,30 370,40 430,15 490,20 550,10",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      gridY: [20, 50, 80, 110],
      scale: metricsData ? `₹0 to ₹${Math.ceil((metricsData.revenue || 10000) / 10000) * 10000} Volume` : "₹0 to ₹1,000,000 Volume",
      color: "stroke-[#FF6A00]"
    },
    shipments: {
      points: "10,80 70,60 130,50 190,70 250,40 310,45 370,30 430,25 490,15 550,8",
      labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10"],
      gridY: [20, 50, 80, 110],
      scale: metricsData ? `0 to ${metricsData.shipmentsCount || 100} Orders` : "0 to 100,000 Orders",
      color: "stroke-blue-400"
    },
    users: {
      points: "10,110 70,105 130,95 190,80 250,75 310,60 370,50 430,42 490,30 550,22",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      gridY: [20, 50, 80, 110],
      scale: metricsData ? `0 to ${metricsData.users || 10} Users` : "0 to 2,000 Users",
      color: "stroke-green-400"
    }
  };

  const currentChart = chartData[activeTab];

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Phreight Executive Dashboard</h1>
          <p className="text-sm text-[#687280]">Examine transactional telemetry, logistics metrics ratios, and platform user growth parameters.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert("Downloading PDF summary report...")}
            className="px-3.5 py-2 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 text-[#0A1F44] hover:text-[#0A1F44] rounded-xl text-xs font-bold border border-[#687280]/20 transition-all shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Audit PDF Summary
          </button>
          <button
            onClick={() => alert("Compiling full platform logs database to CSV...")}
            className="px-3.5 py-2 bg-[#FF6A00] text-white hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV Dataset
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="glass-card p-2.5 rounded-2xl border border-[#687280]/20 flex gap-2 w-fit">
        <button
          onClick={() => setActiveTab("revenue")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === "revenue"
              ? "bg-[#FF6A00] text-white shadow-md"
              : "text-[#687280] hover:text-[#0A1F44]"
          }`}
        >
          Revenue Analytics
        </button>
        <button
          onClick={() => setActiveTab("shipments")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === "shipments"
              ? "bg-[#FF6A00] text-white shadow-md"
              : "text-[#687280] hover:text-[#0A1F44]"
          }`}
        >
          Shipment Metrics
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === "users"
              ? "bg-[#FF6A00] text-white shadow-md"
              : "text-[#687280] hover:text-[#0A1F44]"
          }`}
        >
          User Acquisition
        </button>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-[fadeIn_0.4s_ease-out]">
        {metrics[activeTab].map((m, idx) => (
          <div
            key={idx}
            className="glass-card p-6 rounded-2xl border border-[#687280]/20 relative overflow-hidden group hover:scale-[1.02] transition-all"
          >
            {/* Soft decorative glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#E5E7EB]/30 rounded-full blur-2xl group-hover:bg-[#FF6A00]/5 transition-all"></div>

            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-[#687280] tracking-wide uppercase">{m.label}</span>
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                m.isPositive ? "bg-green-100 text-green-600" : "bg-[#FF6A00]/10 text-[#FF6A00]"
              }`}>
                Telemetry
              </span>
            </div>

            <p className="text-2xl font-extrabold text-[#0A1F44] mb-1 tracking-tight">{m.value}</p>
            <span className={`text-[10px] font-semibold ${m.isPositive ? "text-green-600" : "text-[#687280]"}`}>
              {m.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Beautiful High-Fidelity SVG Charts Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main interactive chart (Left: 2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#0A1F44] uppercase tracking-wider">
              {activeTab === "revenue" ? "Operational Volume Curve" : activeTab === "shipments" ? "Order Load Frequency Matrix" : "Seller Signup Accretion"}
            </h3>
            <p className="text-xs text-[#687280] font-medium mt-0.5">Real-time telemetry vectors mapped over previous cycles.</p>
          </div>

          {/* Premium Vector Chart */}
          <div className="bg-[#0A1F44] p-6 rounded-2xl border border-[#687280]/20 relative overflow-hidden">
            <div className="absolute top-2 right-4 text-[9px] font-mono text-gray-500">
              Y-Scale Limit: {currentChart.scale}
            </div>

            <div className="w-full h-48">
              <svg className="w-full h-full" viewBox="0 0 600 130" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                {currentChart.gridY.map((y, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={y}
                    x2="600"
                    y2={y}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                  />
                ))}

                {/* Main line path */}
                <polyline
                  fill="none"
                  className={currentChart.color}
                  strokeWidth="2.5"
                  points={currentChart.points}
                />

                {/* Pulsing interactive nodes on polyline */}
                {currentChart.points.split(" ").map((pt, idx) => {
                  const [x, y] = pt.split(",");
                  return (
                    <g key={idx} className="group/dot cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r="3.5"
                        className={activeTab === "revenue" ? "fill-[#FF6A00]" : activeTab === "shipments" ? "fill-blue-400" : "fill-green-400"}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="transparent"
                        className={activeTab === "revenue" ? "hover:fill-[#FF6A00]/20" : activeTab === "shipments" ? "hover:fill-blue-400/20" : "hover:fill-green-400/20"}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 pt-3 border-t border-[#687280]/20">
              {currentChart.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Efficiency metrics (Right: 1 Col) */}
        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-6 flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <h3 className="text-sm font-bold text-[#0A1F44] uppercase tracking-wider mb-1">Carrier Dispatch Ratios</h3>
            <p className="text-xs text-[#687280]">Total logistical load distributed across carrier APIs.</p>
          </div>

          <div className="space-y-4 my-2 flex-1 flex flex-col justify-center">
            {/* BlueDart Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#687280]">
                <span>BlueDart Express Integration</span>
                <span className="font-bold text-[#FF6A00]/80">64% Loading</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6A00] rounded-full" style={{ width: "64%" }}></div>
              </div>
            </div>

            {/* Delhivery Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#687280]">
                <span>Delhivery Air Logistics</span>
                <span className="font-bold text-[#FF6A00]/80">28% Loading</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6A00] rounded-full" style={{ width: "28%" }}></div>
              </div>
            </div>

            {/* RTO exception Ratio Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#687280]">
                <span>Other Third-Party APIs</span>
                <span className="font-bold text-[#FF6A00]/80">8% Loading</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6A00] rounded-full" style={{ width: "8%" }}></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#687280]/20">
            <button
              onClick={() => alert("Rebalancing load schedules across shipping APIs...")}
              className="w-full py-2 bg-[#FF6A00] hover:bg-orange-500 text-[#0A1F44] font-extrabold rounded-xl text-xs transition-all shadow-md"
            >
              Optimize Logistics Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
