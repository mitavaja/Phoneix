import React, {useEffect, useState} from "react";
import API from "../../services/api";
import { HelpCircle, Send, Upload, Plus, XCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [ticketForm, setTicketForm] = useState({
        subject: "",
        type: "Shipment Issue",
        description: ""
    });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketReply, setTicketReply] = useState("");
    const [ticketSuccess, setTicketSuccess] = useState("");

    const fetchTickets = async () => {
        try {
            const ticketsRes = await API.get("/tickets/my-tickets");
            setTickets(ticketsRes.data || []);
            if (selectedTicket) {
                const updated = ticketsRes.data.find(t => t._id === selectedTicket._id);
                if (updated) setSelectedTicket(updated);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error while retrieving tickets.");
        }
    }

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createdTicketId, setCreatedTicketId] = useState("");

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setTicketSuccess("");
        setCreatedTicketId("");
        try {
            const res = await API.post("/tickets/ticket", ticketForm);
            const created = res.data?.ticket;
            const tId = created?.ticketId || "";
            setCreatedTicketId(tId);
            setTicketSuccess(`Support Ticket Raised Successfully! Assigned Ticket ID: ${tId}`);
            toast.success(`Ticket ${tId} opened successfully!`);
            setTicketForm({ subject: "", type: "Shipment Issue", description: "" });
            setShowCreateModal(false);

            const updatedRes = await API.get("/tickets/my-tickets");
            const allTickets = updatedRes.data || [];
            setTickets(allTickets);
            if (created && created._id) {
                const found = allTickets.find(t => t._id === created._id);
                setSelectedTicket(found || created);
            } else if (allTickets.length > 0) {
                setSelectedTicket(allTickets[allTickets.length - 1]);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to open support ticket.");
        }
    };

    const handleTicketReply = async (e) => {
        e.preventDefault();
        if (!ticketReply.trim()) return;
        try {
            await API.post(`/tickets/ticket/${selectedTicket._id}/reply`, { content: ticketReply });
            setTicketReply("");
            await fetchTickets();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send message.");
        }
    };

    useEffect(() => {
        fetchTickets()
    }, []);
    return (
        <div className="glass-card border border-[#687280]/20 rounded-2xl p-6 shadow-xl animate-fade-in grid lg:grid-cols-3 gap-8">

            {/* Ticket roster list & New Ticket Header */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#687280]/20">
                    <div>
                        <h3 className="text-base font-extrabold text-[#0A1F44]">Support Tickets</h3>
                        <p className="text-[10px] text-[#687280]">{tickets.length} total tickets logged</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                    >
                        <Plus size={14} /> New Ticket
                    </button>
                </div>

                {ticketSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                        <div>
                            <span className="font-bold block">Ticket Logged</span>
                            <span className="text-[11px]">{ticketSuccess}</span>
                        </div>
                    </div>
                )}

                {/* Ticket roster list */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-[#0A1F44] uppercase tracking-wider">Your Active Tickets</h3>

                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                        {tickets.map(t => (
                            <div
                                key={t._id}
                                onClick={() => setSelectedTicket(t)}
                                className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                                    selectedTicket?._id === t._id ? "bg-[#FF6A00]/10 border-2 border-[#FF6A00] shadow-sm" : "bg-white border-[#687280]/20 hover:border-[#687280]/40 hover:bg-[#E5E7EB]/20 shadow-sm"
                                }`}
                            >
                                <div className="space-y-1">
                                    <span className="font-mono text-[10px] text-[#FF6A00] font-black block">{t.ticketId}</span>
                                    <span className="font-bold text-[#0A1F44] text-xs block truncate max-w-[140px]">{t.subject}</span>
                                    <span className="text-[10px] text-[#687280] block">{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    t.status === "Resolved" || t.status === "Closed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                                }`}>
                                    {t.status}
                                </span>
                            </div>
                        ))}
                        {tickets.length === 0 && (
                            <p className="text-[#687280] text-center py-6 text-xs">No active tickets opened.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Ticket Chat thread */}
            <div className="lg:col-span-2 bg-[#E5E7EB]/30 border border-[#687280]/20 rounded-2xl p-6 flex flex-col justify-between min-h-[450px]">
                {selectedTicket ? (
                    <>
                        <div>
                            <div className="flex justify-between items-start border-b border-[#687280]/20 pb-4 mb-4">
                                <div>
                                    <span className="font-mono text-xs text-[#FF6A00] font-black">{selectedTicket.ticketId} | {selectedTicket.type}</span>
                                    <h4 className="text-lg font-black text-[#0A1F44]">{selectedTicket.subject}</h4>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                                }`}>
                                    Status: {selectedTicket.status}
                                </span>
                            </div>

                            {/* Chat Messages */}
                            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-6">
                                {selectedTicket.messages.map((m, idx) => (
                                    <div key={idx} className={`flex flex-col ${m.sender === "Seller" ? "items-end" : "items-start"}`}>
                                        <div className={`p-3.5 rounded-2xl max-w-sm text-xs shadow-sm ${
                                            m.sender === "Seller" ? "bg-[#FF6A00] text-white rounded-tr-none" : "bg-white text-[#0A1F44] rounded-tl-none border border-[#687280]/20"
                                        }`}>
                                            {m.content.startsWith("data:image/") ? (
                                                <img
                                                    src={m.content}
                                                    alt="Attachment"
                                                    className="max-w-xs rounded-lg cursor-zoom-in hover:opacity-90 transition"
                                                    onClick={() => {
                                                        const w = window.open();
                                                        w.document.write(`<img src="${m.content}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                                    }}
                                                />
                                            ) : (
                                                <p>{m.content}</p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-[#687280] mt-1 font-medium">{new Date(m.time).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Send reply message */}
                        {selectedTicket.status !== "Closed" && (
                            <form onSubmit={handleTicketReply} className="flex gap-3 items-center pt-3 border-t border-[#687280]/20">
                                <input
                                    id="ticket-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            const reader = new FileReader();
                                            reader.onloadend = async () => {
                                                const base64String = reader.result;
                                                try {
                                                    await API.post(`/tickets/ticket/${selectedTicket._id}/reply`, {
                                                        content: base64String
                                                    });
                                                    await fetchTickets();
                                                } catch (err) {
                                                    toast.error(err.response?.data?.message || "Failed to send image attachment.");
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("ticket-image-upload").click()}
                                    className="bg-white hover:bg-[#E5E7EB]/50 border border-[#687280]/30 text-[#FF6A00] p-3 rounded-xl transition flex items-center justify-center shrink-0 shadow-sm"
                                    title="Upload Image"
                                >
                                    <Upload size={16} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type reply message content..."
                                    value={ticketReply}
                                    onChange={(e) => setTicketReply(e.target.value)}
                                    required
                                    className="flex-1 p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] placeholder:text-[#687280]/60 outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] text-xs transition"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#FF6A00] text-white font-bold px-4 py-3 rounded-xl hover:brightness-110 transition flex items-center justify-center shrink-0 shadow-md"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </>
                ) : (
                    <div className="my-auto text-center text-[#687280] py-20">
                        <HelpCircle size={48} className="mx-auto mb-3 text-[#687280]/50 animate-pulse" />
                        <p className="text-sm font-semibold">Select a ticket from the left panel to inspect communication logs.</p>
                    </div>
                )}
            </div>

            <a
                href="https://whatsapp.com/channel/0029VbDi2MGI1rcrq6PGZO3t"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] transition-all duration-300 group"
                title="Join our WhatsApp Channel for Support"
            >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
            </a>

        </div>
    )
}

export default Tickets