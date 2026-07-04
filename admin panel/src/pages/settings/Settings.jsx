import React, { useState } from "react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaved, setIsSaved] = useState(false);

  // General Settings State
  const [platformFee, setPlatformFee] = useState(4.5);
  const [codSurcharge, setCodSurcharge] = useState(2.50);
  const [currency, setCurrency] = useState("USD ($)");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // API Credentials State
  const [bdApiKey, setBdApiKey] = useState("bd_sec_live_90382baf8920cf2");
  const [showBdKey, setShowBdKey] = useState(false);
  const [delClientId, setDelClientId] = useState("del_client_prod_4429x");
  const [showDelKey, setShowDelKey] = useState(false);

  // Security configuration State
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [mfaRequired, setMfaRequired] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
    alert("Success: Master configurations committed to database nodes successfully!");
  };

  return (
    <div className="space-y-8 select-none max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">System Settings Terminal</h1>
          <p className="text-sm text-[#687280]">Configure global business fee parameters, gateway credentials, API hooks, and security compliance locks.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="glass-card p-2 rounded-xl border border-[#687280]/20 flex gap-1 w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "general"
              ? "bg-[#FF6A00] text-[#0A1F44] font-bold shadow-md"
              : "text-[#687280] hover:text-[#0A1F44]"
          }`}
        >
          General Parameters
        </button>
        <button
          onClick={() => setActiveTab("api")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "api"
              ? "bg-[#FF6A00] text-[#0A1F44] font-bold shadow-md"
              : "text-[#687280] hover:text-[#0A1F44]"
          }`}
        >
          API Integrations
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "security"
              ? "bg-[#FF6A00] text-[#0A1F44] font-bold shadow-md"
              : "text-[#687280] hover:text-[#0A1F44]"
          }`}
        >
          Security Policies
        </button>
      </div>

      {/* Main Settings Form */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/2 rounded-full blur-3xl pointer-events-none"></div>

        {isSaved && (
          <div className="mb-6 p-3.5 bg-green-100 border border-green-500/20 text-green-600 rounded-xl text-xs flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Master node adjustments written and synced successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <h3 className="text-sm font-bold text-[#0A1F44] border-b border-[#687280]/20 pb-3">Financial Fee Policies</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Platform fee Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-[#687280]">
                    <label>Platform Commission Margin</label>
                    <span className="font-mono text-[#FF6A00]/80 font-bold">{platformFee.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.1"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#E5E7EB]/40 rounded-lg appearance-none cursor-pointer accent-[#FF6A00] border border-[#687280]/20"
                  />
                  <p className="text-[10px] text-gray-500">Charged on absolute order volumes transacted across stores.</p>
                </div>

                {/* COD Surcharge */}
                <div className="space-y-2">
                  <label className="block text-[#687280] font-semibold">Cash-on-Delivery (COD) Surcharge</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-[#FF6A00]/80">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.00"
                      value={codSurcharge}
                      onChange={(e) => setCodSurcharge(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 pl-8 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">Fixed rate applied to COD shipments for courier cash remittance processing.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#687280]/20 pt-4">
                {/* Settlement Currency */}
                <div className="space-y-2">
                  <label className="block text-[#687280] font-semibold">Consolidated Billing Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="USD ($)" className="bg-[#0A1F44]">USD ($) - United States Dollar</option>
                    <option value="INR (₹)" className="bg-[#0A1F44]">INR (₹) - Indian Rupee</option>
                    <option value="EUR (€)" className="bg-[#0A1F44]">EUR (€) - Euro Ledger</option>
                  </select>
                </div>

                {/* Maintenance Toggle */}
                <div className="space-y-2">
                  <label className="block text-[#687280] font-semibold">Emergency System Lock Mode</label>
                  <div className="p-3 bg-[#E5E7EB]/30 border border-[#687280]/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[#0A1F44] font-semibold">Maintenance Mode</p>
                      <p className="text-[9px] text-gray-500">Locks public registration & seller dashboards</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${
                        maintenanceMode ? "bg-red-500" : "bg-[#E5E7EB]/40 border border-[#687280]/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                          maintenanceMode ? "translate-x-6 bg-white" : ""
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === "api" && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <h3 className="text-sm font-bold text-[#0A1F44] border-b border-[#687280]/20 pb-3">Third-Party Logistics Sync</h3>

              <div className="space-y-4">
                {/* BlueDart secret key */}
                <div className="space-y-1.5">
                  <label className="block text-[#687280] font-semibold">BlueDart Express API Auth Token</label>
                  <div className="relative">
                    <input
                      type={showBdKey ? "text" : "password"}
                      value={bdApiKey}
                      onChange={(e) => setBdApiKey(e.target.value)}
                      className="w-full px-4 py-2.5 pr-12 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBdKey(!showBdKey)}
                      className="absolute right-3.5 top-2.5 text-[#687280] hover:text-[#0A1F44]"
                    >
                      {showBdKey ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Delhivery Client ID */}
                <div className="space-y-1.5 border-t border-[#687280]/20 pt-3">
                  <label className="block text-[#687280] font-semibold">Delhivery Air API Gateway Client ID</label>
                  <div className="relative">
                    <input
                      type={showDelKey ? "text" : "password"}
                      value={delClientId}
                      onChange={(e) => setDelClientId(e.target.value)}
                      className="w-full px-4 py-2.5 pr-12 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDelKey(!showDelKey)}
                      className="absolute right-3.5 top-2.5 text-[#687280] hover:text-[#0A1F44]"
                    >
                      {showDelKey ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <h3 className="text-sm font-bold text-[#0A1F44] border-b border-[#687280]/20 pb-3">Administrative Access Compliance</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Session Timeout */}
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-[#687280]">
                    <label>Session Idle Timeout</label>
                    <span className="font-mono text-[#FF6A00]/80 font-bold">{sessionTimeout} Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#E5E7EB]/40 rounded-lg appearance-none cursor-pointer accent-[#FF6A00] border border-[#687280]/20"
                  />
                  <p className="text-[10px] text-gray-500">Automatically ends inactive console browser sessions.</p>
                </div>

                {/* MFA enforcement */}
                <div className="space-y-2">
                  <label className="block text-[#687280] font-semibold">Multi-Factor Authentication Enforcements</label>
                  <div className="p-3 bg-[#E5E7EB]/30 border border-[#687280]/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[#0A1F44] font-semibold">Enforce MFA Policies</p>
                      <p className="text-[9px] text-gray-500">MFA token required on all admin accounts</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMfaRequired(!mfaRequired)}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${
                        mfaRequired ? "bg-[#FF6A00]" : "bg-[#E5E7EB]/40 border border-[#687280]/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                          mfaRequired ? "translate-x-6 bg-black" : ""
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="border-t border-[#687280]/20 pt-5 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#FF6A00] hover:bg-orange-500 text-black font-extrabold rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Commit Configuration Locks
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Settings;
