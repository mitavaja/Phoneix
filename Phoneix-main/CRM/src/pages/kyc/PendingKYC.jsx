import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Pagination from "../../components/Pagination";

const PendingKYC = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);
  const itemsPerPage = 10;

  const fetchPendingKYC = async (page) => {
    setLoading(true);
    try {
      const res = await API.get(`/kyc/pending?page=${page}&limit=${itemsPerPage}`);
      setSubmissions(res.data.submissions || []);
      setPaginationData(res.data.pagination || null);
    } catch (error) {
      console.error("Express API pending KYC list unreachable.", error.message);
      setSubmissions([]);
      setPaginationData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKYC(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleAction = async (id, store, isApproved) => {
    try {
      if (isApproved) {
        await API.put(`/kyc/${id}/approve`);
        alert(`Success: Merchant store "${store}" has been KYC verified! Account activated.`);
      } else {
        const reason = prompt(`Provide rejection reason for merchant "${store}":`, "Document image fuzzy or cropped.");
        if (!reason) return;
        await API.put(`/kyc/${id}/reject`, { reason });
        alert(`Merchant "${store}" KYC rejected. Reason: "${reason}"`);
      }
      // Refresh the current page after action
      fetchPendingKYC(currentPage);
    } catch (error) {
      alert(`Error updating KYC state: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
      <div className="space-y-8 select-none">
        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Pending KYC Verifications</h1>
            <p className="text-sm text-[#687280]">Review merchant registration tax certifications, passport files, and authorize merchant accounts.</p>
          </div>
          <div className="glass-card px-4 py-2 rounded-xl border border-[#FF6A00]/20 text-[#FF6A00] text-center font-bold text-sm">
            {paginationData?.totalItems || 0} Awaiting Scan
          </div>
        </div>

        {/* List */}
        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">TICKET ID</th>
                <th className="pb-3 font-semibold">STORE NAME</th>
                <th className="pb-3 font-semibold">OWNER</th>
                <th className="pb-3 font-semibold">TAX / BUSINESS ID</th>
                <th className="pb-3 font-semibold">DOCUMENT FILE</th>
                <th className="pb-3 font-semibold">FILED ON</th>
                <th className="pb-3 font-semibold text-right">COMPLIANCE DECISION</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading compliance documents queue...</p>
                      </div>
                    </td>
                  </tr>
              ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 font-semibold">
                      🎉 Excellent! All pending compliance folders are cleared.
                    </td>
                  </tr>
              ) : (
                  submissions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                        <td className="py-4 font-mono font-bold text-[#FF6A00]/80">{sub.kycId || `KYC-${sub._id.slice(-4).toUpperCase()}`}</td>
                        <td className="py-4 font-semibold text-[#0A1F44]">{sub.store}</td>
                        <td className="py-4 font-semibold text-[#0A1F44]">{sub.owner}</td>
                        <td className="py-4 font-mono text-[#687280]">{sub.taxId}</td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                            {sub.panCard && (
                                <a
                                    href={`http://localhost:5000/uploads/${sub.panCard}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                                >
                                  PAN Card
                                </a>
                            )}
                            {sub.aadhaarCard && (
                                <a
                                    href={`http://localhost:5000/uploads/${sub.aadhaarCard}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                                >
                                  Aadhaar
                                </a>
                            )}
                            {sub.gstCertificate && (
                                <a
                                    href={`http://localhost:5000/uploads/${sub.gstCertificate}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                                >
                                  GST Cert
                                </a>
                            )}
                            {sub.addressProof && (
                                <a
                                    href={`http://localhost:5000/uploads/${sub.addressProof}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                                >
                                  Address Proof
                                </a>
                            )}
                            {sub.companyRegistration && (
                                <a
                                    href={`http://localhost:5000/uploads/${sub.companyRegistration}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                                >
                                  Company Reg
                                </a>
                            )}
                            {!sub.panCard && !sub.aadhaarCard && !sub.gstCertificate && !sub.addressProof && !sub.companyRegistration && sub.document && (
                                <a
                                    href={`http://localhost:5000/uploads/${sub.document}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all underline"
                                >
                                  Doc
                                </a>
                            )}
                            {!sub.panCard && !sub.aadhaarCard && !sub.gstCertificate && !sub.addressProof && !sub.companyRegistration && !sub.document && (
                                <span className="text-gray-400 italic">None Provided</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-[#687280]">{new Date(sub.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                                onClick={() => handleAction(sub._id, sub.store, false)}
                                className="p-1 px-3 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded text-[10px] font-bold border border-red-500/20 hover:border-transparent transition-all"
                            >
                              Reject KYC
                            </button>
                            <button
                                onClick={() => handleAction(sub._id, sub.store, true)}
                                className="p-1 px-3 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 rounded text-[10px] font-bold transition-all shadow-md"
                            >
                              Approve KYC
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {!loading && (
              <Pagination
                  pagination={paginationData}
                  onPageChange={handlePageChange}
              />
          )}
        </div>
      </div>
  );
};

export default PendingKYC;