import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Select } from "../../components/ui/Select";
import { UserRoundKey, Plus, MapPin, Edit2, Trash2 } from "lucide-react";
import { ARAMEX_SUPPORTED_COUNTRIES } from "../../utils/countries";

const RecipientCustomer = () => {
    const [customers, setCustomers] = useState([]);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
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
    const [customerForm, setCustomerForm] = useState(initialCustomerForm);

    const fetchCustomers = async () => {
        try {
            const res = await API.get("/recipient-customer");
            setCustomers(res.data?.data || []);
        } catch (err) {
            
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        try {
            if (customerForm._id) {
                await API.put(`/recipient-customer/${customerForm._id}`, customerForm);
            } else {
                await API.post("/recipient-customer", customerForm);
            }
            setShowCustomerForm(false);
            setCustomerForm(initialCustomerForm);
            await fetchCustomers();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save recipient customer.");
        }
    };

    const handleEditCustomer = (customer) => {
        setCustomerForm(customer);
        setShowCustomerForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm("Are you sure you want to remove this recipient?")) return;
        try {
            await API.delete(`/recipient-customer/${id}`);
            await fetchCustomers();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete recipient.");
        }
    };

    const handleAddNewClick = () => {
        setCustomerForm(initialCustomerForm);
        setShowCustomerForm(!showCustomerForm);
    };

    return (
        <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#687280]/20 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserRoundKey size={22} className="text-[#FF6A00]"/>
                    Recipient Customer
                </h3>

                <button
                    onClick={handleAddNewClick}
                    className="bg-[#FF6A00] text-[#0A1F44] font-extrabold py-2 px-4 rounded-xl text-xs hover:brightness-110 transition flex items-center gap-1"
                >
                    <Plus size={14}/> Add New Recipient Customer
                </button>
            </div>

            {/* Form Segment */}
            {showCustomerForm && (
                <form onSubmit={handleSaveCustomer}
                      className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00]">
                        {customerForm._id ? "Edit Recipient Customer" : "Save New Recipient Customer"}
                    </h4>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Contact Person Name <span
                                className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Jane Smith"
                                value={customerForm.name}
                                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Mobile Number <span
                                className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="+91 98765 43210"
                                value={customerForm.mobile}
                                onChange={(e) => setCustomerForm({...customerForm, mobile: e.target.value})}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">
                                Country Code (2-Letter ISO)
                                <span className="text-red-500"> *</span>
                            </label>
                            <Select
                                placeholder={"Search and select country"}
                                options={ARAMEX_SUPPORTED_COUNTRIES}
                                value={customerForm.countryCode}
                                onChange={(value) => {
                                    setCustomerForm({
                                        ...customerForm,
                                        countryCode: value.toUpperCase()
                                    })
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Address Line 1 <span
                            className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="Plot No 22, MIDC Industrial Area"
                            value={customerForm.addressLine1}
                            onChange={(e) => setCustomerForm({...customerForm, addressLine1: e.target.value})}
                            required
                            className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Address Line 2</label>
                            <input
                                type="text"
                                placeholder="Building/Floor (Optional)"
                                value={customerForm.addressLine2}
                                onChange={(e) => setCustomerForm({...customerForm, addressLine2: e.target.value})}
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Address Line 3</label>
                            <input
                                type="text"
                                placeholder="Landmark (Optional)"
                                value={customerForm.addressLine3}
                                onChange={(e) => setCustomerForm({...customerForm, addressLine3: e.target.value})}
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">City <span
                                className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Mumbai"
                                value={customerForm.city}
                                onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">State / Province Code <span
                                className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="MH"
                                value={customerForm.stateOrProvinceCode}
                                onChange={(e) => setCustomerForm({
                                    ...customerForm,
                                    stateOrProvinceCode: e.target.value.toUpperCase()
                                })}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs uppercase"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Pincode / Zipcode <span
                                className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="400001"
                                value={customerForm.postCode}
                                onChange={(e) => setCustomerForm({...customerForm, postCode: e.target.value})}
                                required
                                className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#FF6A00] to-orange-500 text-white font-bold py-3 rounded-xl text-xs hover:brightness-110 transition"
                        >
                            {customerForm._id ? "Update Recipient" : "Save Recipient"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCustomerForm(false);
                                setCustomerForm(initialCustomerForm);
                            }}
                            className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl text-xs hover:bg-white/10 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Listing Segment */}
            <div className="grid md:grid-cols-2 gap-6">
                {customers.map((c) => (
                    <div key={c._id}
                         className="bg-black/20 border border-white/5 hover:border-[#FF6A00]/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                                    <span className="text-[10px] text-gray-500">Mobile: {c.mobile}</span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 mt-3 flex items-start gap-1">
                                <MapPin size={12} className="shrink-0 text-[#FF6A00] mt-0.5"/>
                                <span className="leading-relaxed">
                              {c.addressLine1}
                                    {c.addressLine2 && `, ${c.addressLine2}`}
                                    {c.addressLine3 && `, ${c.addressLine3}`}<br/>
                                    {c.city}, {c.stateOrProvinceCode} - {c.postCode}<br/>
                                    {c.countryCode}
                            </span>
                            </p>
                        </div>

                        <div className="flex justify-end border-t border-white/5 pt-3 gap-4">
                            <button
                                onClick={() => handleEditCustomer(c)}
                                className="text-blue-400 hover:text-blue-500 transition flex items-center gap-1 text-[10px]"
                            >
                                <Edit2 size={12}/>
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteCustomer(c._id)}
                                className="text-red-400 hover:text-red-600 transition flex items-center gap-1 text-[10px]"
                            >
                                <Trash2 size={12}/>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}

                {(!customers || customers.length === 0) && (
                    <p className="text-gray-500 text-sm md:col-span-2 text-center py-10">
                        No recipient customers registered.
                    </p>
                )}
            </div>
        </div>
    );
};
export default RecipientCustomer;