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
            setClaimForm({ shipmentId: "", claimType: "Lost Shipment", description: "", claimAmount: "" });
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
        <div className="space-y-8 animate-fade-in">

            <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-[#687280]/20 pb-4">
                    <ShieldAlert size={22} className="text-[#FF6A00]" />
                    Logistics Insurance Claims
                </h3>

                <form onSubmit={handleFileClaim} className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00]">File New Insurance claim dispute</h4>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Select Shipment ID</label>
                            <Select
                                options={shipmentOptions}
                                value={claimForm.shipmentId}
                                onChange={(val) => setClaimForm({ ...claimForm, shipmentId: val })}
                                placeholder="Search Shipment ID..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Claim Dispute Category</label>
                            <Select
                                options={claimTypeOptions}
                                value={claimForm.claimType}
                                onChange={(val) => setClaimForm({ ...claimForm, claimType: val })}
                                placeholder="-- Select Category --"
                            />
                        </div>
                        {/*<div>*/}
                        {/*    <label className="text-[10px] text-gray-400 block mb-1">Requested Payout Amount (₹)</label>*/}
                        {/*    <input*/}
                        {/*        type="number"*/}
                        {/*        placeholder="5000"*/}
                        {/*        value={claimForm.claimAmount}*/}
                        {/*        onChange={(e) => setClaimForm({ ...claimForm, claimAmount: e.target.value })}*/}
                        {/*        required*/}
                        {/*        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"*/}
                        {/*    />*/}
                        {/*</div>*/}
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Description & Incident Details</label>
                        <textarea
                            placeholder="Please detail the loss or delay particulars..."
                            value={claimForm.description}
                            onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                            rows="3"
                            required
                            className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                        />
                    </div>

                    {claimError && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl">
                            {claimError}
                        </div>
                    )}

                    {claimSuccess && (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-3.5 rounded-xl">
                            {claimSuccess}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!claimForm.shipmentId}
                        className="w-full bg-[#FF6A00] text-[#0A1F44] font-extrabold py-3.5 rounded-xl text-xs hover:brightness-110 active:scale-95 transition disabled:opacity-50"
                    >
                        Submit Dispute Claim Request
                    </button>

                </form>
            </div>

            {/* Claims list */}
            <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Disputed claims register</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                        <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-4">Date Filed</th>
                            <th className="py-2.5 px-4">Shipment</th>
                            <th className="py-2.5 px-4 text-center">Dispute Class</th>
                            {/*<th className="py-2.5 px-4 text-right">Requested Payout</th>*/}
                            <th className="py-2.5 px-4">Description</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                            <th className="py-2.5 px-4">Admin Remarks</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#687280]/10">
                        {claims.map(c => (
                            <tr key={c._id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 px-4 font-mono font-bold text-[#FF6A00]">
                                    {/* Accounts for backend populating the shipment reference */}
                                    {c.shipmentId?.shipmentId || c.shipmentId || "Unknown"}
                                </td>
                                <td className="py-3 px-4 text-center font-semibold">{c.claimType}</td>
                                {/*<td className="py-3 px-4 text-right font-bold text-white">₹{c.claimAmount.toFixed(2)}</td>*/}
                                <td className="py-3 px-4 text-gray-400">{c.description}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        c.status === "Approved" || c.status === "Paid" ? "bg-green-500/10 text-green-500" :
                                            c.status === "Pending" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                                    }`}>
                                      {c.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-gray-400 italic">{c.adminRemarks || "No admin notes yet."}</td>
                            </tr>
                        ))}
                        {claims.length === 0 && (
                            <tr>
                                <td colSpan="7" className="py-6 text-center text-gray-500">No insurance claims filed yet.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default InsuranceClaims;