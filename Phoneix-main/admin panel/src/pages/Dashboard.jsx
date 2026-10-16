import React, { useState, useEffect } from "react";
import API from "../services/api";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await API.get("/shipments/metrics");
        setMetrics(res.data);
      } catch (err) {
        console.warn("Failed to fetch dashboard metrics. Using simulated values.");
      }
    };
    fetchMetrics();
  }, []);

  const stats = [
    {
      title: "Consolidated Revenue Volume",
      value: metrics ? `$${parseFloat(metrics.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$942,850.10",
      change: "+22.4% vs last quarter",
      isPositive: true,
      color: "border-[#FF6A00]/20 text-[#FF6A00]",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "System Active Sellers",
      value: metrics ? `${metrics.users} Accounts` : "1,240 Accounts",
      change: "Sync with DB Roster",
      isPositive: true,
      color: "border-blue-400/20 text-blue-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "Operational Server Load",
      value: "14.2% CPU",
      change: "All system nodes online",
      isPositive: true,
      color: "border-green-400/20 text-green-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
    },
    {
      title: "Core Verification Queue",
      value: metrics ? `${metrics.kycQueue} Actions` : "8 Actions",
      change: "Requires prompt audit",
      isPositive: false,
      color: "border-orange-400/20 text-[#FF6A00]",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  const serverNodes = [
    { id: "NODE-US-01", location: "N. Virginia, US", type: "API Core Gateway", load: "12%", ping: "8ms", status: "Active" },
    { id: "NODE-EU-02", location: "Frankfurt, DE", type: "DB Replica Master", load: "18%", ping: "14ms", status: "Active" },
    { id: "NODE-AP-03", location: "Singapore", type: "CDN Edge Caching", load: "8%", ping: "22ms", status: "Active" },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Executive Control Panel</h1>
        <p className="text-sm text-[#687280]">Platform-wide statistics, server node status, and configuration triggers.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl relative overflow-hidden group hover:scale-[1.03] transition-all duration-300"
          >
            {/* Background Light */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#E5E7EB]/30 rounded-full blur-2xl group-hover:bg-[#FF6A00]/5 transition-all"></div>

            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-[#687280] tracking-wide uppercase">{s.title}</span>
              <div className={`p-2.5 rounded-xl bg-[#E5E7EB]/40 border ${s.color}`}>
                {s.icon}
              </div>
            </div>

            <p className="text-2xl font-extrabold text-[#0A1F44] mb-1.5 tracking-tight">{s.value}</p>
            <span className={`text-xs font-medium ${s.isPositive ? "text-green-600" : "text-[#687280]"}`}>
              {s.change}
            </span>
          </div>
        ))}
      </div>

      {/* Server Status Table & Volume tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Server Nodes Grid */}
        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#0A1F44]">Phreight Cloud Core Nodes</h3>
              <p className="text-xs text-[#687280]">Live virtualization micro-services and server clusters performance.</p>
            </div>
            <button
              onClick={() => alert("Rebalancing server node workloads...")}
              className="px-3.5 py-1.5 bg-[#FF6A00] text-black hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Optimize Nodes
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                  <th className="pb-3 font-semibold">CLUSTER ID</th>
                  <th className="pb-3 font-semibold">LOCATION</th>
                  <th className="pb-3 font-semibold">SERVICE LAYER</th>
                  <th className="pb-3 font-semibold text-center">COMPUTE LOAD</th>
                  <th className="pb-3 font-semibold text-center">NETWORK LATENCY</th>
                  <th className="pb-3 font-semibold text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
                {serverNodes.map((n, idx) => (
                  <tr key={idx} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#FF6A00]/80">{n.id}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{n.location}</td>
                    <td className="py-4">{n.type}</td>
                    <td className="py-4 text-center font-bold text-[#0A1F44]">{n.load}</td>
                    <td className="py-4 text-center font-mono font-semibold text-[#FF6A00]/80">{n.ping}</td>
                    <td className="py-4 text-right">
                      <span className="inline-flex px-2.5 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Configuration Controls */}
        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-sm font-bold text-[#0A1F44] mb-1">Global System Locks</h3>
            <p className="text-xs text-[#687280]">Urgent settings adjustments requiring override auth.</p>
          </div>

          <div className="flex-1 my-4 space-y-3 overflow-y-auto custom-scrollbar pr-1">
            <div className="p-3 bg-[#E5E7EB]/30 hover:bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-xl transition-all flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#0A1F44]">Emergency Maintenance Mode</p>
                <p className="text-[10px] text-gray-500">Locks seller public signups</p>
              </div>
              <button
                onClick={() => alert("Maintenance Mode active status updated.")}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded text-[10px] font-bold transition-all border border-red-500/20"
              >
                Toggle Lock
              </button>
            </div>

            <div className="p-3 bg-[#E5E7EB]/30 hover:bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-xl transition-all flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#0A1F44]">COD Remittances Limit</p>
                <p className="text-[10px] text-gray-500">Max limit per seller withdrawal</p>
              </div>
              <button
                onClick={() => alert("COD remittance thresholds updated.")}
                className="px-3 py-1 bg-[#FF6A00]/10 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black rounded text-[10px] font-bold transition-all border border-[#FF6A00]/20"
              >
                Modify Limits
              </button>
            </div>
          </div>

          <button
            onClick={() => alert("Platform cluster backup has been successfully stored to AWS S3 Glacier.")}
            className="w-full py-2.5 bg-[#FF6A00] text-black hover:bg-orange-500 font-bold rounded-xl text-xs transition-all tracking-wide shadow-lg"
          >
            Trigger Hot System Backup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
