import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import { ChevronDown, Check, Search, Plus, X, Trash2 } from "lucide-react";

// Custom Dropdown Component: Opens ONLY on Click (never hover), clean theme, optional search
const CustomDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  searchable = false,
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
  onDeleteOption = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter((opt) => {
        const text = typeof opt === "string" ? opt : `${opt.label} ${opt.sublabel || ""}`;
        return text.toLowerCase().includes(search.toLowerCase());
      })
    : options;

  const selectedItem = options.find((opt) =>
    typeof opt === "string" ? opt === value : opt.value === value
  );

  const displayLabel = selectedItem
    ? typeof selectedItem === "string"
      ? selectedItem
      : selectedItem.label
    : placeholder;

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-[#687280] font-semibold text-xs">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen && searchable) setSearch("");
        }}
        className="w-full px-4 py-2.5 bg-white border border-[#687280]/20 focus:border-[#FF6A00] rounded-lg text-[#0A1F44] font-semibold text-xs flex items-center justify-between transition-colors shadow-sm outline-none cursor-pointer"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#FF6A00]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#687280]/20 rounded-xl shadow-2xl py-1 z-50 animate-[fadeIn_0.15s_ease-out]">
          {searchable && (
            <div className="p-2 border-b border-[#687280]/15 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-[#0A1F44] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs text-gray-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const optValue = typeof opt === "string" ? opt : opt.value;
                const optLabel = typeof opt === "string" ? opt : opt.label;
                const optSublabel = typeof opt === "string" ? null : opt.sublabel;
                const isSelected = optValue === value;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2.5 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? "bg-[#FF6A00]/10 text-[#FF6A00] font-bold"
                        : "text-[#0A1F44] hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-[#0A1F44]">{optLabel}</span>
                      {optSublabel && (
                        <span className="text-[10px] text-[#687280] font-normal">{optSublabel}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {isSelected && <Check className="w-4 h-4 text-[#FF6A00] shrink-0" />}
                      {onDeleteOption && opt.isDeletable !== false && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteOption(opt);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AddBalance = () => {
  const [selectedStore, setSelectedStore] = useState("");
  const [amount, setAmount] = useState("");
  const [txType, setTxType] = useState("Insurance Claim");
  const [memo, setMemo] = useState("");
  const [reference, setReference] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Manageable categories for Add Balance (Credit)
  const defaultCreditCategories = [
    { name: "Insurance Claim", sublabel: "Lost or damaged cargo settlement" },
    { name: "Coupon", sublabel: "Promotional or discount credit voucher" },
    { name: "Cash Deposit", sublabel: "Direct cash deposit to account" },
    { name: "Bonus / Cashback", sublabel: "Merchant volume incentive or referral reward" },
    { name: "Bank Transfer", sublabel: "Direct NEFT/RTGS/IMPS wire transfer receipt" },
  ];
  const [categories, setCategories] = useState(defaultCreditCategories);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSublabel, setNewCatSublabel] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/wallet/categories?type=Credit");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
      }
    } catch (e) {
      console.warn("Could not fetch categories from server, using local defaults", e.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert("Please enter a category name");
      return;
    }
    setIsAddingCat(true);
    try {
      const res = await API.post("/wallet/categories", {
        name: newCatName.trim(),
        type: "Credit",
        sublabel: newCatSublabel.trim(),
      });
      const created = res.data?.category || { name: newCatName.trim(), sublabel: newCatSublabel.trim() };
      
      setCategories((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === created.name.toLowerCase());
        return exists ? prev : [...prev, created];
      });
      setTxType(created.name);
      setShowAddCategoryModal(false);
      setNewCatName("");
      setNewCatSublabel("");
      alert(`Category "${created.name}" added successfully!`);
    } catch (err) {
      console.error("Create category error:", err);
      // Fallback local add
      const fallbackCat = { name: newCatName.trim(), sublabel: newCatSublabel.trim() };
      setCategories((prev) => [...prev, fallbackCat]);
      setTxType(fallbackCat.name);
      setShowAddCategoryModal(false);
      setNewCatName("");
      setNewCatSublabel("");
    } finally {
      setIsAddingCat(false);
    }
  };

  const [deletingCatId, setDeletingCatId] = useState(null);

  const handleDeleteCategory = async (catItem) => {
    const catName = typeof catItem === "string" ? catItem : catItem.name || catItem.label || catItem.value;
    const catId = catItem._id || catItem.id || catName;

    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    setDeletingCatId(catId);
    try {
      await API.delete(`/wallet/categories/${encodeURIComponent(catId)}`);
      setCategories((prev) => prev.filter((c) => c._id !== catId && c.name !== catName));
      if (txType === catName) {
        setTxType("");
      }
      alert(`Category "${catName}" deleted successfully!`);
    } catch (err) {
      console.error("Delete category error:", err);
      setCategories((prev) => prev.filter((c) => (c._id && c._id !== catId) || c.name !== catName));
      if (txType === catName) {
        setTxType("");
      }
      alert(`Category "${catName}" removed.`);
    } finally {
      setDeletingCatId(null);
    }
  };

  // Real registered sellers loaded dynamically from MongoDB (No dummy data)
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);

  const fetchSellers = async () => {
    setLoadingSellers(true);
    try {
      // 1. Fetch registered users from API
      const userRes = await API.get("/users?limit=100");
      const usersList = userRes.data?.users || (Array.isArray(userRes.data) ? userRes.data : []);

      // 2. Fetch admin wallets roster
      let balancesList = [];
      try {
        const balRes = await API.get("/wallet/admin/balances");
        balancesList = Array.isArray(balRes.data) ? balRes.data : [];
      } catch (e) {
        console.warn("Could not fetch admin balances", e.message);
      }

      // Merge real registered users with their wallet balance
      const mapped = usersList.map((u) => {
        const userWallet = balancesList.find(
          (b) =>
            b.user?._id === u._id ||
            b.user === u._id ||
            b.storeName === u.companyName ||
            b.storeName === u.name
        );
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          companyName: u.companyName,
          storeName: userWallet?.storeName || u.companyName || u.name,
          balance: userWallet
            ? (userWallet.availableBalance ?? userWallet.balance ?? 0)
            : (u.wallet?.availableBalance ?? u.wallet?.balance ?? 0),
        };
      });

      // Add any wallets that might have been created separately
      balancesList.forEach((b) => {
        const exists = mapped.some((m) => m.id === b.user?._id || m.storeName === b.storeName);
        if (!exists && b.storeName) {
          mapped.push({
            id: b._id,
            name: b.user?.name || b.storeName,
            email: b.user?.email || "",
            role: b.user?.role || "Seller",
            companyName: b.storeName,
            storeName: b.storeName,
            balance: b.availableBalance ?? b.balance ?? 0,
          });
        }
      });

      setSellers(mapped);

      // Auto-select first seller if not yet set
      if (mapped.length > 0 && !selectedStore) {
        setSelectedStore(mapped[0].name || mapped[0].storeName);
      }
    } catch (error) {
      console.warn("Error fetching live sellers:", error.message);
      setSellers([]);
    } finally {
      setLoadingSellers(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStore) {
      alert("Please select a target merchant store.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid balance amount greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await API.post("/wallet/admin/add", {
        storeName: selectedStore,
        amount: numericAmount,
        type: txType,
        reference: reference,
        memo: memo,
        currency: currency,
      });

      setSuccessMessage({
        id: res.data.transaction?.transactionId || `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        merchant: selectedStore,
        amount: `${currency} ${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        type: txType,
        ref: res.data.transaction?.referenceId || reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString(),
      });

      // Refresh real balances list
      fetchSellers();

      // Clear input fields
      setAmount("");
      setMemo("");
      setReference("");
    } catch (error) {
      console.error("Adjustment error:", error);
      alert(error.response?.data?.message || "Failed to dispatch ledger adjustment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dropdown options
  const sellerOptions = sellers.map((s) => ({
    value: s.name || s.storeName,
    label: s.name, // Login seller name show
    sublabel: `${s.email ? s.email + " • " : ""}${s.storeName ? s.storeName + " • " : ""}Bal: ₹${parseFloat(s.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  }));

  const currencyOptions = [
    { value: "INR", label: "INR (₹)" },
    { value: "AED", label: "AED (AED)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
  ];

  // Dynamic categories with sublabels
  const adjustmentTypeOptions = categories.map((c) => ({
    value: c.name,
    label: c.name,
    sublabel: c.sublabel,
    _id: c._id,
    id: c._id,
    name: c.name,
    isDeletable: true,
  }));

  return (
    <div className="space-y-8 select-none max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">
          Manual Balance Dispatch Terminal
        </h1>
        <p className="text-sm text-[#687280]">
          Perform direct credit additions or ledger adjustments to merchant wallet nodes. Requires complete authorization audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Real Registered Sellers Directory */}
        <div className="md:col-span-1 glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#687280] uppercase tracking-wider mb-3">
              Merchant Node Balances
            </h3>
            <div className="divide-y divide-[#687280]/10 max-h-[420px] overflow-y-auto custom-scrollbar">
              {loadingSellers ? (
                <div className="py-6 text-center text-xs text-gray-500">Loading sellers...</div>
              ) : sellers.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">No sellers registered yet.</div>
              ) : (
                sellers.map((m, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="block font-semibold text-[#0A1F44]">{m.name}</span>
                      <span className="text-[10px] text-gray-500">{m.storeName || m.email}</span>
                    </div>
                    <span className="font-mono text-[#FF6A00]/80 font-extrabold">
                      ₹{parseFloat(m.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Form Terminal */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/2 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-sm font-bold text-[#0A1F44] border-b border-[#687280]/20 pb-3">
            Initiate Financial Adjustment
          </h3>

          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-500/20 text-green-600 rounded-xl space-y-2 text-xs animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-2 font-extrabold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ledger Updated Successfully!
              </div>
              <p className="text-[11px] text-[#687280] leading-relaxed">
                Merchant <strong className="text-[#0A1F44]">{successMessage.merchant}</strong> wallet has been credited with <strong className="text-[#FF6A00]">{successMessage.amount}</strong> via <strong className="text-[#0A1F44]">{successMessage.type}</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-green-500/10 pt-2 text-[#687280]">
                <span>SYSTEM ID: {successMessage.id}</span>
                <span className="text-right">REFERENCE: {successMessage.ref}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Target Merchant Store Dropdown with Search Box & Real Login Seller Names */}
            <CustomDropdown
              label="Target Merchant Store *"
              value={selectedStore}
              onChange={setSelectedStore}
              options={sellerOptions}
              searchable={true}
              searchPlaceholder="Search seller name, store, email..."
              placeholder={loadingSellers ? "Loading sellers..." : "Select registered seller..."}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Wallet Currency Selector */}
              <CustomDropdown
                label="Wallet Currency *"
                value={currency}
                onChange={setCurrency}
                options={currencyOptions}
                searchable={false}
              />

              {/* Adjustment Amount */}
              <div className="space-y-1.5">
                <label className="block text-[#687280] font-semibold">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono font-bold text-[#FF6A00]/80">
                    {currency === "INR" ? "₹" : currency === "AED" ? "Dh" : currency === "USD" ? "$" : "£"}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 bg-white border border-[#687280]/20 focus:border-[#FF6A00] rounded-lg text-[#0A1F44] font-semibold focus:outline-none transition-all font-mono shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Adjustment Category with manual Add Category option */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[#687280] font-semibold text-xs">Adjustment Type *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="text-[11px] font-bold text-[#FF6A00] hover:text-orange-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Category
                  </button>
                </div>
                <CustomDropdown
                  value={txType}
                  onChange={setTxType}
                  options={adjustmentTypeOptions}
                  searchable={true}
                  placeholder="Select or search category..."
                  onDeleteOption={handleDeleteCategory}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reference ID */}
              <div className="space-y-1.5">
                <label className="block text-[#687280] font-semibold">External Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CLAIM-8921, COUPON-500..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#687280]/20 focus:border-[#FF6A00] rounded-lg text-[#0A1F44] font-medium focus:outline-none transition-all font-mono shadow-sm"
                />
              </div>

              {/* Audit Memo */}
              <div className="space-y-1.5">
                <label className="block text-[#687280] font-semibold">Internal Audit Memo / Notes *</label>
                <input
                  type="text"
                  placeholder="Describe reason for balance addition..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#687280]/20 focus:border-[#FF6A00] rounded-lg text-[#0A1F44] font-medium focus:outline-none transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="p-3.5 bg-[#FF6A00]/5 border border-[#FF6A00]/10 rounded-xl space-y-2">
              <span className="block text-[10px] text-[#FF6A00] font-bold uppercase tracking-wider">
                Compliance Safeguards
              </span>
              <p className="text-[10px] text-[#687280] leading-relaxed">
                By clicking dispatch, you authorize a real-time modification of the ledger of this merchant wallet. This operation is immediately logged under your administrative identity and cannot be deleted from the audit logs.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FF6A00] hover:bg-orange-500 disabled:bg-[#FF6A00]/30 disabled:text-black/40 text-black font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authorizing Ledger Adjustment...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Dispatch Balance Credits
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 🏷️ ADD NEW CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="bg-[#0A1F44] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FF6A00]/20 rounded-lg text-[#FF6A00]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Credit Category</h3>
                  <p className="text-[11px] text-gray-300">Create a custom category for balance additions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCatName("");
                  setNewCatSublabel("");
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1F44]">
                  Category Name <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Volume Incentive, Vendor Bonus..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#FF6A00] focus:bg-white rounded-xl text-xs font-semibold text-[#0A1F44] outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1F44]">
                  Description / Sublabel <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly performance payout for high tier stores"
                  value={newCatSublabel}
                  onChange={(e) => setNewCatSublabel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#FF6A00] focus:bg-white rounded-xl text-xs font-medium text-[#0A1F44] outline-none transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCatName("");
                    setNewCatSublabel("");
                  }}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingCat || !newCatName.trim()}
                  className="px-5 py-2.5 bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs transition disabled:opacity-50 shadow-md shadow-[#FF6A00]/20 flex items-center gap-1.5"
                >
                  {isAddingCat ? "Saving..." : "Add & Select Category"}
                </button>
              </div>

              {/* Existing Categories List with Delete Option */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Existing Categories ({categories.length})
                  </span>
                  <span className="text-[10px] text-gray-400">Click trash icon to delete</span>
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {categories.map((cat, idx) => (
                    <div
                      key={cat._id || idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/60 transition group text-xs"
                    >
                      <div className="min-w-0 pr-2 text-left">
                        <span className="font-semibold text-[#0A1F44] block truncate">{cat.name}</span>
                        {cat.sublabel && (
                          <span className="text-[10px] text-gray-500 block truncate">{cat.sublabel}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={deletingCatId === (cat._id || cat.name)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition shrink-0"
                        title={`Delete ${cat.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBalance;
