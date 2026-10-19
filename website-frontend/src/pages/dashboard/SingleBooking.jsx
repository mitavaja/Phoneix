import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useOutletContext, useNavigate } from "react-router-dom";
import { PlusCircle, Plus, CheckCircle, AlertTriangle, Check, XCircle } from "lucide-react";
import { Select } from "../../components/ui/Select";
import { ARAMEX_SUPPORTED_COUNTRIES, ARAMEX_SUPPORTED_CURRENCIES } from "../../utils/countries";

const SingleBooking = () => {
    const { user, fetchWalletData } = useOutletContext();
    const navigate = useNavigate();

    const [warehouses, setWarehouses] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Single Shipment Form
    const [singleForm, setSingleForm] = useState({
        customer: "",
        customerId: "",
        isGuestRecipient: false,
        receiverName: "",
        receiverMobile: "",
        receiverAddress: "",
        receiverCity: "",
        receiverState: "",
        receiverCountry: "AE",
        receiverPincode: "",
        pickupAddressId: "",
        courier: "aramex",
        productGroup: "EXP",
        productType: "PPX",
        weight: "",
        length: "",
        width: "",
        height: "",
        shipmentType: "Parcel",
        productDescription: "",
        shipmentValue: "",
        goodsOriginCountry: "IN",
        customsValue: "",
        customsCurrency: "USD",
    });

    const [estimateResult, setEstimateResult] = useState(null);
    const [estimating, setEstimating] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState("");
    const [isManualRecipient, setIsManualRecipient] = useState(false);
    const [saveManualRecipient, setSaveManualRecipient] = useState(false);

    // Recipient Customer Form
    const [showSingleCustomerModal, setShowSingleCustomerModal] = useState(false);
    const initialCustomerForm = {
        _id: null,
        name: "",
        mobile: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        city: "",
        stateOrProvinceCode: "",
        postCode: "",
        countryCode: ""
    };
    const [singleCustomerForm, setSingleCustomerForm] = useState(initialCustomerForm);
    const [saveCustomerToDirectory, setSaveCustomerToDirectory] = useState(true);

    const handleSaveSingleCustomer = () => {
        if (!singleCustomerForm.name || !singleCustomerForm.mobile || !singleCustomerForm.addressLine1 || !singleCustomerForm.city || !singleCustomerForm.stateOrProvinceCode || !singleCustomerForm.countryCode) {
            alert("Please complete mandatory recipient fields: Name, Mobile, Address, City, State, Country.");
            return;
        }

        setSingleForm(prev => ({
            ...prev,
            isGuestRecipient: true,
            receiverName: singleCustomerForm.name,
            receiverMobile: singleCustomerForm.mobile,
            receiverAddress: `${singleCustomerForm.addressLine1} ${singleCustomerForm.addressLine2 || ""}`.trim(),
            receiverCity: singleCustomerForm.city,
            receiverState: singleCustomerForm.stateOrProvinceCode,
            receiverCountry: singleCustomerForm.countryCode,
            receiverPincode: singleCustomerForm.postCode,
            customerId: ""
        }));

        if (saveCustomerToDirectory) {
            API.post("/recipient-customer", singleCustomerForm)
                .then(res => {
                    if (res.data?.data) {
                        setCustomers(prev => [...prev, res.data.data]);
                    }
                })
                .catch(err => {
                    console.error("Failed to background save recipient customer", err);
                });
        }

        setShowSingleCustomerModal(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [whRes, custRes] = await Promise.all([
                    API.get("/warehouses/my-addresses"),
                    API.get("/recipient-customer")
                ]);

                setWarehouses(whRes.data || []);
                if (whRes.data?.length > 0) {
                    const defaultWh = whRes.data.find(w => w.isDefault) || whRes.data[0];
                    setSingleForm(prev => ({
                        ...prev,
                        pickupAddressId: defaultWh._id,
                        goodsOriginCountry: defaultWh.country || "IN"
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

    // Estimate Cost for Single Booking
    const handleEstimateSingle = async () => {
        setEstimating(true);
        setBookingError("");
        setEstimateResult(null);

        try {
            if (isManualRecipient) {
                if (!singleForm.receiverName || !singleForm.receiverMobile || !singleForm.receiverAddress || !singleForm.receiverCity || !singleForm.receiverState || !singleForm.receiverCountry || !singleForm.receiverPincode) {
                    setBookingError("Please complete all required recipient fields.");
                    setEstimating(false);
                    return;
                }

                if (saveManualRecipient) {
                    try {
                        const newCustRes = await API.post("/recipient-customer", {
                            name: singleForm.receiverName,
                            mobile: singleForm.receiverMobile,
                            addressLine1: singleForm.receiverAddress,
                            city: singleForm.receiverCity,
                            stateOrProvinceCode: singleForm.receiverState,
                            postCode: singleForm.receiverPincode,
                            countryCode: singleForm.receiverCountry,
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
                courier: singleForm.courier,
                pickupAddressId: singleForm.pickupAddressId,
                customerId: !isManualRecipient && !singleForm.isGuestRecipient ? singleForm.customerId : undefined,
                weight: parseFloat(singleForm.weight),
                length: singleForm.length ? parseFloat(singleForm.length) : 0,
                width: singleForm.width ? parseFloat(singleForm.width) : 0,
                height: singleForm.height ? parseFloat(singleForm.height) : 0,
                productGroup: singleForm.productGroup,
                productType: singleForm.courier === "aramex" ? singleForm.productType : undefined,
                receiverName: singleForm.receiverName,
                receiverMobile: singleForm.receiverMobile,
                receiverAddressLine1: singleForm.receiverAddress,
                receiverCity: singleForm.receiverCity,
                receiverState: singleForm.receiverState,
                receiverCountry: singleForm.receiverCountry,
                receiverPincode: singleForm.receiverPincode,
            };

            const res = await API.post("/rates/calculate", payload);
            setEstimateResult(res.data);

            if (singleForm.courier === "phreight" && res.data.services?.length > 0) {
                setSingleForm(prev => ({ ...prev, productType: res.data.services[0].serviceName }));
            }
        } catch (err) {
            setBookingError(err.response?.data?.message || err.message || "Failed to estimate cost.");
        } finally {
            setEstimating(false);
        }
    };

    // Commit Single Booking
    const handleBookSingle = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        setBookingError("");
        setBookingSuccess("");

        try {
            if (isManualRecipient) {
                if (!singleForm.receiverName || !singleForm.receiverMobile || !singleForm.receiverAddress || !singleForm.receiverCity || !singleForm.receiverState || !singleForm.receiverCountry || !singleForm.receiverPincode) {
                    setBookingError("Please complete all required recipient fields.");
                    setBookingLoading(false);
                    return;
                }

                if (saveManualRecipient) {
                    try {
                        const newCustRes = await API.post("/recipient-customer", {
                            name: singleForm.receiverName,
                            mobile: singleForm.receiverMobile,
                            addressLine1: singleForm.receiverAddress,
                            city: singleForm.receiverCity,
                            stateOrProvinceCode: singleForm.receiverState,
                            postCode: singleForm.receiverPincode,
                            countryCode: singleForm.receiverCountry,
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
                ...singleForm,
                weight: parseFloat(singleForm.weight),
                length: singleForm.length ? parseFloat(singleForm.length) : 0,
                width: singleForm.width ? parseFloat(singleForm.width) : 0,
                height: singleForm.height ? parseFloat(singleForm.height) : 0,
                numberOfPieces: parseInt(singleForm.numberOfPieces, 10) || 1,
                customsValue: parseFloat(singleForm.customsValue),
                customsCurrency: singleForm.customsCurrency,
                isGuestRecipient: isManualRecipient ? true : singleForm.isGuestRecipient,
                receiverName: isManualRecipient ? singleForm.receiverName : singleForm.receiverName,
                receiverMobile: isManualRecipient ? singleForm.receiverMobile : singleForm.receiverMobile,
                receiverAddressLine1: isManualRecipient ? singleForm.receiverAddress : singleForm.receiverAddress,
                receiverCity: isManualRecipient ? singleForm.receiverCity : singleForm.receiverCity,
                receiverState: isManualRecipient ? singleForm.receiverState : singleForm.receiverState,
                receiverCountry: isManualRecipient ? singleForm.receiverCountry : singleForm.receiverCountry,
                receiverPincode: isManualRecipient ? singleForm.receiverPincode : singleForm.receiverPincode,
                customerId: !isManualRecipient && !singleForm.isGuestRecipient ? singleForm.customerId : undefined
            };

            const res = await API.post("/shipments/book", payload);
            if (res.data?.isDraft) {
                setBookingSuccess(`Shipment saved as Draft due to insufficient wallet balance (ID: ${res.data.shipment?.shipmentId}). You can reprocess it anytime once you recharge your wallet.`);
            } else {
                setBookingSuccess(`Shipment successfully booked! Tracking ID: ${res.data.shipment?.shipmentId}`);
            }
            if (fetchWalletData) await fetchWalletData();

            setTimeout(() => {
                navigate("/dashboard/shipments");
            }, 1800);

        } catch (err) {
            setBookingError(err.response?.data?.message || "Shipment booking failed.");
        } finally {
            setBookingLoading(false);
        }
    };

    // Mapping Options for Headless UI Select component
    const warehouseOptions = warehouses.map(w => ({
        label: `${w.addressName} (${w.city}, ${w.country})`,
        value: w._id
    }));

    const customerOptions = [
        ...(singleForm.isGuestRecipient ? [{
            label: `Guest: ${singleForm.receiverName} (${singleForm.receiverCity})`,
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
                <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Book Single Shipping Voucher</h1>
                <p className="text-sm text-[#687280]">Dispatch individual consignments, generate airway bills, and debit your store wallet ledger.</p>
            </div>

            <form onSubmit={handleBookSingle} className="glass-card p-6 md:p-8 rounded-2xl border border-[#687280]/20 shadow-xl space-y-6">

                {/* Courier Selection */}
                <div className="bg-[#E5E7EB]/30 p-5 rounded-2xl border border-[#687280]/15 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Select Courier Partner</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition shadow-sm ${singleForm.courier === "aramex" ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-[#687280]/20 bg-white hover:border-[#FF6A00]/40"}`}>
                            <input
                                type="radio"
                                name="courier"
                                value="aramex"
                                checked={singleForm.courier === "aramex"}
                                onChange={() => {
                                    setSingleForm({ ...singleForm, courier: "aramex", productType: "PPX" });
                                    setEstimateResult(null);
                                }}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${singleForm.courier === "aramex" ? "border-[#FF6A00]" : "border-[#687280]"}`}>
                                {singleForm.courier === "aramex" && <div className="w-2 h-2 bg-[#FF6A00] rounded-full"></div>}
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
                            <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">1. Select Warehouse Pickup Origin</h4>
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Saved Warehouses</label>
                            <Select
                                options={warehouseOptions}
                                value={singleForm.pickupAddressId}
                                onChange={(val) => {
                                    const selectedWarehouse = warehouses.find(w => w._id === val);
                                    setSingleForm({
                                        ...singleForm,
                                        pickupAddressId: val,
                                        goodsOriginCountry: selectedWarehouse ? selectedWarehouse.country : singleForm.goodsOriginCountry
                                    });
                                }}
                                placeholder="-- Choose Warehouse --"
                                disabled={true}
                            />
                        </div>
                    </div>

                    {/* Recipient Details */}
                    <div className="bg-[#E5E7EB]/30 p-5 rounded-2xl border border-[#687280]/15 space-y-4 flex flex-col h-full">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">2. Recipient Customer Details</h4>
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
                                <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Saved Customer Directory</label>
                                <Select
                                    options={customerOptions}
                                    value={singleForm.isGuestRecipient ? "guest" : singleForm.customerId}
                                    onChange={(val) => {
                                        if (val !== "guest") {
                                            setSingleForm({ ...singleForm, customerId: val, isGuestRecipient: false });
                                        }
                                    }}
                                    placeholder="-- Choose Recipient --"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4 border-t border-[#687280]/15 pt-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <input type="text" placeholder="Contact Name *" value={singleForm.receiverName} onChange={(e) => setSingleForm({ ...singleForm, receiverName: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Mobile *" value={singleForm.receiverMobile} onChange={(e) => setSingleForm({ ...singleForm, receiverMobile: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                    </div>
                                    <div>
                                        <Select
                                            placeholder="Country Code (AE) *"
                                            options={ARAMEX_SUPPORTED_COUNTRIES}
                                            value={singleForm.receiverCountry}
                                            onChange={(value) => setSingleForm({
                                                ...singleForm,
                                                receiverCountry: value.toUpperCase()
                                            })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <input type="text" placeholder="Full Address *" value={singleForm.receiverAddress} onChange={(e) => setSingleForm({ ...singleForm, receiverAddress: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <input type="text" placeholder="City *" value={singleForm.receiverCity} onChange={(e) => setSingleForm({ ...singleForm, receiverCity: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="State / Province *" value={singleForm.receiverState} onChange={(e) => setSingleForm({ ...singleForm, receiverState: e.target.value.toUpperCase() })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs uppercase shadow-sm" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Pincode *" value={singleForm.receiverPincode} onChange={(e) => setSingleForm({ ...singleForm, receiverPincode: e.target.value })} className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" required />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="saveRecipient" checked={saveManualRecipient} onChange={(e) => setSaveManualRecipient(e.target.checked)} className="accent-[#FF6A00] w-4 h-4 cursor-pointer" />
                                    <label htmlFor="saveRecipient" className="text-xs text-[#0A1F44] font-semibold cursor-pointer select-none">
                                        Save this recipient to Customer Directory for future use
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Add Recipient Modal */}
                {showSingleCustomerModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#687280]/20 shadow-2xl overflow-hidden text-[#0A1F44]">
                            <div className="px-6 py-4 border-b border-[#687280]/15 flex justify-between items-center">
                                <h3 className="text-[#0A1F44] font-bold">Recipient Customer Details</h3>
                                <button type="button" onClick={() => setShowSingleCustomerModal(false)} className="text-[#687280] hover:text-[#0A1F44]">
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Contact Name <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Jane Smith" value={singleCustomerForm.name} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, name: e.target.value })} required className="w-full p-2.5 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Mobile Number <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="+91 98765 43210" value={singleCustomerForm.mobile} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, mobile: e.target.value })} required className="w-full p-2.5 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Country (2-Letter) <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="AE" maxLength={2} value={singleCustomerForm.countryCode} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, countryCode: e.target.value.toUpperCase() })} required className="w-full p-2.5 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs uppercase" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Address Line 1 <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="Plot No 22, MIDC Industrial Area" value={singleCustomerForm.addressLine1} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, addressLine1: e.target.value })} required className="w-full p-2.5 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs" />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">City <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Mumbai" value={singleCustomerForm.city} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, city: e.target.value })} required className="w-full p-2.5 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">State / Province <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="MH" value={singleCustomerForm.stateOrProvinceCode} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, stateOrProvinceCode: e.target.value.toUpperCase() })} required className="w-full p-2.5 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs uppercase" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Pincode <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="400001" value={singleCustomerForm.postCode} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, postCode: e.target.value })} required className="w-full p-2.5 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2 p-3 bg-[#E5E7EB]/40 border border-[#687280]/15 rounded-xl cursor-pointer" onClick={() => setSaveCustomerToDirectory(!saveCustomerToDirectory)}>
                                    <input type="checkbox" checked={saveCustomerToDirectory} onChange={(e) => setSaveCustomerToDirectory(e.target.checked)} className="accent-[#FF6A00] w-4 h-4 cursor-pointer" />
                                    <label className="text-xs font-bold text-[#0A1F44] cursor-pointer">Save this recipient to my Customer Directory for future use.</label>
                                </div>

                                <div className="flex gap-4 pt-6 mt-4 border-t border-[#687280]/15">
                                    <button type="button" onClick={handleSaveSingleCustomer} className="flex-1 bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-bold py-3 rounded-xl text-xs transition shadow-md shadow-[#FF6A00]/20">
                                        Confirm Recipient Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Package Specs */}
                <div className="bg-[#E5E7EB]/30 p-5 rounded-2xl border border-[#687280]/15 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">3. Package Specifications & Value</h4>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Dead Weight (kg)</label>
                            <input type="number" step="0.01" placeholder="1.5" value={singleForm.weight} onChange={(e) => setSingleForm({ ...singleForm, weight: e.target.value })} required className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Total Pieces</label>
                            <input type="number" min="1" value={singleForm.numberOfPieces || 1} onChange={(e) => setSingleForm({ ...singleForm, numberOfPieces: e.target.value })} required className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                        </div>

                        {/* Aramex Product Type Selector */}
                        {singleForm.courier === "aramex" && (
                            <div>
                                <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">International Product Type</label>
                                <Select
                                    options={productTypeOptions}
                                    value={singleForm.productType}
                                    onChange={(val) => setSingleForm({ ...singleForm, productType: val })}
                                    placeholder="-- Select Product Type --"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Product Description</label>
                            <input type="text" placeholder="Apparel, Electronics..." value={singleForm.productDescription} onChange={(e) => setSingleForm({ ...singleForm, productDescription: e.target.value })} required className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Goods Origin Country</label>
                            <Select
                                options={ARAMEX_SUPPORTED_COUNTRIES}
                                value={singleForm.goodsOriginCountry}
                                onChange={(val) => setSingleForm({ ...singleForm, goodsOriginCountry: val })}
                                placeholder="-- Search country --"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Dimensions (L x W x H cm)</label>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="number"
                                placeholder="Length"
                                value={singleForm.length}
                                onChange={(e) => setSingleForm({
                                    ...singleForm,
                                    length: e.target.value
                                })}
                                className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] text-center outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                            <input type="number" placeholder="Width" value={singleForm.width} onChange={(e) => setSingleForm({ ...singleForm, width: e.target.value })} className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] text-center outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                            <input type="number" placeholder="Height" value={singleForm.height} onChange={(e) => setSingleForm({ ...singleForm, height: e.target.value })} className="p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] text-center outline-none focus:border-[#FF6A00] text-xs shadow-sm" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 border-t border-[#687280]/15 pt-4 mt-2">
                        <div>
                            <label className="text-[10px] text-[#FF6A00] font-bold block mb-1 uppercase tracking-wider">Customs Declared Value <span className="text-red-500">*</span></label>
                            <input type="number" step="0.01" placeholder="50.00" value={singleForm.customsValue} onChange={(e) => setSingleForm({ ...singleForm, customsValue: e.target.value })} required className="w-full p-3 rounded-xl bg-white border border-[#FF6A00]/50 text-[#0A1F44] outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs shadow-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#FF6A00] font-bold block mb-1 uppercase tracking-wider">Currency Code <span className="text-red-500">*</span></label>
                            <Select
                                options={ARAMEX_SUPPORTED_CURRENCIES}
                                value={singleForm.customsCurrency}
                                onChange={(val) => setSingleForm({ ...singleForm, customsCurrency: val })}
                                placeholder="-- Select Currency --"
                            />
                        </div>
                    </div>
                </div>

                {/* Estimate Result Block */}
                {estimateResult && (
                    <>
                        {/* Phreight Multi-Service Cards */}
                        {singleForm.courier === "phreight" && estimateResult.services && estimateResult.services.length > 0 ? (
                            <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6A00]/40 shadow-xl space-y-4">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Select Phreight Service Plan</h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {estimateResult.services.map((svc, idx) => {
                                        const isSelected = singleForm.productType === svc.serviceName;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setSingleForm({ ...singleForm, productType: svc.serviceName })}
                                                className={`p-4 rounded-xl cursor-pointer border transition-all ${isSelected ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-[#687280]/20 bg-[#E5E7EB]/30 hover:border-[#FF6A00]/40"}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`font-bold text-xs ${isSelected ? "text-[#0A1F44]" : "text-[#687280]"}`}>{svc.title}</span>
                                                    {isSelected && <CheckCircle size={14} className="text-[#FF6A00]" />}
                                                </div>
                                                <p className="text-[10px] text-[#687280] mb-2">{svc.transitTime} {svc.notes ? `| ${svc.notes}` : ''}</p>
                                                <div className="flex justify-between items-center mt-3 border-t border-[#687280]/15 pt-2">
                                                    <span className="text-[10px] text-[#687280]">Total Payable</span>
                                                    <span className="font-black text-[#FF6A00] text-sm">₹{svc.invoiceTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Aramex Single Plan Block */
                            <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6A00]/40 shadow-xl space-y-4">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Dynamic Shipping Quotation Breakdown</h4>
                                <div className="grid md:grid-cols-3 gap-4 text-xs">
                                    <div><span className="text-[#687280] block">Courier Partner:</span><span className="font-bold text-[#0A1F44] capitalize">{estimateResult.courierName}</span></div>
                                    <div><span className="text-[#687280] block">Chargeable Weight:</span><span className="font-bold text-[#FF6A00]">{estimateResult.chargeableWeight}</span></div>
                                    <div><span className="text-[#687280] block">Volumetric Weight:</span><span className="text-[#0A1F44] font-semibold">{estimateResult.volumetricWeight}</span></div>
                                </div>
                                <div className="border-t border-[#687280]/15 pt-3 flex flex-wrap justify-between items-center text-sm gap-2">
                                    <div className="space-x-4">
                                        <span className="text-[#687280]">Shipping Charge: <strong className="text-[#0A1F44]">₹{estimateResult.shippingCharge}</strong></span>
                                        <span className="text-[#687280]">GST (18%): <strong className="text-[#0A1F44]">₹{estimateResult.gstAmount}</strong></span>
                                    </div>
                                    <span className="text-lg font-black text-[#FF6A00]">Total Payable: ₹{estimateResult.invoiceTotal}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {bookingError && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl flex items-center gap-2"><AlertTriangle size={15} className="shrink-0" /><span>{bookingError}</span></div>}
                {bookingSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-xl flex items-center gap-2"><Check size={15} className="shrink-0" /><span>{bookingSuccess}</span></div>}

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleEstimateSingle}
                        disabled={estimating || !singleForm.weight || (!singleForm.customerId && !singleForm.isGuestRecipient) || !singleForm.pickupAddressId}
                        className="flex-1 bg-[#E5E7EB]/50 hover:bg-[#E5E7EB] border border-[#687280]/20 text-[#0A1F44] font-bold py-3.5 rounded-xl text-xs transition disabled:opacity-50 shadow-sm"
                    >
                        {estimating ? "Calculating..." : "Calculate Cost Quote"}
                    </button>

                    <button
                        type="submit"
                        disabled={bookingLoading || user?.status !== "Active" || (singleForm.courier === "phreight" && !singleForm.productType)}
                        className="flex-1 bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-extrabold py-3.5 rounded-xl text-xs active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-[#FF6A00]/20"
                    >
                        {bookingLoading ?
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> :
                            <><Check size={16} /> Confirm Booking</>
                        }
                    </button>
                </div>

            </form>
        </div>
    );
};

export default SingleBooking;