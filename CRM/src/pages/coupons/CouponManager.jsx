import React, {useState, useEffect} from "react";
import API from "../../services/api";
import {toast} from "react-toastify";
import Pagination from "../../components/Pagination";

const CouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Dynamic Categories State
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);

    // Quick Add Category State in Coupon Modal
    const [showQuickAddCat, setShowQuickAddCat] = useState(false);
    const [quickCatName, setQuickCatName] = useState("");
    const [quickCatLoading, setQuickCatLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState(null);
    const itemsPerPage = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        category: "General",
        couponType: "Percentage",
        value: "",
        minRecharge: 0,
        firstTimeOnly: false,
        isActive: true,
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch Categories from Database
    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const res = await API.get("/coupons/categories");
            const fetched = res.data?.categories || [];
            setCategories(fetched);
            if (fetched.length > 0 && !formData.category) {
                setFormData((prev) => ({ ...prev, category: fetched[0].name }));
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            // Fallback default categories
            setCategories([
                { _id: "cat_1", name: "General" },
                { _id: "cat_2", name: "Wallet Recharge" },
                { _id: "cat_3", name: "Shipping Discount" },
                { _id: "cat_4", name: "Festive Offer" },
                { _id: "cat_5", name: "Promotional" },
                { _id: "cat_6", name: "Special Offer" },
                { _id: "cat_7", name: "Cashback" },
            ]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Create Category Manually
    const handleCreateCategory = async (name) => {
        if (!name || !name.trim()) {
            toast.warning("Please enter a category name.");
            return null;
        }
        try {
            const res = await API.post("/coupons/categories", { name: name.trim() });
            toast.success(res.data?.message || `Category "${name}" created successfully!`);
            await fetchCategories();
            return res.data?.category;
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error(error.response?.data?.message || "Failed to create category.");
            return null;
        }
    };

    // Delete Category
    const handleDeleteCategory = async (cat) => {
        if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
            return;
        }
        try {
            const res = await API.delete(`/coupons/categories/${cat._id}`);
            toast.success(res.data?.message || "Category deleted successfully!");
            await fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error(error.response?.data?.message || "Failed to delete category.");
        }
    };

    // Quick Add in Coupon Modal
    const handleQuickAddCategory = async (e) => {
        e.preventDefault();
        if (!quickCatName.trim()) return;
        setQuickCatLoading(true);
        const created = await handleCreateCategory(quickCatName);
        if (created) {
            setFormData((prev) => ({ ...prev, category: created.name }));
            setQuickCatName("");
            setShowQuickAddCat(false);
        }
        setQuickCatLoading(false);
    };

    // Debounce the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Coupons
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch
            });

            if (selectedCategory && selectedCategory !== "All") {
                queryParams.append("category", selectedCategory);
            }

            const res = await API.get(`/coupons?${queryParams.toString()}`);
            setCoupons(res.data.coupons || []);
            setPaginationData(res.data.pagination || null);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Failed to load coupons from database.");
            // Fallback simulated list if API fails
            setCoupons([
                {
                    _id: "1",
                    code: "WELCOME100",
                    description: "Get flat ₹100 extra balance on your first topup of ₹500 or more!",
                    category: "Wallet Recharge",
                    couponType: "Flat",
                    value: 100,
                    minRecharge: 500,
                    firstTimeOnly: true,
                    isActive: true
                },
                {
                    _id: "2",
                    code: "GROW20",
                    description: "Get 20% bonus balance on your first wallet recharge of ₹1000 or more!",
                    category: "Promotional",
                    couponType: "Percentage",
                    value: 20,
                    minRecharge: 1000,
                    firstTimeOnly: true,
                    isActive: true
                },
                {
                    _id: "3",
                    code: "FESTIVE10",
                    description: "Enjoy 10% bonus balance on any recharge of ₹1000 or more!",
                    category: "Festive Offer",
                    couponType: "Percentage",
                    value: 10,
                    minRecharge: 1000,
                    firstTimeOnly: false,
                    isActive: true
                },
            ]);
            setPaginationData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [currentPage, debouncedSearch, selectedCategory]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleOpenAdd = () => {
        setEditItem(null);
        setShowQuickAddCat(false);
        setQuickCatName("");
        const defaultCat = categories.length > 0 ? categories[0].name : "General";
        setFormData({
            code: "",
            description: "",
            category: defaultCat,
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
        setShowQuickAddCat(false);
        setQuickCatName("");
        const defaultCat = item.category || (categories.length > 0 ? categories[0].name : "General");
        setFormData({
            code: item.code,
            description: item.description,
            category: defaultCat,
            couponType: item.couponType || "Percentage",
            value: item.value,
            minRecharge: item.minRecharge || 0,
            firstTimeOnly: !!item.firstTimeOnly,
            isActive: item.isActive !== undefined ? !!item.isActive : true,
        });
        setIsModalOpen(true);
    };

    const handleToggleActive = async (item) => {
        try {
            const res = await API.put(`/coupons/${item._id}`, {
                isActive: !item.isActive,
            });
            toast.success(res.data?.message || `Coupon marked as ${!item.isActive ? "Active" : "Inactive"}`);
            fetchCoupons();
        } catch (error) {
            console.error("Error toggling coupon status:", error);
            toast.error("Failed to update status.");
        }
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
                <div className="flex flex-wrap items-center gap-2.5 self-start">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#E5E7EB]/50 text-[#0A1F44] border border-[#687280]/25 font-bold rounded-xl text-xs shadow-sm transition-all hover:scale-[1.02]"
                    >
                        <svg className="w-4 h-4 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Manage Categories
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6A00] text-[#0A1F44] hover:bg-[#FF6A00]/90 font-bold rounded-xl text-xs shadow-lg transition-all hover:scale-[1.02]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                        </svg>
                        Create Coupon
                    </button>
                </div>
            </div>

            {/* Filter and Search */}
            <div
                className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Search coupon code, description, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
                        />
                        <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full sm:w-auto px-3 py-2.5 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-semibold"
                    >
                        <option value="All">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id || cat.name} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="text-xs text-[#687280] font-medium">
                    Total Offers Configured: <span
                    className="font-bold text-[#0A1F44]">{paginationData?.totalItems || 0}</span>
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
                            <th className="pb-3 font-semibold text-center">CATEGORY</th>
                            <th className="pb-3 font-semibold text-center">TYPE</th>
                            <th className="pb-3 font-semibold text-center">VALUE</th>
                            <th className="pb-3 font-semibold text-center">STATUS</th>
                            <th className="pb-3 font-semibold text-right">ADMIN OPERATIONS</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div
                                            className="w-6 h-6 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
                                        <p>Loading promotional campaigns...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : coupons.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                                    No active or inactive coupons found matching criteria.
                                </td>
                            </tr>
                        ) : (
                            coupons.map((item) => (
                                <tr key={item._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                                    {/* Code */}
                                    <td className="py-4">
                      <span
                          className="font-mono font-black text-sm text-[#FF6A00] bg-[#FF6A00]/5 px-2.5 py-1 rounded-lg border border-[#FF6A00]/15">
                        {item.code}
                      </span>
                                    </td>

                                    {/* Description */}
                                    <td className="py-4 font-medium text-[#0A1F44] pr-4">
                                        {item.description}
                                    </td>

                                    {/* Category */}
                                    <td className="py-4 text-center">
                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6A00]/10 text-[#0A1F44] border border-[#FF6A00]/20">
                                            {item.category || "General"}
                                        </span>
                                    </td>

                                    {/* Type */}
                                    <td className="py-4 text-center font-bold">
                                        {item.couponType}
                                    </td>

                                    {/* Value */}
                                    <td className="py-4 text-center font-mono font-bold text-[#0A1F44]">
                                        {item.couponType === "Flat" ? `₹${item.value}` : `${item.value}%`}
                                    </td>

                                    {/* Status with quick toggle */}
                                    <td className="py-4 text-center">
                                      <button
                                          type="button"
                                          onClick={() => handleToggleActive(item)}
                                          title="Click to toggle status"
                                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer ${
                                              item.isActive
                                                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                                          }`}>
                                        {item.isActive ? "Active" : "Inactive"}
                                      </button>
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

                {!loading && (
                    <Pagination
                        pagination={paginationData}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Modal Popup */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
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
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                     strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            {/* Coupon Code */}
                            <div>
                                <label
                                    className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                                    Coupon Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editItem} // Code should be immutable once created
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    placeholder="e.g. WELCOME100"
                                    className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all uppercase font-mono disabled:opacity-60"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                                    Campaign Description <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="e.g. Get flat ₹100 extra balance on first recharge!"
                                    className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all"
                                />
                            </div>

                            {/* Coupon Category Dropdown with Quick Add */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-[#0A1F44] uppercase tracking-wider">
                                        Coupon Category <span className="text-red-500">*</span>
                                    </label>
                                    {!showQuickAddCat ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowQuickAddCat(true)}
                                            className="text-[11px] font-bold text-[#FF6A00] hover:underline inline-flex items-center gap-1 cursor-pointer"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                            </svg>
                                            + Add Category
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowQuickAddCat(false);
                                                setQuickCatName("");
                                            }}
                                            className="text-[11px] font-semibold text-[#687280] hover:text-[#0A1F44] cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                {showQuickAddCat && (
                                    <div className="p-3 bg-[#E5E7EB]/40 rounded-xl border border-[#FF6A00]/40 space-y-2 mb-2 animate-[fadeIn_0.2s_ease-out]">
                                        <div className="text-[11px] font-bold text-[#0A1F44]">
                                            Create Category Manually
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={quickCatName}
                                                onChange={(e) => setQuickCatName(e.target.value)}
                                                placeholder="e.g. Clearance Sale, VIP..."
                                                className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none focus:border-[#FF6A00]"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleQuickAddCategory(e);
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleQuickAddCategory}
                                                disabled={quickCatLoading || !quickCatName.trim()}
                                                className="px-3 py-1.5 bg-[#FF6A00] text-[#0A1F44] font-bold rounded-lg text-xs hover:bg-[#FF6A00]/90 disabled:opacity-50 transition-all shadow-sm"
                                            >
                                                {quickCatLoading ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-semibold"
                                >
                                    {categories.length === 0 ? (
                                        <option value="">No categories created yet</option>
                                    ) : (
                                        categories.map((cat) => (
                                            <option key={cat._id || cat.name} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Coupon Type & Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                                        Discount Type
                                    </label>
                                    <select
                                        value={formData.couponType}
                                        onChange={(e) => setFormData({...formData, couponType: e.target.value})}
                                        className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 rounded-lg text-[#0A1F44] focus:outline-none transition-all font-semibold"
                                    >
                                        <option value="Percentage">Percentage (%)</option>
                                        <option value="Flat">Flat Rupees (₹)</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        className="block text-xs font-semibold text-[#0A1F44] mb-1.5 uppercase tracking-wider">
                                        Bonus Value <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.value}
                                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                                        placeholder={formData.couponType === "Percentage" ? "e.g. 10" : "e.g. 100"}
                                        className="w-full px-3 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 focus:bg-white rounded-lg text-[#0A1F44] focus:outline-none transition-all font-mono"
                                    />
                                </div>
                            </div>

                            {/* Only show Active toggle when editing an existing coupon */}
                            {editItem && (
                                <div className="pt-2 border-t border-[#687280]/15">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            className="rounded border-[#687280]/30 text-[#FF6A00] focus:ring-[#FF6A00]"
                                        />
                                        <span className="text-xs text-[#0A1F44] font-semibold">Active Campaign</span>
                                    </label>
                                </div>
                            )}

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

            {/* Category Manager Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-[#0A1F44]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
                    <div
                        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#687280]/20 relative transform transition-transform animate-[scaleUp_0.2s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#687280]/15 pb-4 mb-5">
                            <div>
                                <h3 className="text-base font-extrabold text-[#0A1F44]">
                                    Manage Coupon Categories
                                </h3>
                                <p className="text-[11px] text-[#687280]">
                                    Add categories manually. Created categories will appear in the coupon creation dropdown.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="text-[#687280] hover:text-[#0A1F44] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Add Category Form */}
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!newCategoryName.trim()) return;
                                setAddingCategory(true);
                                const res = await handleCreateCategory(newCategoryName);
                                if (res) {
                                    setNewCategoryName("");
                                }
                                setAddingCategory(false);
                            }}
                            className="p-4 bg-[#E5E7EB]/30 rounded-xl border border-[#687280]/20 space-y-3 mb-5"
                        >
                            <div className="text-xs font-bold text-[#0A1F44]">
                                Add New Category Manually
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    required
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Festival Offer, VIP Member, Clearance..."
                                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none focus:border-[#FF6A00]"
                                />
                                <button
                                    type="submit"
                                    disabled={addingCategory || !newCategoryName.trim()}
                                    className="px-4 py-2 bg-[#FF6A00] text-[#0A1F44] font-bold rounded-lg text-xs hover:bg-[#FF6A00]/90 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    {addingCategory ? "Adding..." : "Add Category"}
                                </button>
                            </div>
                        </form>

                        {/* Categories List */}
                        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                            <div className="text-xs font-bold text-[#687280] uppercase tracking-wider mb-2">
                                Configured Categories ({categories.length})
                            </div>
                            {categories.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-6">
                                    No categories found. Add your first category above!
                                </p>
                            ) : (
                                categories.map((cat) => (
                                    <div
                                        key={cat._id || cat.name}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#687280]/15 hover:border-[#FF6A00]/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2 h-2 rounded-full bg-[#FF6A00]"></span>
                                            <span className="text-xs font-bold text-[#0A1F44]">
                                                {cat.name}
                                            </span>
                                        </div>
                                        {cat._id && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCategory(cat)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs transition-colors"
                                                title="Delete Category"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-[#687280]/15 pt-4 mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="px-4 py-2 bg-[#E5E7EB] hover:bg-[#E5E7EB]/80 text-[#0A1F44] rounded-lg text-xs font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManager;