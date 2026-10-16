import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";

const InquireManager = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [statusText, setStatusText] = useState("Pending");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Inquiries
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await API.get("/contact/list");
      setInquiries(res.data);
    } catch (error) {
      console.error("Error fetching contact inquiries:", error);
      toast.error("Failed to load inquiries from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Open Reply Modal
  const handleOpenReply = (inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyText(inquiry.reply || "");
    setStatusText(inquiry.status || "Pending");
    setIsModalOpen(true);
  };

  // Submit Reply
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setSubmitting(true);
    try {
      const res = await API.put(`/contact/${selectedInquiry._id}`, {
        status: statusText,
        reply: replyText,
      });
      toast.success(res.data?.message || "Inquiry updated successfully!");
      setIsModalOpen(false);
      fetchInquiries();
    } catch (error) {
      console.error("Error replying to inquiry:", error);
      toast.error(error.response?.data?.message || "Failed to update inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.message.toLowerCase().includes(term) ||
      (item.reply && item.reply.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "all" || item.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">
          Contact Inquiries
        </h1>
        <p className="text-sm text-[#687280]">
          Manage client questions, complaints, and requests submitted via the website Contact form.
        </p>
      </div>

      {/* Filter and Search Options */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search name, email, or message contents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg
            className="w-4 h-4 text-gray-500 absolute left-3 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 self-start md:self-auto overflow-x-auto pb-1 md:pb-0 max-w-full custom-scrollbar">
          {["all", "Pending", "Replied", "Closed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                statusFilter === status
                  ? "bg-[#FF6A00] text-[#0A1F44] font-bold border-transparent shadow-[0_2px_8px_rgba(255,106,0,0.25)]"
                  : "bg-[#E5E7EB]/40 text-[#687280] hover:text-[#0A1F44] border-[#687280]/20"
              }`}
            >
              {status === "all" ? "All Messages" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiry List */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-semibold">
                <th className="pb-3 font-semibold w-[12%]">DATE</th>
                <th className="pb-3 font-semibold w-[18%]">CONTACT INFO</th>
                <th className="pb-3 font-semibold w-[35%]">MESSAGE</th>
                <th className="pb-3 font-semibold w-[10%] text-center">STATUS</th>
                <th className="pb-3 font-semibold w-[15%]">REPLY STATEMENT</th>
                <th className="pb-3 font-semibold text-right w-[10%]">OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                    <div className="inline-block w-6 h-6 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading inquiries from database...</div>
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <svg
                      className="w-10 h-10 text-gray-400/40 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h4 className="text-xs font-bold text-[#0A1F44] mb-1">No Inquiries Found</h4>
                    <p className="text-[11px] text-[#687280]">
                      No messages match the current search filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => (
                  <tr key={item._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    {/* Date */}
                    <td className="py-4 text-[#687280] font-mono leading-relaxed">
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-[#687280]/60">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4">
                      <div className="font-bold text-[#0A1F44]">{item.name}</div>
                      <div className="text-[11px] font-mono text-[#687280]">{item.email}</div>
                    </td>

                    {/* Message */}
                    <td className="py-4 pr-6">
                      <p className="line-clamp-3 text-[#687280] leading-relaxed whitespace-pre-line">
                        {item.message}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          item.status === "Closed"
                            ? "bg-gray-100 text-gray-500"
                            : item.status === "Replied"
                            ? "bg-green-100 text-green-600"
                            : "bg-[#FF6A00]/10 text-[#FF6A00]"
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>
                    </td>

                    {/* Reply Statement */}
                    <td className="py-4 pr-4">
                      {item.reply ? (
                        <p className="line-clamp-2 text-[#0A1F44] font-medium leading-relaxed italic">
                          "{item.reply}"
                        </p>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Unanswered</span>
                      )}
                    </td>

                    {/* Action Operations */}
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleOpenReply(item)}
                        className={`p-1.5 px-3 rounded-lg text-[10px] font-bold border transition-colors ${
                          item.reply
                            ? "bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 text-[#0A1F44] border-[#687280]/20"
                            : "bg-[#FF6A00]/10 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-[#0A1F44] border-[#FF6A00]/20 hover:border-transparent"
                        }`}
                      >
                        {item.reply ? "Edit Reply" : "Reply"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal Popup */}
      {isModalOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#687280]/20 relative transform transition-transform animate-[scaleUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#687280]/15 pb-4 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-[#0A1F44]">
                  Respond to Inquiry
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">
                  From: {selectedInquiry.name} ({selectedInquiry.email})
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#687280] hover:text-[#0A1F44] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Inquiry Details Display */}
            <div className="bg-[#E5E7EB]/25 border border-[#687280]/10 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
              <span className="text-[9px] text-[#687280] uppercase font-bold tracking-wider block mb-1">
                Client Original Message:
              </span>
              <p className="text-xs text-[#0A1F44] leading-relaxed whitespace-pre-line">
                "{selectedInquiry.message}"
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReply} className="space-y-4">
              {/* Inquiry Status Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                  Inquiry Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Replied">Replied</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Admin Reply text */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                  Your Statement / Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply message to record inside system logs..."
                  className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 border-t border-[#687280]/15 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#E5E7EB] hover:bg-[#E5E7EB]/80 text-[#0A1F44] rounded-lg text-xs font-bold transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-[#0A1F44] disabled:opacity-60 rounded-lg text-xs font-bold transition-all shadow-md active:scale-[0.98]"
                >
                  {submitting ? "Saving..." : "Save Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquireManager;
