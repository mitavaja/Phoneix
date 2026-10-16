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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [whRes, custRes] = await Promise.all([
                    API.get("/warehouses/my-addresses"),
                    API.get("/recipient-customer")
                ]);
                setWarehouses(whRes.data || []);
                if (whRes.data && whRes.data.length > 0) {
                    const defaultWh = whRes.data.find(w => w.isDefault) || whRes.data[0];
                    setSingleForm(prev => ({ ...prev, pickupAddressId: defaultWh._id }));
                }
                if (custRes.data && custRes.data.data) {
                    setCustomers(custRes.data.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const processManualRecipient = async () => {
        if (!isManualRecipient) return singleForm.customerId;

        if (!singleForm.receiverName || !singleForm.receiverMobile || !singleForm.receiverAddress || !singleForm.receiverCity || !singleForm.receiverState || !singleForm.receiverCountry || !singleForm.receiverPincode) {
            throw new Error("Please fill out all mandatory manual recipient fields.");
        }

        if (saveManualRecipient) {
            const res = await API.post("/recipient-customer", {
                name: singleForm.receiverName,
                mobile: singleForm.receiverMobile,
                countryCode: singleForm.receiverCountry,
                addressLine1: singleForm.receiverAddress,
                city: singleForm.receiverCity,
                stateOrProvinceCode: singleForm.receiverState,
                postCode: singleForm.receiverPincode
            });
            const newCustomerId = res.data?.customer?._id || res.data?._id || res.data?.data?._id;

            const custRes = await API.get("/recipient-customer");
            if (custRes.data && custRes.data.data) {
                setCustomers(custRes.data.data);
            }
            return newCustomerId;
        }
        return null;
    };

    const handleEstimateSingle = async () => {
        setBookingError("");
        setEstimateResult(null);
        setEstimating(true);

        try {
            let finalCustomerId = singleForm.customerId;

            if (isManualRecipient) {
                finalCustomerId = await processManualRecipient();
                if (finalCustomerId) {
                    setSingleForm(prev => ({ ...prev, customerId: finalCustomerId }));
                }
            }

            const { courier, pickupAddressId, weight, length, width, height, productGroup, productType } = singleForm;

            if (!weight || !pickupAddressId || (!finalCustomerId && !isManualRecipient)) {
                setBookingError("Please provide weight, origin warehouse, and destination recipient.");
                setEstimating(false);
                return;
            }

            const payload = {
                courier,
                pickupAddressId,
                customerId: finalCustomerId,
                weight: parseFloat(weight),
                length: length ? parseFloat(length) : 0,
                width: width ? parseFloat(width) : 0,
                height: height ? parseFloat(height) : 0,
                productGroup,
                productType: courier === "aramex" ? productType : undefined,
                receiverName: singleForm.receiverName,
                receiverMobile: singleForm.receiverMobile,
                receiverAddress: singleForm.receiverAddress,
                receiverCity: singleForm.receiverCity,
                receiverState: singleForm.receiverState,
                receiverCountry: singleForm.receiverCountry,
                receiverPincode: singleForm.receiverPincode,
            };

            const res = await API.post("/rates/calculate", payload);
            setEstimateResult(res.data);

            if (courier === "phreights" && res.data.services?.length > 0) {
                setSingleForm(prev => ({ ...prev, productType: res.data.services[0].serviceName }));
            }
        } catch (err) {
            setBookingError(err.response?.data?.message || err.message || "Rate estimation failed.");
        } finally {
            setEstimating(false);
        }
    };

    const handleBookSingle = async (e) => {
        e.preventDefault();
        setBookingError("");
        setBookingSuccess("");

        if (user?.status !== "Active") {
            setBookingError("Booking locked: Your store account KYC status is currently not Active.");
            return;
        }

        setBookingLoading(true);
        try {
            let finalCustomerId = singleForm.customerId;

            if (isManualRecipient) {
                finalCustomerId = await processManualRecipient();
                if (finalCustomerId) {
                    setSingleForm(prev => ({ ...prev, customerId: finalCustomerId }));
                }
            }

            const {
                pickupAddressId,
                weight,
                productDescription,
                courier,
                customsValue,
                customsCurrency,
                productType
            } = singleForm;

            if (!courier || (!finalCustomerId && !isManualRecipient) || !pickupAddressId || !weight || !productDescription || !customsValue || !customsCurrency) {
                setBookingError("Please fill out recipient details, weight, pickup warehouse, and all customs values.");
                setBookingLoading(false);
                return;
            }

            if (courier === "phreights" && !productType) {
                setBookingError("Please calculate the cost quote and select a Phreight service plan before booking.");
                setBookingLoading(false);
                return;
            }

            const payload = {
                ...singleForm,
                customerId: finalCustomerId,
            };

            const res = await API.post("/shipments/book", payload);
            setBookingSuccess(res.data.message || "Shipment successfully booked!");

            // Reset Form completely
            setSingleForm({
                ...singleForm,
                customerId: "",
                pickupAddressId: warehouses[0]?._id || "",
                weight: "",
                length: "",
                width: "",
                height: "",
                productDescription: "",
                customsValue: "",
                customsCurrency: "USD",
                productType: courier === "aramex" ? "PPX" : "",
                receiverName: "",
                receiverMobile: "",
                receiverAddress: "",
                receiverCity: "",
                receiverState: "",
                receiverCountry: "AE",
                receiverPincode: "",
            });
            setIsManualRecipient(false);
            setEstimateResult(null);
        } catch (err) {
            setBookingError(err.response?.data?.message || err.message || "Booking request failed.");
        } finally {
            setBookingLoading(false);
        }
    };

    const handleSaveSingleCustomer = async (e) => {
        e.preventDefault();
        if (saveManualRecipient) {
            try {
                const res = await API.post("/recipient-customer", singleCustomerForm);
                const newId = res.data?.customer?._id || res.data?._id || res.data?.data?._id;

                const custRes = await API.get("/recipient-customer");
                if (custRes.data && custRes.data.data) {
                    setCustomers(custRes.data.data);
                }

                setSingleForm(prev => ({
                    ...prev,
                    customerId: newId,
                    isGuestRecipient: false,
                    receiverCountry: singleCustomerForm.countryCode,
                    receiverPincode: singleCustomerForm.postCode
                }));
                setShowSingleCustomerModal(false);
                setSingleCustomerForm(initialCustomerForm);
            } catch (error) {
                alert(error.response?.data?.message || "Failed to save recipient.");
            }
        } else {
            setSingleForm(prev => ({
                ...prev,
                customerId: "",
                isGuestRecipient: true,
                receiverName: singleCustomerForm.name,
                receiverMobile: singleCustomerForm.mobile,
                receiverAddress: singleCustomerForm.addressLine1,
                receiverCity: singleCustomerForm.city,
                receiverState: singleCustomerForm.stateOrProvinceCode,
                receiverCountry: singleCustomerForm.countryCode,
                receiverPincode: singleCustomerForm.postCode,
            }));
            setShowSingleCustomerModal(false);
            setSingleCustomerForm(initialCustomerForm);
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
        <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#687280]/20 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlusCircle size={22} className="text-[#FF6A00]" />
                    Book Single Shipping Voucher
                </h3>
            </div>

            <form onSubmit={handleBookSingle} className="space-y-6">

                {/* Courier Selection */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Select Courier Partner</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition ${singleForm.courier === "aramex" ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-white/10 bg-[#0A1F44] hover:border-white/30"}`}>
                            <input
                                type="radio"
                                name="courier"
                                value="aramex"
                                checked={singleForm.courier === "aramex"}
                                onChange={(e) => {
                                    setSingleForm({ ...singleForm, courier: "aramex", productType: "PPX" });
                                    setEstimateResult(null);
                                }}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${singleForm.courier === "aramex" ? "border-[#FF6A00]" : "border-gray-500"}`}>
                                {singleForm.courier === "aramex" && <div className="w-2 h-2 bg-[#FF6A00] rounded-full"></div>}
                            </div>
                            <span className="text-white font-bold text-sm">Aramex</span>
                        </label>

                        <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition ${singleForm.courier === "phreight" ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-white/10 bg-[#0A1F44] hover:border-white/30"}`}>
                            <input
                                type="radio"
                                name="courier"
                                value="phreight"
                                checked={singleForm.courier === "phreight"}
                                onChange={(e) => {
                                    setSingleForm({ ...singleForm, courier: "phreight", productType: "" });
                                    setEstimateResult(null);
                                }}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${singleForm.courier === "phreight" ? "border-[#FF6A00]" : "border-gray-500"}`}>
                                {singleForm.courier === "phreight" && <div className="w-2 h-2 bg-[#FF6A00] rounded-full"></div>}
                            </div>
                            <span className="text-white font-bold text-sm">Phreight</span>
                        </label>
                    </div>
                </div>

                {/* Warehouse Origin & Recipient Details Side-by-Side Container */}
                <div className="grid md:grid-cols-2 gap-4">

                    {/* Warehouse Origin */}
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">1. Select Warehouse Pickup Origin</h4>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Saved Warehouses</label>
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
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 flex flex-col h-full">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">2. Recipient Customer Details</h4>
                            <button
                                type="button"
                                onClick={() => setIsManualRecipient(!isManualRecipient)}
                                className="text-[10px] text-[#FF6A00] hover:text-white transition flex items-center gap-1 bg-[#FF6A00]/10 px-2 py-1 rounded"
                            >
                                {isManualRecipient ? "Use Saved Directory" : <><Plus size={12} /> Add New Recipient Inline</>}
                            </button>
                        </div>

                        {!isManualRecipient ? (
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Saved Customer Directory</label>
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
                            <div className="space-y-4 border-t border-white/5 pt-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <input type="text" placeholder="Contact Name *" value={singleForm.receiverName} onChange={(e) => setSingleForm({ ...singleForm, receiverName: e.target.value })} className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Mobile *" value={singleForm.receiverMobile} onChange={(e) => setSingleForm({ ...singleForm, receiverMobile: e.target.value })} className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" required />
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
                                    <input type="text" placeholder="Full Address *" value={singleForm.receiverAddress} onChange={(e) => setSingleForm({ ...singleForm, receiverAddress: e.target.value })} className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" required />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <input type="text" placeholder="City *" value={singleForm.receiverCity} onChange={(e) => setSingleForm({ ...singleForm, receiverCity: e.target.value })} className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="State / Province *" value={singleForm.receiverState} onChange={(e) => setSingleForm({ ...singleForm, receiverState: e.target.value.toUpperCase() })} className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs uppercase" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Pincode *" value={singleForm.receiverPincode} onChange={(e) => setSingleForm({ ...singleForm, receiverPincode: e.target.value })} className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" required />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="saveRecipient" checked={saveManualRecipient} onChange={(e) => setSaveManualRecipient(e.target.checked)} className="accent-[#FF6A00] w-4 h-4 cursor-pointer" />
                                    <label htmlFor="saveRecipient" className="text-xs text-gray-300 font-semibold cursor-pointer select-none">
                                        Save this recipient to Customer Directory for future use
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Add Recipient Modal (Triggered by Top Bar if needed, preserved for consistency) */}
                {showSingleCustomerModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#0A1F44] w-full max-w-2xl rounded-3xl border border-[#FF6A00]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-[#FF6A00] font-bold">Recipient Customer Details</h3>
                                <button type="button" onClick={() => setShowSingleCustomerModal(false)} className="text-gray-400 hover:text-white">
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">Contact Name <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Jane Smith" value={singleCustomerForm.name} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, name: e.target.value })} required className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">Mobile Number <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="+91 98765 43210" value={singleCustomerForm.mobile} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, mobile: e.target.value })} required className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">Country (2-Letter) <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="AE" maxLength={2} value={singleCustomerForm.countryCode} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, countryCode: e.target.value.toUpperCase() })} required className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs uppercase" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="text-[10px] text-gray-400 block mb-1">Address Line 1 <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="Plot No 22, MIDC Industrial Area" value={singleCustomerForm.addressLine1} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, addressLine1: e.target.value })} required className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">City <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Mumbai" value={singleCustomerForm.city} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, city: e.target.value })} required className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">State / Province <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="MH" value={singleCustomerForm.stateOrProvinceCode} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, stateOrProvinceCode: e.target.value.toUpperCase() })} required className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs uppercase" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">Pincode <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="400001" value={singleCustomerForm.postCode} onChange={(e) => setSingleCustomerForm({ ...singleCustomerForm, postCode: e.target.value })} required className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer" onClick={() => setSaveCustomerToDirectory(!saveCustomerToDirectory)}>
                                    <input type="checkbox" checked={saveCustomerToDirectory} onChange={(e) => setSaveCustomerToDirectory(e.target.checked)} className="accent-[#FF6A00] w-4 h-4 cursor-pointer" />
                                    <label className="text-xs font-bold text-white cursor-pointer">Save this recipient to my Customer Directory for future use.</label>
                                </div>

                                <div className="flex gap-4 pt-6 mt-4 border-t border-white/10">
                                    <button type="button" onClick={handleSaveSingleCustomer} className="flex-1 bg-[#FF6A00] text-[#0A1F44] font-bold py-3 rounded-xl text-xs hover:brightness-110 transition">
                                        Confirm Recipient Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Package Specs */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">3. Package Specifications & Value</h4>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Dead Weight (kg)</label>
                            <input type="number" step="0.01" placeholder="1.5" value={singleForm.weight} onChange={(e) => setSingleForm({ ...singleForm, weight: e.target.value })} required className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Total Pieces</label>
                            <input type="number" min="1" value={singleForm.numberOfPieces || 1} onChange={(e) => setSingleForm({ ...singleForm, numberOfPieces: e.target.value })} required className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                        </div>

                        {/* Aramex Product Type Selector via Custom Combobox */}
                        {singleForm.courier === "aramex" && (
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">International Product Type</label>
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
                            <label className="text-[10px] text-gray-400 block mb-1">Product Description</label>
                            <input type="text" placeholder="Apparel, Electronics..." value={singleForm.productDescription} onChange={(e) => setSingleForm({ ...singleForm, productDescription: e.target.value })} required className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Goods Origin Country</label>
                            <Select
                                options={ARAMEX_SUPPORTED_COUNTRIES}
                                value={singleForm.goodsOriginCountry}
                                onChange={(val) => setSingleForm({ ...singleForm, goodsOriginCountry: val })}
                                placeholder="-- Search country --"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Dimensions (L x W x H cm)</label>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="number"
                                placeholder="Length"
                                value={singleForm.length}
                                onChange={(e) => setSingleForm({
                                    ...singleForm,
                                    length: e.target.value
                                })}
                                className="p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white text-center outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                            <input type="number" placeholder="Width" value={singleForm.width} onChange={(e) => setSingleForm({ ...singleForm, width: e.target.value })} className="p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white text-center outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                            <input type="number" placeholder="Height" value={singleForm.height} onChange={(e) => setSingleForm({ ...singleForm, height: e.target.value })} className="p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white text-center outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
                        <div>
                            <label className="text-[10px] text-[#FF6A00] font-bold block mb-1">Customs Declared Value <span className="text-red-500">*</span></label>
                            <input type="number" step="0.01" placeholder="50.00" value={singleForm.customsValue} onChange={(e) => setSingleForm({ ...singleForm, customsValue: e.target.value })} required className="w-full p-3 rounded-xl bg-[#0A1F44] border border-[#FF6A00]/50 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs" />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#FF6A00] font-bold block mb-1">Currency Code <span className="text-red-500">*</span></label>
                            <Select
                                options={ARAMEX_SUPPORTED_CURRENCIES}
                                value={singleForm.customsCurrency}
                                onChange={(val) => setSingleForm({ ...singleForm, customsCurrency: val })}
                                placeholder="-- Select Currency --"
                            />
                        </div>
                    </div>
                </div>

                {/* Estimate Result Block (Aramex vs ShipGlobal Multi-Plan UI) */}
                {estimateResult && (
                    <>
                        {/* ShipGlobal Multi-Service Cards */}
                        {singleForm.courier === "phreight" && estimateResult.services && estimateResult.services.length > 0 ? (
                            <div className="bg-black/30 p-5 rounded-2xl border border-[#FF6A00]/30 space-y-4">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Select Phreight Service Plan</h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {estimateResult.services.map((svc, idx) => {
                                        const isSelected = singleForm.productType === svc.serviceName;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setSingleForm({ ...singleForm, productType: svc.serviceName })}
                                                className={`p-4 rounded-xl cursor-pointer border transition-all ${isSelected ? "border-[#FF6A00] bg-[#FF6A00]/10" : "border-white/10 bg-[#0A1F44] hover:border-white/30"}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-gray-300"}`}>{svc.title}</span>
                                                    {isSelected && <CheckCircle size={14} className="text-[#FF6A00]" />}
                                                </div>
                                                <p className="text-[10px] text-gray-400 mb-2">{svc.transitTime} {svc.notes ? `| ${svc.notes}` : ''}</p>
                                                <div className="flex justify-between items-center mt-3 border-t border-white/10 pt-2">
                                                    <span className="text-[10px] text-gray-500">Total Payable</span>
                                                    <span className="font-black text-[#FF6A00] text-sm">₹{svc.invoiceTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Aramex Single Plan Block */
                            <div className="bg-black/30 p-5 rounded-2xl border border-[#FF6A00]/30 space-y-3">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Dynamic Shipping Quotation Breakdown</h4>
                                <div className="grid md:grid-cols-3 gap-4 text-xs">
                                    <div><span className="text-gray-500 block">Courier Name:</span><span className="font-bold text-white capitalize">{estimateResult.courierName}</span></div>
                                    <div><span className="text-gray-500 block">Chargeable Weight:</span><span className="font-bold text-[#FF6A00]">{estimateResult.chargeableWeight}</span></div>
                                    <div><span className="text-gray-500 block">Volumetric weight:</span><span className="text-gray-400 font-semibold">{estimateResult.volumetricWeight}</span></div>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex flex-wrap justify-between items-center text-sm gap-2">
                                    <div className="space-x-4">
                                        <span className="text-[#687280]">Shipping Charge: <strong>₹{estimateResult.shippingCharge}</strong></span>
                                        <span className="text-[#687280]">GST (18%): <strong>₹{estimateResult.gstAmount}</strong></span>
                                    </div>
                                    <span className="text-lg font-black text-[#FF6A00]">Total Payable: ₹{estimateResult.invoiceTotal}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {bookingError && <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl flex items-center gap-2"><AlertTriangle size={14} className="shrink-0" /><span>{bookingError}</span></div>}
                {bookingSuccess && <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-3.5 rounded-xl flex items-center gap-2"><Check size={14} className="shrink-0" /><span>{bookingSuccess}</span></div>}

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleEstimateSingle}
                        disabled={estimating || !singleForm.weight || (!singleForm.customerId && !singleForm.isGuestRecipient) || !singleForm.pickupAddressId}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl text-xs transition disabled:opacity-50"
                    >
                        {estimating ? "Calculating..." : "Calculate Cost Quote"}
                    </button>

                    <button
                        type="submit"
                        disabled={bookingLoading || user?.status !== "Active" || (singleForm.courier === "phreight" && !singleForm.productType)}
                        className="flex-1 bg-[#FF6A00] text-[#0A1F44] font-extrabold py-3.5 rounded-xl text-xs hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {bookingLoading ?
                            <span className="w-5 h-5 border-2 border-[#0A1F44] border-t-transparent rounded-full animate-spin"></span> :
                            <><Check size={16} /> Confirm Booking</>
                        }
                    </button>
                </div>

            </form>
        </div>
    );
};

export default SingleBooking;