import React, { useState, useEffect } from "react";
import API from "../../services/api";

const RateManager = () => {
  // Rate matrix state
  const [rates, setRates] = useState([]);
  const [margins, setMargins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for adding slab
  const [newCarrier, setNewCarrier] = useState("Aramex");
  const [newWeight, setNewWeight] = useState("");
  const [newZoneA, setNewZoneA] = useState("");
  const [newZoneB, setNewZoneB] = useState("");
  const [newZoneC, setNewZoneC] = useState("");
  const [newZoneD, setNewZoneD] = useState("");
  const [isAddingSlab, setIsAddingSlab] = useState(false);

  // Form states for adding margin rule
  const [marginType, setMarginType] = useState("Fixed");
  const [marginValue, setMarginValue] = useState("");
  const [marginCountry, setMarginCountry] = useState("");
  const [marginWeightMin, setMarginWeightMin] = useState("");
  const [marginWeightMax, setMarginWeightMax] = useState("");
  const [isAddingMargin, setIsAddingMargin] = useState(false);

  // Rate calculator states
  const [calcOrigin, setCalcOrigin] = useState("IN");
  const [calcDest, setCalcDest] = useState("AE");
  const [calcWeight, setCalcWeight] = useState("");
  const [calcLength, setCalcLength] = useState("");
  const [calcWidth, setCalcWidth] = useState("");
  const [calcHeight, setCalcHeight] = useState("");
  const [calcShipmentType, setCalcShipmentType] = useState("Parcel");
  const [calcResult, setCalcResult] = useState(null);
  const [calcError, setCalcError] = useState("");
  const [calculating, setCalculating] = useState(false);

  const fetchRatesAndMargins = async () => {
    setLoading(true);
    try {
      const ratesRes = await API.get("/rates");
      setRates(ratesRes.data || []);
      
      const marginsRes = await API.get("/rates/margins");
      setMargins(marginsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch rates/margins", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatesAndMargins();
  }, []);

  const handleAddSlab = async (e) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    const zA = parseFloat(newZoneA);
    const zB = parseFloat(newZoneB);
    const zC = parseFloat(newZoneC);
    const zD = parseFloat(newZoneD);

    if (isNaN(w) || isNaN(zA) || isNaN(zB) || isNaN(zC) || isNaN(zD)) {
      alert("Please ensure all parameters contain valid numbers.");
      return;
    }

    try {
      await API.post("/rates/add", {
        carrier: newCarrier,
        weightLimit: w,
        zoneA: zA,
        zoneB: zB,
        zoneC: zC,
        zoneD: zD,
      });

      setIsAddingSlab(false);
      setNewWeight("");
      setNewZoneA("");
      setNewZoneB("");
      setNewZoneC("");
      setNewZoneD("");
      
      alert(`Success: Added new shipping rate tier for ${newCarrier}!`);
      fetchRatesAndMargins();
    } catch (error) {
      alert(`Error publishing rate slab: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteSlab = async (id) => {
    if (confirm("Are you sure you want to delete this shipping rate tier?")) {
      try {
        await API.delete(`/rates/${id}`);
        alert("Success: Rate slab deleted successfully.");
        fetchRatesAndMargins();
      } catch (error) {
        alert(`Error deleting rate slab: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleAddMarginRule = async (e) => {
    e.preventDefault();
    const val = parseFloat(marginValue);
    if (isNaN(val)) {
      alert("Please enter a valid markup value.");
      return;
    }

    try {
      await API.post("/rates/margins", {
        type: marginType,
        value: val,
        country: marginCountry,
        weightMin: marginWeightMin ? parseFloat(marginWeightMin) : 0,
        weightMax: marginWeightMax ? parseFloat(marginWeightMax) : 0,
      });

      setIsAddingMargin(false);
      setMarginValue("");
      setMarginCountry("");
      setMarginWeightMin("");
      setMarginWeightMax("");

      alert("Success: Margin Priority Rule saved successfully.");
      fetchRatesAndMargins();
    } catch (error) {
      alert(`Error adding margin rule: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteMarginRule = async (id) => {
    if (confirm("Are you sure you want to remove this margin markup rule?")) {
      try {
        await API.delete(`/rates/margins/${id}`);
        alert("Success: Margin rule deleted.");
        fetchRatesAndMargins();
      } catch (error) {
        alert(`Error deleting margin rule: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalcError("");
    setCalcResult(null);
    const w = parseFloat(calcWeight);
    if (isNaN(w) || w <= 0) {
      alert("Please enter a valid weight parameter (kg).");
      return;
    }

    setCalculating(true);
    try {
      const res = await API.post("/rates/calculate", {
        originCountry: calcOrigin,
        destinationCountry: calcDest,
        weight: w,
        length: calcLength ? parseFloat(calcLength) : 0,
        width: calcWidth ? parseFloat(calcWidth) : 0,
        height: calcHeight ? parseFloat(calcHeight) : 0,
        shipmentType: calcShipmentType,
      });

      setCalcResult(res.data);
    } catch (error) {
      setCalcError(error.response?.data?.message || "Calculation failed.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Logistical Rates & Margin Priority Controls</h1>
          <p className="text-sm text-[#687280]">Configure carrier slabs, priority markups override rules, and perform audit calculations.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddingMargin(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-[#687280]/20 text-[#0A1F44] font-bold rounded-xl text-xs transition-all shadow-sm"
          >
            Add Margin Markup Rule
          </button>
          <button
            onClick={() => setIsAddingSlab(true)}
            className="px-4 py-2 bg-[#FF6A00] text-white hover:bg-orange-500 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1"
          >
            Add Base Rate Slab
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cost Matrix and Margins (Left: 2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Base rates table */}
          <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-4">
            <h3 className="text-sm font-bold text-[#0A1F44] border-b border-[#687280]/10 pb-2">Active Carrier Base Tariff Tiers</h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                    <th className="pb-3 font-semibold">SLAB ID</th>
                    <th className="pb-3 font-semibold">CARRIER</th>
                    <th className="pb-3 font-semibold">WEIGHT LIMIT</th>
                    <th className="pb-3 font-semibold text-center">ZONE A (₹)</th>
                    <th className="pb-3 font-semibold text-center">ZONE B (₹)</th>
                    <th className="pb-3 font-semibold text-center">ZONE C (₹)</th>
                    <th className="pb-3 font-semibold text-center">ZONE D (₹)</th>
                    <th className="pb-3 font-semibold text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
                  {loading ? (
                    <tr><td colSpan="8" className="py-4 text-center">Loading pricing slabs...</td></tr>
                  ) : (
                    rates.map((rate) => (
                      <tr key={rate._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                        <td className="py-3 font-mono font-bold text-[#FF6A00]/80">{rate.slabId}</td>
                        <td className="py-3 font-semibold text-[#0A1F44]">{rate.carrier}</td>
                        <td className="py-3 font-mono font-bold">≤ {rate.weightLimit} kg</td>
                        <td className="py-3 text-center font-mono text-[#0A1F44]">₹{rate.zoneA}</td>
                        <td className="py-3 text-center font-mono text-[#0A1F44]">₹{rate.zoneB}</td>
                        <td className="py-3 text-center font-mono text-[#0A1F44]">₹{rate.zoneC}</td>
                        <td className="py-3 text-center font-mono text-[#0A1F44]">₹{rate.zoneD}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteSlab(rate._id)}
                            className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded text-[10px] font-bold border border-red-500/10 hover:border-transparent transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && rates.length === 0 && (
                    <tr><td colSpan="8" className="py-4 text-center text-gray-500">No base rate slabs configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Margins Priority Rules Table */}
          <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-4">
            <h3 className="text-sm font-bold text-[#0A1F44] border-b border-[#687280]/10 pb-2">Profit Margin Markups Priority Engine</h3>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                    <th className="pb-3 font-semibold">PRIORITY CLASS</th>
                    <th className="pb-3 font-semibold">COUNTRY LIMIT</th>
                    <th className="pb-3 font-semibold">WEIGHT BOUNDS</th>
                    <th className="pb-3 font-semibold">MARKUP CLASS</th>
                    <th className="pb-3 font-semibold text-right">MARKUP VALUE</th>
                    <th className="pb-3 font-semibold text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
                  {loading ? (
                    <tr><td colSpan="6" className="py-4 text-center">Loading margins rules...</td></tr>
                  ) : (
                    margins.map((m, index) => {
                      let priorityClass = "Priority 4: Global";
                      if (m.country && m.weightMin > 0) priorityClass = "Priority 1: Country + Weight";
                      else if (m.country) priorityClass = "Priority 2: Country";
                      else if (m.weightMin > 0 || m.weightMax > 0) priorityClass = "Priority 3: Weight";

                      return (
                        <tr key={m._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                          <td className="py-3 font-semibold text-[#FF6A00]">{priorityClass}</td>
                          <td className="py-3 font-mono font-bold text-[#0A1F44]">{m.country ? m.country.toUpperCase() : "GLOBAL (*)"}</td>
                          <td className="py-3">
                            {m.weightMin === 0 && m.weightMax === 0 ? "Any weight" : `${m.weightMin} kg - ${m.weightMax === 0 ? "∞" : m.weightMax + " kg"}`}
                          </td>
                          <td className="py-3 text-gray-500 font-semibold">{m.type}</td>
                          <td className="py-3 text-right font-mono font-bold text-[#0A1F44]">
                            {m.type === "Percentage" ? `${m.value}%` : `₹${m.value}`}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteMarginRule(m._id)}
                              className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded text-[10px] font-bold border border-red-500/10 hover:border-transparent transition-all"
                            >
                              Remove Rule
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {!loading && margins.length === 0 && (
                    <tr><td colSpan="6" className="py-4 text-center text-gray-500">No profit margin rules registered. Global defaults (₹100) will be applied.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Live Shipment Cost Calculator (Right: 1 Col) */}
        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 h-fit space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#0A1F44] mb-1">Live Pricing calculator Audit</h3>
            <p className="text-xs text-[#687280]">Verify base rate slabs and margin overrides with decoupled GST breakdown calculations.</p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#687280] font-semibold mb-1">Origin Country</label>
                <select
                  value={calcOrigin}
                  onChange={(e) => setCalcOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="IN" className="bg-[#0A1F44]">India (IN)</option>
                  <option value="AE" className="bg-[#0A1F44]">United Arab Emirates (AE)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#687280] font-semibold mb-1">Destination Country</label>
                <select
                  value={calcDest}
                  onChange={(e) => setCalcDest(e.target.value)}
                  className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="AE" className="bg-[#0A1F44]">United Arab Emirates (AE)</option>
                  <option value="SA" className="bg-[#0A1F44]">Saudi Arabia (SA)</option>
                  <option value="US" className="bg-[#0A1F44]">United States (US)</option>
                  <option value="GB" className="bg-[#0A1F44]">United Kingdom (GB)</option>
                  <option value="IN" className="bg-[#0A1F44]">India (IN)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#687280] font-semibold mb-1">Dead Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1.5"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[#687280] font-semibold mb-1">Shipment Type</label>
                <select
                  value={calcShipmentType}
                  onChange={(e) => setCalcShipmentType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none cursor-pointer"
                >
                  <option value="Parcel" className="bg-[#0A1F44]">Parcel</option>
                  <option value="Document" className="bg-[#0A1F44]">Document</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[#687280] font-semibold">Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="L"
                  value={calcLength}
                  onChange={(e) => setCalcLength(e.target.value)}
                  className="p-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] text-center focus:outline-none text-xs"
                />
                <input
                  type="number"
                  placeholder="W"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(e.target.value)}
                  className="p-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] text-center focus:outline-none text-xs"
                />
                <input
                  type="number"
                  placeholder="H"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                  className="p-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] text-center focus:outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full py-2.5 bg-[#FF6A00] hover:bg-orange-500 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center"
            >
              {calculating ? "Calculating..." : "Run Calculator Audit"}
            </button>
          </form>

          {calcError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
              {calcError}
            </div>
          )}

          {calcResult && (
            <div className="p-4 bg-[#FF6A00]/5 border border-[#FF6A00]/20 text-[#FF6A00] rounded-xl space-y-3 text-xs animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-baseline font-bold border-b border-[#FF6A00]/10 pb-2">
                <span>INVOICE TOTAL:</span>
                <span className="text-xl font-extrabold text-[#0A1F44]">₹{calcResult.invoiceTotal}</span>
              </div>
              <div className="text-[10px] text-[#687280] space-y-1.5">
                <div className="flex justify-between">
                  <span>Chargeable Weight:</span>
                  <span className="font-semibold text-white">{calcResult.chargeableWeight} (Dead: {calcResult.actualWeight})</span>
                </div>
                <div className="flex justify-between">
                  <span>Aramex Base Cost:</span>
                  <span className="font-semibold text-white">₹{calcResult.aramexBaseCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Margin Applied:</span>
                  <span className="font-semibold text-white">{calcResult.marginApplied.type} ({calcResult.marginApplied.value})</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Charge:</span>
                  <span className="font-semibold text-white">₹{calcResult.shippingCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (18%):</span>
                  <span className="font-semibold text-white">₹{calcResult.gstAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Add Slabs Modal */}
      {isAddingSlab && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-[#E5E7EB]">
            <div className="bg-[#0A1F44] px-6 py-4 border-b border-[#687280]/20 flex items-center justify-between text-white">
              <div>
                <h3 className="font-extrabold">Create Shipping Tariff Slab</h3>
                <p className="text-[10px] text-gray-400">Add a new carrier weight slab threshold matrix.</p>
              </div>
              <button onClick={() => setIsAddingSlab(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSlab} className="p-6 space-y-4 text-xs text-[#0A1F44]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[#687280] font-semibold">Logistics Carrier *</label>
                  <select
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none"
                  >
                    <option value="Aramex">Aramex</option>
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="Delhivery Air">Delhivery Air</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#687280] font-semibold">Weight Limit Slab (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 3.0"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-[#687280]/20 pt-3">
                <span className="block text-[10px] text-[#FF6A00] font-bold uppercase tracking-wider mb-2">Zone-wise Pricing Tariffs (₹)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="space-y-1.5">
                    <label className="block text-gray-500 font-semibold">ZONE A</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newZoneA}
                      onChange={(e) => setNewZoneA(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-500 font-semibold">ZONE B</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newZoneB}
                      onChange={(e) => setNewZoneB(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-500 font-semibold">ZONE C</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newZoneC}
                      onChange={(e) => setNewZoneC(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-500 font-semibold">ZONE D</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newZoneD}
                      onChange={(e) => setNewZoneD(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#687280]/20 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddingSlab(false)}
                  className="px-4 py-2 bg-white border border-[#687280]/20 hover:bg-gray-100 rounded-lg transition-all text-[#0A1F44] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6A00] hover:bg-orange-500 text-white font-extrabold rounded-lg transition-all"
                >
                  Publish Tariff Slab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Margin Rule Modal */}
      {isAddingMargin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-[#E5E7EB]">
            <div className="bg-[#0A1F44] px-6 py-4 border-b border-[#687280]/20 flex items-center justify-between text-white">
              <div>
                <h3 className="font-extrabold">Create Margin Markup Rule</h3>
                <p className="text-[10px] text-gray-400">Configure priority profit markups matching parameters.</p>
              </div>
              <button onClick={() => setIsAddingMargin(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMarginRule} className="p-6 space-y-4 text-xs text-[#0A1F44]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[#687280] font-semibold">Markup Type *</label>
                  <select
                    value={marginType}
                    onChange={(e) => setMarginType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none"
                  >
                    <option value="Fixed">Fixed Amount markup (₹)</option>
                    <option value="Percentage">Percentage markup (%)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#687280] font-semibold">Markup Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 150 or 15"
                    value={marginValue}
                    onChange={(e) => setMarginValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-[#687280]/20 pt-3">
                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-semibold">Country code (Optional)</label>
                  <input
                    type="text"
                    maxLength="2"
                    placeholder="e.g. AE"
                    value={marginCountry}
                    onChange={(e) => setMarginCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-semibold">Min Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={marginWeightMin}
                    onChange={(e) => setMarginWeightMin(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-gray-500 font-semibold">Max Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={marginWeightMax}
                    onChange={(e) => setMarginWeightMax(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#687280]/20 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddingMargin(false)}
                  className="px-4 py-2 bg-white border border-[#687280]/20 hover:bg-gray-100 rounded-lg transition-all text-[#0A1F44] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6A00] hover:bg-orange-500 text-white font-extrabold rounded-lg transition-all"
                >
                  Publish Markup Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateManager;
