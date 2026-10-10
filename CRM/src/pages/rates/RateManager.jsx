import React, {useState, useEffect} from "react";
import API from "../../services/api";
import { CustomSelect } from "../../components/ui/CustomSelect";
import Pagination from "../../components/Pagination";

const RateManager = () => {
    const [margins, setMargins] = useState([]);
    const [merchantsList, setMerchantsList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Table Filter & Pagination States
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterUserId, setFilterUserId] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState(null);
    const itemsPerPage = 10;

    // Form states for adding margin rule
    const [marginType, setMarginType] = useState("Fixed");
    const [marginValue, setMarginValue] = useState("");
    const [marginCountry, setMarginCountry] = useState("");
    const [marginWeightMin, setMarginWeightMin] = useState("");
    const [marginWeightMax, setMarginWeightMax] = useState("");
    const [marginUserId, setMarginUserId] = useState("all");
    const [isAddingMargin, setIsAddingMargin] = useState(false);

    // Rate calculator states
    const [calcOrigin, setCalcOrigin] = useState("IN");
    const [calcDest, setCalcDest] = useState("AE");
    const [calcWeight, setCalcWeight] = useState("");
    const [calcLength, setCalcLength] = useState("");
    const [calcWidth, setCalcWidth] = useState("");
    const [calcHeight, setCalcHeight] = useState("");
    const [calcShipmentType, setCalcShipmentType] = useState("Parcel");
    const [calcResult, setCalcResult] = useState(null);
    const [calcError, setCalcError] = useState("");
    const [calculating, setCalculating] = useState(false);

    // Initial load for Users List
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRes = await API.get("/auth/list");
                setMerchantsList(usersRes.data.list || []);
            } catch (error) {
                console.error("Failed to fetch users list", error);
            }
        };
        fetchUsers();
    }, []);

    // Debounce the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset to first page when changing user filter
    useEffect(() => {
        setCurrentPage(1);
    }, [filterUserId]);

    const fetchMargins = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch,
                userId: filterUserId
            });

            const marginsRes = await API.get(`/rates/margins?${queryParams.toString()}`);
            setMargins(marginsRes.data.rules || []);
            setPaginationData(marginsRes.data.pagination || null);
        } catch (error) {
            console.error("Failed to fetch margins", error);
            setMargins([]);
            setPaginationData(null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Margins when filters or page changes
    useEffect(() => {
        fetchMargins();
    }, [currentPage, debouncedSearch, filterUserId]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleAddMarginRule = async (e) => {
        e.preventDefault();
        const val = parseFloat(marginValue);
        if (isNaN(val)) {
            alert("Please enter a valid markup value.");
            return;
        }

        try {
            await API.post("/rates/margins", {
                type: marginType,
                value: val,
                country: marginCountry,
                weightMin: marginWeightMin ? parseFloat(marginWeightMin) : 0,
                weightMax: marginWeightMax ? parseFloat(marginWeightMax) : 0,
                userId: marginUserId === "all" ? null : marginUserId
            });

            setIsAddingMargin(false);
            setMarginValue("");
            setMarginCountry("");
            setMarginWeightMin("");
            setMarginWeightMax("");
            setMarginUserId("all");

            alert("Success: Margin Priority Rule saved successfully.");
            fetchMargins();
        } catch (error) {
            alert(`Error adding margin rule: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteMarginRule = async (id) => {
        if (confirm("Are you sure you want to remove this margin markup rule?")) {
            try {
                await API.delete(`/rates/margins/${id}`);
                alert("Success: Margin rule deleted.");
                fetchMargins();
            } catch (error) {
                alert(`Error deleting margin rule: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setCalcError("");
        setCalcResult(null);
        const w = parseFloat(calcWeight);
        if (isNaN(w) || w <= 0) {
            alert("Please enter a valid weight parameter (kg).");
            return;
        }

        setCalculating(true);
        try {
            const res = await API.post("/rates/calculate", {
                originCountry: calcOrigin,
                destinationCountry: calcDest,
                weight: w,
                length: calcLength ? parseFloat(calcLength) : 0,
                width: calcWidth ? parseFloat(calcWidth) : 0,
                height: calcHeight ? parseFloat(calcHeight) : 0,
                shipmentType: calcShipmentType,
            });

            setCalcResult(res.data);
        } catch (error) {
            setCalcError(error.response?.data?.message || "Calculation failed.");
        } finally {
            setCalculating(false);
        }
    };

    // Dropdown configurations
    const tableFilterUsers = [
        {label: "All Rules (Global + Specific)", value: "all"},
        {label: "Global Defaults Only", value: "global"},
        ...merchantsList
    ];

    const formModalUsers = [
        {label: "All Users (Global Defaults)", value: "all"},
        ...merchantsList
    ];

    return (
        <div className="space-y-8 select-none">
            {/* Title */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Logistical Rates & Margin
                        Priority Controls</h1>
                    <p className="text-sm text-[#687280]">Configure priority markups override rules, user-specific
                        tariffs, and perform audit calculations.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddingMargin(true)}
                        className="px-4 py-2 bg-[#FF6A00] hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                    >
                        Add Margin Markup Rule
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Margins Priority Rules Table (Left: 2 Cols) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Filters Row */}
                    <div
                        className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="w-full md:w-64">
                            <CustomSelect
                                options={tableFilterUsers}
                                value={filterUserId}
                                onChange={setFilterUserId}
                            />
                        </div>
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Search Country Code or Type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
                            />
                            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#687280]/10 pb-2">
                            <h3 className="text-sm font-bold text-[#0A1F44]">Profit Margin Markups Priority Engine</h3>
                            <span className="text-[10px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 px-2 py-1 rounded">
                                {paginationData?.totalItems || 0} Rules Found
                            </span>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                                    <th className="pb-3 font-semibold">TARGET USER</th>
                                    <th className="pb-3 font-semibold">PRIORITY CLASS</th>
                                    <th className="pb-3 font-semibold">COUNTRY LIMIT</th>
                                    <th className="pb-3 font-semibold">WEIGHT BOUNDS</th>
                                    <th className="pb-3 font-semibold">MARKUP CLASS</th>
                                    <th className="pb-3 font-semibold text-right">MARKUP VALUE</th>
                                    <th className="pb-3 font-semibold text-right">OPERATIONS</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div
                                                    className="w-5 h-5 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading rules...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : margins.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500">
                                            No profit margin rules registered. Global defaults will be applied.
                                        </td>
                                    </tr>
                                ) : (
                                    margins.map((m) => {
                                        let priorityClass = "Global Defaults";
                                        if (m.userId && m.country && m.weightMin > 0) priorityClass = "Priority 1: User+Loc+Wt";
                                        else if (m.userId && m.country) priorityClass = "Priority 2: User+Loc";
                                        else if (m.userId) priorityClass = "Priority 3: User Base";
                                        else if (m.country && m.weightMin > 0) priorityClass = "Priority 4: Loc+Wt";
                                        else if (m.country) priorityClass = "Priority 5: Location";
                                        else if (m.weightMin > 0) priorityClass = "Priority 6: Weight";

                                        return (
                                            <tr key={m._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                                                <td className="py-3 font-bold text-[#0A1F44]">
                                                    {m.userId ? (
                                                        <span
                                                            className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 text-[10px]">
                                                            {m.userId.name}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200 text-[10px]">
                                                            All Users
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 font-semibold text-[#FF6A00]">{priorityClass}</td>
                                                <td className="py-3 font-mono font-bold text-[#0A1F44]">{m.country ? m.country.toUpperCase() : "GLOBAL (*)"}</td>
                                                <td className="py-3">
                                                    {m.weightMin === 0 && m.weightMax === 0 ? "Any weight" : `${m.weightMin} kg - ${m.weightMax === 0 ? "∞" : m.weightMax + " kg"}`}
                                                </td>
                                                <td className="py-3 text-gray-500 font-semibold">{m.type}</td>
                                                <td className="py-3 text-right font-mono font-bold text-[#0A1F44]">
                                                    {m.type === "Percentage" ? `${m.value}%` : `₹${m.value}`}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteMarginRule(m._id)}
                                                        className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded text-[10px] font-bold border border-red-500/10 hover:border-transparent transition-all"
                                                    >
                                                        Remove Rule
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Integration */}
                        {!loading && (
                            <Pagination
                                pagination={paginationData}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>

                {/* Live Shipment Cost Calculator (Right: 1 Col) */}
                <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 h-fit space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-[#0A1F44] mb-1">Live Pricing calculator Audit</h3>
                        <p className="text-xs text-[#687280]">Verify base rate slabs and margin overrides with decoupled
                            GST breakdown calculations.</p>
                    </div>

                    <form onSubmit={handleCalculate} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[#687280] font-semibold mb-1">Origin Country</label>
                                <select
                                    value={calcOrigin}
                                    onChange={(e) => setCalcOrigin(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none transition-all cursor-pointer"
                                >
                                    <option value="IN" className="bg-[#0A1F44]">India (IN)</option>
                                    <option value="AE" className="bg-[#0A1F44]">United Arab Emirates (AE)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#687280] font-semibold mb-1">Destination Country</label>
                                <select
                                    value={calcDest}
                                    onChange={(e) => setCalcDest(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none transition-all cursor-pointer"
                                >
                                    <option value="AE" className="bg-[#0A1F44]">United Arab Emirates (AE)</option>
                                    <option value="SA" className="bg-[#0A1F44]">Saudi Arabia (SA)</option>
                                    <option value="US" className="bg-[#0A1F44]">United States (US)</option>
                                    <option value="GB" className="bg-[#0A1F44]">United Kingdom (GB)</option>
                                    <option value="IN" className="bg-[#0A1F44]">India (IN)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[#687280] font-semibold mb-1">Dead Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="1.5"
                                    value={calcWeight}
                                    onChange={(e) => setCalcWeight(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none font-mono"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[#687280] font-semibold mb-1">Shipment Type</label>
                                <select
                                    value={calcShipmentType}
                                    onChange={(e) => setCalcShipmentType(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none cursor-pointer"
                                >
                                    <option value="Parcel" className="bg-[#0A1F44]">Parcel</option>
                                    <option value="Document" className="bg-[#0A1F44]">Document</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={calculating}
                            className="w-full py-2.5 bg-[#FF6A00] hover:bg-orange-500 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center"
                        >
                            {calculating ? "Calculating..." : "Run Calculator Audit"}
                        </button>
                    </form>

                    {calcError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
                            {calcError}
                        </div>
                    )}

                    {calcResult && (
                        <div
                            className="p-4 bg-[#FF6A00]/5 border border-[#FF6A00]/20 text-[#FF6A00] rounded-xl space-y-3 text-xs animate-[fadeIn_0.3s_ease-out]">
                            <div
                                className="flex justify-between items-baseline font-bold border-b border-[#FF6A00]/10 pb-2">
                                <span>INVOICE TOTAL:</span>
                                <span
                                    className="text-xl font-extrabold text-[#0A1F44]">₹{calcResult.invoiceTotal}</span>
                            </div>
                            <div className="text-[10px] text-[#687280] space-y-1.5">
                                <div className="flex justify-between">
                                    <span>Chargeable Weight:</span>
                                    <span className="font-semibold text-white">{calcResult.chargeableWeight}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Carrier Base Cost:</span>
                                    <span className="font-semibold text-white">₹{calcResult.aramexBaseCost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Margin Applied:</span>
                                    <span
                                        className="font-semibold text-white">{calcResult.marginApplied.type} ({calcResult.marginApplied.value})</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Margin Rule Modal */}
            {isAddingMargin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="glass-card w-full max-w-lg rounded-2xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-[#E5E7EB]">
                        <div
                            className="bg-[#0A1F44] px-6 py-4 border-b border-[#687280]/20 flex items-center justify-between text-white">
                            <div>
                                <h3 className="font-extrabold">Create Margin Markup Rule</h3>
                                <p className="text-[10px] text-gray-400">Configure priority profit markups matching
                                    parameters.</p>
                            </div>
                            <button onClick={() => setIsAddingMargin(false)} className="text-gray-400 hover:text-white">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddMarginRule} className="p-6 space-y-4 text-xs text-[#0A1F44]">

                            <div className="space-y-1.5">
                                <label className="block text-[#687280] font-semibold">Target Merchant (User) *</label>
                                <CustomSelect
                                    options={formModalUsers}
                                    value={marginUserId}
                                    onChange={setMarginUserId}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[#687280] font-semibold">Markup Type *</label>
                                    <select
                                        value={marginType}
                                        onChange={(e) => setMarginType(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none"
                                    >
                                        <option value="Fixed">Fixed Amount markup (₹)</option>
                                        <option value="Percentage">Percentage markup (%)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[#687280] font-semibold">Markup Value *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 150 or 15"
                                        value={marginValue}
                                        onChange={(e) => setMarginValue(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t border-[#687280]/20 pt-3">
                                <div className="space-y-1.5">
                                    <label className="block text-gray-500 font-semibold">Country code (Optional)</label>
                                    <input
                                        type="text"
                                        maxLength="2"
                                        placeholder="e.g. AE"
                                        value={marginCountry}
                                        onChange={(e) => setMarginCountry(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44] uppercase"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-gray-500 font-semibold">Min Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0"
                                        value={marginWeightMin}
                                        onChange={(e) => setMarginWeightMin(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-gray-500 font-semibold">Max Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0"
                                        value={marginWeightMax}
                                        onChange={(e) => setMarginWeightMax(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-[#687280]/20 rounded-lg text-[#0A1F44]"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#687280]/20 flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingMargin(false)}
                                    className="px-4 py-2 bg-white border border-[#687280]/20 hover:bg-gray-100 rounded-lg transition-all text-[#0A1F44] font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#FF6A00] hover:bg-orange-500 text-white font-extrabold rounded-lg transition-all"
                                >
                                    Publish Markup Rule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateManager;