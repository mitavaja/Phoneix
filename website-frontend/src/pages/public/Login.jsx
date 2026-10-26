import React, { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { ArrowLeft, Mail, Lock, LogIn, ShieldAlert, Eye, EyeOff, KeyRound, CheckCircle2, Phone, XCircle } from "lucide-react";
import { isValidEmail } from "../../utils/validation";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!isValidEmail(forgotEmail.trim())) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    setForgotError("");
    setForgotLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email: forgotEmail.trim() });
      setForgotSuccess(res.data.message || "Verification code sent to your email.");
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to process forgot password request.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError("Please enter the 6-digit OTP received.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotError("");
    setForgotLoading(true);
    try {
      const res = await API.post("/auth/reset-password", {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword
      });
      alert(res.data.message || "Password reset successfully! Please log in with your new credentials.");
      setForm(prev => ({ ...prev, email: forgotEmail.trim(), password: "" }));
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail("");
      setForgotOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      // Save token
      localStorage.setItem("token", res.data.token);
      // Redirect
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0A1F44] text-white">
      {/* Left Side: Background & Content */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 h-full relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-[#0A1F44]/80 to-[#0A1F44]/40" />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Top: Logo & Back to Home */}
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer bg-[#0A1F44]/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-xl hover:border-[#FF6A00]/40 transition" 
              onClick={() => navigate("/")}
            >
              <Logo theme="navy" size="md" />
            </div>
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full backdrop-blur-md transition-all duration-300"
            >
              <ArrowLeft size={14} /> Back to Home
            </button>
          </div>

          {/* Middle: Rich Aesthetic Marketing Copy */}
          <div className="max-w-xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00] bg-[#FF6A00]/10 px-3.5 py-1.5 rounded-full border border-[#FF6A00]/20 w-fit block">
              Merchant Gateway
            </span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Global Logistics, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-orange-400">
                Simplified & Unified.
              </span>
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Access the ultimate multi-carrier shipping engine. Book local and international courier manifests, track global cargo shipments, and manage merchant ledgers from a single, high-performance console.
            </p>
          </div>

          {/* Bottom: Footer note */}
          <div className="text-xs text-gray-400 font-semibold tracking-wide">
            © {new Date().getFullYear()} Phreights Aggregator. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 h-full bg-[#071630] border-l border-[#687280]/20 flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          {/* Title and Header */}
          <div className="space-y-3">
            <div className="flex justify-center sm:justify-start mb-2">
              <div className="p-2.5 bg-[#0A1F44] rounded-2xl border border-white/10 shadow-lg inline-flex">
                <Logo theme="navy" size="md" className="justify-center" />
              </div>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Welcome back
            </h2>
            <p className="text-gray-400 text-sm">
              Log in to access your shipping dashboard and manage bookings.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl flex items-center gap-2.5 animate-shake">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-bold tracking-wider uppercase">
                  Portal Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Mail size={18} />
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

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-gray-400 font-bold tracking-wider uppercase">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(form.email || "");
                      setForgotError("");
                      setForgotSuccess("");
                      setForgotStep(1);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-[#FF6A00] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#0A1F44] border border-[#687280]/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF6A00] outline-none text-sm transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6A00] hover:bg-[#ff7b1a] text-[#0A1F44] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 shadow-lg shadow-[#FF6A00]/20"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#0A1F44] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Log In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Register Redirect */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-[#FF6A00] font-semibold cursor-pointer hover:underline"
              >
                Register Merchant Account
              </span>
            </p>
          </div>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#071630] border border-[#687280]/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <KeyRound size={20} className="text-[#FF6A00]" /> Reset Password
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-white">
                <XCircle size={22} />
              </button>
            </div>

            {forgotError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                <ShieldAlert size={15} className="shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-gray-300">
                  Enter your registered portal email address. We'll generate a 6-digit verification OTP to reset your password.
                </p>
                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-bold uppercase tracking-wider">
                    Registered Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      placeholder="merchant@store.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0A1F44] border border-[#687280]/30 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#FF6A00] text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                  <Phone size={13} className="text-[#FF6A00]" />
                  <span>Support Helpline: <a href="tel:+917698039174" className="text-[#FF6A00] underline font-bold">+91 76980 39174</a></span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-[#FF6A00] hover:bg-[#ff7b1a] text-[#0A1F44] font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-[#FF6A00]/20"
                  >
                    {forgotLoading ? "Sending OTP..." : "Generate Verification OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-gray-300">
                  Enter the 6-digit OTP code along with your new account password.
                </p>

                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-bold uppercase tracking-wider">
                    6-Digit Verification OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-[#0A1F44] border border-[#687280]/30 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#FF6A00] text-center font-mono font-bold tracking-widest text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold uppercase tracking-wider">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-[#0A1F44] border border-[#687280]/30 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#FF6A00] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold uppercase tracking-wider">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-[#0A1F44] border border-[#687280]/30 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#FF6A00] text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-[#FF6A00] hover:bg-[#ff7b1a] text-[#0A1F44] font-bold py-3 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-[#FF6A00]/20"
                  >
                    {forgotLoading ? "Resetting Password..." : "Confirm Password Reset"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl text-xs font-semibold"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;