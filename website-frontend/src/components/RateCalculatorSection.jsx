import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { ArrowRight, Calculator, CheckCircle2, PhoneCall } from "lucide-react";
import { ARAMEX_SUPPORTED_COUNTRIES } from "../utils/countries";

const RateCalculatorSection = ({ data }) => {
  const navigate = useNavigate();
  const title = data?.title || "Calculate Shipping Cost Instantly";
  const description = data?.description || "Enter your shipment details and get the best courier rates instantly.";
  const points = data?.points || ["Real-time pricing", "Multiple courier options", "Transparent charges"];

  const [form, setForm] = useState({
    destinationCountry: "AE",
    weight: "",
    length: "",
    width: "",
    height: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const w = parseFloat(form.weight);
    if (isNaN(w) || w <= 0) {
      setError("Please enter a valid weight in kg (greater than 0).");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/rates/calculate", {
        courier: "aramex",
        destinationCountry: form.destinationCountry,
        receiverCountry: form.destinationCountry,
        weight: w,
        length: form.length ? parseFloat(form.length) : 0,
        width: form.width ? parseFloat(form.width) : 0,
        height: form.height ? parseFloat(form.height) : 0,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Rate estimation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white text-[#0A1F44] py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] bg-[#FF6A00]/10 px-3 py-1 rounded-full border border-[#FF6A00]/20 inline-block mb-3">
            Instant Tariff Engine
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#0A1F44]">
            {title}
          </h2>
          <p className="text-[#687280] mb-6 leading-relaxed">
            {description}
          </p>

          <ul className="space-y-3 text-[#687280] mb-6">
            {points.map((pt, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#FF6A00] shrink-0" />
                <span>{pt.replace(/^[✔✔\s]+/, "")}</span>
              </li>
            ))}
          </ul>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
            <span className="text-lg">💡</span>
            <div>
              <strong className="block font-bold">Looking for commercial volume discounts?</strong>
              <span>Register a free merchant account or call our desk at <a href="tel:+917698039174" className="font-bold underline text-[#FF6A00]">+91 76980 39174</a> for best wholesale rates!</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM / RESULT */}
        <div className="bg-white border border-[#687280]/20 rounded-3xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-[#0A1F44] mb-4 flex items-center gap-2">
            <Calculator size={20} className="text-[#FF6A00]" />
            Tariff Calculator
          </h3>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                Destination Country *
              </label>
              <select
                value={form.destinationCountry}
                onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs font-semibold shadow-sm"
              >
                {ARAMEX_SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                Package Dead Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 1.5"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                required
                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                Dimensions (cm) - Optional
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="L"
                  value={form.length}
                  onChange={(e) => setForm({ ...form, length: e.target.value })}
                  className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs text-center shadow-sm"
                />
                <input
                  type="number"
                  placeholder="W"
                  value={form.width}
                  onChange={(e) => setForm({ ...form, width: e.target.value })}
                  className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs text-center shadow-sm"
                />
                <input
                  type="number"
                  placeholder="H"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs text-center shadow-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl transition shadow-md shadow-[#FF6A00]/20 flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Calculate Shipping Rate"
              )}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-5 rounded-2xl bg-[#0A1F44]/5 border border-[#687280]/20 space-y-3 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded border border-amber-500/20">
                  Public Retail Tariff
                </span>
                <span className="text-xs text-[#687280] font-mono">
                  Chargeable: {result.chargeableWeight}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#687280] font-bold uppercase">Estimated Payable:</span>
                <span className="text-3xl font-black text-[#FF6A00]">
                  ₹{Number(result.invoiceTotal).toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-[#687280]">
                Standard retail rate shown. Register an account or contact us for best negotiated commercial rates!
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="bg-[#FF6A00] hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition text-center"
                >
                  Register for Best Rates
                </button>
                <a
                  href="https://wa.me/917698039174?text=Hi%2C%20I%20want%20the%20best%20shipping%20rates%20for%20Phreights"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0A1F44] hover:bg-[#071630] text-white font-bold py-2 px-3 rounded-xl text-xs transition text-center flex items-center justify-center gap-1"
                >
                  <PhoneCall size={12} /> +91 76980 39174
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RateCalculatorSection;
