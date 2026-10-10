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

    const handleDownloadSample = (format) => {
        const ws = XLSX.utils.aoa_to_sheet([headers, sampleDataRow]);
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "0A1F44" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
            }
        };

        ws["!cols"] = headers.map(() => ({ wch: 22 }));

        headers.forEach((_, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
            if (ws[cellAddress]) ws[cellAddress].s = headerStyle;
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bulk_Template");

        if (format === "excel") XLSX.writeFile(wb, "Phoenix_Bulk_Template.xlsx");
        if (format === "csv") XLSX.writeFile(wb, "Phoenix_Bulk_Template.csv");
    };

    const dropdownItems = [
        { label: "Download as Excel (.xlsx)", icon: FileSpreadsheet, onClick: () => handleDownloadSample("excel") },
        { label: "Download as CSV (.csv)", icon: FileText, onClick: () => handleDownloadSample("csv") }
    ];

    // STEP 1: Parse File in Frontend & Validate Basic Fields
    const handleFileProcessAndValidate = (e) => {
        const file = e.target.files[0];
        setBulkFile(file);
        setBulkResult(null);
        setRatesCalculated(false);
        setBulkValidationError("");

        if (!file) return;

        const allowedExtensions = ["csv", "xlsx", "xls"];
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            setBulkValidationError("Invalid file format. Please upload a .csv or .xlsx file.");
            return;
        }

        const defaultWh = warehouses.find(w => w.isDefault) || warehouses[0];
        if (!defaultWh) {
            setBulkValidationError("No warehouse found. Please create a pickup warehouse in the Warehouses tab first.");
            return;
        }

        setBulkProcessing(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                console.log(data)

                let valid = [];
                let invalid = [];

                // Prepare Validated Reference Arrays
                const validCountries = ARAMEX_SUPPORTED_COUNTRIES.map(c => (c.code || c.value || "").toUpperCase());
                const validCurrencies = ARAMEX_SUPPORTED_CURRENCIES.map(c => (c.code || c.value || "").toUpperCase());
                const validProductTypes = ["PPX", "EPX", "PDX"];

                data.forEach((row, index) => {
                    let errors = [];

                    // Basic Mandatory Validations
                    if (!row.receiverName) errors.push("Missing receiverName");
                    if (!row.receiverMobile) errors.push("Missing receiverMobile");
                    if (!row.receiverEmail) errors.push("Missing receiverEmail");
                    if (!row.receiverAddressLine1) errors.push("Missing receiverAddressLine1");
                    if (!row.receiverCity) errors.push("Missing receiverCity");
                    if (!row.receiverState) errors.push("Missing receiverState");

                    // Country Code Validation
                    if (!row.receiverCountry) {
                        errors.push("Missing receiverCountry");
                    } else if (!validCountries.includes(row.receiverCountry.toString().toUpperCase())) {
                        errors.push(`Invalid receiverCountry: '${row.receiverCountry}'`);
                    }

                    if (!row.receiverPincode) errors.push("Missing receiverPincode");

                    // Dimensions and Weight Validation
                    if (!row.weight || isNaN(parseFloat(row.weight))) errors.push("Invalid weight");
                    if (!row.length || isNaN(parseFloat(row.length))) errors.push("Invalid length");
                    if (!row.width || isNaN(parseFloat(row.width))) errors.push("Invalid width");
                    if (!row.height || isNaN(parseFloat(row.height))) errors.push("Invalid height");

                    if (!row.numberOfPieces || isNaN(parseInt(row.numberOfPieces))) errors.push("Invalid numberOfPieces");
                    if (!row.productDescription) errors.push("Missing productDescription");

                    if (!row.customsValue || isNaN(parseFloat(row.customsValue))) errors.push("Invalid customsValue");

                    // Currency Code Validation
                    if (!row.customsCurrency) {
                        errors.push("Missing customsCurrency");
                    } else if (!validCurrencies.includes(row.customsCurrency.toString().toUpperCase())) {
                        errors.push(`Invalid customsCurrency: '${row.customsCurrency}'`);
                    }

                    // Product Type Validation
                    if (!row.productType) {
                        errors.push("Missing productType");
                    } else if (!validProductTypes.includes(row.productType.toString().toUpperCase())) {
                        errors.push(`Invalid productType: '${row.productType}'`);
                    }

                    if (errors.length > 0) {
                        invalid.push({ line: index + 2, row, errors });
                    } else {
                        valid.push({
                            line: index + 2,
                            pickupAddressId: defaultWh._id,
                            receiverName: row.receiverName,
                            receiverMobile: row.receiverMobile.toString(),
                            receiverEmail: row.receiverEmail.toString(),
                            receiverAddressLine1: row.receiverAddressLine1,
                            receiverCity: row.receiverCity,
                            receiverState: row.receiverState,
                            receiverCountry: row.receiverCountry.toUpperCase(),
                            receiverPincode: row.receiverPincode.toString(),
                            weight: parseFloat(row.weight),
                            length: parseFloat(row.length),
                            width: parseFloat(row.width),
                            height: parseFloat(row.height),
                            numberOfPieces: parseInt(row.numberOfPieces),
                            productDescription: row.productDescription,
                            customsValue: parseFloat(row.customsValue),
                            customsCurrency: row.customsCurrency.toUpperCase(),
                            productType: row.productType.toUpperCase()
                        });
                    }
                });

                setBulkResult({
                    validRows: valid,
                    invalidRows: invalid,
                    summary: {
                        totalRows: data.length,
                        validCount: valid.length,
                        invalidCount: invalid.length,
                        totalEstimatedCost: 0,
                        walletAvailable: wallet?.availableBalance || 0,
                        hasSufficientFunds: true
                    }
                });
            } catch (err) {
                setBulkValidationError("Error parsing file. Please ensure it follows the sample template.");
            } finally {
                setBulkProcessing(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    // STEP 2: Loop API to Calculate Rates for Valid Rows
    const handleCalculateBatchRates = async () => {
        if (!bulkResult || bulkResult.validRows.length === 0) return;
        setCalculatingRates(true);

        let updatedValid = [];
        let newInvalids = [...bulkResult.invalidRows];
        let totalCost = 0;

        for (const row of bulkResult.validRows) {
            try {
                const payload = {
                    isTestMode: batchSettings.isTestMode,
                    courier: batchSettings.courier,
                    pickupAddressId: row.pickupAddressId,
                    customerId: "", // Force Guest Recipient mapping on backend
                    weight: row.weight,
                    length: row.length, width: row.width, height: row.height,
                    productGroup: "EXP",
                    productType: batchSettings.courier === "aramex" ? row.productType : undefined,
                    receiverName: row.receiverName,
                    receiverMobile: row.receiverMobile,
                    receiverAddressLine1: row.receiverAddressLine1,
                    receiverCity: row.receiverCity,
                    receiverState: row.receiverState,
                    receiverCountry: row.receiverCountry,
                    receiverPincode: row.receiverPincode,
                };

                const res = await API.post("/rates/calculate", payload);

                let cost = res.data.invoiceTotal;
                let service = res.data.selectedService || row.productType;

                // For phreights dynamic services, grab the first available returned plan
                if (batchSettings.courier === "phreights" && res.data.services?.length > 0) {
                    cost = res.data.services[0].invoiceTotal;
                    service = res.data.services[0].serviceName;
                }

                totalCost += cost;
                updatedValid.push({
                    ...row,
                    invoiceTotal: cost,
                    serviceType: service
                });
            } catch (error) {
                newInvalids.push({
                    line: row.line,
                    row,
                    errors: [error.response?.data?.message || "Courier route not supported or rate failed."]
                });
            }
        }

        const walletBal = wallet?.availableBalance || 0;

        setBulkResult({
            validRows: updatedValid,
            invalidRows: newInvalids,
            summary: {
                totalRows: updatedValid.length + newInvalids.length,
                validCount: updatedValid.length,
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

            toast.success(res.data.message || `Successfully booked ${finalPayload.length} shipments.`);
            setBulkFile(null);
            setBulkResult(null);
            setRatesCalculated(false);
            await fetchWalletData();
            navigate("/dashboard/shipments");
        } catch (err) {
            setBulkValidationError(err.response?.data?.message || "Failed to commit bulk bookings.");
        } finally {
            setBulkConfirming(false);
        }
    };

    return (
        <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#687280]/20 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <UploadCloud size={22} className="text-[#FF6A00]" />
                    Double-Pass Bulk Consignments Upload
                </h3>

                <div className="flex items-center gap-3">
                    {/* Help Guide Navigation Button */}
                    <button
                        onClick={() => navigate("/dashboard/help-guide")}
                        className="bg-[#0A1F44] text-gray-300 border border-white/10 hover:border-[#FF6A00]/50 hover:text-[#FF6A00] px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2"
                    >
                        <HelpCircle size={14} /> Format Guide
                    </button>

                    {/* Download Sample File Dropdown */}
                    <Dropdown
                        buttonLabel="Download Sample File"
                        icon={Download}
                        items={dropdownItems}
                        buttonClassName="bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30 hover:bg-[#FF6A00] hover:text-[#0A1F44]"
                    />
                </div>
            </div>

            {/* Excel & CSV Upload Guidelines Block */}
            <div className="bg-[#0A1F44]/40 p-6 rounded-2xl border border-white/5 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">Excel & CSV Upload Guidelines</h4>
                <p className="text-xs text-[#687280]">Your columns must exactly match these headers in order:</p>

                <div className="bg-[#071630] border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar pb-3 pt-3 px-4">
                        <code className="text-gray-300 font-mono text-xs whitespace-nowrap select-all">
                            {headers.join(",")}
                        </code>
                    </div>
                </div>

                <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-[#687280] italic">* The system will automatically use your account's Default Warehouse for all pickups.</p>
                    <p className="text-xs text-[#687280] italic">
                        * For supported country codes, currencies, and Product Types, please refer to the{" "}
                        <button onClick={() => navigate("/dashboard/help-guide")} className="text-[#FF6A00] font-semibold hover:underline">Format Guide</button>.
                    </p>
                </div>
            </div>

            {/* Batch Level Courier Settings */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Batch Carrier Settings</h4>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition ${batchSettings.courier === "aramex" ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-white/10 bg-[#0A1F44] hover:border-white/30"}`}>
                        <input type="radio" value="aramex" checked={batchSettings.courier === "aramex"} onChange={() => { setBatchSettings({ ...batchSettings, courier: "aramex", productType: "PPX" }); setBulkResult(null); setRatesCalculated(false); }} className="hidden" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${batchSettings.courier === "aramex" ? "border-[#FF6A00]" : "border-gray-500"}`}>
                            {batchSettings.courier === "aramex" && <div className="w-2 h-2 bg-[#FF6A00] rounded-full"></div>}
                        </div>
                        <span className="text-white font-bold text-sm">Aramex</span>
                    </label>

                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition ${batchSettings.courier === "phreights" ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-white/10 bg-[#0A1F44] hover:border-white/30"}`}>
                        <input type="radio" value="phreights" checked={batchSettings.courier === "phreights"} onChange={() => { setBatchSettings({ ...batchSettings, courier: "phreights", productType: "" }); setBulkResult(null); setRatesCalculated(false); }} className="hidden" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${batchSettings.courier === "phreights" ? "border-[#FF6A00]" : "border-gray-500"}`}>
                            {batchSettings.courier === "phreights" && <div className="w-2 h-2 bg-[#FF6A00] rounded-full"></div>}
                        </div>
                        <span className="text-white font-bold text-sm">phreights</span>
                    </label>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-end">
                <div>
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold uppercase tracking-wider">Select Excel (.xlsx) or CSV File</label>
                    <input
                        type="file"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={handleFileProcessAndValidate}
                        className="w-full text-xs text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-white/10 file:text-white hover:file:bg-white/20 transition cursor-pointer bg-[#0A1F44] border border-white/10 rounded-xl outline-none"
                    />
                </div>
            </div>

            {bulkValidationError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{bulkValidationError}</span>
                </div>
            )}

            {bulkResult && (
                <div className="space-y-6">
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 grid md:grid-cols-4 gap-6 text-xs">
                        <div>
                            <span className="text-gray-500 block">Total Rows Detected:</span>
                            <span className="text-lg font-bold text-white">{bulkResult.summary.totalRows}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Valid Rows:</span>
                            <span className="text-lg font-bold text-green-500">{bulkResult.summary.validCount}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Invalid Rows:</span>
                            <span className="text-lg font-bold text-red-500">{bulkResult.summary.invalidCount}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Calculated Total Cost:</span>
                            <span className="text-lg font-bold text-[#FF6A00]">
                                {ratesCalculated ? `₹${bulkResult.summary.totalEstimatedCost.toFixed(2)}` : "Pending Calculation"}
                            </span>
                        </div>
                    </div>

                    {!bulkResult.summary.hasSufficientFunds && ratesCalculated && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                            <AlertTriangle size={14} className="shrink-0" />
                            <span>Insufficient Funds! Your available wallet balance (₹{bulkResult.summary.walletAvailable.toFixed(2)}) is lower than the batch cost (₹{bulkResult.summary.totalEstimatedCost.toFixed(2)}).</span>
                        </div>
                    )}

                    {bulkResult.summary.invalidCount > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">Validation Errors Listing</h4>
                            <div className="max-h-60 overflow-y-auto border border-red-500/10 rounded-2xl custom-scrollbar">
                                <table className="w-full text-left text-xs bg-red-500/5">
                                    <thead>
                                    <tr className="border-b border-red-500/10 text-red-400 text-[10px] uppercase font-bold sticky top-0 bg-[#0A1F44]">
                                        <th className="py-3 px-4 text-center">Row</th>
                                        <th className="py-3 px-4">Recipient Name</th>
                                        <th className="py-3 px-4">Error Reasons</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-500/10">
                                    {bulkResult.invalidRows.map((inv, idx) => (
                                        <tr key={idx} className="hover:bg-red-500/10 transition-colors">
                                            <td className="py-2.5 px-4 text-center font-bold text-red-400">{inv.line}</td>
                                            <td className="py-2.5 px-4 font-semibold text-white">{inv.row.receiverName || "Empty name"}</td>
                                            <td className="py-2.5 px-4 text-red-400 italic">{inv.errors.join(", ")}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {bulkResult.summary.validCount > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider">Valid Bookings Preview Grid</h4>
                            <div className="max-h-60 overflow-y-auto border border-green-500/10 rounded-2xl custom-scrollbar">
                                <table className="w-full text-left text-xs bg-green-500/5">
                                    <thead>
                                    <tr className="border-b border-green-500/10 text-green-400 text-[10px] uppercase font-bold sticky top-0 bg-[#0A1F44]">
                                        <th className="py-3 px-4 text-center">Row</th>
                                        <th className="py-3 px-4">Customer Name</th>
                                        <th className="py-3 px-4">Route</th>
                                        <th className="py-3 px-4 text-center">Type / Weight</th>
                                        <th className="py-3 px-4 text-right">Cost (Calculated)</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-green-500/10">
                                    {bulkResult.validRows.map((val, idx) => (
                                        <tr key={idx} className="hover:bg-green-500/10 transition-colors">
                                            <td className="py-2.5 px-4 text-center font-bold text-green-400">{val.line}</td>
                                            <td className="py-2.5 px-4 font-semibold text-white">{val.receiverName}</td>
                                            <td className="py-2.5 px-4 text-gray-300">
                                                {val.receiverCity}, {val.receiverCountry}
                                            </td>
                                            <td className="py-2.5 px-4 text-center font-mono">
                                                <span className="block text-[10px] font-bold text-[#FF6A00]">{val.productType}</span>
                                                {val.weight} kg
                                            </td>
                                            <td className="py-2.5 px-4 text-right font-bold text-[#FF6A00]">
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
                            className="w-full bg-[#0A1F44] border border-[#FF6A00]/50 text-[#FF6A00] font-extrabold py-4 rounded-xl text-xs hover:bg-[#FF6A00]/10 transition flex items-center justify-center gap-2"
                        >
                            {calculatingRates ? <span className="w-5 h-5 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></span> : <><Calculator size={16} /> Calculate Rates for {bulkResult.summary.validCount} Rows</>}
                        </button>
                    )}

                    {/* Step 3: Confirm & Book Button */}
                    {ratesCalculated && bulkResult.summary.validCount > 0 && bulkResult.summary.hasSufficientFunds && user?.status === "Active" && (
                        <button
                            onClick={handleBulkConfirm}
                            disabled={bulkConfirming}
                            className="w-full bg-[#FF6A00] text-[#0A1F44] font-extrabold py-4 rounded-xl text-xs hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                        >
                            {bulkConfirming ? <span className="w-5 h-5 border-2 border-[#0A1F44] border-t-transparent rounded-full animate-spin"></span> : <><CheckCircle size={16} /> Confirm & Book Batch (Debits ₹{bulkResult.summary.totalEstimatedCost.toFixed(2)})</>}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkUpload;