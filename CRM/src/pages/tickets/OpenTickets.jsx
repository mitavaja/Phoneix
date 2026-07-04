import React, { useState, useEffect } from "react";
import API from "../../services/api";

const OpenTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await API.get("/tickets/admin/tickets");
      // Filter open and in progress tickets
      const open = (res.data || []).filter(t => ["Open", "In Progress"].includes(t.status));
      setTickets(open);
      if (open.length > 0 && !activeTicketId) {
        setActiveTicketId(open[0]._id);
      }
    } catch (error) {
      console.error("Failed to load platform tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const activeTicket = tickets.find(t => t._id === activeTicketId);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicketId) return;

    try {
      await API.post(`/tickets/ticket/${activeTicketId}/reply`, { content: replyMessage.trim() });
      setReplyMessage("");
      alert("Reply sent successfully.");
      await fetchTickets();
    } catch (error) {
      alert(`Error sending reply: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleResolve = async (id, storeName) => {
    try {
      await API.put(`/tickets/admin/ticket/${id}/status`, { status: "Resolved" });
      alert(`Ticket resolved: Ticket for ${storeName} resolved successfully.`);
      setActiveTicketId(null);
      setReplyMessage("");
      await fetchTickets();
    } catch (error) {
      alert(`Error resolving ticket: ${error.response?.data?.message || error.message}`);
    }
  };

  const getPriorityStyle = (type) => {
    switch (type) {
      case "Billing Issue": return "bg-red-100 text-red-600 border border-red-200";
      case "Shipment Issue": return "bg-amber-100 text-[#FF6A00] border border-[#FF6A00]/20";
      default: return "bg-blue-100 text-blue-600 border border-blue-200";
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Active Support Inbox</h1>
        <p className="text-sm text-[#687280]">Respond to merchant support queries, troubleshoot billing concerns, and review system feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List queue */}
        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 lg:col-span-1 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#0A1F44] mb-1">Inboxes ({tickets.length})</h3>
            <p className="text-xs text-[#687280]">Open questions and dispute tickets from platform sellers.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-[460px]">
            {loading ? (
              <div className="text-center text-xs text-gray-500 py-6">Loading tickets queue...</div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setActiveTicketId(t._id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    activeTicketId === t._id
                      ? "bg-[#FF6A00]/5 border-[#FF6A00]/35 text-[#FF6A00] shadow-md"
                      : "bg-[#E5E7EB]/30 hover:bg-[#E5E7EB]/40 border-[#687280]/20 text-[#687280]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold font-mono text-gray-500 uppercase">{t.ticketId}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider ${getPriorityStyle(t.type)}`}>
                      {t.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0A1F44] mb-1 truncate">{t.subject}</h4>
                  <div className="flex justify-between items-center text-[10px] text-[#687280] mt-2">
                    <span>Store: {t.userId?.companyName || "Merchant"}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
            {!loading && tickets.length === 0 && (
              <div className="py-12 text-center text-gray-500 font-semibold text-xs">
                🎉 Hurrah! Zero open support tickets. Inbox completely cleared.
              </div>
            )}
          </div>
        </div>

        {/* Detailed Ticket Reading & Resolution Window */}
        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 lg:col-span-2 min-h-[440px] flex flex-col justify-between">
          {activeTicket ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Header Info */}
              <div className="border-b border-[#687280]/20 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs px-2.5 py-0.5 bg-[#FF6A00]/10 text-[#FF6A00] rounded-md font-bold text-[10px] uppercase tracking-wider">{activeTicket.type}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider bg-amber-100 text-amber-600">{activeTicket.status}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0A1F44] leading-tight">{activeTicket.subject}</h3>
                  <p className="text-[10px] text-gray-500 font-medium mt-1">Ticket ID: {activeTicket.ticketId} | Opened: {new Date(activeTicket.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Seller Store</span>
                  <span className="text-[#0A1F44] font-semibold text-xs">{activeTicket.userId?.companyName || "Merchant"}</span>
                  <span className="block text-[9px] text-gray-500">{activeTicket.userId?.email}</span>
                </div>
              </div>

              {/* Message Description / Messages Chat Thread */}
              <div className="flex-1 bg-[#E5E7EB]/30 border border-[#687280]/20 rounded-xl p-4 text-xs leading-relaxed text-[#687280] min-h-[200px] select-text overflow-y-auto space-y-4">
                <span className="block text-[9px] text-gray-500 font-bold uppercase border-b border-[#687280]/15 pb-1">Communication Log:</span>
                
                {activeTicket.messages && activeTicket.messages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.sender === "Seller" ? "items-start" : "items-end"}`}>
                    <span className="text-[9px] text-gray-500 font-semibold mb-0.5">{m.sender}:</span>
                    <div className={`p-2.5 rounded-xl max-w-sm ${m.sender === "Seller" ? "bg-[#0A1F44] text-white" : "bg-[#FF6A00]/10 text-[#0A1F44]"}`}>
                      {m.content}
                    </div>
                    <span className="text-[8px] text-gray-500 mt-0.5">{new Date(m.time).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="space-y-3">
                <form onSubmit={handleSendReply}>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1.5">Draft Support Reply</label>
                  <div className="flex gap-2">
                    <textarea
                      rows="2"
                      placeholder="Provide reply updates to merchant..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      required
                      className="flex-1 px-4 py-2.5 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-xl text-[#0A1F44] focus:outline-none transition-all resize-none"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-[#0A1F44] text-white font-bold rounded-xl text-xs hover:bg-[#071630] transition flex items-center justify-center shrink-0"
                    >
                      Reply
                    </button>
                  </div>
                </form>

                <div className="flex justify-end border-t border-[#687280]/10 pt-3">
                  <button
                    onClick={() => handleResolve(activeTicket._id, activeTicket.userId?.companyName || "Merchant")}
                    className="px-5 py-2 bg-[#FF6A00] text-[#0A1F44] font-bold hover:bg-orange-500 rounded-xl text-xs transition-all tracking-wide shadow-lg flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Close & Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 flex-1">
              <svg className="w-14 h-14 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H8a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4" />
              </svg>
              <h3 className="text-sm font-bold text-[#0A1F44] mb-1">No Ticket Selected</h3>
              <p className="text-xs text-gray-500 max-w-xs">Select an open ticket inquiry from the sidebar inbox to read seller concerns and send immediate resolutions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenTickets;
