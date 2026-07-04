import React, { useState } from "react";
import API from "../../services/api";
import { Search, MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";

const Tracking = () => {
  const [trackingId, setTrackingId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a valid Shipment ID or Tracking Number.");
      return;
    }

    setError("");
    setData(null);
    setLoading(true);

    try {
      const res = await API.get(`/tracking/${trackingId.trim()}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Tracking record not found. Please verify the ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pt-32 pb-20 bg-[#E5E7EB] text-[#0A1F44] min-h-screen px-6">

      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-orange-500 mb-3">
          Track Your Shipment
        </h1>
        <p className="text-[#687280]">
          Enter your Shipment ID or AWB Courier Tracking Number to view real-time transit logs.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-xl mx-auto w-full flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Shipment ID or AWB Tracking Number"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            className="w-full p-4 pl-12 pr-4 rounded-xl bg-white border border-[#687280]/20 text-[#0A1F44] focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10 shadow-[0_4px_20px_-2px_rgba(10,31,68,0.05)] outline-none transition-all duration-300 placeholder:text-[#687280]/60 text-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#687280]/70" size={18} />
        </div>

        <button
          onClick={handleTrack}
          disabled={loading}
          className="bg-gradient-to-r from-[#FF6A00] to-orange-500 text-white font-bold px-8 rounded-xl hover:brightness-110 active:scale-95 shadow-[0_4px_12px_rgba(255,106,0,0.2)] transition-all flex items-center justify-center min-w-[130px]"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={16} strokeWidth={2.5} />
              Track
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="max-w-xl mx-auto w-full bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* RESULT */}
      {data && data.shipment && (
        <div className="max-w-3xl mx-auto w-full space-y-6">
          
          {/* INFO CARD */}
          <div className="bg-white border border-[#687280]/20 rounded-2xl p-6 shadow-xl grid md:grid-cols-3 gap-6">
            <div>
              <span className="text-[#687280] block text-xs font-semibold uppercase">Shipment Status</span>
              <span className="text-xl font-bold text-[#FF6A00]">{data.shipment.status}</span>
            </div>
            <div>
              <span className="text-[#687280] block text-xs font-semibold uppercase">AWB Tracking Number</span>
              <span className="text-sm font-mono font-bold text-[#0A1F44]">
                {data.shipment.courierTrackingNumber || "Awaiting Allocation"}
              </span>
            </div>
            <div>
              <span className="text-[#687280] block text-xs font-semibold uppercase">Route</span>
              <span className="text-sm font-bold text-[#0A1F44]">
                {data.shipment.from} → {data.shipment.to}
              </span>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="bg-white border border-[#687280]/20 rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-[#0A1F44] border-b border-[#687280]/20 pb-3 mb-6">
              Activity History & Status Timeline
            </h3>

            {data.trackingSteps && data.trackingSteps.length > 0 ? (
              <div className="relative border-l-2 border-[#FF6A00]/30 ml-4 pl-6 space-y-8">
                {data.trackingSteps.map((step, idx) => (
                  <div key={step._id || idx} className="relative">
                    {/* TIMELINE MARKER */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 bg-[#FF6A00] rounded-full border-2 border-white ring-4 ring-[#FF6A00]/20"></div>
                    
                    {/* DETAILS */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0A1F44]">{step.status}</span>
                        {step.location && (
                          <span className="text-xs px-2 py-0.5 bg-[#0A1F44]/5 text-[#0A1F44]/80 rounded-md font-semibold flex items-center gap-1">
                            <MapPin size={10} />
                            {step.location}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#687280]">{step.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[#687280]/80 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(step.eventTime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(step.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative border-l-2 border-[#FF6A00]/30 ml-4 pl-6 space-y-8">
                {/* Fallback to shipment status history if granular tracking is empty */}
                {data.shipment.statusHistory && data.shipment.statusHistory.length > 0 ? (
                  data.shipment.statusHistory.map((hist, idx) => (
                    <div key={hist._id || idx} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 bg-[#FF6A00] rounded-full border-2 border-white ring-4 ring-[#FF6A00]/20"></div>
                      <div className="space-y-1">
                        <span className="font-bold text-[#0A1F44]">{hist.status}</span>
                        <p className="text-xs text-[#687280] pt-1 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(hist.time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#687280] text-sm py-4">No status updates recorded yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Tracking;