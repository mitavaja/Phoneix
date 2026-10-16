import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import API from "../services/api";
import { isValidEmail } from "../utils/validation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/auth/login", { email, password });
      
      // Store token
      localStorage.setItem("token", res.data.token);
      
      // Navigate to admin dashboard
      navigate("/admin/cms/home");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Failed to connect to authentication server. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1F44] flex flex-col justify-center items-center relative p-4 overflow-hidden font-sans select-none">
      {/* Background glowing particles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6A00]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6A00]/10 rounded-full blur-3xl animate-pulse duration-10000"></div>

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-md bg-[#0F2756]/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-300">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent"></div>

        {/* Branding/Logo */}
        <div className="flex flex-col items-center mb-7 text-center">
          <div className="mb-3 p-2 bg-[#0A1F44]/60 rounded-2xl border border-white/10 shadow-inner flex justify-center">
            <Logo showText={true} theme="navy" size="md" className="justify-center" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">Phreight Control</h1>
          <p className="text-xs text-gray-400 mt-1.5 font-medium">Website Editor & Platform Administration</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2.5 animate-[fadeIn_0.3s_ease-out]">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@phreight.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pl-11 text-sm bg-black/25 border border-white/10 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-sans"
                required
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Secret Key Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pl-11 pr-12 text-sm bg-black/25 border border-white/10 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-sans"
                required
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-2.29c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FF6A00] hover:bg-orange-500 disabled:bg-[#FF6A00]/40 text-white font-extrabold rounded-xl transition-all shadow-[0_4px_20px_rgba(255,106,0,0.3)] hover:shadow-[0_4px_25px_rgba(255,106,0,0.45)] flex items-center justify-center gap-2 mt-2 text-sm active:scale-[0.99]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authorizing Node Entry...
              </>
            ) : (
              <>
                <span>Access Console</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Decorative branding info */}
        <div className="mt-8 border-t border-white/10 pt-5 text-center text-[10px] text-gray-400 font-mono tracking-wider">
          PHREIGHT LOGISTICS CORE GATEWAY
        </div>
      </div>
    </div>
  );
};

export default Login;
