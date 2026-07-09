import React, { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { ArrowLeft, Mail, Lock, LogIn, ShieldAlert, Eye, EyeOff } from "lucide-react";
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
            © {new Date().getFullYear()} Phreight Aggregator. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 h-full bg-[#071630] border-l border-[#687280]/20 flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          {/* Title and Header */}
          <div className="space-y-2">
            {/* Show logo on mobile only */}
            <div className="md:hidden flex justify-center mb-6">
              <Logo theme="dark" size="md" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
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
                <label className="text-xs text-gray-400 block mb-1.5 font-bold tracking-wider uppercase">
                  Account Password
                </label>
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
    </div>
  );
};

export default Login;