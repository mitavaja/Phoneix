import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Home, Plus, MapPin, Edit2, AlertTriangle } from "lucide-react";
import moment from "moment";

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [showAddWarehouse, setShowAddWarehouse] = useState(false);
    const [isEditingWarehouse, setIsEditingWarehouse] = useState(false);
    const [canEditLocation, setCanEditLocation] = useState(false);
    const [nextEditDate, setNextEditDate] = useState("");

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
            country: w.country,
            pincode: w.pincode,
            isDefault: w.isDefault
        });

        setIsEditingWarehouse(true);
        setShowAddWarehouse(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveWarehouse = async (e) => {
        e.preventDefault();
        try {
            if (isEditingWarehouse) {
                await API.put(`/warehouses/${warehouseForm._id}`, {
                    addressName: warehouseForm.addressName,
                    contactPerson: warehouseForm.contactPerson,
                    mobile: warehouseForm.mobile,
                    address: warehouseForm.address,
                    pincode: warehouseForm.pincode,
                    // Pass location fields only if allowed
                    ...(canEditLocation && {
                        city: warehouseForm.city,
                        state: warehouseForm.state,
                        country: warehouseForm.country
                    })
                });
                alert("Warehouse details updated successfully.");
            } else {
                await API.post("/warehouses/add", warehouseForm);
                alert("Warehouse saved successfully.");
            }

            setShowAddWarehouse(false);
            setIsEditingWarehouse(false);
            setWarehouseForm({
                addressName: "", contactPerson: "", mobile: "", address: "",
                city: "", state: "", country: "IN", pincode: "", isDefault: false
            });
            await fetchWarehouses();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save warehouse.");
        }
    };

    const handleCancelWarehouseForm = () => {
        setShowAddWarehouse(false);
        setIsEditingWarehouse(false);
        setWarehouseForm({
            addressName: "", contactPerson: "", mobile: "", address: "",
            city: "", state: "", country: "IN", pincode: "", isDefault: false
        });
    };

    return (
        <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#687280]/20 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Home size={22} className="text-[#FF6A00]" />
                    Pickup Warehouses Manager
                </h3>

                {/* Only show the Add button if the user hasn't created a warehouse yet */}
                {warehouses.length === 0 && !showAddWarehouse && (
                    <button
                        onClick={() => setShowAddWarehouse(true)}
                        className="bg-[#FF6A00] text-[#0A1F44] font-extrabold py-2 px-4 rounded-xl text-xs hover:brightness-110 transition flex items-center gap-1"
                    >
                        <Plus size={14}/> Add New Warehouse
                    </button>
                )}
            </div>

            {/* Add / Edit warehouse form */}
            {showAddWarehouse && (
                <form onSubmit={handleSaveWarehouse} className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold uppercase text-[#FF6A00]">
                            {isEditingWarehouse ? "Edit Warehouse Details" : "Save New Warehouse Location"}
                        </h4>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Warehouse Nickname</label>
                            <input
                                type="text"
                                placeholder="Mumbai Main Hub"
                                value={warehouseForm.addressName}
                                onChange={(e) => setWarehouseForm({...warehouseForm, addressName: e.target.value})}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Contact Person Name</label>
                            <input
                                type="text"
                                placeholder="John Manager"
                                value={warehouseForm.contactPerson}
                                onChange={(e) => setWarehouseForm({...warehouseForm, contactPerson: e.target.value})}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Contact Mobile Number</label>
                            <input
                                type="text"
                                placeholder="+91 99999 88888"
                                value={warehouseForm.mobile}
                                onChange={(e) => setWarehouseForm({...warehouseForm, mobile: e.target.value})}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Warehouse Address Line</label>
                        <input
                            type="text"
                            placeholder="Plot No 22, MIDC Industrial Area"
                            value={warehouseForm.address}
                            onChange={(e) => setWarehouseForm({...warehouseForm, address: e.target.value})}
                            required
                            className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                        />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">City</label>
                            <input
                                type="text"
                                placeholder="Mumbai"
                                value={warehouseForm.city}
                                onChange={(e) => setWarehouseForm({...warehouseForm, city: e.target.value})}
                                required
                                disabled={isEditingWarehouse && !canEditLocation}
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">State / Province</label>
                            <input
                                type="text"
                                placeholder="Maharashtra"
                                value={warehouseForm.state}
                                onChange={(e) => setWarehouseForm({...warehouseForm, state: e.target.value})}
                                required
                                disabled={isEditingWarehouse && !canEditLocation}
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Country</label>
                            <input
                                type="text"
                                value={warehouseForm.country}
                                onChange={(e) => setWarehouseForm({...warehouseForm, country: e.target.value})}
                                required
                                disabled={isEditingWarehouse && !canEditLocation}
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Pincode / Zipcode</label>
                            <input
                                type="text"
                                placeholder="400001"
                                value={warehouseForm.pincode}
                                onChange={(e) => setWarehouseForm({...warehouseForm, pincode: e.target.value})}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                    </div>

                    {/* 90-Day Lock Notification */}
                    {isEditingWarehouse && !canEditLocation && (
                        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-2">
                            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                            <p className="text-amber-500 text-[10px] font-semibold leading-relaxed">
                                Core location details (City, State, Country) are locked for 90 days after any profile update to prevent manifest fraud. You can update these fields again on: <span className="font-bold underline">{nextEditDate}</span>
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#FF6A00] to-orange-500 text-white font-bold py-3 rounded-xl text-xs hover:brightness-110 transition"
                        >
                            {isEditingWarehouse ? "Update Details" : "Save Location"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelWarehouseForm}
                            className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl text-xs hover:bg-white/10 transition"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            )}

            {/* Warehouse Listing */}
            <div className="grid md:grid-cols-2 gap-6">
                {warehouses.map(w => (
                    <div key={w._id}
                         className="bg-black/20 border border-white/5 hover:border-[#FF6A00]/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-white text-sm">{w.addressName}</h4>
                                    <span
                                        className="text-[10px] text-gray-500">Contact: {w.contactPerson} ({w.mobile})</span>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 font-bold uppercase">
                                    Default Origin
                                </span>
                            </div>

                            <p className="text-xs text-gray-400 mt-3 flex items-start gap-1">
                                <MapPin size={12} className="shrink-0 text-[#FF6A00] mt-0.5"/>
                                {w.address}, {w.city}, {w.state}, {w.country} - {w.pincode}
                            </p>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                            <span className="text-[9px] text-gray-500">
                                Last Updated: {moment(w.updatedAt || w.createdAt).format('DD/MM/YYYY')}
                            </span>
                            <button
                                onClick={() => handleEditWarehouseClick(w)}
                                className="text-blue-400 hover:text-blue-600 transition flex items-center gap-1 text-[10px]"
                            >
                                <Edit2 size={12}/>
                                Edit Details
                            </button>
                        </div>
                    </div>
                ))}
                {warehouses.length === 0 && !showAddWarehouse && (
                    <div className="md:col-span-2 text-center py-10 bg-black/20 border border-white/5 rounded-2xl">
                        <Home size={32} className="mx-auto text-gray-600 mb-3"/>
                        <p className="text-gray-400 text-sm font-semibold">No warehouse pickup location
                            registered.</p>
                        <p className="text-gray-500 text-xs mt-1">Please add a warehouse to begin booking
                            shipments.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Warehouses;