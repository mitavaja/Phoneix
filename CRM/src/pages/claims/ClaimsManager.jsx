import React, {useState, useEffect} from "react";
import API from "../../services/api";
import Pagination from "../../components/Pagination";

const ClaimsManager = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState(null);
    const itemsPerPage = 10;

    // Resolve Action States
    const [decision, setDecision] = useState("Approved");
    const [remarks, setRemarks] = useState("");
    const [processing, setProcessing] = useState(false);

    // Debounce the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset to first page when changing status tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter,
                search: debouncedSearch
            });

            const res = await API.get(`/tickets/admin/claims?${queryParams.toString()}`);
            setClaims(res.data.claims || []);
            setPaginationData(res.data.pagination || null);
        } catch (err) {
            console.error("Failed to load platform claims:", err.message);
            setClaims([]);
            setPaginationData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, [currentPage, statusFilter, debouncedSearch]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleResolveClaim = async (e) => {
        e.preventDefault();
        if (!selectedClaim) return;

        setProcessing(true);
        try {
            await API.put(`/tickets/admin/claim/${selectedClaim._id}/resolve`, {
                status: decision,
                adminRemarks: remarks,
            });

            alert(`Success: Claim was successfully ${decision}.`);
            setSelectedClaim(null);
            setRemarks("");
            fetchClaims(); // Refresh the active page data
        } catch (err) {
            alert("Failed to resolve claim: " + (err.response?.data?.message || err.message));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-8 select-none">
            {/* Title */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Insurance Claims Register</h1>
                    <p className="text-sm text-[#687280]">Review disputed claims for lost, delayed, or physically
                        damaged consignments and authorize wallet reimbursement payouts.</p>
                </div>
            </div>

            {/* Filter and search controls */}
            <div
                className="glass-card p-4 rounded-xl border border-[#687280]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search AWB, Shipment ID, Store..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all"
                    />
                    <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>

                {/* Filters */}
                <div className="flex gap-2 items-center">
                    <div className="text-[10px] text-[#687280] font-bold uppercase tracking-wider mr-2 hidden md:block">
                        {paginationData?.totalItems || 0} Records
                    </div>
                    {["all", "Pending", "Approved", "Rejected"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                statusFilter === status
                                    ? "bg-[#FF6A00] text-[#0A1F44] font-bold border-transparent"
                                    : "bg-[#E5E7EB]/40 text-[#687280] hover:text-[#0A1F44] border-[#687280]/20"
                            }`}
                        >
                            {status === "all" ? "All Claims" : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Claims List Table */}
            <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                        <tr className="border-b border-[#687280]/20 text-[#687280] font-medium">
                            <th className="pb-3 font-semibold">DATE FILED</th>
                            <th className="pb-3 font-semibold">SHIPMENT ID / AWB</th>
                            <th className="pb-3 font-semibold">MERCHANT STORE</th>
                            <th className="pb-3 font-semibold">DISPUTE CLASS</th>
                            <th className="pb-3 font-semibold text-right">REQUESTED</th>
                            <th className="pb-3 font-semibold text-center">STATUS</th>
                            <th className="pb-3 font-semibold text-right">OPERATIONS</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div
                                            className="w-6 h-6 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
                                        <p>Loading insurance claims registry...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : claims.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-12 text-center text-gray-500 font-semibold">
                                    🔍 No insurance claims found matching filters.
                                </td>
                            </tr>
                        ) : (
                            claims.map((claim) => (
                                <tr key={claim._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                                    <td className="py-4 text-[#687280]">{new Date(claim.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4">
                                        <span
                                            className="block font-bold text-[#0A1F44]">{claim.shipmentId?.shipmentId || "N/A"}</span>
                                        <span
                                            className="block font-mono text-[10px] text-[#FF6A00]">{claim.shipmentId?.courierTrackingNumber || "N/A"}</span>
                                    </td>
                                    <td className="py-4">
                                        <span
                                            className="block font-semibold text-[#0A1F44]">{claim.userId?.companyName || "N/A"}</span>
                                        <span
                                            className="block text-[10px] text-gray-500">{claim.userId?.name} ({claim.userId?.email})</span>
                                    </td>
                                    <td className="py-4">
                      <span
                          className="inline-flex px-2.5 py-0.5 rounded bg-[#E5E7EB]/40 border border-[#687280]/20 text-[10px] text-[#687280] font-semibold">
                        {claim.claimType}
                      </span>
                                    </td>
                                    <td className="py-4 text-right font-extrabold text-[#0A1F44]">
                                        ₹{claim.claimAmount?.toFixed(2) || "0.00"}
                                    </td>
                                    <td className="py-4 text-center">
                      <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              claim.status === "Approved"
                                  ? "bg-green-100 text-green-600"
                                  : claim.status === "Pending"
                                      ? "bg-[#FF6A00]/10 text-[#FF6A00]"
                                      : "bg-red-100 text-red-600"
                          }`}
                      >
                        {claim.status}
                      </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button
                                            onClick={() => setSelectedClaim(claim)}
                                            className="p-1 px-3 bg-[#E5E7EB]/40 hover:bg-[#E5E7EB]/60 hover:text-[#0A1F44] rounded text-[10px] font-bold border border-[#687280]/20 transition-colors"
                                        >
                                            {claim.status === "Pending" ? "Review & Reply" : "Audit Details"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Global Pagination Component */}
                {!loading && (
                    <Pagination
                        pagination={paginationData}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Review Modal */}
            {selectedClaim && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div
                        className="glass-card w-full max-w-lg rounded-2xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        {/* Modal Header */}
                        <div
                            className="bg-[#0A1F44] px-6 py-4 border-b border-[#687280]/20 flex items-center justify-between">
                            <div>
                                <h3 className="font-extrabold text-white text-sm">Disputed Claim Investigation</h3>
                                <p className="text-[10px] text-[#FF6A00] font-semibold">Claim
                                    ID: {selectedClaim._id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedClaim(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                     strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Store / Merchant</span>
                                    <span
                                        className="font-semibold text-[#0A1F44]">{selectedClaim.userId?.companyName || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Dispute Category</span>
                                    <span className="font-semibold text-[#0A1F44]">{selectedClaim.claimType}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-[#687280]/10 pt-3">
                                <div>
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Shipment Reference</span>
                                    <span
                                        className="font-mono text-[#0A1F44]">{selectedClaim.shipmentId?.shipmentId || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">AWB Tracking Number</span>
                                    <span
                                        className="font-mono text-[#FF6A00] font-bold">{selectedClaim.shipmentId?.courierTrackingNumber || "N/A"}</span>
                                </div>
                            </div>

                            <div className="border-t border-[#687280]/10 pt-3">
                                <span className="block text-[10px] text-gray-500 font-bold uppercase">Incident Description Details</span>
                                <p className="text-gray-600 bg-[#E5E7EB]/40 p-3 rounded-lg border border-[#687280]/10 mt-1 leading-relaxed">
                                    {selectedClaim.description}
                                </p>
                            </div>

                            <div
                                className="border-t border-[#687280]/10 pt-3 flex justify-between items-center bg-[#FF6A00]/5 p-3 rounded-lg border border-[#FF6A00]/10">
                                <div>
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Claim Reimbursement Amount</span>
                                    <span className="text-xs text-gray-500 font-medium">Reimburses to available balance on approval</span>
                                </div>
                                <span className="text-lg font-black text-[#FF6A00]">
                  ₹{selectedClaim.claimAmount?.toFixed(2) || "0.00"}
                </span>
                            </div>

                            {selectedClaim.status !== "Pending" ? (
                                <div className="border-t border-[#687280]/10 pt-3 space-y-2">
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Audit Ledger Remarks</span>
                                    <p className="text-gray-600 bg-white p-3 rounded-lg border border-[#687280]/15 italic">
                                        {selectedClaim.adminRemarks || "No admin notes recorded."}
                                    </p>
                                    <div className="text-[10px] text-gray-400 font-semibold">
                                        Settlement Status: <strong
                                        className={selectedClaim.status === "Approved" ? "text-green-600" : "text-red-600"}>{selectedClaim.status}</strong>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleResolveClaim}
                                      className="border-t border-[#687280]/10 pt-3 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[#687280] font-bold uppercase text-[10px]">Settlement
                                            Decision *</label>
                                        <div className="flex gap-4">
                                            <label
                                                className="flex items-center gap-2 cursor-pointer font-bold text-[#0A1F44]">
                                                <input
                                                    type="radio"
                                                    name="decision"
                                                    value="Approved"
                                                    checked={decision === "Approved"}
                                                    onChange={() => setDecision("Approved")}
                                                    className="accent-[#FF6A00]"
                                                />
                                                Approve Payout
                                            </label>
                                            <label
                                                className="flex items-center gap-2 cursor-pointer font-bold text-[#0A1F44]">
                                                <input
                                                    type="radio"
                                                    name="decision"
                                                    value="Rejected"
                                                    checked={decision === "Rejected"}
                                                    onChange={() => setDecision("Rejected")}
                                                    className="accent-red-500"
                                                />
                                                Reject Claim
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[#687280] font-bold uppercase text-[10px]">Admin
                                            Resolution Remarks & Reply *</label>
                                        <textarea
                                            placeholder="Specify findings, carrier dispute checks, or reason for reject..."
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            required
                                            rows={3}
                                            className="w-full px-3 py-2 bg-gray-50 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg text-[#0A1F44] focus:outline-none transition-all resize-none leading-relaxed text-xs"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`w-full py-3 text-white font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                                            decision === "Approved"
                                                ? "bg-[#FF6A00] hover:bg-orange-500"
                                                : "bg-red-500 hover:bg-red-600"
                                        }`}
                                    >
                                        {processing ? (
                                            <span
                                                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24"
                                                     stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                                Submit Resolution Decision
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimsManager;