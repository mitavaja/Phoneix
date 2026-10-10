import React, { useState, useEffect, Fragment } from "react";
import API from "../../services/api";
import {
    User,
    FileText,
    Lock,
    ShieldCheck,
    Download,
    AlertTriangle,
    ChevronRight,
    Edit2,
    X
} from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";

const Profile = () => {
    const baseKycUploadURL = `${import.meta.env.VITE_API_BASE_URL}/uploads/`
    const [activeTab, setActiveTab] = useState("profile");
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit Profile States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", email: "", mobileNumber: "" });

    // Change Password States
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const fetchProfile = async () => {
        try {
            const res = await API.get("/auth/profile");
            if (res.data.success && res.data.data.length > 0) {
                const data = res.data.data[0];
                setProfileData(data);
                setEditForm({
                    name: data.name || "",
                    email: data.email || "",
                    mobileNumber: data.mobileNumber || ""
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Handle Profile Update Submission
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            await API.put("/auth/profile", editForm);
            toast.success("Profile details updated successfully.");
            setIsEditModalOpen(false);
            fetchProfile(); // Refresh data
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Handle Password Change Submission
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setIsChangingPassword(true);
        try {
            await API.put("/auth/change-password", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success("Password changed successfully.");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#687280] text-sm font-semibold">Loading Profile Details...</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Profile Not Found</h3>
                <p className="text-gray-400 text-sm">Unable to retrieve your account details at this time.</p>
            </div>
        );
    }

    const { kyc } = profileData;

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">

            {/* Left Inner Sidebar Navigation */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">

                {/* Avatar & Summary Card */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#FF6A00]/20 to-transparent opacity-50"></div>

                    <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-[#FF6A00] to-orange-400 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-[0_10px_20px_rgba(255,106,0,0.3)] mb-4">
                        {(profileData.name?.charAt(0) || "U").toUpperCase()}
                    </div>
                    <h3 className="font-bold text-white text-lg text-center relative z-10">{profileData.name}</h3>
                    <span className="text-xs font-bold text-[#FF6A00] bg-[#FF6A00]/10 px-3 py-1 rounded-full mt-2 border border-[#FF6A00]/20 relative z-10">
                        {profileData.status} Merchant
                    </span>
                </div>

                {/* Inner Tabs Navigation */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-3 space-y-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "profile" ? "bg-[#FF6A00] text-[#0A1F44] shadow-md shadow-[#FF6A00]/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                        <User size={18} /> My Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("kyc")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "kyc" ? "bg-[#FF6A00] text-[#0A1F44] shadow-md shadow-[#FF6A00]/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                        <ShieldCheck size={18} /> KYC Details
                    </button>
                    <button
                        onClick={() => setActiveTab("password")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "password" ? "bg-[#FF6A00] text-[#0A1F44] shadow-md shadow-[#FF6A00]/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                        <Lock size={18} /> Change Password
                    </button>
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 md:p-8 min-h-full shadow-sm">

                    {/* Dynamic Header & Breadcrumbs */}
                    <div className="border-b border-white/10 pb-5 mb-6 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2">
                                Settings <ChevronRight size={12} /> <span className="text-[#FF6A00]">{activeTab === "profile" ? "My Profile" : activeTab === "kyc" ? "KYC Details" : "Security"}</span>
                            </div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                {activeTab === "profile" ? "My Profile" : activeTab === "kyc" ? "KYC Documentation" : "Account Security"}
                                {activeTab === "kyc" && kyc && (
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider font-extrabold ${
                                        kyc.status === "Approved" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            kyc.status === "Pending" || kyc.status === "Under Review" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}>
                                        {kyc.status}
                                    </span>
                                )}
                            </h2>
                        </div>

                        {activeTab === "profile" && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#FF6A00] hover:text-[#0A1F44] hover:border-[#FF6A00] transition shadow-md flex items-center gap-2"
                            >
                                <Edit2 size={14} /> Edit Profile
                            </button>
                        )}

                        {/*{activeTab === "kyc" && kyc?.status === "Approved" && (*/}
                        {/*    <button className="bg-[#0A1F44] border border-[#FF6A00]/30 text-[#FF6A00] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#FF6A00] hover:text-[#0A1F44] transition shadow-md">*/}
                        {/*        ↑ Upgrade To CSB-V*/}
                        {/*    </button>*/}
                        {/*)}*/}
                    </div>

                    {/* TAB 1: MY PROFILE */}
                    {activeTab === "profile" && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Basic Details Section */}
                            <section className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-widest border-b border-white/5 pb-2">Basic Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/20 p-5 rounded-2xl border border-white/5">
                                    <div className="col-span-1 text-gray-400 text-sm font-semibold">Name</div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-gray-500 block mb-1">Full Name</span>
                                        <span className="text-white font-bold text-base">{profileData.name || "-"}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Contact Details Section */}
                            <section className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-widest border-b border-white/5 pb-2">Contact Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/20 p-5 rounded-2xl border border-white/5 items-center">
                                    <div className="col-span-1 text-gray-400 text-sm font-semibold">Contact Info</div>
                                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <span className="text-[10px] text-gray-500 block mb-1">Phone Number</span>
                                            <div className="text-white font-bold">{profileData.mobileNumber || "Not Provided"}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 block mb-1">Email Address</span>
                                            <div className="text-white font-bold">{profileData.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Billing Details Section (Read-Only) */}
                            <section className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-widest border-b border-white/5 pb-2">Billing & Store Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/20 p-5 rounded-2xl border border-white/5">
                                    <div className="col-span-1 text-gray-400 text-sm font-semibold">Business Info</div>
                                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 uppercase font-bold">
                                                <FileText size={12} /> Company Name
                                            </span>
                                            <div className="text-white font-bold">{profileData.companyName || "N/A"}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 block mb-1">GST Registration Type</span>
                                            <div className="text-gray-300 font-bold">{profileData.gstType}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* TAB 2: KYC DETAILS */}
                    {activeTab === "kyc" && (
                        <div className="space-y-6 animate-fade-in">
                            {!kyc ? (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                                    <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
                                    <h3 className="text-amber-500 font-bold mb-1">KYC Not Submitted</h3>
                                    <p className="text-gray-400 text-xs">You have not submitted your business verification documents yet.</p>
                                </div>
                            ) : (
                                <>
                                    {kyc.rejectReason && kyc.status === "Rejected" && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex gap-3">
                                            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-red-500 text-sm font-bold">KYC Rejected by Auditor</h4>
                                                <p className="text-red-400 text-xs mt-1">{kyc.rejectReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-4">Business KYC Overview</h4>

                                    <div className="bg-black/20 rounded-2xl border border-white/5 divide-y divide-white/5">

                                        {/* Aadhar Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 items-center">
                                            <div className="text-gray-400 text-sm font-semibold">Aadhar ID</div>
                                            <div className="md:col-span-2">
                                                <span className="text-[10px] text-gray-500 block mb-0.5">Aadhar Reference</span>
                                                <div className="text-white font-mono text-sm tracking-widest">[Aadhaar Number Omitted]</div>
                                            </div>
                                            <div className="flex justify-end">
                                                {kyc.aadhaarCard ? (
                                                    <a href={`${baseKycUploadURL}${kyc.aadhaarCard}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold hover:underline bg-[#FF6A00]/10 px-3 py-1.5 rounded-lg border border-[#FF6A00]/20">
                                                        <Download size={14} /> View Document
                                                    </a>
                                                ) : <span className="text-xs text-gray-600 italic">Not Uploaded</span>}
                                            </div>
                                        </div>

                                        {/* GST Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 items-center">
                                            <div className="text-gray-400 text-sm font-semibold">GST Registration</div>
                                            <div className="md:col-span-2">
                                                <span className="text-[10px] text-gray-500 block mb-0.5">GSTIN Number</span>
                                                <div className="text-white font-mono text-sm tracking-wider">{profileData.gstType === "GST Registered" ? (kyc.taxId || "Registered") : "N/A (Non-GST)"}</div>
                                            </div>
                                            <div className="flex justify-end">
                                                {kyc.gstCertificate ? (
                                                    <a href={`${baseKycUploadURL}${kyc.gstCertificate}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold hover:underline bg-[#FF6A00]/10 px-3 py-1.5 rounded-lg border border-[#FF6A00]/20">
                                                        <Download size={14} /> View Certificate
                                                    </a>
                                                ) : <span className="text-xs text-gray-600 italic">Not Uploaded</span>}
                                            </div>
                                        </div>

                                        {/* PAN Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 items-center">
                                            <div className="text-gray-400 text-sm font-semibold">PAN Details</div>
                                            <div className="md:col-span-2">
                                                <span className="text-[10px] text-gray-500 block mb-0.5">PAN Number</span>
                                                <div className="text-white font-mono text-sm tracking-wider">
                                                    {kyc.taxId ? `XXXXX${kyc.taxId.slice(-4)}X` : "****"}
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                {kyc.panCard ? (
                                                    <a href={`${baseKycUploadURL}${kyc.panCard}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold hover:underline bg-[#FF6A00]/10 px-3 py-1.5 rounded-lg border border-[#FF6A00]/20">
                                                        <Download size={14} /> View PAN
                                                    </a>
                                                ) : <span className="text-xs text-gray-600 italic">Not Uploaded</span>}
                                            </div>
                                        </div>

                                        {/* Company/Address Proof */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 items-center">
                                            <div className="text-gray-400 text-sm font-semibold">Address Proof</div>
                                            <div className="md:col-span-2">
                                                <span className="text-[10px] text-gray-500 block mb-0.5">Document Type</span>
                                                <div className="text-white text-sm">Utility Bill / Lease Agreement</div>
                                            </div>
                                            <div className="flex justify-end">
                                                {kyc.addressProof || kyc.lightbill ? (
                                                    <a href={`${baseKycUploadURL}${kyc.addressProof || kyc.lightbill}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold hover:underline bg-[#FF6A00]/10 px-3 py-1.5 rounded-lg border border-[#FF6A00]/20">
                                                        <Download size={14} /> View Proof
                                                    </a>
                                                ) : <span className="text-xs text-gray-600 italic">Not Uploaded</span>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB 3: CHANGE PASSWORD */}
                    {activeTab === "password" && (
                        <div className="animate-fade-in max-w-md">
                            <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-widest border-b border-white/5 pb-2 mb-6">Update Security Credentials</h4>

                            <form className="space-y-4" onSubmit={handlePasswordChange}>
                                <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="w-full bg-[#FF6A00] text-[#0A1F44] font-extrabold py-3.5 rounded-xl text-xs hover:brightness-110 active:scale-95 transition mt-4 disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {isChangingPassword && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>}
                                    Update Password
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            <Transition appear show={isEditModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => !isSavingProfile && setIsEditModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-[#0A1F44] border border-[#FF6A00]/20 p-6 text-left align-middle shadow-2xl transition-all">
                                    <div className="flex justify-between items-center mb-5">
                                        <Dialog.Title as="h3" className="text-lg font-bold text-white flex items-center gap-2">
                                            <Edit2 size={18} className="text-[#FF6A00]" /> Edit Profile
                                        </Dialog.Title>
                                        <button onClick={() => setIsEditModalOpen(false)} disabled={isSavingProfile} className="text-gray-400 hover:text-white transition disabled:opacity-50">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 block mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 block mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 block mb-1">Mobile Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.mobileNumber}
                                                onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                                                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs transition"
                                            />
                                        </div>

                                        <div className="mt-8 flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition disabled:opacity-50"
                                                onClick={() => setIsEditModalOpen(false)}
                                                disabled={isSavingProfile}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 rounded-xl bg-[#FF6A00] text-[#0A1F44] px-4 py-3 text-xs font-extrabold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                                disabled={isSavingProfile}
                                            >
                                                {isSavingProfile && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>}
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Profile;