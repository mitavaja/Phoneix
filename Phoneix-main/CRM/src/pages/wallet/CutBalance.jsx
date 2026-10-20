import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import { ChevronDown, Check, Search, AlertTriangle, MinusCircle, Wallet, ArrowDownRight, ShieldAlert, Plus, X, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

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

const CutBalance = () => {
  const [selectedStore, setSelectedStore] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Weight Discrepancy");
  const [memo, setMemo] = useState("");
  const [reference, setReference] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Manageable categories for Cut Balance (Debit)
  const defaultDebitCategories = [
    { name: "Weight Discrepancy", sublabel: "Carrier audit weight difference charges" },
    { name: "RTO Charges", sublabel: "Return to origin freight & logistics charges" },
    { name: "Penalty / Violation", sublabel: "Platform policy breach or KYC fine" },
    { name: "Customs & Duty Adjustment", sublabel: "Consignee unpaid duties or customs fee debit" },
    { name: "Lost / Damaged Goods Fee", sublabel: "Transit damage adjustment or inspection fees" },
    { name: "Cancellation Fee", sublabel: "Consignment cancellation after pickup/manifest" },
    { name: "Manual Recovery / Correction", sublabel: "Administrative ledger clawback or debit correction" },
    { name: "Other / Miscellaneous", sublabel: "Custom deduction reason specified in memo" },
  ];
  const [categories, setCategories] = useState(defaultDebitCategories);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSublabel, setNewCatSublabel] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/wallet/categories?type=Debit");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
      }
    } catch (e) {
      console.warn("Could not fetch debit categories from server, using local defaults", e.message);
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
        type: "Debit",
        sublabel: newCatSublabel.trim(),
      });
      const created = res.data?.category || { name: newCatName.trim(), sublabel: newCatSublabel.trim() };
      
      setCategories((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === created.name.toLowerCase());
        return exists ? prev : [...prev, created];
      });
      setCategory(created.name);
      setShowAddCategoryModal(false);
      setNewCatName("");
      setNewCatSublabel("");
      toast.success(`Deduction Category "${created.name}" created successfully!`);
    } catch (err) {
      console.error("Create category error:", err);
      const fallbackCat = { name: newCatName.trim(), sublabel: newCatSublabel.trim() };
      setCategories((prev) => [...prev, fallbackCat]);
      setCategory(fallbackCat.name);
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
      if (category === catName) {
        setCategory("");
      }
      toast.success(`Category "${catName}" deleted successfully!`);
    } catch (err) {
      console.error("Delete category error:", err);
      setCategories((prev) => prev.filter((c) => (c._id && c._id !== catId) || c.name !== catName));
      if (category === catName) {
        setCategory("");
      }
      toast.info(`Category "${catName}" removed.`);
    } finally {
      setDeletingCatId(null);
    }
  };

  // Sellers roster from MongoDB
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [sellerSearch, setSellerSearch] = useState("");

  const fetchSellers = async () => {
    setLoadingSellers(true);
    try {
      const userRes = await API.get("/users?limit=100");
      const usersList = userRes.data?.users || (Array.isArray(userRes.data) ? userRes.data : []);

      let balancesList = [];
      try {
        const balRes = await API.get("/wallet/admin/balances");
        balancesList = Array.isArray(balRes.data) ? balRes.data : [];
      } catch (e) {
        console.warn("Could not fetch admin balances", e.message);
      }

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

  // Currently selected seller object
  const currentSeller = sellers.find(
    (s) => (s.name || s.storeName) === selectedStore || s.storeName === selectedStore || s.email === selectedStore
  );

  const currentAvailableBalance = currentSeller ? parseFloat(currentSeller.balance || 0) : 0;
  const numericAmount = parseFloat(amount) || 0;
  const isInsufficient = numericAmount > 0 && numericAmount > currentAvailableBalance;
  const balanceAfterCut = Math.max(0, currentAvailableBalance - numericAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStore) {
      toast.error("Please select a target merchant store.");
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0 to deduct.");
      return;
    }

    if (isInsufficient) {
      toast.error(`Insufficient balance: Available balance is ₹${currentAvailableBalance.toFixed(2)}. Cannot cut ₹${numericAmount.toFixed(2)}.`);
      return;
    }

    if (!memo.trim()) {
      toast.error("Please provide an internal audit memo / reason for cutting balance.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await API.post("/wallet/admin/cut", {
        storeName: selectedStore,
        amount: numericAmount,
        category: category,
        reference: reference,
        memo: memo,
        currency: currency,
      });

      toast.success(`Successfully cut ₹${numericAmount.toFixed(2)} (${category}) from seller wallet!`);

      setSuccessMessage({
        id: res.data.transaction?.referenceId || `CUT-${Math.floor(10000 + Math.random() * 90000)}`,
        merchant: currentSeller?.name || selectedStore,
        amount: `${currency} ${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        category: category,
        ref: res.data.transaction?.referenceId || reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString(),
        newBalance: `${currency} ${balanceAfterCut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      });

      // Refresh sellers balances
      await fetchSellers();

      // Reset form fields
      setAmount("");
      setMemo("");
      setReference("");
    } catch (error) {
      console.error("Cut balance error:", error);
      const errMsg = error.response?.data?.message || "Failed to process balance deduction.";
      toast.error(errMsg);
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dropdown options
  const sellerOptions = sellers.map((s) => ({
    value: s.name || s.storeName,
    label: s.name,
    sublabel: `${s.email ? s.email + " • " : ""}${s.storeName ? s.storeName + " • " : ""}Bal: ₹${parseFloat(s.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  }));

  const currencyOptions = [
    { value: "INR", label: "INR (₹)" },
    { value: "AED", label: "AED (AED)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
  ];

  // Category-wise deduction options for admin (Dynamic from DB / local state)
  const categoryOptions = categories.map((c) => ({
    value: c.name,
    label: c.name,
    sublabel: c.sublabel,
    _id: c._id,
    id: c._id,
    name: c.name,
    isDeletable: true,
  }));

  const filteredSellersList = sellers.filter((s) => {
    if (!sellerSearch) return true;
    const q = sellerSearch.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.storeName && s.storeName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-600 rounded-xl border border-red-500/20">
            <MinusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">
              Cut Balance Terminal (Debit / Deduction)
            </h1>
            <p className="text-sm text-[#687280]">
              Deduct seller wallet balance category-wise (Weight Discrepancy, RTO Charges, Penalties, Customs, etc.).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Real Registered Sellers Directory */}
        <div className="md:col-span-1 glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#687280] uppercase tracking-wider">
                Seller Accounts
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">
                {sellers.length} registered
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sellers..."
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-[#0A1F44] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div className="divide-y divide-[#687280]/10 max-h-[460px] overflow-y-auto custom-scrollbar">
              {loadingSellers ? (
                <div className="py-6 text-center text-xs text-gray-500">Loading sellers...</div>
              ) : filteredSellersList.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">No matching sellers found.</div>
              ) : (
                filteredSellersList.map((m, idx) => {
                  const isCurrent = (m.name || m.storeName) === selectedStore || m.storeName === selectedStore;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedStore(m.name || m.storeName)}
                      className={`py-2.5 px-2 rounded-lg flex justify-between items-center text-xs cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-red-500/10 border-l-2 border-red-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <span className={`block font-semibold ${isCurrent ? "text-red-700" : "text-[#0A1F44]"}`}>
                          {m.name}
                        </span>
                        <span className="text-[10px] text-gray-500">{m.storeName || m.email}</span>
                      </div>
                      <span className="font-mono text-gray-700 font-bold">
                        ₹{parseFloat(m.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Deduction Form Terminal */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between border-b border-[#687280]/20 pb-3">
            <h3 className="text-sm font-bold text-[#0A1F44] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Debit Ledger Authorization
            </h3>
            {currentSeller && (
              <span className="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                Available: <strong className="text-[#0A1F44]">₹{currentAvailableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
            )}
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 bg-red-50 border border-red-500/20 text-red-700 rounded-xl space-y-2 text-xs animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-2 font-extrabold text-red-800">
                <MinusCircle className="w-5 h-5 text-red-600" />
                Seller Balance Successfully Deducted!
              </div>
              <p className="text-[11px] text-gray-700 leading-relaxed">
                Merchant <strong className="text-[#0A1F44]">{successMessage.merchant}</strong> wallet has been debited by <strong className="text-red-600">{successMessage.amount}</strong> under category <strong className="text-[#0A1F44]">"{successMessage.category}"</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-red-200 pt-2 text-gray-600">
                <span>NEW BALANCE: {successMessage.newBalance}</span>
                <span className="text-right">REF: {successMessage.ref}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Target Merchant Store */}
            <CustomDropdown
              label="Target Merchant Seller *"
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
                label="Currency *"
                value={currency}
                onChange={setCurrency}
                options={currencyOptions}
                searchable={false}
              />

              {/* Amount to Cut */}
              <div className="space-y-1.5">
                <label className="block text-[#687280] font-semibold">Cut Amount *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono font-bold text-red-600">
                    {currency === "INR" ? "₹" : currency === "AED" ? "Dh" : currency === "USD" ? "$" : "£"}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-4 py-2.5 pl-10 bg-white border ${
                      isInsufficient ? "border-red-500 focus:border-red-600" : "border-[#687280]/20 focus:border-[#FF6A00]"
                    } rounded-lg text-[#0A1F44] font-semibold focus:outline-none transition-all font-mono shadow-sm`}
                    required
                  />
                </div>
              </div>

              {/* Category-wise Cut with manual Add Category option */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[#687280] font-semibold text-xs">Cut Category *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Category
                  </button>
                </div>
                <CustomDropdown
                  value={category}
                  onChange={setCategory}
                  options={categoryOptions}
                  searchable={true}
                  placeholder="Select or search category..."
                  onDeleteOption={handleDeleteCategory}
                />
              </div>
            </div>

            {/* Insufficient Balance Alert */}
            {isInsufficient && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Insufficient Balance Alert:</strong> The seller's current available balance is ₹{currentAvailableBalance.toFixed(2)}. You cannot cut ₹{numericAmount.toFixed(2)}.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reference ID */}
              <div className="space-y-1.5">
                <label className="block text-[#687280] font-semibold">External Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. AWB-892189, DISP-1049, RTO-492..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#687280]/20 focus:border-[#FF6A00] rounded-lg text-[#0A1F44] font-medium focus:outline-none transition-all font-mono shadow-sm"
                />
              </div>

              {/* Audit Memo */}
              <div className="space-y-1.5">
                <label className="block text-[#687280] font-semibold">Internal Audit Memo / Reason *</label>
                <input
                  type="text"
                  placeholder="Reason for balance deduction..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#687280]/20 focus:border-[#FF6A00] rounded-lg text-[#0A1F44] font-medium focus:outline-none transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Live Balance Impact Preview Card */}
            {numericAmount > 0 && currentSeller && (
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Current Balance:</span>
                  <span className="font-mono font-bold text-[#0A1F44]">
                    ₹{currentAvailableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-red-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    Deduction ({category}):
                  </span>
                  <span className="font-mono font-bold">
                    -₹{numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-gray-200 pt-2 font-bold">
                  <span className="text-[#0A1F44]">Estimated Balance After Cut:</span>
                  <span className={`font-mono text-sm ${isInsufficient ? "text-red-600" : "text-green-700"}`}>
                    ₹{balanceAfterCut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl space-y-2">
              <span className="block text-[10px] text-red-600 font-bold uppercase tracking-wider">
                Audit & Compliance Safeguards
              </span>
              <p className="text-[10px] text-[#687280] leading-relaxed">
                By confirming, you authorize an immediate debit modification to this merchant's ledger. A formal notification will be dispatched to the merchant's dashboard with the selected category and reasoning.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isInsufficient || !selectedStore || numericAmount <= 0}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Balance Deduction...
                </>
              ) : (
                <>
                  <MinusCircle className="w-4 h-4" />
                  Cut & Deduct Seller Balance
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 🏷️ ADD NEW DEDUCTION CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="bg-[#0A1F44] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Deduction Category</h3>
                  <p className="text-[11px] text-gray-300">Create a custom category for balance cuts/penalties</p>
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
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Return Freight Surcharge, Storage Fine..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white rounded-xl text-xs font-semibold text-[#0A1F44] outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1F44]">
                  Description / Sublabel <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special carrier freight debit after inspection"
                  value={newCatSublabel}
                  onChange={(e) => setNewCatSublabel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white rounded-xl text-xs font-medium text-[#0A1F44] outline-none transition"
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
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition disabled:opacity-50 shadow-md shadow-red-500/20 flex items-center gap-1.5"
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

export default CutBalance;
