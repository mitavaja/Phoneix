import React, { useState, useEffect } from "react";
import API from "../../services/api";

const VerifiedKYC = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifiedKYC = async () => {
      try {
        const res = await API.get("/kyc/verified");
        setMerchants(res.data);
      } catch (error) {
        console.error("Express API verified KYC registry unreachable.", error.message);
        setMerchants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVerifiedKYC();
  }, []);

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Verified Merchants Registry</h1>
        <p className="text-sm text-[#687280]">Roster of compliance-approved platform sellers, active tax IDs, and verification auditor logs.</p>
      </div>

      {/* Verified List */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">VERIFICATION ID</th>
                <th className="pb-3 font-semibold">STORE NAME</th>
                <th className="pb-3 font-semibold">OWNER NAME</th>
                <th className="pb-3 font-semibold">TAX / INCORPORATION ID</th>
                <th className="pb-3 font-semibold">COMPLIANCE DOCUMENTS</th>
                <th className="pb-3 font-semibold">VERIFIED ON</th>
                <th className="pb-3 font-semibold">AUDITING OFFICER</th>
                <th className="pb-3 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    Loading verified compliance registry...
                  </td>
                </tr>
              ) : (
                merchants.map((m) => (
                  <tr key={m._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#FF6A00]/80">{m.kycId || `KYC-${m._id.slice(-4).toUpperCase()}`}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{m.store}</td>
                    <td className="py-4 font-semibold text-[#0A1F44]">{m.owner}</td>
                    <td className="py-4 font-mono text-[#687280]">{m.taxId}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        {m.panCard && (
                          <a
                            href={`http://localhost:5000/uploads/${m.panCard}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            PAN Card
                          </a>
                        )}
                        {m.aadhaarCard && (
                          <a
                            href={`http://localhost:5000/uploads/${m.aadhaarCard}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            Aadhaar
                          </a>
                        )}
                        {m.gstCertificate && (
                          <a
                            href={`http://localhost:5000/uploads/${m.gstCertificate}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            GST Cert
                          </a>
                        )}
                        {m.addressProof && (
                          <a
                            href={`http://localhost:5000/uploads/${m.addressProof}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            Address Proof
                          </a>
                        )}
                        {m.companyRegistration && (
                          <a
                            href={`http://localhost:5000/uploads/${m.companyRegistration}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all"
                          >
                            Company Reg
                          </a>
                        )}
                        {!m.panCard && !m.aadhaarCard && !m.gstCertificate && !m.addressProof && !m.companyRegistration && m.document && (
                          <a
                            href={`http://localhost:5000/uploads/${m.document}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/25 text-[#0A1F44] border border-[#687280]/20 rounded text-[10px] font-bold transition-all underline"
                          >
                            Doc
                          </a>
                        )}
                        {!m.panCard && !m.aadhaarCard && !m.gstCertificate && !m.addressProof && !m.companyRegistration && !m.document && (
                          <span className="text-gray-400 italic">None Provided</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-[#687280]">{new Date(m.updatedAt).toLocaleDateString()}</td>
                    <td className="py-4 font-mono text-[#FF6A00]/85">{m.auditor || "Compliance Node"}</td>
                    <td className="py-4 text-right">
                      <span className="inline-flex px-2.5 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                        VERIFIED
                      </span>
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

export default VerifiedKYC;
