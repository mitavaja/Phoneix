import React, { useState, useEffect } from "react";
import API from "../../services/api";

const RejectedKYC = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRejectedKYC = async () => {
    try {
      const res = await API.get("/kyc/rejected");
      setSubmissions(res.data);
    } catch (error) {
      console.warn("Express API rejected KYC registry unreachable. Using simulated roster.", error.message);
      setSubmissions([
        { _id: "647a3e80f12c9c381a4b9035", kycId: "KYC-084", store: "Apex Spares", owner: "Dominic Toretto", taxId: "TAX-AP43092R", updatedAt: "2026-05-12T10:00:00Z", rejectReason: "Electricity Bill address does not match incorporation address", reRequested: false },
        { _id: "647a3e80f12c9c381a4b9036", kycId: "KYC-071", store: "NaturePure Labs", owner: "Gwyneth Paltrow", taxId: "TAX-NP30291X", updatedAt: "2026-05-10T10:00:00Z", rejectReason: "Uploaded identity document scan is cropped and missing signature", reRequested: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedKYC();
  }, []);

  const handleReRequest = async (id, store) => {
    try {
      await API.post(`/kyc/${id}/re-request`);
      alert(`Success: Alert sent to "${store}" requesting document re-upload.`);
      fetchRejectedKYC();
    } catch (error) {
      alert(`Error requesting re-upload: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Rejected KYC Applications</h1>
        <p className="text-sm text-[#687280]">Review declined seller applications, manage rejection reasons, and coordinate document re-upload schedules.</p>
      </div>

      {/* Rejected List */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">REJECTION ID</th>
                <th className="pb-3 font-semibold">STORE NAME</th>
                <th className="pb-3 font-semibold">OWNER NAME</th>
                <th className="pb-3 font-semibold">TAX / INCORPORATION ID</th>
                <th className="pb-3 font-semibold">REJECTION EXCEPTION DETAIL</th>
                <th className="pb-3 font-semibold">DECLINED ON</th>
                <th className="pb-3 font-semibold text-right">COMPLIANCE ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    Loading rejected compliance files...
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#FF6A00]/80">{s.kycId || `KYC-${s._id.slice(-4).toUpperCase()}`}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{s.store}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{s.owner}</td>
                    <td className="py-4 font-mono text-[#687280]">{s.taxId}</td>
                    <td className="py-4 font-medium text-red-600/80 leading-relaxed max-w-xs">{s.rejectReason || "Unspecified policy violation"}</td>
                    <td className="py-4 text-[#687280]">{new Date(s.updatedAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleReRequest(s._id, s.store)}
                        disabled={s.reRequested}
                        className={`p-1 px-3 rounded text-[10px] font-bold transition-all border ${
                          s.reRequested
                            ? "bg-gray-700/50 text-gray-500 border-transparent cursor-not-allowed"
                            : "bg-[#FF6A00]/10 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black border-[#FF6A00]/20 hover:border-transparent shadow-md"
                        }`}
                      >
                        {s.reRequested ? "Alerted Seller" : "Request Re-upload"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RejectedKYC;
