import React, {useEffect, useState} from "react";
import API from "../../services/api";
import { HelpCircle, Send, Upload } from "lucide-react";
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

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setTicketSuccess("");
        try {
            const res = await API.post("/tickets/ticket", ticketForm);
            setTicketSuccess(res.data.message || "Support ticket created successfully.");
            setTicketForm({ subject: "", type: "Shipment Issue", description: "" });
            await fetchTickets();
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
        <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 animate-fade-in grid lg:grid-cols-3 gap-8">

            {/* Ticket creation and listing */}
            <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-[#687280]/20 pb-2">Open New Ticket</h3>

                    <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Subject</label>
                            <input
                                type="text"
                                placeholder="Delayed delivery AWB..."
                                value={ticketForm.subject}
                                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Issue category</label>
                            <select
                                value={ticketForm.type}
                                onChange={(e) => setTicketForm({ ...ticketForm, type: e.target.value })}
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            >
                                <option value="Shipment Issue">Shipment Issue</option>
                                <option value="Tracking Issue">Tracking Issue</option>
                                <option value="Pickup Issue">Pickup Issue</option>
                                <option value="Billing Issue">Billing Issue</option>
                                <option value="Account Issue">Account Issue</option>
                                <option value="Other">Other Query</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Problem details</label>
                            <textarea
                                placeholder="Elaborate details..."
                                value={ticketForm.description}
                                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                rows="3"
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>

                        {ticketSuccess && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-2 rounded">
                                {ticketSuccess}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[#FF6A00] text-[#0A1F44] font-bold py-2.5 rounded-xl text-xs hover:brightness-110 transition"
                        >
                            Submit Ticket
                        </button>
                    </form>
                </div>

                {/* Ticket roster list */}
                <div className="space-y-4 pt-4 border-t border-[#687280]/20">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Tickets</h3>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {tickets.map(t => (
                            <div
                                key={t._id}
                                onClick={() => setSelectedTicket(t)}
                                className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                                    selectedTicket?._id === t._id ? "bg-[#FF6A00]/20 border-[#FF6A00]" : "bg-black/20 border-white/5 hover:border-white/10"
                                }`}
                            >
                                <div className="space-y-1">
                                    <span className="font-mono text-[10px] text-[#FF6A00] font-bold block">{t.ticketId}</span>
                                    <span className="font-bold text-white text-xs block truncate max-w-[120px]">{t.subject}</span>
                                    <span className="text-[9px] text-gray-500 block">{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    t.status === "Resolved" || t.status === "Closed" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                }`}>
                          {t.status}
                        </span>
                            </div>
                        ))}
                        {tickets.length === 0 && (
                            <p className="text-gray-500 text-center py-6 text-xs">No active tickets opened.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Ticket Chat thread */}
            <div className="lg:col-span-2 bg-black/20 border border-white/5 rounded-3xl p-6 flex flex-col justify-between min-h-[450px]">
                {selectedTicket ? (
                    <>
                        <div>
                            <div className="flex justify-between items-start border-b border-[#687280]/20 pb-4 mb-4">
                                <div>
                                    <span className="font-mono text-xs text-[#FF6A00] font-bold">{selectedTicket.ticketId} | {selectedTicket.type}</span>
                                    <h4 className="text-lg font-bold text-white">{selectedTicket.subject}</h4>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                }`}>
                          Status: {selectedTicket.status}
                        </span>
                            </div>

                            {/* Chat Messages */}
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                                {selectedTicket.messages.map((m, idx) => (
                                    <div key={idx} className={`flex flex-col ${m.sender === "Seller" ? "items-end" : "items-start"}`}>
                                        <div className={`p-3 rounded-2xl max-w-sm text-xs ${
                                            m.sender === "Seller" ? "bg-[#FF6A00]/20 text-white rounded-tr-none" : "bg-[#0A1F44] text-white rounded-tl-none border border-white/5"
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
                                        <span className="text-[9px] text-gray-500 mt-1">{new Date(m.time).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Send reply message */}
                        {selectedTicket.status !== "Closed" && (
                            <form onSubmit={handleTicketReply} className="flex gap-3 items-center">
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
                                    className="bg-[#0A1F44] hover:bg-white/5 border border-white/10 text-[#FF6A00] p-3 rounded-xl transition flex items-center justify-center shrink-0"
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
                                    className="flex-1 p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#FF6A00] text-[#0A1F44] font-bold px-4 py-3 rounded-xl hover:brightness-110 transition flex items-center justify-center shrink-0"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </>
                ) : (
                    <div className="my-auto text-center text-gray-500 py-20">
                        <HelpCircle size={48} className="mx-auto mb-3 text-gray-600 animate-pulse" />
                        <p className="text-sm">Select a ticket from the left panel to inspect communication logs.</p>
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