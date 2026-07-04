import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    couponType: "Percentage",
    value: "",
    minRecharge: 0,
    firstTimeOnly: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await API.get("/coupons");
      setCoupons(res.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons from database.");
      // Fallback simulated list if API fails
      setCoupons([
        { _id: "1", code: "WELCOME100", description: "Get flat ₹100 extra balance on your first topup of ₹500 or more!", couponType: "Flat", value: 100, minRecharge: 500, firstTimeOnly: true, isActive: true },
        { _id: "2", code: "GROW20", description: "Get 20% bonus balance on your first wallet recharge of ₹1000 or more!", couponType: "Percentage", value: 20, minRecharge: 1000, firstTimeOnly: true, isActive: true },
        { _id: "3", code: "FESTIVE10", description: "Enjoy 10% bonus balance on any recharge of ₹1000 or more!", couponType: "Percentage", value: 10, minRecharge: 1000, firstTimeOnly: false, isActive: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      code: "",
      description: "",
      couponType: "Percentage",
      value: "",
      minRecharge: 0,
      firstTimeOnly: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      code: item.code,
      description: item.description,
      couponType: item.couponType || "Percentage",
      value: item.value,
      minRecharge: item.minRecharge || 0,
      firstTimeOnly: !!item.firstTimeOnly,
      isActive: item.isActive !== undefined ? !!item.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.description.trim() || formData.value === "") {
      toast.warning("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (editItem) {
        // Update
        const res = await API.put(`/coupons/${editItem._id}`, formData);
        toast.success(res.data?.message || "Coupon updated successfully!");
      } else {
        // Create
        const res = await API.post("/coupons", formData);
        toast.success(res.data?.message || "Coupon created successfully!");
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message || "Failed to save coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      return;
    }

    try {
      const res = await API.delete(`/coupons/${id}`);
      toast.success(res.data?.message || "Coupon deleted successfully!");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error(error.response?.data?.message || "Failed to delete coupon.");
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.code.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">
            Offer Coupon Manager
          </h1>
          <p className="text-sm text-[#687280]">
            Create, configure, and manage wallet recharge promotional coupons for merchants.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 self-start px-4 py-2.5 bg-[#FF6A00] text-[#0A1F44] hover:bg-[#FF6A00]/90 font-bold rounded-xl text-xs shadow-lg transition-all hover:scale-[1.02]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Coupon
        </button>
      </div>

      {/* Filter and Search */}
      <div className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search coupon code or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="text-xs text-[#687280] font-medium">
          Total Offers Configured: <span className="font-bold text-[#0A1F44]">{filteredCoupons.length}</span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#687280]/20 text-[#687280] font-semibold">
                <th className="pb-3 font-semibold">CODE</th>
                <th className="pb-3 font-semibold">DESCRIPTION</th>
                <th className="pb-3 font-semibold text-center">TYPE</th>
                <th className="pb-3 font-semibold text-center">VALUE</th>
                <th className="pb-3 font-semibold text-center">MIN RECHARGE</th>
                <th className="pb-3 font-semibold text-center">TARGET AUDIENCE</th>
                <th className="pb-3 font-semibold text-center">STATUS</th>
                <th className="pb-3 font-semibold text-right">ADMIN OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
              {loading && coupons.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                    Loading promotional campaigns...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                    No active or inactive coupons found.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((item) => (
                  <tr key={item._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                    {/* Code */}
                    <td className="py-4">
                      <span className="font-mono font-black text-sm text-[#FF6A00] bg-[#FF6A00]/5 px-2.5 py-1 rounded-lg border border-[#FF6A00]/15">
                        {item.code}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-4 font-medium text-[#0A1F44] pr-4">
                      {item.description}
                    </td>

                    {/* Type */}
                    <td className="py-4 text-center font-bold">
                      {item.couponType}
                    </td>

                    {/* Value */}
                    <td className="py-4 text-center font-mono font-bold text-[#0A1F44]">
                      {item.couponType === "Flat" ? `₹${item.value}` : `${item.value}%`}
                    </td>

                    {/* Min Recharge */}
                    <td className="py-4 text-center font-mono text-[#687280]">
                      ₹{item.minRecharge || 0}
                    </td>

                    {/* Audience */}
                    <td className="py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.firstTimeOnly
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}>
                        {item.firstTimeOnly ? "First Recharge Only" : "All Recharges"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        item.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-[#E5E7EB]/40 hover:bg-[#FF6A00]/10 hover:text-[#FF6A00] rounded-lg text-gray-500 border border-[#687280]/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.code)}
                          className="p-1.5 bg-red-50/20 hover:bg-red-500/10 hover:text-red-600 rounded-lg text-red-400 border border-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#687280]/20 relative transform transition-transform animate-[scaleUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#687280]/15 pb-4 mb-5">
              <h3 className="text-base font-extrabold text-[#0A1F44]">
                {editItem ? "Edit Offer Coupon" : "Configure Coupon Campaign"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#687280] hover:text-[#0A1F44] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Coupon Code */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editItem} // Code should be immutable once created
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME100"
                  className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all uppercase font-mono disabled:opacity-60"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                  Campaign Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Get flat ₹100 extra balance on first recharge!"
                  className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all"
                />
              </div>

              {/* Coupon Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                    Discount Type
                  </label>
                  <select
                    value={formData.couponType}
                    onChange={(e) => setFormData({ ...formData, couponType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-semibold"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Rupees (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                    Bonus Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.couponType === "Percentage" ? "e.g. 10" : "e.g. 100"}
                    className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Minimum Recharge */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                  Minimum Recharge Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minRecharge}
                  onChange={(e) => setFormData({ ...formData, minRecharge: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all font-mono"
                />
              </div>

              {/* Toggle Options: First Time & Active */}
              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.firstTimeOnly}
                    onChange={(e) => setFormData({ ...formData, firstTimeOnly: e.target.checked })}
                    className="rounded border-[#687280]/30 text-[#FF6A00] focus:ring-[#FF6A00]"
                  />
                  <span className="text-xs text-[#0A1F44] font-semibold">First-time Recharge Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-[#687280]/30 text-[#FF6A00] focus:ring-[#FF6A00]"
                  />
                  <span className="text-xs text-[#0A1F44] font-semibold">Active Campaign</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 border-t border-[#687280]/15 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#E5E7EB] hover:bg-[#E5E7EB]/80 text-[#0A1F44] rounded-lg text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-[#0A1F44] disabled:opacity-60 rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  {submitting ? "Saving..." : editItem ? "Update Campaign" : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
