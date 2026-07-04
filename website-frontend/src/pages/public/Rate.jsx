import React, { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Calculator, ArrowRight, ShieldAlert, Check } from "lucide-react";

const RateCalculator = () => {
  const [form, setForm] = useState({
    originCountry: "IN",
    destinationCountry: "AE",
    weight: "",
    length: "",
    width: "",
    height: "",
    shipmentType: "Parcel",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    setError("");
    setResult(null);

    const { originCountry, destinationCountry, weight, length, width, height, shipmentType } = form;

    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      setError("Please enter a valid weight limit greater than 0 kg");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/rates/calculate", {
        originCountry,
        destinationCountry,
        weight: parsedWeight,
        length: length ? parseFloat(length) : 0,
        width: width ? parseFloat(width) : 0,
        height: height ? parseFloat(height) : 0,
        shipmentType,
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to calculate tariff cost. Please verify if rates are seeded.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookRedirect = () => {
    const isLoggedIn = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col gap-10 pt-32 pb-20 bg-[#E5E7EB] text-[#0A1F44] min-h-screen px-6">
      
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-orange-500 mb-3">
          Logistics Tariff Calculator
        </h1>
        <p className="text-[#687280]">
          Compute your volumetric shipping tariffs against active carrier slabs in real time.
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-10">
        
        {/* FORM */}
        <div className="bg-white border border-[#687280]/20 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-xl font-semibold text-[#FF6A00] border-b border-[#687280]/20 pb-2 mb-2 flex items-center gap-2">
            <Calculator size={20} />
            Tariff Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#687280] block mb-1 font-semibold">Origin Country</label>
              <select
                name="originCountry"
                value={form.originCountry}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white border border-[#687280]/20 text-[#0A1F44] focus:ring-2 focus:ring-[#FF6A00] outline-none"
              >
                <option value="IN">India (IN)</option>
                <option value="AE">United Arab Emirates (AE)</option>
                <option value="US">United States (US)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="SA">Saudi Arabia (SA)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#687280] block mb-1 font-semibold">Destination Country</label>
              <select
                name="destinationCountry"
                value={form.destinationCountry}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white border border-[#687280]/20 text-[#0A1F44] focus:ring-2 focus:ring-[#FF6A00] outline-none"
              >
                <option value="AE">United Arab Emirates (AE)</option>
                <option value="SA">Saudi Arabia (SA)</option>
                <option value="US">United States (US)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="IN">India (IN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#687280] block mb-1 font-semibold">Dead Weight (kg)</label>
              <input
                type="number"
                name="weight"
                placeholder="0.5"
                value={form.weight}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white border border-[#687280]/20 text-[#0A1F44] focus:ring-2 focus:ring-[#FF6A00] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#687280] block mb-1 font-semibold">Shipment Type</label>
              <select
                name="shipmentType"
                value={form.shipmentType}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white border border-[#687280]/20 text-[#0A1F44] focus:ring-2 focus:ring-[#FF6A00] outline-none"
              >
                <option value="Parcel">Parcel</option>
                <option value="Document">Document</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#687280] block mb-1 font-semibold">Dimensions (cm) - Optional for Volumetric</label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                name="length"
                placeholder="L"
                value={form.length}
                onChange={handleChange}
                className="p-3 rounded-lg bg-white border border-[#687280]/20 text-[#0A1F44] text-center focus:ring-2 focus:ring-[#FF6A00] outline-none"
              />
              <input
                type="number"
                name="width"
                placeholder="W"
                value={form.width}
                onChange={handleChange}
                className="p-3 rounded-lg bg-white border border-[#687280]/20 text-[#0A1F44] text-center focus:ring-2 focus:ring-[#FF6A00] outline-none"
              />
              <input
                type="number"
                name="height"
                placeholder="H"
                value={form.height}
                onChange={handleChange}
                className="p-3 rounded-lg bg-white border border-[#687280]/20 text-[#0A1F44] text-center focus:ring-2 focus:ring-[#FF6A00] outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3 rounded-lg flex items-center gap-2">
              <ShieldAlert size={14} />
              {error}
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF6A00] to-orange-500 text-white font-semibold py-3 rounded-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Calculate Cost"
            )}
          </button>
        </div>

        {/* RESULT */}
        <div className="bg-white border border-[#687280]/20 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[300px]">
          <h2 className="text-xl font-semibold text-[#FF6A00] border-b border-[#687280]/20 pb-2">
            Pricing Breakdown
          </h2>

          <div className="my-auto flex flex-col items-center justify-center py-6">
            {result ? (
              <div className="text-center w-full space-y-4 animate-fade-in">
                <div className="text-sm text-[#687280] uppercase tracking-widest font-semibold">Total Payable</div>
                <div className="text-5xl font-black text-[#FF6A00] tracking-tight">
                  ₹{result.invoiceTotal}
                </div>

                <div className="grid grid-cols-2 gap-4 text-left bg-[#0A1F44]/5 p-4 rounded-xl text-sm mt-4 border border-[#687280]/20">
                  <div>
                    <span className="text-[#687280] block text-xs">Courier Name:</span>
                    <span className="font-semibold text-[#0A1F44]">{result.courierName}</span>
                  </div>
                  <div>
                    <span className="text-[#687280] block text-xs">Route:</span>
                    <span className="font-semibold text-[#0A1F44] uppercase">{form.originCountry} → {form.destinationCountry}</span>
                  </div>
                  <div>
                    <span className="text-[#687280] block text-xs">Chargeable Weight:</span>
                    <span className="font-semibold text-[#FF6A00]">{result.chargeableWeight}</span>
                  </div>
                  <div>
                    <span className="text-[#687280] block text-xs">Volumetric Weight:</span>
                    <span className="font-semibold text-[#687280]">{result.volumetricWeight}</span>
                  </div>
                  <div className="col-span-2 border-t border-[#687280]/20 pt-2 mt-1">
                    <div className="flex justify-between text-xs text-[#687280] mb-1">
                      <span>Shipping Charge (Base + Margin):</span>
                      <span className="font-semibold text-[#0A1F44]">₹{result.shippingCharge}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#687280]">
                      <span>GST (18%):</span>
                      <span className="font-semibold text-[#0A1F44]">₹{result.gstAmount}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#687280] italic px-2 mt-2">
                  Tariff computed dynamically based on the priority margin engine rules.
                </p>

                <button
                  onClick={handleBookRedirect}
                  className="w-full mt-4 bg-[#0A1F44] text-white font-bold py-3 rounded-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  Book This Shipment
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#687280] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p>Provide shipment weight, destination, and dimensions to retrieve dynamic courier cost quotes.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RateCalculator;