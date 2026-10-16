import React, { useState } from 'react';
import { ArrowRight, Sparkles, Check, Globe2, ShieldCheck, Zap, Package, Plane } from 'lucide-react';
import LogisticsCanvas from './LogisticsCanvas';

export default function Hero({ onOpenNewsletter }) {
  const [quickEmail, setQuickEmail] = useState('');

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (quickEmail) {
      onOpenNewsletter(quickEmail);
    }
  };

  return (
    <section id="hero" className="pt-28 pb-12 relative overflow-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Hero Pitch Header */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-xl shadow-cyan-950/30 backdrop-blur-md animate-pulse-slow">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
            <span>REVOLUTIONIZING CROSS-BORDER LOGISTICS</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">Q4 2026 DEPLOYMENT</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1]">
            The Next-Gen Global <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 filter drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              Courier & Freight Infrastructure
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Phoenix Commerce connects international merchants, freight forwarders, and enterprises with real-time multi-courier APIs, AI-driven flight routing, and automated customs pre-clearance.
          </p>

          {/* Quick Hero Email Opt-in Bar */}
          <form onSubmit={handleQuickSubmit} className="max-w-md mx-auto pt-2">
            <div className="relative flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl group focus-within:border-cyan-400 transition-all">
              <Package className="w-5 h-5 text-cyan-400 ml-3 hidden sm:block" />
              <input
                type="email"
                required
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                placeholder="Enter work email for early access..."
                className="w-full bg-transparent px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shadow-lg shadow-cyan-500/25"
              >
                <span>Reserve VIP Spot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-3 font-mono">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> $500 Credit at Launch</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Instant Priority API</span>
            </div>
          </form>

        </div>

        {/* Hero Visual: Interactive Logistics Map Canvas */}
        <div className="pt-4">
          <LogisticsCanvas />
        </div>

        {/* Global Trust Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 text-center space-y-1">
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-cyan-300">190+</div>
            <div className="text-xs text-slate-400 font-medium">Countries & Territories Covered</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 text-center space-y-1">
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-emerald-400">99.99%</div>
            <div className="text-xs text-slate-400 font-medium">On-Time Transit Reliability</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 text-center space-y-1">
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-blue-400">50+</div>
            <div className="text-xs text-slate-400 font-medium">Unified Courier Partners</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 text-center space-y-1">
            <div className="font-mono font-extrabold text-2xl sm:text-3xl text-cyan-300">&lt; 45ms</div>
            <div className="text-xs text-slate-400 font-medium">API Response & Webhook Engine</div>
          </div>
        </div>

      </div>
    </section>
  );
}
