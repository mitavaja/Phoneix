import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Calculator, AlertTriangle, Plus } from "lucide-react";
import { Select } from "../../components/ui/Select";
import { ARAMEX_SUPPORTED_COUNTRIES } from "../../utils/countries";

const RateCalculator = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [calcForm, setCalcForm] = useState({
        pickupAddressId: "",
        customerId: "",
        isGuestRecipient: false,
        receiverName: "",
        receiverMobile: "",
        receiverAddress: "",
        receiverCity: "",
        receiverState: "",
        receiverCountry: "AE",
        receiverPincode: "",
        courier: "aramex",
        productGroup: "EXP",
        productType: "PPX",
        weight: "",
        length: "",
        width: "",
        height: "",
    });

    const [calcResult, setCalcResult] = useState(null);
    const [calcLoading, setCalcLoading] = useState(false);
    const [calcError, setCalcError] = useState("");

    const [isManualRecipient, setIsManualRecipient] = useState(false);
    const [saveManualRecipient, setSaveManualRecipient] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [whRes, custRes] = await Promise.all([
                    API.get("/warehouses/my-addresses"),
                    API.get("/recipient-customer")
                ]);

                setWarehouses(whRes.data || []);
                if (whRes.data?.length > 0) {
                    setCalcForm(prev => ({
                        ...prev,
                        pickupAddressId: (whRes.data.find(w => w.isDefault) || whRes.data[0])._id
                    }));
                }

                if (custRes.data?.data) {
                    setCustomers(custRes.data.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleCalculateRate = async (e) => {
        e.preventDefault();
        setCalcLoading(true);
        setCalcError("");
        setCalcResult(null);

        try {
            if (isManualRecipient) {
                if (!calcForm.receiverName || !calcForm.receiverMobile || !calcForm.receiverAddress || !calcForm.receiverCity || !calcForm.receiverState || !calcForm.receiverCountry || !calcForm.receiverPincode) {
                    setCalcError("Please complete all required recipient fields.");
                    setCalcLoading(false);
                    return;
                }

                if (saveManualRecipient) {
                    try {
                        const newCustRes = await API.post("/recipient-customer", {
                            name: calcForm.receiverName,
                            mobile: calcForm.receiverMobile,
                            addressLine1: calcForm.receiverAddress,
                            city: calcForm.receiverCity,
                            stateOrProvinceCode: calcForm.receiverState,
                            postCode: calcForm.receiverPincode,
                            countryCode: calcForm.receiverCountry,
                        });
                        if (newCustRes.data?.data) {
                            setCustomers(prev => [...prev, newCustRes.data.data]);
                        }
                    } catch (custErr) {
                        console.error("Could not background save customer", custErr);
                    }
                }
            }

            const payload = {
                courier: calcForm.courier,
                pickupAddressId: calcForm.pickupAddressId,
                customerId: !isManualRecipient ? calcForm.customerId : undefined,
                weight: parseFloat(calcForm.weight),
                length: calcForm.length ? parseFloat(calcForm.length) : 0,
                width: calcForm.width ? parseFloat(calcForm.width) : 0,
                height: calcForm.height ? parseFloat(calcForm.height) : 0,
                productGroup: calcForm.productGroup,
                productType: calcForm.courier === "aramex" ? calcForm.productType : undefined,
                receiverName: calcForm.receiverName,
                receiverMobile: calcForm.receiverMobile,
                receiverAddressLine1: calcForm.receiverAddress,
                receiverCity: calcForm.receiverCity,
                receiverState: calcForm.receiverState,
                receiverCountry: calcForm.receiverCountry,
                receiverPincode: calcForm.receiverPincode,
            };

            const res = await API.post("/rates/calculate", payload);
            setCalcResult(res.data);

            if (calcForm.courier === "phreights" && res.data.services?.length > 0) {
                setCalcForm(prev => ({ ...prev, productType: res.data.services[0].serviceName }));
            }
        } catch (err) {
            setCalcError(err.response?.data?.message || err.message || "Rate estimation failed.");
        } finally {
            setCalcLoading(false);
        }
    };

    // Mapping Options for Headless UI Select component
    const warehouseOptions = warehouses.map(w => ({
        label: `${w.addressName} (${w.city}, ${w.country})`,
        value: w._id
    }));

    const customerOptions = [
        ...(calcForm.isGuestRecipient ? [{
            label: `Guest: ${calcForm.receiverName} (${calcForm.receiverCity})`,
            value: "guest"
        }] : []),
        ...customers.map(c => ({
            label: `${c.name} (${c.city}, ${c.countryCode})`,
            value: c._id
        }))
    ];

    const productTypeOptions = [
        { label: "Priority Parcel Express (PPX)", value: "PPX" },
        { label: "Economy Parcel Express (EPX)", value: "EPX" },
        { label: "Priority Document Express (PDX)", value: "PDX" },
    ];

    return (
        <div className="space-y-6 select-none animate-fade-in">
            {/* Title Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Shipping Rate Calculator</h1>
                <p className="text-sm text-[#687280]">Calculate real-time shipping costs, estimated volumetric weights, and tariff taxes.</p>
            </div>

            <form onSubmit={handleCalculateRate} className="glass-card p-6 md:p-8 rounded-2xl border border-[#687280]/20 shadow-xl space-y-6">

                {/* Courier Selection */}
                <div className="bg-[#E5E7EB]/30 p-5 rounded-2xl border border-[#687280]/15 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Select Courier Partner</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition shadow-sm ${calcForm.courier === "aramex" ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-[#687280]/20 bg-white hover:border-[#FF6A00]/40"}`}>
                            <input type="radio" value="aramex" checked={calcForm.courier === "aramex"} onChange={() => { setCalcForm({ ...calcForm, courier: "aramex", productType: "PPX" }); setCalcResult(null); }} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${calcForm.courier === "aramex" ? "border-[#FF6A00]" : "border-[#687280]"}`}>
                                {calcForm.courier === "aramex" && <div className="w-2 h-2 bg-[#FF6A00] rounded-full"></div>}
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

                {/* Warehouse Origin & Recipient Details Side-by-Side Container */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Warehouse Origin */}
                    <div className="bg-[#E5E7EB]/30 p-5 rounded-2xl border border-[#687280]/15 space-y-4 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Origin Warehouse</h4>
                        </div>
                        <div>
                            <Select
                                options={warehouseOptions}
                                value={calcForm.pickupAddressId}
                                onChange={(val) => {
                                    setCalcForm({
                                        ...calcForm,
                                        pickupAddressId: val,
                                    });
                                }}
                                disabled={true}
                                placeholder="-- Choose Warehouse --"
                            />
                        </div>
                    </div>

                    {/* Recipient Details */}
                    <div className="bg-[#E5E7EB]/30 p-5 rounded-2xl border border-[#687280]/15 space-y-4 flex flex-col h-full">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Destination Customer</h4>
                            <button
                                type="button"
                                onClick={() => setIsManualRecipient(!isManualRecipient)}
                                className="text-[10px] text-[#FF6A00] hover:text-[#0A1F44] font-bold transition flex items-center gap-1 bg-[#FF6A00]/10 px-2.5 py-1 rounded-lg"
                            >
                                {isManualRecipient ? "Use Saved Directory" : <><Plus size={12} /> Add New Recipient Inline</>}
                            </button>
                        </div>

                        {!isManualRecipient ? (
                            <div>
                                <Select
                                    options={customerOptions}
                                    value={calcForm.isGuestRecipient ? "guest" : calcForm.customerId}
                                    onChange={(val) => {
                                        if (val !== "guest") {
                                            setCalcForm({ ...calcForm, customerId: val, isGuestRecipient: false });
                                        }
                                    }}
                                    placeholder="-- Choose Recipient --"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4 border-t border-[#687280]/15 pt-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <input type="text" placeholder="Contact Name *" value={calcForm.receiverName} onChange={(e) => setCalcForm({ ...calcForm, receiverName: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Mobile *" value={calcForm.receiverMobile} onChange={(e) => setCalcForm({ ...calcForm, receiverMobile: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                    </div>
                                    <div>
                                        <Select
                                            placeholder="Country (AE) *"
                                            options={ARAMEX_SUPPORTED_COUNTRIES}
                                            value={calcForm.receiverCountry}
                                            onChange={(val) => setCalcForm({ ...calcForm, receiverCountry: val.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <input type="text" placeholder="Full Address *" value={calcForm.receiverAddress} onChange={(e) => setCalcForm({ ...calcForm, receiverAddress: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <input type="text" placeholder="City *" value={calcForm.receiverCity} onChange={(e) => setCalcForm({ ...calcForm, receiverCity: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="State / Province *" value={calcForm.receiverState} onChange={(e) => setCalcForm({ ...calcForm, receiverState: e.target.value.toUpperCase() })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs uppercase shadow-sm" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Pincode *" value={calcForm.receiverPincode} onChange={(e) => setCalcForm({ ...calcForm, receiverPincode: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="saveCalcRecipient" checked={saveManualRecipient} onChange={(e) => setSaveManualRecipient(e.target.checked)} className="accent-[#FF6A00] w-4 h-4 cursor-pointer" />
                                    <label htmlFor="saveCalcRecipient" className="text-xs text-[#0A1F44] font-semibold cursor-pointer select-none">
                                        Save this recipient to Customer Directory for future use
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Package Specs */}
                <div className="bg-[#E5E7EB]/30 p-5 rounded-2xl border border-[#687280]/15 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Package Specifications</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Dead Weight (kg)</label>
                            <input type="number" step="0.01" value={calcForm.weight} onChange={(e) => setCalcForm({ ...calcForm, weight: e.target.value })} required className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                        </div>
                        {calcForm.courier === "aramex" && (
                            <div>
                                <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Product Type</label>
                                <Select
                                    options={productTypeOptions}
                                    value={calcForm.productType}
                                    onChange={(val) => setCalcForm({ ...calcForm, productType: val })}
                                    placeholder="-- Select Product Type --"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Dimensions (L x W x H cm)</label>
                        <div className="grid grid-cols-3 gap-3">
                            <input type="number" placeholder="Length" value={calcForm.length} onChange={(e) => setCalcForm({ ...calcForm, length: e.target.value })} className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] text-center outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                            <input type="number" placeholder="Width" value={calcForm.width} onChange={(e) => setCalcForm({ ...calcForm, width: e.target.value })} className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] text-center outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                            <input type="number" placeholder="Height" value={calcForm.height} onChange={(e) => setCalcForm({ ...calcForm, height: e.target.value })} className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] text-center outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                        </div>
                    </div>
                </div>

                {calcError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl flex items-center gap-2">
                        <AlertTriangle size={15} />
                        <span>{calcError}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={calcLoading || !calcForm.weight || (!calcForm.customerId && !isManualRecipient) || !calcForm.pickupAddressId} 
                    className="w-full bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50 shadow-md shadow-[#FF6A00]/20"
                >
                    {calcLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <><Calculator size={16} /> Calculate Shipping Cost</>}
                </button>

                {calcResult && (
                    <>
                        {/* Multi-Service Cards for Phreight */}
                        {calcForm.courier === "phreights" && calcResult.services && calcResult.services.length > 0 ? (
                            <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6A00]/40 shadow-xl space-y-4">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Available Phreight Service Plans</h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {calcResult.services.map((svc, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-[#687280]/20 bg-[#E5E7EB]/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-xs text-[#0A1F44]">{svc.title}</span>
                                            </div>
                                            <p className="text-[10px] text-[#687280] mb-2">{svc.transitTime} {svc.notes ? `| ${svc.notes}` : ''}</p>
                                            <div className="flex justify-between items-center mt-3 border-t border-[#687280]/15 pt-2">
                                                <span className="text-[10px] text-[#687280]">Estimated Cost</span>
                                                <span className="font-black text-[#FF6A00] text-sm">₹{svc.invoiceTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Aramex Single Plan Block */
                            <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6A00]/40 shadow-xl space-y-4">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Dynamic Shipping Quotation Breakdown</h4>
                                <div className="grid md:grid-cols-3 gap-4 text-xs">
                                    <div><span className="text-[#687280] block">Courier Partner:</span><span className="font-bold text-[#0A1F44] capitalize">{calcResult.courierName}</span></div>
                                    <div><span className="text-[#687280] block">Chargeable Weight:</span><span className="font-bold text-[#FF6A00]">{calcResult.chargeableWeight}</span></div>
                                    <div><span className="text-[#687280] block">Volumetric Weight:</span><span className="text-[#0A1F44] font-semibold">{calcResult.volumetricWeight}</span></div>
                                </div>
                                <div className="border-t border-[#687280]/15 pt-3 flex flex-wrap justify-between items-center text-sm gap-2">
                                    <div className="space-x-4">
                                        <span className="text-[#687280]">Shipping Charge: <strong className="text-[#0A1F44]">₹{calcResult.shippingCharge}</strong></span>
                                        <span className="text-[#687280]">GST (18%): <strong className="text-[#0A1F44]">₹{calcResult.gstAmount}</strong></span>
                                    </div>
                                    <span className="text-lg font-black text-[#FF6A00]">Total Payable: ₹{calcResult.invoiceTotal}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </form>
        </div>
    );
};

export default RateCalculator;