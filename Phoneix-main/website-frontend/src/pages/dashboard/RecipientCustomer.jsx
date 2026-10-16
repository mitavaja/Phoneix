import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Select } from "../../components/ui/Select";
import { UserRoundKey, Plus, MapPin, Edit2, Trash2 } from "lucide-react";
import { ARAMEX_SUPPORTED_COUNTRIES } from "../../utils/countries";
import { toast } from "react-toastify";

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
        } catch (err) {}
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        try {
            if (customerForm._id) {
                await API.put(`/recipient-customer/${customerForm._id}`, customerForm);
                toast.success("Recipient updated successfully!");
            } else {
                await API.post("/recipient-customer", customerForm);
                toast.success("Recipient saved successfully!");
            }
            setShowCustomerForm(false);
            setCustomerForm(initialCustomerForm);
            await fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save recipient customer.");
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
            toast.success("Recipient deleted successfully!");
            await fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete recipient customer.");
        }
    };

    const handleAddNewClick = () => {
        setCustomerForm(initialCustomerForm);
        setShowCustomerForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 select-none animate-fade-in">
            {/* Header Component */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A1F44] tracking-tight">Recipient Customer Directory</h1>
                    <p className="text-sm text-[#687280]">Manage buyer contact addresses, international postal codes, and quick-booking profiles.</p>
                </div>
                <button
                    onClick={handleAddNewClick}
                    className="bg-[#0A1F44] hover:bg-[#FF6A00] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                    <Plus size={14} /> Add New Recipient
                </button>
            </div>

            {/* Form Segment */}
            {showCustomerForm && (
                <form onSubmit={handleSaveCustomer} className="glass-card p-6 md:p-8 rounded-2xl border border-[#687280]/20 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider pb-3 border-b border-[#687280]/15">
                        {customerForm._id ? "Edit Recipient Customer" : "Save New Recipient Customer"}
                    </h4>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                                Contact Person Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Jane Smith"
                                value={customerForm.name}
                                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="+91 98765 43210"
                                value={customerForm.mobile}
                                onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                                Country Code (2-Letter ISO) <span className="text-red-500">*</span>
                            </label>
                            <Select
                                placeholder="Search and select country"
                                options={ARAMEX_SUPPORTED_COUNTRIES}
                                value={customerForm.countryCode}
                                onChange={(value) => {
                                    setCustomerForm({
                                        ...customerForm,
                                        countryCode: value.toUpperCase()
                                    });
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                            Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Plot No 22, Industrial Area"
                            value={customerForm.addressLine1}
                            onChange={(e) => setCustomerForm({ ...customerForm, addressLine1: e.target.value })}
                            required
                            className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Address Line 2</label>
                            <input
                                type="text"
                                placeholder="Building/Floor (Optional)"
                                value={customerForm.addressLine2}
                                onChange={(e) => setCustomerForm({ ...customerForm, addressLine2: e.target.value })}
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">Address Line 3</label>
                            <input
                                type="text"
                                placeholder="Landmark (Optional)"
                                value={customerForm.addressLine3}
                                onChange={(e) => setCustomerForm({ ...customerForm, addressLine3: e.target.value })}
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Dubai"
                                value={customerForm.city}
                                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                                State / Province Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="DU"
                                value={customerForm.stateOrProvinceCode}
                                onChange={(e) => setCustomerForm({
                                    ...customerForm,
                                    stateOrProvinceCode: e.target.value.toUpperCase()
                                })}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs uppercase shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[#687280] font-bold block mb-1 uppercase tracking-wider">
                                Pincode / Zipcode <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="12345"
                                value={customerForm.postCode}
                                onChange={(e) => setCustomerForm({ ...customerForm, postCode: e.target.value })}
                                required
                                className="w-full p-3 rounded-xl bg-white border border-[#687280]/30 text-[#0A1F44] outline-none focus:border-[#FF6A00] text-xs shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-[#687280]/15">
                        <button
                            type="submit"
                            className="flex-1 bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-extrabold py-3.5 rounded-xl text-xs transition shadow-md shadow-[#FF6A00]/20"
                        >
                            {customerForm._id ? "Update Recipient" : "Save Recipient"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCustomerForm(false);
                                setCustomerForm(initialCustomerForm);
                            }}
                            className="flex-1 bg-[#E5E7EB]/50 border border-[#687280]/20 text-[#0A1F44] hover:bg-[#E5E7EB] font-bold py-3.5 rounded-xl text-xs transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Listing Segment */}
            <div className="grid md:grid-cols-2 gap-6">
                {customers.map((c) => (
                    <div
                        key={c._id}
                        className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-xl hover:border-[#FF6A00]/40 flex flex-col justify-between space-y-4 transition"
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-[#0A1F44] text-base">{c.name}</h4>
                                    <span className="text-xs text-[#687280]">Mobile: {c.mobile}</span>
                                </div>
                            </div>

                            <p className="text-xs text-[#0A1F44] mt-3 flex items-start gap-1 font-medium">
                                <MapPin size={14} className="shrink-0 text-[#FF6A00] mt-0.5" />
                                <span className="leading-relaxed">
                                    {c.addressLine1}
                                    {c.addressLine2 && `, ${c.addressLine2}`}
                                    {c.addressLine3 && `, ${c.addressLine3}`}<br />
                                    {c.city}, {c.stateOrProvinceCode} - {c.postCode}<br />
                                    {c.countryCode}
                                </span>
                            </p>
                        </div>

                        <div className="flex justify-end border-t border-[#687280]/15 pt-3 gap-4">
                            <button
                                onClick={() => handleEditCustomer(c)}
                                className="text-blue-600 hover:text-[#0A1F44] font-bold transition flex items-center gap-1 text-xs"
                            >
                                <Edit2 size={13} />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteCustomer(c._id)}
                                className="text-red-500 hover:text-red-700 font-bold transition flex items-center gap-1 text-xs"
                            >
                                <Trash2 size={13} />
                                Remove
                            </button>
                        </div>
                    </div>
                ))}

                {(!customers || customers.length === 0) && (
                    <div className="md:col-span-2 text-center py-12 glass-card rounded-2xl border border-[#687280]/20 shadow-md">
                        <UserRoundKey size={36} className="mx-auto text-[#687280] mb-3 opacity-60" />
                        <p className="text-[#0A1F44] text-sm font-bold">No recipient customers registered.</p>
                        <p className="text-[#687280] text-xs mt-1">Add recipients to speed up single and bulk parcel dispatches.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipientCustomer;