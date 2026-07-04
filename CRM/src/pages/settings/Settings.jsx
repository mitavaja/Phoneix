import React, { useState, useEffect } from "react";
import API from "../../services/api";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaved, setIsSaved] = useState(false);

  // General Settings State
  const [platformFee, setPlatformFee] = useState(4.5);
  const [codSurcharge, setCodSurcharge] = useState(50000);
  const [currency, setCurrency] = useState("INR (₹)");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Aramex Credentials State
  const [aramexUsername, setAramexUsername] = useState("");
  const [aramexPassword, setAramexPassword] = useState("");
  const [aramexAccountNumber, setAramexAccountNumber] = useState("");
  const [aramexAccountPin, setAramexAccountPin] = useState("");
  const [aramexAccountEntity, setAramexAccountEntity] = useState("DEL");
  const [aramexAccountCountryCode, setAramexAccountCountryCode] = useState("IN");
  const [aramexApiEnv, setAramexApiEnv] = useState("Sandbox");
  
  const [showAramexPass, setShowAramexPass] = useState(false);
  const [showAramexPin, setShowAramexPin] = useState(false);
  
  const [testStatus, setTestStatus] = useState(null);
  const [testMessage, setTestMessage] = useState("");
  const [originalSettings, setOriginalSettings] = useState(null);

  // Security configuration State
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [mfaRequired, setMfaRequired] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get("/settings");
        if (res.data) {
          setOriginalSettings(res.data);
          setMaintenanceMode(res.data.maintenanceMode || false);
          setCodSurcharge(res.data.codLimit || 50000);
          setAramexUsername(res.data.aramexUsername || "");
          setAramexPassword(res.data.aramexPassword || "");
          setAramexAccountNumber(res.data.aramexAccountNumber || "");
          setAramexAccountPin(res.data.aramexAccountPin || "");
          setAramexAccountEntity(res.data.aramexAccountEntity || "DEL");
          setAramexAccountCountryCode(res.data.aramexAccountCountryCode || "IN");
          setAramexApiEnv(res.data.aramexApiEnv || "Sandbox");
        }
      } catch (err) {
        console.warn("Failed to fetch settings from server.", err.message);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaved(false);
    try {
      const res = await API.put("/settings", {
        maintenanceMode,
        codLimit: codSurcharge,
        aramexUsername,
        aramexPassword,
        aramexAccountNumber,
        aramexAccountPin,
        aramexAccountEntity,
        aramexAccountCountryCode,
        aramexApiEnv,
      });
      if (res.data && res.data.settings) {
        setOriginalSettings(res.data.settings);
        setAramexPassword(res.data.settings.aramexPassword);
        setAramexAccountPin(res.data.settings.aramexAccountPin);
      }
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
      alert("Success: Master configurations committed to database nodes successfully!");
    } catch (err) {
      alert("Error: Failed to save configurations. " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    if (originalSettings) {
      setAramexUsername(originalSettings.aramexUsername || "");
      setAramexPassword(originalSettings.aramexPassword || "");
      setAramexAccountNumber(originalSettings.aramexAccountNumber || "");
      setAramexAccountPin(originalSettings.aramexAccountPin || "");
      setAramexAccountEntity(originalSettings.aramexAccountEntity || "DEL");
      setAramexAccountCountryCode(originalSettings.aramexAccountCountryCode || "IN");
      setAramexApiEnv(originalSettings.aramexApiEnv || "Sandbox");
      setMaintenanceMode(originalSettings.maintenanceMode || false);
      setCodSurcharge(originalSettings.codLimit || 50000);
    }
    setTestStatus(null);
    setTestMessage("");
    alert("Cancelled adjustments. Original settings restored.");
  };

  const handleTestConnection = async () => {
    setTestStatus("loading");
    setTestMessage("");
    try {
      const res = await API.post("/settings/test-aramex", {
        aramexUsername,
        aramexPassword,
        aramexAccountNumber,
        aramexAccountPin,
        aramexAccountEntity,
        aramexAccountCountryCode,
      });
      setTestStatus("success");
      setTestMessage(res.data.message || "Connection Successful");
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err.response?.data?.message || "Invalid Credentials");
    }
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
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white border border-[#687280]/20 p-6 rounded-2xl shadow-xl space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#0A1F44]">Aramex API Credentials</h3>
                  <p className="text-[11px] text-[#687280] mt-1">
                    Enter your Aramex account credentials to enable shipping, rate calculation, pickup scheduling, tracking, and label generation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* User Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[#687280] font-bold text-[10px] uppercase tracking-wider">User Name *</label>
                    <input
                      type="email"
                      required
                      value={aramexUsername}
                      onChange={(e) => setAramexUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-xl text-[#0A1F44] focus:outline-none transition-all font-mono"
                      placeholder="Enter Aramex API Username"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[#687280] font-bold text-[10px] uppercase tracking-wider">Password *</label>
                    <div className="relative">
                      <input
                        type={showAramexPass ? "text" : "password"}
                        required
                        value={aramexPassword}
                        onChange={(e) => setAramexPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-12 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-xl text-[#0A1F44] focus:outline-none transition-all font-mono"
                        placeholder="Enter Aramex API Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAramexPass(!showAramexPass)}
                        className="absolute right-3.5 top-2.5 text-[#687280] hover:text-[#0A1F44]"
                      >
                        {showAramexPass ? (
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1.5">
                    <label className="block text-[#687280] font-bold text-[10px] uppercase tracking-wider">Account Number *</label>
                    <input
                      type="text"
                      required
                      value={aramexAccountNumber}
                      onChange={(e) => setAramexAccountNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-xl text-[#0A1F44] focus:outline-none transition-all font-mono"
                      placeholder="Enter Account Number"
                    />
                  </div>

                  {/* Account PIN */}
                  <div className="space-y-1.5">
                    <label className="block text-[#687280] font-bold text-[10px] uppercase tracking-wider">Account PIN *</label>
                    <div className="relative">
                      <input
                        type={showAramexPin ? "text" : "password"}
                        required
                        value={aramexAccountPin}
                        onChange={(e) => setAramexAccountPin(e.target.value)}
                        className="w-full px-4 py-2.5 pr-12 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-xl text-[#0A1F44] focus:outline-none transition-all font-mono"
                        placeholder="Enter Account PIN"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAramexPin(!showAramexPin)}
                        className="absolute right-3.5 top-2.5 text-[#687280] hover:text-[#0A1F44]"
                      >
                        {showAramexPin ? (
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Entity */}
                  <div className="space-y-1.5">
                    <label className="block text-[#687280] font-bold text-[10px] uppercase tracking-wider">Account Entity *</label>
                    <input
                      type="text"
                      required
                      value={aramexAccountEntity}
                      onChange={(e) => setAramexAccountEntity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-xl text-[#0A1F44] focus:outline-none transition-all font-mono"
                      placeholder="Example: BOM"
                    />
                    <p className="text-[9px] text-[#687280]">Branch/Entity Code provided by Aramex.</p>
                  </div>

                  {/* Account Country Code */}
                  <div className="space-y-1.5">
                    <label className="block text-[#687280] font-bold text-[10px] uppercase tracking-wider">Account Country Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={aramexAccountCountryCode}
                      onChange={(e) => setAramexAccountCountryCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-xl text-[#0A1F44] focus:outline-none transition-all font-mono"
                      placeholder="Example: IN"
                    />
                  </div>

                  {/* API Environment */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-[#687280] font-bold text-[10px] uppercase tracking-wider">API Gateway Environment</label>
                    <select
                      value={aramexApiEnv}
                      onChange={(e) => setAramexApiEnv(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-xl text-[#0A1F44] focus:outline-none transition-all cursor-pointer font-semibold"
                    >
                      <option value="Sandbox">Sandbox Mode (Mock simulated responses)</option>
                      <option value="Production">Production Environment (Live Web Service calls)</option>
                    </select>
                  </div>
                </div>

                {/* Connection Status Response */}
                {testStatus && (
                  <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out] ${
                    testStatus === "loading"
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : testStatus === "success"
                      ? "bg-green-50 border-green-200 text-green-600"
                      : "bg-red-50 border-red-200 text-red-600"
                  }`}>
                    {testStatus === "loading" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        Testing credentials integrity with Aramex servers...
                      </>
                    ) : testStatus === "success" ? (
                      <>✅ Connection Successful</>
                    ) : (
                      <>❌ Invalid Credentials</>
                    )}
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex flex-wrap gap-3 border-t border-[#687280]/10 pt-5">
                  <button
                    type="button"
                    disabled={testStatus === "loading"}
                    onClick={handleTestConnection}
                    className="px-4 py-2.5 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white font-bold rounded-xl transition-all border border-[#687280]/20 shadow-md text-xs"
                  >
                    Test Connection
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="px-4 py-2.5 bg-[#FF6A00] hover:bg-orange-500 text-black font-extrabold rounded-xl transition-all shadow-md text-xs"
                  >
                    Save Credentials
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all border border-gray-300/40 text-xs"
                  >
                    Cancel
                  </button>
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
