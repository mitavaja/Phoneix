import React, { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { 
  Upload, User, Mail, Lock, Phone, Building, Briefcase, 
  FileText, ArrowLeft, ArrowRight, Check, ShieldAlert, FileCheck, Eye 
} from "lucide-react";

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    ownerName: "",
    mobileNumber: "",
    gstType: "Non-GST",
  });

  const [files, setFiles] = useState({
    panCard: null,
    aadhaarCard: null,
    gstCertificate: null,
    addressProof: null,
    companyRegistration: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!form.ownerName.trim()) return "Owner's Full Name is required.";
      if (!form.mobileNumber.trim()) return "Contact Mobile is required.";
      if (!form.email.trim()) return "Portal Email is required.";
      if (!form.password.trim()) return "Account Password is required.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
    }
    if (currentStep === 2) {
      if (!form.companyName.trim()) return "Store / Company Name is required.";
    }
    if (currentStep === 3) {
      if (!files.panCard) return "PAN Card file is required.";
      if (!files.aadhaarCard) return "Aadhaar Card file is required.";
      if (!files.addressProof) return "Address Proof file is required.";
      if (!files.companyRegistration) return "Company Registration file is required.";
    }
    return null;
  };

  const handleNext = () => {
    const stepError = validateStep(step);
    if (stepError) {
      setError(stepError);
      return;
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const stepError = validateStep(3); // Double-check KYC files
    if (stepError) {
      setError(stepError);
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      // Set name equal to ownerName before submitting
      const finalForm = { ...form, name: form.ownerName };

      Object.keys(finalForm).forEach((key) => {
        data.append(key, finalForm[key]);
      });

      Object.keys(files).forEach((key) => {
        if (files[key]) {
          data.append(key, files[key]);
        }
      });

      const res = await API.post("/auth/register", data);
      
      setSuccess(res.data.message || "Merchant account created! Awaiting compliance audit.");
      
      // Save token to localStorage so the merchant is auto-logged in
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Short delay for user to read success message before opening dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit merchant registration. Please try again.");
      setLoading(false);
    }
  };

  // Helper to render file upload status cards
  const FileUploadField = ({ label, field, required }) => {
    const file = files[field];
    return (
      <div className="space-y-1.5">
        <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">
          {label} {required && <span className="text-[#FF6A00]">*</span>}
        </span>
        <label className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
          file 
            ? "border-green-500/50 bg-green-500/5 text-white" 
            : "border-[#687280]/20 bg-[#0A1F44] hover:border-[#FF6A00]/50 hover:bg-[#FF6A00]/5 text-gray-400"
        }`}>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, field)}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {file ? (
            <FileCheck className="text-green-500 shrink-0" size={20} />
          ) : (
            <Upload className="text-[#FF6A00] shrink-0" size={20} />
          )}
          <div className="text-left overflow-hidden flex-1">
            <p className={`text-xs font-semibold truncate ${file ? "text-white" : "text-gray-400"}`}>
              {file ? file.name : "Select PDF or Image"}
            </p>
            {file && (
              <span className="text-[10px] text-gray-400 block font-medium">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
          </div>
          {file && (
            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">
              Uploaded
            </span>
          )}
        </label>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0A1F44] text-white">
      {/* Left Side: Background & Content */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 h-full relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-[#0A1F44]/85 to-[#0A1F44]/40" />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Top: Logo & Back to Home */}
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <Logo theme="dark" size="md" />
            </div>
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full backdrop-blur-md transition-all duration-300"
            >
              <ArrowLeft size={14} /> Back to Home
            </button>
          </div>

          {/* Middle: Marketing Copy */}
          <div className="max-w-md space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00] bg-[#FF6A00]/10 px-3.5 py-1.5 rounded-full border border-[#FF6A00]/20 w-fit block">
              Merchant Registration
            </span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Launch Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-orange-400">
                Store Integration.
              </span>
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Complete your verification details in 4 steps. Gain access to negotiated shipping rates, instant wallet top-ups, and auto-dispatch manifests across multiple courier networks.
            </p>
          </div>

          {/* Bottom */}
          <div className="text-xs text-gray-400 font-semibold tracking-wide">
            © {new Date().getFullYear()} Phreight Aggregator. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Step Wizard Form */}
      <div className="w-full md:w-1/2 lg:w-7/12 h-full bg-[#071630] border-l border-[#687280]/20 flex flex-col justify-between overflow-y-auto">
        
        {/* Wizard Header & Progress Bar */}
        <div className="px-6 sm:px-12 md:px-16 pt-8 pb-4 border-b border-[#687280]/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-white">Create Merchant Account</h2>
            <span className="text-xs text-gray-400 font-semibold">Step {step} of 4</span>
          </div>
          
          {/* Progress Circles */}
          <div className="relative flex items-center justify-between w-full">
            {/* Background progress track */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#0A1F44]" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#FF6A00] transition-all duration-500" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[
              { label: "Personal", number: 1 },
              { label: "Business", number: 2 },
              { label: "KYC Files", number: 3 },
              { label: "Review", number: 4 }
            ].map((s) => (
              <div key={s.number} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2 ${
                  step > s.number 
                    ? "bg-[#FF6A00] border-[#FF6A00] text-[#0A1F44]" 
                    : step === s.number
                      ? "bg-[#071630] border-[#FF6A00] text-[#FF6A00]" 
                      : "bg-[#0A1F44] border-[#687280]/20 text-gray-500"
                }`}>
                  {step > s.number ? <Check size={14} strokeWidth={3} /> : s.number}
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase mt-1.5 transition-colors duration-500 ${
                  step >= s.number ? "text-white" : "text-gray-500"
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Content */}
        <div className="flex-1 px-6 sm:px-12 md:px-16 py-8 flex items-center">
          <div className="w-full max-w-xl mx-auto space-y-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl flex items-center gap-2.5 animate-shake">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                <Check size={16} className="shrink-0 animate-bounce" />
                <span>{success}</span>
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Personal Details</h3>
                  <p className="text-xs text-gray-400">Please provide the primary owner contact profile information.</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Owner's Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        name="ownerName"
                        placeholder="John Doe"
                        value={form.ownerName}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A1F44] border border-[#687280]/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF6A00] outline-none text-sm transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Contact Mobile</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <Phone size={16} />
                      </span>
                      <input
                        type="text"
                        name="mobileNumber"
                        placeholder="+91 98765 43210"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A1F44] border border-[#687280]/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF6A00] outline-none text-sm transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Portal Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="merchant@store.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A1F44] border border-[#687280]/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF6A00] outline-none text-sm transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Account Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A1F44] border border-[#687280]/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF6A00] outline-none text-sm transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Business Details */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Business Details</h3>
                  <p className="text-xs text-gray-400">Configure company registration parameters for your dashboard ledger.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Store / Company Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Building size={16} />
                    </span>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Apex Logistics Ltd"
                      value={form.companyName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A1F44] border border-[#687280]/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF6A00] outline-none text-sm transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Tax GST Class Type</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Briefcase size={16} />
                    </span>
                    <select
                      name="gstType"
                      value={form.gstType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A1F44] border border-[#687280]/20 text-white focus:ring-2 focus:ring-[#FF6A00] outline-none text-sm transition-all duration-300 appearance-none"
                    >
                      <option value="Non-GST">Non-GST (Small Business / Exempt)</option>
                      <option value="GST Registered">GST Registered Partner</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: KYC Details */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">KYC Document Uploads</h3>
                  <p className="text-xs text-gray-400">Compliance uploads are verified during manual audit check.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FileUploadField label="PAN Card" field="panCard" required={true} />
                  <FileUploadField label="Aadhaar Card" field="aadhaarCard" required={true} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FileUploadField label="Address Proof" field="addressProof" required={true} />
                  <FileUploadField label="GST Certificate (Optional)" field="gstCertificate" required={false} />
                </div>

                <FileUploadField label="Company Registration" field="companyRegistration" required={true} />
              </div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                    Review Details
                  </h3>
                  <p className="text-xs text-gray-400">Review your parameters before launching the Merchant portal node.</p>
                </div>

                {/* Info Card Grid */}
                <div className="bg-[#0A1F44] border border-[#687280]/20 rounded-2xl p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Owner Name</span>
                      <span className="font-semibold text-white truncate block">{form.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Mobile</span>
                      <span className="font-semibold text-white truncate block">{form.mobileNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Portal Email</span>
                      <span className="font-semibold text-white truncate block">{form.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Password</span>
                      <span className="font-semibold text-gray-400 truncate block">••••••••</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Store Name</span>
                      <span className="font-semibold text-[#FF6A00] truncate block">{form.companyName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">GST Type</span>
                      <span className="font-semibold text-white truncate block">{form.gstType}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#687280]/20 pt-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-2">KYC Uploaded Files</span>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { label: "PAN Card", name: files.panCard?.name },
                        { label: "Aadhaar Card", name: files.aadhaarCard?.name },
                        { label: "Address Proof", name: files.addressProof?.name },
                        { label: "Company Reg.", name: files.companyRegistration?.name },
                        { label: "GST Cert.", name: files.gstCertificate?.name || "Not provided" }
                      ].map((file, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-[#071630] border border-[#687280]/15 px-3 py-2 rounded-xl text-gray-300">
                          <FileText size={12} className="text-[#FF6A00] shrink-0" />
                          <div className="overflow-hidden flex-1 leading-tight">
                            <span className="text-[9px] text-gray-500 block font-bold uppercase">{file.label}</span>
                            <span className="truncate block text-xs font-semibold text-white">{file.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 sm:px-12 md:px-16 py-6 border-t border-[#687280]/10 bg-[#071630]/50 shrink-0 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-[#0A1F44] border border-[#687280]/20 hover:border-[#687280]/40 px-5 py-3 rounded-xl transition"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div className="text-xs text-gray-400">
              Already registered?{" "}
              <span onClick={() => navigate("/login")} className="text-[#FF6A00] font-semibold cursor-pointer hover:underline">
                Log In
              </span>
            </div>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 text-xs font-bold text-[#0A1F44] bg-[#FF6A00] hover:bg-[#ff7b1a] px-6 py-3 rounded-xl transition shadow-lg shadow-[#FF6A00]/20"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-[#0A1F44] bg-[#FF6A00] hover:bg-[#ff7b1a] px-6 py-3 rounded-xl disabled:opacity-50 transition shadow-lg shadow-[#FF6A00]/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0A1F44] border-t-transparent rounded-full animate-spin"></span>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Submit & Open Dashboard</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Register;