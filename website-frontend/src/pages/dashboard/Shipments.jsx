import React, { useState, useEffect } from "react";
import API from "../../services/api";
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
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

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
        console.log(newPage)
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
        link.setAttribute("href", url);
        link.setAttribute("download", `Phoenix_Shipments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSyncTracking = async (shId, dbId) => {
        setTrackingLoading(true);
        try {
            const res = await API.get(`/tracking/${shId}`);
            setShipmentTrackingSteps(prev => ({ ...prev, [dbId]: res.data.trackingSteps || [] }));
            await refreshShipments();
        } catch (err) {
            toast.error("Failed to synchronize live tracking data.");
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        setGeneratingInvoice(true);
        try {
            // responseType: 'blob' is strictly required to handle PDF binaries securely
            const res = await API.get("/invoices/generate", {
                params: { fromDate: invoiceFromDate, toDate: invoiceToDate },
                responseType: 'blob'
            });

            // Trigger Browser Download
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Phoenix_Tax_Invoice_${invoiceFromDate}_to_${invoiceToDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setInvoiceModalOpen(false);
            toast.success("Tax Invoice generated successfully!");
        } catch (err) {
            // Convert Blob error back to JSON to read the backend message
            if (err.response && err.response.data instanceof Blob) {
                const errorData = JSON.parse(await err.response.data.text());
                toast.error(errorData.message || "Failed to generate invoice.");
            } else {
                toast.error("An error occurred while generating the invoice.");
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
            toast.success(res.data.message); // You can optionally swap this alert for a toast notification later
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

    const filteredShipments = shipments.filter(sh => {
        const matchesSearch = sh.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) || sh.customer.toLowerCase().includes(searchQuery.toLowerCase()) || (sh.courierTrackingNumber && sh.courierTrackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "All" || sh.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case "Booked":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20">Booked</span>;
            case "Pickup Scheduled":
            case "Pickup Requested":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">Pickup Scheduled</span>;
            case "Picked Up":
            case "In Transit":
            case "Out For Delivery":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">In Transit</span>;
            case "Delivered":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">Delivered</span>;
            case "Cancelled":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">Cancelled</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">{status}</span>;
        }
    };

    return (
        <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#687280]/20 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package size={22} className="text-[#FF6A00]" /> Shipment Manifest Register
                </h3>
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-[#687280]" size={16} />
                        <input
                            type="text"
                            placeholder="Search AWB, Recipient..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none w-64 focus:ring-1 focus:ring-[#FF6A00]"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                        <Filter size={14} className="text-[#687280]" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-xs text-white outline-none">
                            <option value="All" className="bg-[#0A1F44]">All Statuses</option>
                            <option value="Draft" className="bg-[#0A1F44]">Draft</option>
                            <option value="Booked" className="bg-[#0A1F44]">Booked</option>
                            <option value="Pickup Scheduled" className="bg-[#0A1F44]">Pickup Scheduled</option>
                            <option value="In Transit" className="bg-[#0A1F44]">In Transit</option>
                            <option value="Delivered" className="bg-[#0A1F44]">Delivered</option>
                            <option value="Cancelled" className="bg-[#0A1F44]">Cancelled</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setInvoiceModalOpen(true)}
                        className="flex items-center gap-2 bg-[#0A1F44] border border-[#FF6A00]/50 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-[#0A1F44] px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                        <FileText size={14} /> Generate Invoice
                    </button>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                    <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Shipment ID</th>
                        <th className="py-3 px-4">Date Booked</th>
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4 text-center">AWB Code</th>
                        <th className="py-3 px-4 text-center">Weight</th>
                        <th className="py-3 px-4 text-right">Invoice Charge</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-[#687280]/10">
                    {filteredShipments.map(sh => (
                        <React.Fragment key={sh._id}>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-[#FF6A00]">{sh.shipmentId}</td>
                                <td className="py-3.5 px-4 text-[#687280]">{new Date(sh.createdAt).toLocaleDateString()}</td>
                                <td className="py-3.5 px-4 font-semibold text-white">
                                    {sh.customer}
                                    <span className="block text-[10px] text-gray-500 truncate max-w-[150px]">{sh.to}</span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono font-semibold text-gray-400">{sh.courierTrackingNumber || "Awaiting Allocation"}</td>
                                <td className="py-3.5 px-4 text-center font-semibold text-[#687280]">{sh.weight} kg</td>
                                <td className="py-3.5 px-4 text-right font-bold text-white">₹{sh.invoiceTotal.toFixed(2)}</td>
                                <td className="py-3.5 px-4 text-center">{getStatusBadge(sh.status)}</td>
                                <td className="py-3.5 px-4 text-center space-x-1.5 flex justify-center items-center">
                                    <button onClick={() => toggleExpandShipment(sh.courierTrackingNumber || sh.shipmentId, sh._id)} className="px-2 py-1 bg-white/5 border border-white/10 hover:border-[#FF6A00] rounded text-[10px] font-semibold text-white transition inline-flex items-center gap-1">
                                        Track {expandedShipmentId === (sh.courierTrackingNumber || sh.shipmentId) ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                    </button>

                                    {sh.labelUrl ? (
                                        <a href={sh.labelUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500 rounded text-[10px] font-semibold text-purple-400 hover:text-white transition inline-flex items-center gap-1">Label</a>
                                    ) : sh.labelPdfPath && (
                                        <a href={`${import.meta.env.VITE_API_BASE_URL || ""}${sh.labelPdfPath}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500 rounded text-[10px] font-semibold text-purple-400 hover:text-white transition inline-flex items-center gap-1">Label</a>
                                    )}

                                    {sh.status === "Booked" && !sh.manifestCode && (
                                        <button onClick={() => {setSchedulingShipment(sh); setPickupDate(new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]);}} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500 rounded text-[10px] font-semibold text-blue-400 hover:text-white transition inline-flex items-center gap-1">
                                            <Calendar size={10} /> Pickup
                                        </button>
                                    )}

                                    {sh.manifestCode && !["Cancelled", "Delivered"].includes(sh.status) && (
                                        <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-[10px] font-semibold text-green-500 inline-flex items-center gap-1">
                                            <Check size={10} /> Scheduled
                                        </span>
                                    )}

                                    {["Draft", "Booked", "Pickup Scheduled"].includes(sh.status) && (
                                        <button
                                            onClick={() => openCancelModal(sh._id, sh.courierTrackingNumber || sh.shipmentId)}
                                            className="px-2 py-1 bg-red-500/10 border border-red-500/30 hover:bg-red-600 rounded text-[10px] font-semibold text-red-500 hover:text-white transition inline-flex items-center gap-1"
                                        >
                                            <XCircle size={10} /> Cancel
                                        </button>
                                    )}

                                    {["Picked Up", "In Transit"].includes(sh.status) && (
                                        <button onClick={() => {}} className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500 rounded text-[10px] font-semibold text-orange-400 hover:text-white transition inline-flex items-center gap-1">
                                            Claim
                                        </button>
                                    )}
                                </td>
                            </tr>

                            {/* Expanded Details Row */}
                            {expandedShipmentId === (sh.courierTrackingNumber || sh.shipmentId) && (
                                <tr>
                                    <td colSpan="8" className="bg-[#071630]/60 p-6 border-b border-[#687280]/20">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4 border-r border-[#687280]/10 pr-6">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5"><Clock size={14} className="text-[#FF6A00]" /> Chronological Transit Steps</h4>
                                                    <button onClick={() => handleSyncTracking(sh.courierTrackingNumber || sh.shipmentId, sh._id)} disabled={trackingLoading || ["Delivered", "Cancelled"].includes(sh.status)} className="flex items-center gap-1 px-2.5 py-1 bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white rounded-lg text-[10px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed">
                                                        <RefreshCw size={12} className={trackingLoading ? "animate-spin" : ""} /> {trackingLoading ? "Syncing..." : "Sync Latest"}
                                                    </button>
                                                </div>
                                                {trackingLoading ? (
                                                    <div className="text-[#FF6A00] text-xs py-4 flex items-center gap-2 font-semibold animate-pulse"><div className="w-3 h-3 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div> Querying carrier nodes...</div>
                                                ) : shipmentTrackingSteps[sh._id] && shipmentTrackingSteps[sh._id].length > 0 ? (
                                                    <div className="relative border-l border-[#FF6A00]/30 ml-2 pl-4 space-y-4 text-[11px]">
                                                        {shipmentTrackingSteps[sh._id].map((step, idx) => (
                                                            <div key={idx} className="relative">
                                                                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#FF6A00] rounded-full border border-white"></div>
                                                                <div>
                                                                    <span className="font-bold text-white block">{step.status} {step.location && `(${step.location})`}</span>
                                                                    <p className="text-gray-500">{step.description}</p>
                                                                    <span className="text-[9px] text-gray-500">{new Date(step.eventTime).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="relative border-l border-[#FF6A00]/30 ml-2 pl-4 space-y-4 text-[11px]">
                                                        {sh.statusHistory && sh.statusHistory.length > 0 ? (
                                                            sh.statusHistory.map((hist, idx) => (
                                                                <div key={idx} className="relative">
                                                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#FF6A00] rounded-full border border-white"></div>
                                                                    <div>
                                                                        <span className="font-bold text-white block">{hist.status}</span>
                                                                        <span className="text-[9px] text-gray-500">{new Date(hist.time).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-gray-500 text-xs">No status logs archived.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5"><FileText size={14} className="text-[#FF6A00]" /> Chargeable Details & Tax Breakdown</h4>
                                                <div className="grid grid-cols-2 gap-4 text-[11px] bg-black/20 p-4 rounded-2xl border border-white/5">
                                                    <div><span className="text-gray-500 block">Chargeable Weight:</span><span className="font-semibold text-white">{sh.chargeableWeight || sh.weight} kg (Volumetric: {sh.volumetricWeight || 0} kg)</span></div>
                                                    <div><span className="text-gray-500 block">Sizing Dimensions:</span><span className="font-semibold text-white">{sh.length || 0}L x {sh.width || 0}W x {sh.height || 0}H cm</span></div>
                                                    <div><span className="text-gray-500 block">Shipping Base Charge:</span><span className="font-bold text-white">₹{sh.shippingCharge.toFixed(2)}</span></div>
                                                    <div><span className="text-gray-500 block">GST Tax (18%):</span><span className="font-bold text-white">₹{sh.gstAmount.toFixed(2)}</span></div>
                                                    <div className="col-span-2 border-t border-white/10 pt-2 flex justify-between font-bold text-xs text-[#FF6A00]"><span>Invoice Total:</span><span>₹{sh.invoiceTotal.toFixed(2)}</span></div>
                                                </div>
                                                {sh.weightDiscrepancy && (
                                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[11px] space-y-1">
                                                        <span className="font-bold block uppercase text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> Weight Discrepancy Dispute</span>
                                                        <p>The courier scanned weight is <strong>{sh.scannedWeight} kg</strong> vs declared weight <strong>{sh.weight} kg</strong>.</p>
                                                        <p>Delta penalty cost is <strong>₹{sh.deltaCost.toFixed(2)}</strong>. Review Status: <strong>{sh.discrepancyStatus}</strong></p>
                                                        <p className="italic font-light">Details: {sh.discrepancyDetails}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    {filteredShipments.length === 0 && <tr><td colSpan="8" className="py-8 text-center text-gray-500">No matching shipments found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {paginationData && (
                <Pagination
                    pagination={paginationData}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Generate Invoice Modal */}
            {invoiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
                    <div className="bg-[#0A1F44] border border-white/10 text-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-lg font-bold text-[#FF6A00] mb-4 flex items-center gap-2"><FileText size={20} /> Generate Tax Invoice</h3>
                        <div className="space-y-4 text-xs">
                            <p className="text-gray-400">Select a date range to generate a PDF Tax Invoice. The invoice will only include shipments marked as <strong>Delivered</strong>.</p>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-[10px] text-[#FF6A00] font-bold uppercase block mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={invoiceFromDate}
                                        onChange={(e) => setInvoiceFromDate(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-[#071630] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[#FF6A00] font-bold uppercase block mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={invoiceToDate}
                                        onChange={(e) => setInvoiceToDate(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-[#071630] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-2">
                                <button
                                    onClick={handleGenerateInvoice}
                                    disabled={generatingInvoice}
                                    className="flex-1 bg-[#FF6A00] text-[#0A1F44] font-extrabold py-3 rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {generatingInvoice && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>}
                                    <DownloadCloud size={16} /> Download PDF
                                </button>
                                <button
                                    onClick={() => setInvoiceModalOpen(false)}
                                    disabled={generatingInvoice}
                                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
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
                    <div className="bg-[#0A1F44] border border-white/10 text-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-lg font-bold text-[#FF6A00] mb-4 flex items-center gap-2"><Calendar size={20} /> Schedule Courier Pickup Manifest</h3>
                        <div className="space-y-4 text-xs">
                            <p className="text-gray-400">You are scheduling a courier pickup for Shipment <strong>{schedulingShipment.shipmentId}</strong>.</p>
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                                <span className="font-bold text-amber-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5"><AlertTriangle size={12} /> Mandatory Pre-Pickup Checklist</span>
                                <ul className="list-disc pl-4 space-y-1 text-gray-300 text-[11px]">
                                    <li>Print the AWB Label from the actions menu and tape it securely to the top of the box.</li>
                                    <li>Print 3 copies of the Commercial Invoice for International Customs.</li>
                                    <li>Ensure the physical weight matches your declared weight ({schedulingShipment.weight} kg).</li>
                                </ul>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Pickup Manifest Date</label>
                                <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full p-3 rounded-xl bg-[#071630] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={handleSchedulePickup} className="flex-1 bg-[#FF6A00] text-[#0A1F44] font-extrabold py-3 rounded-xl hover:brightness-110 transition">Confirm Schedule</button>
                                <button onClick={() => setSchedulingShipment(null)} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition">Cancel</button>
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