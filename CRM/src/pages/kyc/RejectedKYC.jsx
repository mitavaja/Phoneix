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
      console.error("Express API rejected KYC registry unreachable.", error.message);
      setSubmissions([]);
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
                <th className="pb-3 font-semibold">COMPLIANCE DOCUMENTS</th>
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
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        {s.panCard && (
                          <a
                            href={`http://localhost:5000/uploads/${s.panCard}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            PAN Card
                          </a>
                        )}
                        {s.aadhaarCard && (
                          <a
                            href={`http://localhost:5000/uploads/${s.aadhaarCard}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            Aadhaar
                          </a>
                        )}
                        {s.gstCertificate && (
                          <a
                            href={`http://localhost:5000/uploads/${s.gstCertificate}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            GST Cert
                          </a>
                        )}
                        {s.addressProof && (
                          <a
                            href={`http://localhost:5000/uploads/${s.addressProof}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            Address Proof
                          </a>
                        )}
                        {s.companyRegistration && (
                          <a
                            href={`http://localhost:5000/uploads/${s.companyRegistration}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            Company Reg
                          </a>
                        )}
                        {!s.panCard && !s.aadhaarCard && !s.gstCertificate && !s.addressProof && !s.companyRegistration && s.document && (
                          <a
                            href={`http://localhost:5000/uploads/${s.document}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all underline"
                          >
                            Doc
                          </a>
                        )}
                        {!s.panCard && !s.aadhaarCard && !s.gstCertificate && !s.addressProof && !s.companyRegistration && !s.document && (
                          <span className="text-gray-400 italic">None Provided</span>
                        )}
                      </div>
                    </td>
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
