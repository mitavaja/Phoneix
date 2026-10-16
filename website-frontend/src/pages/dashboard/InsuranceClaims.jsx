import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ShieldAlert } from "lucide-react";
import API from "../../services/api";
import { Select } from "../../components/ui/Select";

const InsuranceClaims = () => {
    const [claims, setClaims] = useState([]);
    const [shipmentOptions, setShipmentOptions] = useState([]);

    const [claimForm, setClaimForm] = useState({
        shipmentId: "",
        claimType: "Lost Shipment",
        description: "",
        claimAmount: 0,
    });

    const [claimSuccess, setClaimSuccess] = useState("");
    const [claimError, setClaimError] = useState("");

    const fetchClaims = async () => {
        try {
            const claimsRes = await API.get("/tickets/my-claims");
            setClaims(claimsRes.data || []);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error while fetching claims.");
        }
    };

    const fetchShipmentDropdown = async () => {
        try {
            const res = await API.get("/shipments/drop-down-list");
            if (res.data && res.data.list) {
                setShipmentOptions(res.data.list);
            }
        } catch (err) {
            console.error("Failed to fetch shipment dropdown list", err);
            toast.error("Could not load shipments for the dropdown.");
        }
    };

    const handleFileClaim = async (e) => {
        e.preventDefault();
        setClaimError("");
        setClaimSuccess("");

        if (!claimForm.shipmentId) {
            setClaimError("Please select a shipment from the dropdown.");
            return;
        }

        try {
            const res = await API.post("/tickets/claim", claimForm);
            setClaimSuccess(res.data.message || "Insurance claim request submitted successfully.");
            setClaimForm({ shipmentId: "", claimType: "Lost Shipment", description: "", claimAmount: 0 });
            await fetchClaims();
        } catch (err) {
            setClaimError(err.response?.data?.message || "Dispute claim request failed.");
        }
    };

    useEffect(() => {
        fetchClaims();
        fetchShipmentDropdown();
    }, []);

    // Static options for Claim Type dropdown
    const claimTypeOptions = [
        { label: "Lost Shipment (In-Transit)", value: "Lost Shipment" },
        { label: "Damaged Shipment (Broken parcel)", value: "Damaged Shipment" },
        { label: "Delayed Shipment (SLA Breached)", value: "Delayed Shipment" },
    ];

    return (
        <div className="space-y-6 select-none animate-fade-in">
            {/* Title Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Logistics Insurance Claims</h1>
                <p className="text-sm text-[#687280]">File lost or damaged consignment claims, track audit disputes, and review administrative settlements.</p>
            </div>

            {/* File claim card */}
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#687280]/20 shadow-xl space-y-4">
                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider pb-3 border-b border-[#687280]/15 flex items-center gap-2">
                    <ShieldAlert size={16} /> File New Insurance Claim Dispute
                </h4>

                <form onSubmit={handleFileClaim} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Select Shipment ID</label>
                            <Select
                                options={shipmentOptions}
                                value={claimForm.shipmentId}
                                onChange={(val) => setClaimForm({ ...claimForm, shipmentId: val })}
                                placeholder="Search Shipment ID..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Claim Dispute Category</label>
                            <Select
                                options={claimTypeOptions}
                                value={claimForm.claimType}
                                onChange={(val) => setClaimForm({ ...claimForm, claimType: val })}
                                placeholder="-- Select Category --"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Description & Incident Details</label>
                        <textarea
                            placeholder="Please detail the loss, damage, or delay particulars..."
                            value={claimForm.description}
                            onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                            rows="3"
                            required
                            className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                        />
                    </div>

                    {claimError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl">
                            {claimError}
                        </div>
                    )}

                    {claimSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-xl">
                            {claimSuccess}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!claimForm.shipmentId}
                        className="w-full bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-extrabold py-3.5 rounded-xl text-xs transition disabled:opacity-50 shadow-md shadow-[#FF6A00]/20"
                    >
                        Submit Dispute Claim Request
                    </button>
                </form>
            </div>

            {/* Claims list */}
            <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-[#0A1F44]">Disputed Claims Register</h3>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                        <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-4 font-semibold">Date Filed</th>
                            <th className="py-3 px-4 font-semibold">Shipment ID</th>
                            <th className="py-3 px-4 text-center font-semibold">Dispute Class</th>
                            <th className="py-3 px-4 font-semibold">Description</th>
                            <th className="py-3 px-4 text-center font-semibold">Status</th>
                            <th className="py-3 px-4 font-semibold">Admin Remarks</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#687280]/10 text-[#0A1F44]">
                        {claims.map(c => (
                            <tr key={c._id} className="hover:bg-[#E5E7EB]/30 transition-colors">
                                <td className="py-3.5 px-4 text-[#687280]">{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="py-3.5 px-4 font-mono font-bold text-[#FF6A00]">
                                    {c.shipmentId?.shipmentId || c.shipmentId || "Unknown"}
                                </td>
                                <td className="py-3.5 px-4 text-center font-semibold text-[#0A1F44]">{c.claimType}</td>
                                <td className="py-3.5 px-4 text-[#687280] max-w-xs">{c.description}</td>
                                <td className="py-3.5 px-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        c.status === "Approved" || c.status === "Paid" ? "bg-green-100 text-green-700 border-green-200" :
                                            c.status === "Pending" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-red-100 text-red-700 border-red-200"
                                    }`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-[#687280] italic">{c.adminRemarks || "No admin notes yet."}</td>
                            </tr>
                        ))}
                        {claims.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-10 text-center text-[#687280] font-semibold">
                                    No insurance claims filed yet.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InsuranceClaims;