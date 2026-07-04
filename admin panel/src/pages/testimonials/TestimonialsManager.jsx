import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null when creating, testimonial object when editing
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stars: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Testimonials
  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await API.get("/testimonials");
      setTestimonials(res.data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to load testimonials from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      name: "",
      description: "",
      stars: 5,
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      stars: item.stars || 5,
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.warning("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (editItem) {
        // Update
        const res = await API.put(`/testimonials/${editItem._id}`, formData);
        toast.success(res.data?.message || "Testimonial updated successfully!");
      } else {
        // Create
        const res = await API.post("/testimonials", formData);
        toast.success(res.data?.message || "Testimonial added successfully!");
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast.error(error.response?.data?.message || "Failed to save testimonial.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Testimonial
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the testimonial from ${name}?`)) {
      return;
    }

    try {
      const res = await API.delete(`/testimonials/${id}`);
      toast.success(res.data?.message || "Testimonial deleted successfully!");
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error(error.response?.data?.message || "Failed to delete testimonial.");
    }
  };

  // Filtered testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term)
    );
  });

  // Helper to render star rating selectors or static stars
  const renderStars = (count, clickable = false, size = "w-4 h-4") => {
    const starsArray = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= count;
      starsArray.push(
        <button
          key={i}
          type={clickable ? "button" : undefined}
          disabled={!clickable}
          onClick={clickable ? () => setFormData({ ...formData, stars: i }) : undefined}
          className={`${clickable ? "hover:scale-125 transition-transform focus:outline-none" : ""} text-amber-400`}
        >
          <svg
            className={size}
            fill={isFilled ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.564-.371-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z"
            />
          </svg>
        </button>
      );
    }
    return <div className="flex gap-0.5">{starsArray}</div>;
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">
            Client Testimonials
          </h1>
          <p className="text-sm text-[#687280]">
            Create, update, and delete reviews and ratings displayed on the website home page.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 self-start px-4 py-2.5 bg-[#FF6A00] text-[#0A1F44] hover:bg-[#FF6A00]/90 font-bold rounded-xl text-xs shadow-lg transition-all hover:scale-[1.02] border border-transparent active:scale-[0.98]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Testimonial
        </button>
      </div>

      {/* Filter Options */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by client name or feedback..."
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

        <div className="text-xs text-[#687280] font-medium">
          Total Testimonials: <span className="font-bold text-[#0A1F44]">{filteredTestimonials.length}</span>
        </div>
      </div>

      {/* Grid of Testimonial Cards */}
      {loading ? (
        <div className="py-20 text-center text-[#687280] font-medium">
          <div className="inline-block w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-3"></div>
          <div>Loading testimonials from database...</div>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-[#687280]/20 flex flex-col items-center justify-center">
          <svg
            className="w-12 h-12 text-[#687280]/30 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-[#0A1F44] mb-1">No Testimonials Found</h3>
          <p className="text-xs text-[#687280] max-w-sm">
            {searchTerm
              ? "We couldn't find any testimonials matching your search term. Try checking your spelling or clear the filter."
              : "No client testimonials exist in the database yet. Click the 'Add Testimonial' button above to create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((item) => (
            <div
              key={item._id}
              className="glass-card p-6 rounded-2xl border border-[#687280]/20 hover:border-[#FF6A00]/30 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Quote Background Decorative */}
              <span className="absolute right-4 top-4 text-[#0A1F44]/5 text-7xl font-serif pointer-events-none group-hover:scale-110 transition-transform">
                “
              </span>

              {/* Star Ratings */}
              <div className="mb-4">
                {renderStars(item.stars, false, "w-4.5 h-4.5")}
              </div>

              {/* Feedback description */}
              <div className="flex-1 text-[#687280] text-xs leading-relaxed italic mb-6">
                "{item.description}"
              </div>

              {/* Client Info and Actions */}
              <div className="border-t border-[#687280]/15 pt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0A1F44] text-sm">{item.name}</h4>
                  <span className="text-[10px] text-[#687280]">Verified Client</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Testimonial"
                    className="p-2 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/10 hover:text-[#FF6A00] rounded-xl text-gray-500 border border-[#687280]/10 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    title="Delete Testimonial"
                    className="p-2 bg-red-500/5 hover:bg-red-500/10 hover:text-red-600 rounded-xl text-red-400 border border-red-500/10 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#687280]/20 relative transform transition-transform animate-[scaleUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#687280]/15 pb-4 mb-5">
              <h3 className="text-base font-extrabold text-[#0A1F44]">
                {editItem ? "Edit Client Testimonial" : "Add New Testimonial"}
              </h3>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all"
                />
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                  Star Rating (1 - 5) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-lg p-2 px-3 inline-block">
                  {renderStars(formData.stars, true, "w-6 h-6")}
                  <span className="text-xs font-extrabold text-[#FF6A00] ml-1">
                    {formData.stars} Stars
                  </span>
                </div>
              </div>

              {/* Testimonial Description */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                  Feedback Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter the client's detailed testimonial message..."
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
                  {submitting ? "Saving..." : editItem ? "Update Testimonial" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
