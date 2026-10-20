import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import API, { resolveAssetUrl } from "../../services/api";
import {
    Package,
    Search,
    Filter,
    Download,
    ChevronUp,
    ChevronDown,
    Calendar,
    Check,
    XCircle,
    Clock,
    FileText,
    AlertTriangle,
    RefreshCw,
    DownloadCloud
} from "lucide-react";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/Modal";
import Pagination from "../../components/Pagination";
import moment from "moment";

const Shipments = () => {
    const { user, wallet, fetchWalletData } = useOutletContext() || {};
    const navigate = useNavigate();

    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [reprocessingId, setReprocessingId] = useState(null);
    const [bulkReprocessing, setBulkReprocessing] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState(null);

    // UI states
    const [expandedShipmentId, setExpandedShipmentId] = useState(null);
    const [shipmentTrackingSteps, setShipmentTrackingSteps] = useState({});
    const [trackingLoading, setTrackingLoading] = useState(false);

    const [schedulingShipment, setSchedulingShipment] = useState(null);
    const [pickupDate, setPickupDate] = useState("");

    const [cancelModalData, setCancelModalData] = useState({
        isOpen: false,
        shId: null,
        trackingNumber: null,
        isLoading: false
    });

    // Invoice States
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoiceFromDate, setInvoiceFromDate] = useState("");
    const [invoiceToDate, setInvoiceToDate] = useState("");
    const [generatingInvoice, setGeneratingInvoice] = useState(false);

    const refreshShipments = async (page = 1) => {
        setLoading(true);
        try {
            const res = await API.get(`/shipments/list?page=${page}`);
            setShipments(res.data?.shipments || []);
            setPaginationData(res.data?.pagination || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshShipments(currentPage);

        setInvoiceFromDate(moment().startOf('month').format('YYYY-MM-DD'));
        setInvoiceToDate(moment().endOf('month').format('YYYY-MM-DD'));
    }, [currentPage]);

    const handlePageChange = async (newPage) => {
        await setCurrentPage(newPage);
    };

    const handleExportCSV = () => {
        if (filteredShipments.length === 0) {
            toast.error("No shipments to export.");
            return;
        }
        const headers = ["Date", "Shipment ID", "AWB Tracking", "Recipient", "Destination", "Weight (kg)", "Total Charge (INR)", "Status"];
        const csvRows = filteredShipments.map(sh => {
            return [
                new Date(sh.createdAt).toLocaleDateString(),
                sh.shipmentId,
                sh.courierTrackingNumber || "Pending",
                `"${sh.customer}"`,
                `"${sh.to}"`,
                sh.weight,
                sh.invoiceTotal,
                sh.status
            ].join(",");
        });
        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Shipments_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSyncTracking = async (trackingCode, dbId) => {
        if (!trackingCode) return;
        setTrackingLoading(true);
        try {
            const res = await API.get(`/tracking/${trackingCode}`);
            setShipmentTrackingSteps(prev => ({
                ...prev,
                [dbId]: res.data?.trackingSteps || []
            }));
            await refreshShipments(currentPage);
        } catch (err) {
            toast.error(err.response?.data?.message || "Sync tracking failed.");
        } finally {
            setTrackingLoading(false);
        }
    };

    // GENERATE TAX INVOICE
    const handleGenerateInvoice = async () => {
        if (!invoiceFromDate || !invoiceToDate) {
            toast.error("Please select both From and To dates.");
            return;
        }

        setGeneratingInvoice(true);
        try {
            const response = await API.get(`/shipments/generate-invoice?startDate=${invoiceFromDate}&endDate=${invoiceToDate}`, {
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Tax_Invoice_${invoiceFromDate}_to_${invoiceToDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setInvoiceModalOpen(false);
            toast.success("Tax Invoice downloaded successfully!");
        } catch (error) {
            console.error("Failed to generate invoice", error);
            if (error.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const parsed = JSON.parse(reader.result);
                        toast.error(parsed.message || "Failed to generate Tax Invoice.");
                    } catch (e) {
                        toast.error("Failed to generate Tax Invoice.");
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                toast.error(error.response?.data?.message || "Failed to generate Tax Invoice.");
            }
        } finally {
            setGeneratingInvoice(false);
        }
    };

    // OPEN CANCEL MODAL
    const openCancelModal = (shId, trackingNumber) => {
        setCancelModalData({
            isOpen: true,
            shId,
            trackingNumber,
            isLoading: false
        });
    };

    // CLOSE CANCEL MODAL
    const closeCancelModal = () => {
        setCancelModalData({ isOpen: false, shId: null, trackingNumber: null, isLoading: false });
    };

    // CONFIRM CANCEL API CALL
    const confirmCancelShipment = async () => {
        setCancelModalData(prev => ({ ...prev, isLoading: true }));
        try {
            const res = await API.post(`/shipments/${cancelModalData.shId}/cancel`);
            toast.success(res.data.message);
            refreshShipments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel shipment.");
        } finally {
            closeCancelModal();
        }
    };

    const toggleExpandShipment = async (shId, dbId) => {
        if (expandedShipmentId === shId) {
            setExpandedShipmentId(null);
            return;
        }
        setExpandedShipmentId(shId);
        if (shipmentTrackingSteps[dbId]) return;
        setTrackingLoading(true);
        try {
            const res = await API.get(`/tracking/${shId}`);
            setShipmentTrackingSteps(prev => ({ ...prev, [dbId]: res.data.trackingSteps || [] }));
        } catch (err) {
            console.error(err);
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleSchedulePickup = async () => {
        if (!schedulingShipment) return;
        try {
            const res = await API.post("/shipments/pickup/schedule", {
                shipmentIds: [schedulingShipment._id],
                pickupDate,
                pickupAddressId: schedulingShipment.pickupAddressId
            });
            toast.success(res.data.message || "Pickup scheduled.");
            setSchedulingShipment(null);
            await refreshShipments();
        } catch (err) {
            toast.error(err.response?.data?.message || "Courier rejected pickup.");
        }
    };

    const handleReprocessShipment = async (shDbId, shId) => {
        setReprocessingId(shDbId);
        try {
            const res = await API.post(`/shipments/${shDbId}/reprocess`);
            toast.success(res.data?.message || `Shipment ${shId} reprocessed and booked successfully!`);
            await refreshShipments(currentPage);
            if (fetchWalletData) await fetchWalletData();
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to reprocess shipment.";
            toast.error(msg);
        } finally {
            setReprocessingId(null);
        }
    };

    const handleBulkReprocess = async () => {
        setBulkReprocessing(true);
        try {
            const res = await API.post("/shipments/bulk-reprocess");
            toast.success(res.data?.message || "Draft shipments reprocessed successfully!");
            await refreshShipments(currentPage);
            if (fetchWalletData) await fetchWalletData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reprocess draft shipments.");
        } finally {
            setBulkReprocessing(false);
        }
    };

    const filteredShipments = shipments.filter(sh => {
        const matchesSearch = sh.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) || sh.customer.toLowerCase().includes(searchQuery.toLowerCase()) || (sh.courierTrackingNumber && sh.courierTrackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "All" || sh.status === statusFilter || (statusFilter === "Cancelled" && (sh.status === "Cancelled" || sh.status === "Hold"));
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "draft") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">Draft</span>;
        }
        if (s === "delivered") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">Delivered</span>;
        }
        if (s === "cancelled" || s === "hold" || s === "hold shipment") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Hold Shipment</span>;
        }
        if (s === "in transit" || s === "out for delivery") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">In Transit</span>;
        }
        if (s === "pickup scheduled" || s === "pickup requested") {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">Pickup Scheduled</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">{status || "Booked"}</span>;
    };

    return (
        <div className="space-y-6 select-none animate-fade-in">
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Shipments Manifest Register</h1>
                    <p className="text-sm text-[#687280]">Inspect logistical bookings, sync live tracking steps, and generate invoices.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
                    {shipments.filter(s => s.status === "Draft").length > 0 && (
                        <button
                            onClick={handleBulkReprocess}
                            disabled={bulkReprocessing}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                            title="Reprocess all pending Draft shipments"
                        >
                            <RefreshCw size={14} className={bulkReprocessing ? "animate-spin" : ""} /> Reprocess All Drafts ({shipments.filter(s => s.status === "Draft").length})
                        </button>
                    )}
                    <button
                        onClick={() => setInvoiceModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-[#FF6A00]/50 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                        <FileText size={14} /> Generate Invoice
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-[#0A1F44] hover:bg-[#FF6A00] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                    <div className="glass-card px-4 py-2 rounded-xl border border-[#FF6A00]/20 text-[#FF6A00] text-center font-bold text-xs shrink-0 shadow-sm">
                        {paginationData?.totalItems || filteredShipments.length} Total Shipments
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-4 rounded-2xl border border-[#687280]/20 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-[#687280]" size={15} />
                    <input
                        type="text"
                        placeholder="Search AWB, Shipment ID, Recipient..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/50 rounded-xl text-[#0A1F44] focus:outline-none transition-all placeholder-[#687280]"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-2 bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-xl px-3 py-1.5">
                        <Filter size={14} className="text-[#687280]" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-xs text-[#0A1F44] font-semibold outline-none cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Booked">Booked</option>
                            <option value="Pickup Scheduled">Pickup Scheduled</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Hold Shipment</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                        <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-4 font-semibold">Shipment ID</th>
                            <th className="py-3 px-4 font-semibold">Date Booked</th>
                            <th className="py-3 px-4 font-semibold">Recipient</th>
                            <th className="py-3 px-4 text-center font-semibold">AWB Code</th>
                            <th className="py-3 px-4 text-center font-semibold">Weight</th>
                            <th className="py-3 px-4 text-right font-semibold">Invoice Charge</th>
                            <th className="py-3 px-4 text-center font-semibold">Status</th>
                            <th className="py-3 px-4 text-center font-semibold">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#687280]/10 text-[#687280]">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="py-10 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-6 h-6 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs font-semibold">Loading shipment manifest...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredShipments.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-12 text-center text-[#687280] font-semibold text-xs">
                                    🔍 No matching shipments found.
                                </td>
                            </tr>
                        ) : (
                            filteredShipments.map(sh => (
                                <React.Fragment key={sh._id}>
                                    <tr className="hover:bg-[#E5E7EB]/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-[#FF6A00]">{sh.shipmentId}</td>
                                        <td className="py-3.5 px-4 text-[#687280]">{new Date(sh.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3.5 px-4 font-semibold text-[#0A1F44]">
                                            {sh.customer}
                                            <span className="block text-[10px] text-[#687280] truncate max-w-[150px] font-normal">{sh.to}</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#0A1F44]">{sh.courierTrackingNumber || "Awaiting Allocation"}</td>
                                        <td className="py-3.5 px-4 text-center font-semibold text-[#0A1F44]">{sh.weight} kg</td>
                                        <td className="py-3.5 px-4 text-right font-extrabold text-[#0A1F44]">₹{sh.invoiceTotal?.toFixed(2)}</td>
                                        <td className="py-3.5 px-4 text-center">{getStatusBadge(sh.status)}</td>
                                        <td className="py-3.5 px-4 text-center space-x-1.5 flex justify-center items-center">
                                            {sh.status === "Draft" && (
                                                <button
                                                    onClick={() => handleReprocessShipment(sh._id, sh.shipmentId)}
                                                    disabled={reprocessingId === sh._id}
                                                    className="px-2.5 py-1 bg-amber-50 border border-amber-300 hover:bg-amber-600 hover:text-white rounded-lg text-[10px] font-bold text-amber-700 transition inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                                                    title="Reprocess and book with carrier"
                                                >
                                                    <RefreshCw size={11} className={reprocessingId === sh._id ? "animate-spin" : ""} />
                                                    {reprocessingId === sh._id ? "Booking..." : "Reprocess"}
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => toggleExpandShipment(sh.courierTrackingNumber || sh.shipmentId, sh._id)} 
                                                className="px-2.5 py-1 bg-white border border-[#687280]/20 hover:border-[#FF6A00] rounded-lg text-[10px] font-bold text-[#0A1F44] transition inline-flex items-center gap-1 shadow-sm"
                                            >
                                                Track {expandedShipmentId === (sh.courierTrackingNumber || sh.shipmentId) ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                            </button>

                                            {(sh.labelUrl || sh.labelPdfPath || ["Booked", "Pickup Scheduled", "Picked Up", "In Transit", "Out For Delivery", "Delivered"].includes(sh.status)) && (
                                                <a 
                                                    href={
                                                        sh.labelPdfPath 
                                                            ? resolveAssetUrl(sh.labelPdfPath)
                                                            : (sh.labelUrl && !sh.labelUrl.includes("label_demo.pdf") 
                                                                ? sh.labelUrl 
                                                                : resolveAssetUrl("/uploads/sample_shipping_label.pdf"))
                                                    } 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="px-2 py-1 bg-purple-50 border border-purple-200 hover:bg-purple-600 hover:text-white rounded-lg text-[10px] font-bold text-purple-700 transition inline-flex items-center gap-1 shadow-sm"
                                                >
                                                    Label
                                                </a>
                                            )}

                                            {sh.status === "Booked" && !sh.manifestCode && (
                                                <button onClick={() => {setSchedulingShipment(sh); setPickupDate(new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]);}} className="px-2 py-1 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold text-blue-700 transition inline-flex items-center gap-1 shadow-sm">
                                                    <Calendar size={11} /> Pickup
                                                </button>
                                            )}

                                            {sh.manifestCode && !["Cancelled", "Delivered"].includes(sh.status) && (
                                                <span className="px-2 py-1 bg-green-50 border border-green-200 rounded-lg text-[10px] font-bold text-green-700 inline-flex items-center gap-1">
                                                    <Check size={11} /> Scheduled
                                                </span>
                                            )}

                                            {["Draft", "Booked", "Pickup Scheduled"].includes(sh.status) && (
                                                <button
                                                    onClick={() => openCancelModal(sh._id, sh.courierTrackingNumber || sh.shipmentId)}
                                                    className="px-2 py-1 bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-bold text-red-600 transition inline-flex items-center gap-1 shadow-sm"
                                                >
                                                    <XCircle size={11} /> Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expanded Details Row */}
                                    {expandedShipmentId === (sh.courierTrackingNumber || sh.shipmentId) && (
                                        <tr>
                                            <td colSpan="8" className="bg-[#E5E7EB]/40 p-6 border-b border-[#687280]/20">
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-4 border-r border-[#687280]/15 pr-6">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider flex items-center gap-1.5">
                                                                <Clock size={14} className="text-[#FF6A00]" /> Chronological Transit Steps
                                                            </h4>
                                                            <button 
                                                                onClick={() => handleSyncTracking(sh.courierTrackingNumber || sh.shipmentId, sh._id)} 
                                                                disabled={trackingLoading || ["Delivered", "Cancelled"].includes(sh.status)} 
                                                                className="flex items-center gap-1 px-2.5 py-1 bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white rounded-lg text-[10px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <RefreshCw size={12} className={trackingLoading ? "animate-spin" : ""} /> {trackingLoading ? "Syncing..." : "Sync Latest"}
                                                            </button>
                                                        </div>
                                                        {trackingLoading ? (
                                                            <div className="text-[#FF6A00] text-xs py-4 flex items-center gap-2 font-semibold animate-pulse">
                                                                <div className="w-3 h-3 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div> Querying carrier nodes...
                                                            </div>
                                                        ) : shipmentTrackingSteps[sh._id] && shipmentTrackingSteps[sh._id].length > 0 ? (
                                                            <div className="relative border-l-2 border-[#FF6A00] ml-2 pl-4 space-y-4 text-[11px]">
                                                                {shipmentTrackingSteps[sh._id].map((step, idx) => (
                                                                    <div key={idx} className="relative">
                                                                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#FF6A00] rounded-full border border-white"></div>
                                                                        <div>
                                                                            <span className="font-bold text-[#0A1F44] block">{step.status} {step.location && `(${step.location})`}</span>
                                                                            <p className="text-[#687280]">{step.description}</p>
                                                                            <span className="text-[9px] text-gray-500">{new Date(step.eventTime).toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="relative border-l-2 border-[#FF6A00] ml-2 pl-4 space-y-4 text-[11px]">
                                                                {sh.statusHistory && sh.statusHistory.length > 0 ? (
                                                                    sh.statusHistory.map((hist, idx) => (
                                                                        <div key={idx} className="relative">
                                                                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#FF6A00] rounded-full border border-white"></div>
                                                                            <div>
                                                                                <span className="font-bold text-[#0A1F44] block">{hist.status}</span>
                                                                                <span className="text-[9px] text-gray-500">{new Date(hist.time).toLocaleString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-[#687280] text-xs">No status logs archived.</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h4 className="font-bold text-[#0A1F44] text-xs uppercase tracking-wider flex items-center gap-1.5">
                                                            <FileText size={14} className="text-[#FF6A00]" /> Chargeable Details & Tax Breakdown
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-4 text-[11px] bg-white p-4 rounded-2xl border border-[#687280]/15 shadow-sm">
                                                            <div><span className="text-[#687280] block font-medium">Chargeable Weight:</span><span className="font-bold text-[#0A1F44]">{sh.chargeableWeight || sh.weight} kg (Volumetric: {sh.volumetricWeight || 0} kg)</span></div>
                                                            <div><span className="text-[#687280] block font-medium">Sizing Dimensions:</span><span className="font-bold text-[#0A1F44]">{sh.length || 0}L x {sh.width || 0}W x {sh.height || 0}H cm</span></div>
                                                            <div><span className="text-[#687280] block font-medium">Shipping Base Charge:</span><span className="font-bold text-[#0A1F44]">₹{sh.shippingCharge?.toFixed(2)}</span></div>
                                                            <div><span className="text-[#687280] block font-medium">GST Tax (18%):</span><span className="font-bold text-[#0A1F44]">₹{sh.gstAmount?.toFixed(2)}</span></div>
                                                            <div className="col-span-2 border-t border-[#687280]/10 pt-2 flex justify-between font-extrabold text-xs text-[#FF6A00]"><span>Invoice Total:</span><span>₹{sh.invoiceTotal?.toFixed(2)}</span></div>
                                                        </div>
                                                        {sh.weightDiscrepancy && (
                                                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-[11px] space-y-1">
                                                                <span className="font-bold block uppercase text-red-600 flex items-center gap-1"><AlertTriangle size={12} /> Weight Discrepancy Dispute</span>
                                                                <p>The courier scanned weight is <strong>{sh.scannedWeight} kg</strong> vs declared weight <strong>{sh.weight} kg</strong>.</p>
                                                                <p>Delta penalty cost is <strong>₹{sh.deltaCost?.toFixed(2)}</strong>. Review Status: <strong>{sh.discrepancyStatus}</strong></p>
                                                                <p className="italic font-light">Details: {sh.discrepancyDetails}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {paginationData && (
                    <Pagination
                        pagination={paginationData}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Generate Invoice Modal */}
            {invoiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
                    <div className="bg-white border border-[#687280]/20 text-[#0A1F44] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-lg font-bold text-[#0A1F44] mb-3 flex items-center gap-2">
                            <FileText size={20} className="text-[#FF6A00]" /> Generate Tax Invoice
                        </h3>
                        <div className="space-y-4 text-xs">
                            <p className="text-[#687280]">Select a date range to generate a PDF Tax Invoice. The invoice will only include shipments marked as <strong>Delivered</strong>.</p>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-[10px] text-[#687280] font-bold uppercase block mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={invoiceFromDate}
                                        onChange={(e) => setInvoiceFromDate(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/20 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[#687280] font-bold uppercase block mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={invoiceToDate}
                                        onChange={(e) => setInvoiceToDate(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/20 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-2">
                                <button
                                    onClick={handleGenerateInvoice}
                                    disabled={generatingInvoice}
                                    className="flex-1 bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-[#FF6A00]/20"
                                >
                                    {generatingInvoice && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>}
                                    <DownloadCloud size={16} /> Download PDF
                                </button>
                                <button
                                    onClick={() => setInvoiceModalOpen(false)}
                                    disabled={generatingInvoice}
                                    className="flex-1 bg-[#E5E7EB]/50 border border-[#687280]/20 hover:bg-[#E5E7EB] text-[#0A1F44] font-bold py-3 rounded-xl transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pickup Modal */}
            {schedulingShipment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
                    <div className="bg-white border border-[#687280]/20 text-[#0A1F44] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-lg font-bold text-[#0A1F44] mb-3 flex items-center gap-2">
                            <Calendar size={20} className="text-[#FF6A00]" /> Schedule Courier Pickup Manifest
                        </h3>
                        <div className="space-y-4 text-xs">
                            <p className="text-[#687280]">You are scheduling a courier pickup for Shipment <strong className="text-[#0A1F44] font-mono">{schedulingShipment.shipmentId}</strong>.</p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                                <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5"><AlertTriangle size={12} /> Mandatory Pre-Pickup Checklist</span>
                                <ul className="list-disc pl-4 space-y-1 text-amber-900 text-[11px]">
                                    <li>Print the AWB Label from the actions menu and tape it securely to the top of the box.</li>
                                    <li>Print 3 copies of the Commercial Invoice for International Customs.</li>
                                    <li>Ensure the physical weight matches your declared weight ({schedulingShipment.weight} kg).</li>
                                </ul>
                            </div>
                            <div>
                                <label className="text-[10px] text-[#687280] font-bold uppercase block mb-1">Pickup Manifest Date</label>
                                <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full p-3 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/20 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={handleSchedulePickup} className="flex-1 bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-extrabold py-3 rounded-xl transition shadow-md shadow-[#FF6A00]/20">Confirm Schedule</button>
                                <button onClick={() => setSchedulingShipment(null)} className="flex-1 bg-[#E5E7EB]/50 border border-[#687280]/20 hover:bg-[#E5E7EB] text-[#0A1F44] font-bold py-3 rounded-xl transition">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reusable Danger Modal for Cancellation */}
            <Modal
                isOpen={cancelModalData.isOpen}
                onClose={closeCancelModal}
                onConfirm={confirmCancelShipment}
                title="Cancel Shipment"
                description={`Are you sure you want to cancel shipment ${cancelModalData.trackingNumber || cancelModalData.shId}? This action cannot be undone, and the shipment costs will be refunded to your wallet immediately.`}
                confirmText="Yes, Cancel Shipment"
                cancelText="Keep Shipment"
                variant="danger"
                isLoading={cancelModalData.isLoading}
            />
        </div>
    );
};

export default Shipments;