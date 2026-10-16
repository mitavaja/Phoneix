import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Mail, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Gift, ShieldCheck, UserCheck } from 'lucide-react';

const ROLES = [
  { id: 'merchant', label: 'E-Commerce Merchant' },
  { id: 'enterprise', label: 'Enterprise Shipper' },
  { id: 'forwarder', label: 'Freight Forwarder' },
  { id: 'developer', label: 'API Developer' },
  { id: 'individual', label: 'Individual Shipper' },
];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('merchant');
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('phoenix_vip_email');
    if (saved) {
      setAlreadySubscribed(true);
      setEmail(saved);
    }
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#38bdf8', '#10b981']
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid business or personal email address.');
      setStatus('error');
      return;
    }

    setStatus('submitting');

    setTimeout(() => {
      setStatus('success');
      setAlreadySubscribed(true);
      localStorage.setItem('phoenix_vip_email', email);
      triggerConfetti();
    }, 800);
  };

  return (
    <section id="newsletter" className="py-12 relative">
      <div className="w-full glass-card rounded-2xl p-6 sm:p-10 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXCLUSIVE FOUNDER ACCESS</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
            Claim Your VIP Early Access & Founder Perks
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join 12,000+ merchants and freight forwarders awaiting launch. Early subscribers receive priority onboarding, 
            <strong className="text-cyan-300"> $500 in free freight credits</strong>, and zero platform fee for 6 months.
          </p>

          {/* Role Selector Tabs */}
          <div className="pt-2">
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Select Your Shipping Role</label>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedRole === r.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          {status === 'success' || alreadySubscribed ? (
            <div className="p-6 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 space-y-3 animate-fadeIn max-w-lg mx-auto mt-6">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">VIP Registration Confirmed!</h3>
              <p className="text-xs text-slate-300">
                You're on the priority launch queue as a <strong className="text-cyan-300 font-mono">{ROLES.find(r => r.id === selectedRole)?.label}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-cyan-300">
                Registered Email: <span className="text-white font-bold">{email}</span>
              </div>
              <button
                onClick={() => {
                  setAlreadySubscribed(false);
                  setStatus('idle');
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 underline pt-2"
              >
                Register another email address
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-6 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email address..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-white text-sm placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                >
                  {status === 'submitting' ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Get VIP Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          )}

          {/* Perks Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-4 h-4 text-cyan-400" />
              <span>$500 Freight Launch Credit</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Priority API Rate Limit</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Zero Spam Guarantee</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
