import React, { useState, useEffect } from "react";
import API from "../../services/api";

const ClosedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClosedTickets = async () => {
    try {
      const res = await API.get("/tickets/admin/tickets");
      const closed = (res.data || []).filter(t => ["Resolved", "Closed"].includes(t.status));
      setTickets(closed);
    } catch (error) {
      console.error("Failed to load resolved tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosedTickets();
  }, []);

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Resolved Tickets Archive</h1>
        <p className="text-sm text-[#687280]">Review historical support ticket resolutions, agent closure reports, and customer satisfaction audits.</p>
      </div>

      {/* Tickets List */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                <th className="pb-3 font-semibold">TICKET ID</th>
                <th className="pb-3 font-semibold">SELLER STORE</th>
                <th className="pb-3 font-semibold">INQUIRY CATEGORY</th>
                <th className="pb-3 font-semibold">SUBJECT</th>
                <th className="pb-3 font-semibold">RESOLUTION ARCHIVE DETAILS</th>
                <th className="pb-3 font-semibold">DATE FILED</th>
                <th className="pb-3 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">Loading resolved tickets archive...</td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const lastMessage = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
                  return (
                    <tr key={t._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                      <td className="py-4 font-mono font-bold text-[#FF6A00]/80">{t.ticketId}</td>
                      <td className="py-4 font-semibold text-[#0A1F44]">{t.userId?.companyName || "Merchant"}</td>
                      <td className="py-4">
                        <span className="px-2.5 py-0.5 bg-[#E5E7EB]/40 rounded text-[10px] font-bold text-[#687280]">{t.type}</span>
                      </td>
                      <td className="py-4 font-semibold text-[#0A1F44]">{t.subject}</td>
                      <td className="py-4 text-[#687280] max-w-sm leading-relaxed">
                        {lastMessage ? (
                          <span>
                            <strong>Last ({lastMessage.sender}):</strong> {lastMessage.content}
                          </span>
                        ) : (
                          t.description
                        )}
                      </td>
                      <td className="py-4 text-[#687280]">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <span className="inline-flex px-2.5 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500 font-semibold">No resolved tickets archived in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClosedTickets;
