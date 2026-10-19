import React, { useState, useEffect } from "react";
import {
    AlertTriangle,
    CheckCircle,
    UploadCloud,
    Download,
    FileSpreadsheet,
    FileText,
    Calculator,
    HelpCircle
} from "lucide-react";
import API from "../../services/api";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Dropdown } from "../../components/ui/Dropdown";
import * as XLSX from "xlsx-js-style";
import { ARAMEX_SUPPORTED_COUNTRIES, ARAMEX_SUPPORTED_CURRENCIES } from "../../utils/countries";
import { toast } from "react-toastify";

const BulkUpload = () => {
    const { user, wallet, fetchWalletData } = useOutletContext();
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);

    // Batch Settings (Applies as defaults if not provided in CSV)
    const [batchSettings, setBatchSettings] = useState({
        courier: "aramex",
    });

    // File Processing States
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [calculatingRates, setCalculatingRates] = useState(false);
    const [ratesCalculated, setRatesCalculated] = useState(false);
    const [bulkValidationError, setBulkValidationError] = useState("");
    const [bulkResult, setBulkResult] = useState(null);
    const [bulkConfirming, setBulkConfirming] = useState(false);

    // Dynamic Headers Required for Booking
    const headers = [
        "receiverName", "receiverMobile", "receiverEmail", "receiverAddressLine1",
        "receiverCity", "receiverState", "receiverCountry", "receiverPincode",
        "weight", "length", "width", "height", "numberOfPieces",
        "productDescription", "customsValue", "customsCurrency", "productType"
    ];

    const sampleDataRow = [
        "John Doe", "+971501234567", "customer@example.com", "123 Sheikh Zayed Road",
        "Dubai", "DU", "AE", "12345",
        "1.5", "10", "10", "10", "1",
        "Electronics and Apparel", "150.00", "USD", "PPX"
    ];

    // Fetch Warehouses on Mount (Needed to assign the default warehouse)
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await API.get("/warehouses/my-addresses");
                setWarehouses(res.data || []);
            } catch (err) {
                console.error("Failed to fetch warehouses.");
            }
        };
        fetchWarehouses();
    }, []);

    // Helper: Generate and Download Excel/CSV Files
    const downloadTemplate = (format = "csv") => {
        if (format === "csv") {
            const csvContent = [headers.join(","), sampleDataRow.join(",")].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Phoenix_Bulk_Booking_Template.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Generate Styled XLSX Template
        const wb = XLSX.utils.book_new();
        const wsData = [headers, sampleDataRow];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "0A1F44" } },
            alignment: { horizontal: "center", vertical: "center" }
        };

        headers.forEach((_, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
            if (ws[cellAddress]) {
                ws[cellAddress].s = headerStyle;
            }
        });

        ws["!cols"] = headers.map(() => ({ wch: 22 }));
        XLSX.utils.book_append_sheet(wb, ws, "Consignments");
        XLSX.writeFile(wb, "Phoenix_Bulk_Booking_Template.xlsx");
    };

    const dropdownItems = [
        {
            label: "Template Spreadsheet (.xlsx)",
            icon: FileSpreadsheet,
            onClick: () => downloadTemplate("xlsx")
        },
        {
            label: "Template Comma-Separated (.csv)",
            icon: FileText,
            onClick: () => downloadTemplate("csv")
        }
    ];

    // STEP 1: Process and Validate Uploaded File
    const handleFileProcessAndValidate = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setBulkValidationError("");
        setBulkResult(null);
        setRatesCalculated(false);
        setBulkFile(file);
        setBulkProcessing(true);

        const reader = new FileReader();
        const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

        reader.onload = (event) => {
            try {
                let parsedRows = [];

                if (isExcel) {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    parsedRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                } else {
                    const text = event.target.result;
                    const lines = text.split("\n").map(l => l.trim()).filter(l => l);
                    if (lines.length < 2) {
                        setBulkValidationError("The uploaded file does not contain any data rows.");
                        setBulkProcessing(false);
                        return;
                    }
                    const fileHeaders = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
                    parsedRows = lines.slice(1).map(line => {
                        const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
                        const rowObj = {};
                        fileHeaders.forEach((h, i) => { rowObj[h] = values[i] || ""; });
                        return rowObj;
                    });
                }

                if (parsedRows.length === 0) {
                    setBulkValidationError("No valid data rows found in the spreadsheet.");
                    setBulkProcessing(false);
                    return;
                }

                // Row-by-Row Deep Validation
                const validRows = [];
                const invalidRows = [];

                const defaultWarehouse = warehouses.find(w => w.isDefault) || warehouses[0];
                const pickupAddressId = defaultWarehouse ? defaultWarehouse._id : "";
                const goodsOriginCountry = defaultWarehouse ? defaultWarehouse.country : "IN";

                parsedRows.forEach((row, index) => {
                    const errors = [];
                    const line = index + 2;

                    // Required Fields Checks
                    if (!row.receiverName) errors.push("Missing receiver name");
                    if (!row.receiverMobile) errors.push("Missing receiver mobile number");
                    if (!row.receiverAddressLine1) errors.push("Missing receiver address");
                    if (!row.receiverCity) errors.push("Missing receiver city");
                    if (!row.receiverState) errors.push("Missing receiver state/province code");
                    if (!row.receiverCountry) errors.push("Missing 2-letter destination country code");
                    if (!row.receiverPincode) errors.push("Missing receiver postal/zip code");
                    if (!row.productDescription) errors.push("Missing parcel content description");

                    // Weight Validation
                    const weightVal = parseFloat(row.weight);
                    if (!row.weight || isNaN(weightVal) || weightVal <= 0) {
                        errors.push("Invalid dead weight (must be greater than 0 kg)");
                    }

                    // Customs Value & Currency Check
                    const customsVal = parseFloat(row.customsValue);
                    if (!row.customsValue || isNaN(customsVal) || customsVal <= 0) {
                        errors.push("Missing or invalid customs declared monetary value");
                    }
                    if (!row.customsCurrency || !ARAMEX_SUPPORTED_CURRENCIES.some(c => c.value === row.customsCurrency.toUpperCase())) {
                        errors.push(`Invalid customs currency: ${row.customsCurrency}`);
                    }

                    // Country Support Check
                    if (row.receiverCountry && !ARAMEX_SUPPORTED_COUNTRIES.some(c => c.value === row.receiverCountry.toUpperCase())) {
                        errors.push(`Destination country '${row.receiverCountry}' is not supported`);
                    }

                    if (errors.length > 0) {
                        invalidRows.push({ line, row, errors });
                    } else {
                        validRows.push({
                            line,
                            receiverName: row.receiverName,
                            receiverMobile: row.receiverMobile,
                            receiverEmail: row.receiverEmail || "",
                            receiverAddressLine1: row.receiverAddressLine1,
                            receiverCity: row.receiverCity,
                            receiverState: row.receiverState.toUpperCase(),
                            receiverCountry: row.receiverCountry.toUpperCase(),
                            receiverPincode: row.receiverPincode,
                            weight: weightVal,
                            length: parseFloat(row.length) || 10,
                            width: parseFloat(row.width) || 10,
                            height: parseFloat(row.height) || 10,
                            numberOfPieces: parseInt(row.numberOfPieces, 10) || 1,
                            productDescription: row.productDescription,
                            customsValue: customsVal,
                            customsCurrency: row.customsCurrency.toUpperCase(),
                            pickupAddressId: pickupAddressId,
                            goodsOriginCountry: goodsOriginCountry,
                            productGroup: "EXP",
                            productType: row.productType ? row.productType.toUpperCase() : "PPX",
                            invoiceTotal: 0
                        });
                    }
                });

                setBulkResult({
                    totalRows: parsedRows.length,
                    validRows,
                    invalidRows,
                    summary: {
                        totalRows: parsedRows.length,
                        validCount: validRows.length,
                        invalidCount: invalidRows.length,
                        totalEstimatedCost: 0,
                        walletAvailable: wallet ? wallet.availableBalance : 0,
                        hasSufficientFunds: true
                    }
                });

            } catch (err) {
                console.error("Processing failed", err);
                setBulkValidationError("Failed to parse data. Please check your column formatting.");
            } finally {
                setBulkProcessing(false);
            }
        };

        if (isExcel) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };

    // STEP 2: Calculate Rates across all Valid Rows
    const handleCalculateBatchRates = async () => {
        if (!bulkResult || !bulkResult.validRows || bulkResult.validRows.length === 0) return;
        setCalculatingRates(true);
        setBulkValidationError("");

        let totalCost = 0;
        const calculatedRows = [];
        const newInvalids = [...bulkResult.invalidRows];

        for (const row of bulkResult.validRows) {
            try {
                const payload = {
                    courier: batchSettings.courier,
                    pickupAddressId: row.pickupAddressId,
                    weight: row.weight,
                    length: row.length,
                    width: row.width,
                    height: row.height,
                    productGroup: row.productGroup,
                    productType: row.productType,
                    receiverName: row.receiverName,
                    receiverMobile: row.receiverMobile,
                    receiverAddressLine1: row.receiverAddressLine1,
                    receiverCity: row.receiverCity,
                    receiverState: row.receiverState,
                    receiverCountry: row.receiverCountry,
                    receiverPincode: row.receiverPincode,
                };

                const res = await API.post("/rates/calculate", payload);
                const cost = res.data.invoiceTotal || 0;
                totalCost += cost;

                calculatedRows.push({
                    ...row,
                    invoiceTotal: cost,
                    serviceType: res.data.serviceType || row.productType
                });
            } catch (err) {
                newInvalids.push({
                    line: row.line,
                    row,
                    errors: [err.response?.data?.message || "Courier rejected rate query for this destination"]
                });
            }
        }

        const walletBal = wallet ? wallet.availableBalance : 0;

        setBulkResult({
            ...bulkResult,
            validRows: calculatedRows,
            invalidRows: newInvalids,
            summary: {
                totalRows: bulkResult.totalRows,
                validCount: calculatedRows.length,
                invalidCount: newInvalids.length,
                totalEstimatedCost: totalCost,
                walletAvailable: walletBal,
                hasSufficientFunds: walletBal >= totalCost
            }
        });

        setRatesCalculated(true);
        setCalculatingRates(false);
    };

    // STEP 3: Submit Enriched Data to Backend Bulk API
    const handleBulkConfirm = async () => {
        if (!bulkResult || !bulkResult.validRows || bulkResult.validRows.length === 0) return;
        setBulkValidationError("");
        setBulkConfirming(true);

        try {
            const finalPayload = bulkResult.validRows.map(row => ({
                isTestMode: batchSettings.isTestMode,
                courier: batchSettings.courier,
                productType: row.serviceType || row.productType,
                isGuestRecipient: true,
                ...row
            }));

            const res = await API.post("/shipments/bulk-confirm", {
                validRows: finalPayload
            });

            const bookedCount = res.data.successBookings?.length || 0;
            const draftCount = res.data.draftBookings?.length || 0;

            if (draftCount > 0 && bookedCount > 0) {
                toast.success(`Booked ${bookedCount} shipment(s). ${draftCount} saved as Draft due to insufficient balance.`);
            } else if (draftCount > 0) {
                toast.info(`${draftCount} shipment(s) saved as Draft due to insufficient balance. Recharge your wallet to reprocess.`);
            } else {
                toast.success(res.data.message || `Successfully booked ${bookedCount} shipments.`);
            }

            setBulkFile(null);
            setBulkResult(null);
            setRatesCalculated(false);
            if (fetchWalletData) await fetchWalletData();
            navigate("/dashboard/shipments");
        } catch (err) {
            setBulkValidationError(err.response?.data?.message || "Failed to commit bulk bookings.");
        } finally {
            setBulkConfirming(false);
        }
    };

    return (
        <div className="space-y-6 select-none animate-fade-in">
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Bulk Consignments Upload</h1>
                    <p className="text-sm text-[#687280]">Batch upload consignments via CSV or Excel, validate data in real-time, and auto-book manifests.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard/help-guide")}
                        className="bg-white border border-[#687280]/20 hover:border-[#FF6A00] text-[#0A1F44] px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                    >
                        <HelpCircle size={14} /> Format Guide
                    </button>

                    <Dropdown
                        buttonLabel="Download Sample File"
                        icon={Download}
                        items={dropdownItems}
                        buttonClassName="bg-[#0A1F44] hover:bg-[#FF6A00] text-white shadow-sm"
                    />
                </div>
            </div>

            {/* Excel & CSV Upload Guidelines Block */}
            <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                    <UploadCloud size={18} className="text-[#FF6A00]" />
                    <h4 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Excel & CSV Upload Guidelines</h4>
                </div>
                <p className="text-xs text-[#687280]">Your spreadsheet columns must exactly match these headers in order:</p>

                <div className="bg-[#E5E7EB]/40 border border-[#687280]/20 rounded-xl overflow-hidden p-3">
                    <div className="overflow-x-auto custom-scrollbar">
                        <code className="text-[#0A1F44] font-mono text-xs whitespace-nowrap select-all font-semibold">
                            {headers.join(", ")}
                        </code>
                    </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-[#687280]">
                    <p>• The system will automatically use your account's Default Warehouse for all pickups.</p>
                    <p>
                        • For supported country codes, currencies, and Product Types, please refer to the{" "}
                        <button onClick={() => navigate("/dashboard/help-guide")} className="text-[#FF6A00] font-bold hover:underline">Format Guide</button>.
                    </p>
                </div>
            </div>

            {/* Batch Level Courier Settings & File Upload */}
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#687280]/20 shadow-xl space-y-6">
                <div>
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider mb-3">Carrier Partner Selection</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition shadow-sm ${batchSettings.courier === "aramex" ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-[#687280]/20 bg-white hover:border-[#FF6A00]/40"}`}>
                            <input type="radio" value="aramex" checked={batchSettings.courier === "aramex"} onChange={() => { setBatchSettings({ ...batchSettings, courier: "aramex", productType: "PPX" }); setBulkResult(null); setRatesCalculated(false); }} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${batchSettings.courier === "aramex" ? "border-[#FF6A00]" : "border-[#687280]"}`}>
                                {batchSettings.courier === "aramex" && <div className="w-2 h-2 bg-[#FF6A00] rounded-full"></div>}
                            </div>
                            <span className="text-[#0A1F44] font-bold text-sm">Aramex</span>
                        </label>

                        <div className="border border-[#687280]/20 bg-gray-100/70 p-4 rounded-xl flex items-center justify-between cursor-not-allowed opacity-60 select-none">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center bg-gray-200"></div>
                                <span className="text-gray-400 font-bold text-sm">Phreight</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-500 uppercase tracking-wider">Disabled</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#687280]/15 pt-6">
                    <label className="text-[10px] text-[#687280] block mb-2 font-bold uppercase tracking-wider">Select Excel (.xlsx) or CSV File</label>
                    <input
                        type="file"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={handleFileProcessAndValidate}
                        className="w-full text-xs text-[#0A1F44] file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0A1F44] file:text-white hover:file:bg-[#FF6A00] transition cursor-pointer bg-[#E5E7EB]/30 border border-[#687280]/30 rounded-xl outline-none p-2 shadow-sm"
                    />
                </div>
            </div>

            {bulkValidationError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{bulkValidationError}</span>
                </div>
            )}

            {bulkResult && (
                <div className="space-y-6">
                    {/* Summary Row */}
                    <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl grid md:grid-cols-4 gap-6 text-xs">
                        <div>
                            <span className="text-[#687280] block font-semibold mb-1">Total Rows Detected:</span>
                            <span className="text-2xl font-black text-[#0A1F44]">{bulkResult.summary.totalRows}</span>
                        </div>
                        <div>
                            <span className="text-[#687280] block font-semibold mb-1">Valid Rows:</span>
                            <span className="text-2xl font-black text-green-600">{bulkResult.summary.validCount}</span>
                        </div>
                        <div>
                            <span className="text-[#687280] block font-semibold mb-1">Invalid Rows:</span>
                            <span className="text-2xl font-black text-red-600">{bulkResult.summary.invalidCount}</span>
                        </div>
                        <div>
                            <span className="text-[#687280] block font-semibold mb-1">Calculated Total Cost:</span>
                            <span className="text-2xl font-black text-[#FF6A00]">
                                {ratesCalculated ? `₹${bulkResult.summary.totalEstimatedCost.toFixed(2)}` : "Pending Calculation"}
                            </span>
                        </div>
                    </div>

                    {!bulkResult.summary.hasSufficientFunds && ratesCalculated && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl flex items-center gap-2">
                            <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                            <span>
                                <strong>Insufficient Balance Notice:</strong> Your available wallet balance (₹{bulkResult.summary.walletAvailable.toFixed(2)}) is lower than the batch cost (₹{bulkResult.summary.totalEstimatedCost.toFixed(2)}).
                                Any consignments exceeding available funds will be automatically <strong>saved as Draft</strong> in your manifest. Once you recharge your wallet, you can reprocess them.
                            </span>
                        </div>
                    )}

                    {bulkResult.summary.invalidCount > 0 && (
                        <div className="glass-card p-6 rounded-2xl border border-red-200 shadow-xl space-y-3">
                            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider">Validation Errors Listing</h4>
                            <div className="max-h-60 overflow-y-auto border border-red-200 rounded-xl custom-scrollbar">
                                <table className="w-full text-left text-xs bg-red-50/50">
                                    <thead>
                                    <tr className="border-b border-red-200 text-red-700 text-[10px] uppercase font-bold sticky top-0 bg-red-100/90 backdrop-blur-sm">
                                        <th className="py-3 px-4 text-center">Row</th>
                                        <th className="py-3 px-4">Recipient Name</th>
                                        <th className="py-3 px-4">Error Reasons</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-200/60">
                                    {bulkResult.invalidRows.map((inv, idx) => (
                                        <tr key={idx} className="hover:bg-red-100/40 transition-colors">
                                            <td className="py-2.5 px-4 text-center font-bold text-red-600">{inv.line}</td>
                                            <td className="py-2.5 px-4 font-semibold text-[#0A1F44]">{inv.row.receiverName || "Empty name"}</td>
                                            <td className="py-2.5 px-4 text-red-700 font-medium">{inv.errors.join(", ")}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {bulkResult.summary.validCount > 0 && (
                        <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl space-y-3">
                            <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider">Valid Bookings Preview Grid</h4>
                            <div className="max-h-60 overflow-y-auto border border-[#687280]/20 rounded-xl custom-scrollbar">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                    <tr className="border-b border-[#687280]/20 text-[#687280] text-[10px] uppercase font-bold sticky top-0 bg-[#E5E7EB]/90 backdrop-blur-sm">
                                        <th className="py-3 px-4 text-center">Row</th>
                                        <th className="py-3 px-4">Customer Name</th>
                                        <th className="py-3 px-4">Route</th>
                                        <th className="py-3 px-4 text-center">Type / Weight</th>
                                        <th className="py-3 px-4 text-right">Cost (Calculated)</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#687280]/10 text-[#0A1F44]">
                                    {bulkResult.validRows.map((val, idx) => (
                                        <tr key={idx} className="hover:bg-[#E5E7EB]/40 transition-colors">
                                            <td className="py-2.5 px-4 text-center font-bold text-green-700">{val.line}</td>
                                            <td className="py-2.5 px-4 font-semibold text-[#0A1F44]">{val.receiverName}</td>
                                            <td className="py-2.5 px-4 text-[#687280]">
                                                {val.receiverCity}, {val.receiverCountry}
                                            </td>
                                            <td className="py-2.5 px-4 text-center font-mono">
                                                <span className="block text-[10px] font-bold text-[#FF6A00]">{val.productType}</span>
                                                {val.weight} kg
                                            </td>
                                            <td className="py-2.5 px-4 text-right font-extrabold text-[#FF6A00]">
                                                {ratesCalculated ? `₹${val.invoiceTotal?.toFixed(2)}` : "Pending"}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Calculate Rates Button */}
                    {bulkResult.summary.validCount > 0 && !ratesCalculated && (
                        <button
                            onClick={handleCalculateBatchRates}
                            disabled={calculatingRates}
                            className="w-full bg-[#0A1F44] hover:bg-[#FF6A00] text-white font-extrabold py-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md"
                        >
                            {calculatingRates ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <><Calculator size={16} /> Calculate Rates for {bulkResult.summary.validCount} Rows</>}
                        </button>
                    )}

                    {/* Step 3: Confirm & Book Button */}
                    {ratesCalculated && bulkResult.summary.validCount > 0 && user?.status === "Active" && (
                        <button
                            onClick={handleBulkConfirm}
                            disabled={bulkConfirming}
                            className={`w-full font-extrabold py-4 rounded-xl text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2 text-white ${
                                bulkResult.summary.hasSufficientFunds
                                    ? "bg-[#FF6A00] hover:bg-[#ff7b1a] shadow-[#FF6A00]/20"
                                    : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                            }`}
                        >
                            {bulkConfirming ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : bulkResult.summary.hasSufficientFunds ? (
                                <><CheckCircle size={16} /> Confirm & Book Batch (Debits ₹{bulkResult.summary.totalEstimatedCost.toFixed(2)})</>
                            ) : (
                                <><CheckCircle size={16} /> Confirm Batch (Save Unfunded as Draft)</>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkUpload;