import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Home, Plus, MapPin, Edit2, AlertTriangle } from "lucide-react";
import moment from "moment";
import { ARAMEX_SUPPORTED_COUNTRIES } from "../../utils/countries";
import { Select } from "../../components/ui/Select";
import { toast } from "react-toastify";
import { fetchLocationByPincode } from "../../utils/pincodeHelper";
import { Loader2 } from "lucide-react";

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [showAddWarehouse, setShowAddWarehouse] = useState(false);
    const [isEditingWarehouse, setIsEditingWarehouse] = useState(false);
    const [canEditLocation, setCanEditLocation] = useState(false);
    const [nextEditDate, setNextEditDate] = useState("");
    const [isFetchingPin, setIsFetchingPin] = useState(false);

    const handlePincodeChange = async (val) => {
        setWarehouseForm(prev => ({ ...prev, pincode: val }));
        const clean = val.trim();
        if (clean.length === 6 && /^\d{6}$/.test(clean)) {
            setIsFetchingPin(true);
            try {
                const loc = await fetchLocationByPincode(clean, warehouseForm.country || "IN");
                if (loc && (!isEditingWarehouse || canEditLocation)) {
                    setWarehouseForm(prev => ({
                        ...prev,
                        city: loc.city || prev.city,
                        state: loc.state || prev.state,
                        country: "IN"
                    }));
                    toast.info(`Auto-fetched: ${loc.city}, ${loc.state}`);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsFetchingPin(false);
            }
        }
    };

    const [warehouseForm, setWarehouseForm] = useState({
        addressName: "",
        contactPerson: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        country: "IN",
        pincode: "",
        isDefault: false
    });

    const fetchWarehouses = async () => {
        try {
            const res = await API.get("/warehouses/my-addresses");
            setWarehouses(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleEditWarehouseClick = (w) => {
        // Calculate 90 Days logic using moment.js
        const lastUpdate = moment(w.updatedAt || w.createdAt || Date.now());
        const diffDays = moment().diff(lastUpdate, 'days');
        const canEdit = diffDays >= 90;

        setCanEditLocation(canEdit);

        if (!canEdit) {
            const formattedNextDate = lastUpdate.clone().add(90, 'days').format('DD/MM/YYYY');
            setNextEditDate(formattedNextDate);
        }

        setWarehouseForm({
            _id: w._id,
            addressName: w.addressName,
            contactPerson: w.contactPerson,
            mobile: w.mobile,
            address: w.address,
            city: w.city,
            state: w.state,
            country: w.country || "IN",
            pincode: w.pincode,
            isDefault: w.isDefault
        });
        setIsEditingWarehouse(true);
        setShowAddWarehouse(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelWarehouseForm = () => {
        setShowAddWarehouse(false);
        setIsEditingWarehouse(false);
        setWarehouseForm({
            addressName: "",
            contactPerson: "",
            mobile: "",
            address: "",
            city: "",
            state: "",
            country: "IN",
            pincode: "",
            isDefault: false
        });
    };

    const handleSaveWarehouse = async (e) => {
        e.preventDefault();
        try {
            if (isEditingWarehouse && warehouseForm._id) {
                await API.put(`/warehouses/${warehouseForm._id}`, warehouseForm);
                toast.success("Warehouse updated successfully!");
            } else {
                await API.post("/warehouses/add", warehouseForm);
                toast.success("Warehouse added successfully!");
            }

            handleCancelWarehouseForm();
            await fetchWarehouses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save warehouse.");
        }
    };

    return (
        <div className="space-y-6 select-none animate-fade-in">
            {/* Header segment */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Pickup Warehouses Manager</h1>
                    <p className="text-sm text-[#687280]">Configure store dispatch origins, manage pickup addresses, and assign default hub locations.</p>
                </div>

                {warehouses.length === 0 && !showAddWarehouse && (
                    <button
                        onClick={() => setShowAddWarehouse(true)}
                        className="bg-[#0A1F44] hover:bg-[#FF6A00] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus size={14} /> Add New Warehouse
                    </button>
                )}
            </div>

            {/* Add / Edit warehouse form */}
            {showAddWarehouse && (
                <form onSubmit={handleSaveWarehouse} className="glass-card p-6 md:p-8 rounded-2xl border border-[#687280]/20 shadow-xl space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[#687280]/15">
                        <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">
                            {isEditingWarehouse ? "Edit Warehouse Details" : "Save New Warehouse Location"}
                        </h4>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Warehouse Nickname</label>
                            <input
                                type="text"
                                placeholder="Mumbai Main Hub"
                                value={warehouseForm.addressName}
                                onChange={(e) => setWarehouseForm({ ...warehouseForm, addressName: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Contact Person Name</label>
                            <input
                                type="text"
                                placeholder="John Manager"
                                value={warehouseForm.contactPerson}
                                onChange={(e) => setWarehouseForm({ ...warehouseForm, contactPerson: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Contact Mobile Number</label>
                            <input
                                type="text"
                                placeholder="+91 99999 88888"
                                value={warehouseForm.mobile}
                                onChange={(e) => setWarehouseForm({ ...warehouseForm, mobile: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Warehouse Address Line</label>
                        <input
                            type="text"
                            placeholder="Plot No 22, MIDC Industrial Area"
                            value={warehouseForm.address}
                            onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                            required
                            className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                        />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">City</label>
                            <input
                                type="text"
                                placeholder="Mumbai"
                                value={warehouseForm.city}
                                onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                                required
                                disabled={isEditingWarehouse && !canEditLocation}
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs disabled:bg-[#E5E7EB]/50 disabled:cursor-not-allowed shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">State / Province</label>
                            <input
                                type="text"
                                placeholder="Maharashtra"
                                value={warehouseForm.state}
                                onChange={(e) => setWarehouseForm({ ...warehouseForm, state: e.target.value })}
                                required
                                disabled={isEditingWarehouse && !canEditLocation}
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs disabled:bg-[#E5E7EB]/50 disabled:cursor-not-allowed shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Country</label>
                            <Select
                                placeholder="Select Country"
                                options={ARAMEX_SUPPORTED_COUNTRIES}
                                value={warehouseForm.country}
                                onChange={(val) => setWarehouseForm({ ...warehouseForm, country: val.toUpperCase() })}
                                disabled={isEditingWarehouse && !canEditLocation}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] text-[#687280] font-bold uppercase tracking-wider">Pincode *</label>
                                {isFetchingPin && (
                                    <span className="text-[10px] text-[#FF6A00] flex items-center gap-1 font-semibold animate-pulse">
                                        <Loader2 size={11} className="animate-spin" /> Fetching city/state...
                                    </span>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Enter 6-digit Pincode (400001)"
                                value={warehouseForm.pincode}
                                onChange={(e) => handlePincodeChange(e.target.value)}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                    </div>

                    {/* 90-Day Lock Notification */}
                    {isEditingWarehouse && !canEditLocation && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-2">
                            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                            <p className="text-amber-700 text-xs font-semibold leading-relaxed">
                                Core location details (City, State, Country) are locked for 90 days after any profile update to prevent manifest fraud. You can update these fields again on: <span className="font-bold underline">{nextEditDate}</span>
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-[#687280]/15">
                        <button
                            type="submit"
                            className="flex-1 bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-extrabold py-3.5 rounded-xl text-xs transition shadow-md shadow-[#FF6A00]/20"
                        >
                            {isEditingWarehouse ? "Update Details" : "Save Location"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelWarehouseForm}
                            className="flex-1 bg-[#E5E7EB]/50 border border-[#687280]/20 text-[#0A1F44] hover:bg-[#E5E7EB] font-bold py-3.5 rounded-xl text-xs transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Warehouse Listing */}
            <div className="grid md:grid-cols-2 gap-6">
                {warehouses.map(w => (
                    <div
                        key={w._id}
                        className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl hover:border-[#FF6A00]/40 flex flex-col justify-between space-y-4 transition"
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-[#0A1F44] text-base">{w.addressName}</h4>
                                    <span className="text-xs text-[#687280]">Contact: {w.contactPerson} ({w.mobile})</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[10px] bg-green-100 text-green-700 border border-green-200 font-bold uppercase tracking-wider">
                                    Default Origin
                                </span>
                            </div>

                            <p className="text-xs text-[#0A1F44] mt-3 flex items-start gap-1 font-medium">
                                <MapPin size={14} className="shrink-0 text-[#FF6A00] mt-0.5" />
                                {w.address}, {w.city}, {w.state}, {w.country} - {w.pincode}
                            </p>
                        </div>

                        <div className="flex justify-between items-center border-t border-[#687280]/15 pt-3">
                            <span className="text-[10px] text-[#687280]">
                                Last Updated: {moment(w.updatedAt || w.createdAt).format('DD/MM/YYYY')}
                            </span>
                            <button
                                onClick={() => handleEditWarehouseClick(w)}
                                className="text-blue-600 hover:text-[#0A1F44] font-bold transition flex items-center gap-1 text-xs"
                            >
                                <Edit2 size={13} />
                                Edit Details
                            </button>
                        </div>
                    </div>
                ))}
                {warehouses.length === 0 && !showAddWarehouse && (
                    <div className="md:col-span-2 text-center py-12 glass-card rounded-2xl border border-[#687280]/20 shadow-md">
                        <Home size={36} className="mx-auto text-[#687280] mb-3 opacity-60" />
                        <p className="text-[#0A1F44] text-sm font-bold">No warehouse pickup location registered.</p>
                        <p className="text-[#687280] text-xs mt-1">Please add a warehouse to begin booking shipments.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Warehouses;