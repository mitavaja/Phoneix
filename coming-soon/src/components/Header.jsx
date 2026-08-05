import React, { useState, useEffect } from 'react';
import { Package, ArrowRight, Radio, Sparkles, Menu, X, ShieldCheck } from 'lucide-react';

export default function Header({ onOpenNewsletter }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#030712]/80 backdrop-blur-xl border-b border-cyan-500/20 py-3 shadow-2xl shadow-cyan-950/20' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/25 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#070d1e] rounded-[11px] flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"></div>
            </div>
            
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-1.5">
                PHOENIX <span className="text-cyan-400 font-extrabold">COMMERCE</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase -mt-1">
                Global Courier & Logistics
              </span>
            </div>
          </a>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-8 bg-slate-900/60 border border-slate-800 rounded-full px-6 py-2 backdrop-blur-md">
            <a href="#hero" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Overview
            </a>
            <a href="#tracking" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Live Tracking Preview
            </a>
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#rate-estimator" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Rate Calculator
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Contact
            </a>
          </nav>

          {/* Right Action CTA & Status */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>LAUNCHING Q4 2026</span>
            </div>

            <button 
              onClick={onOpenNewsletter}
              className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-xl transition-all duration-300 group-hover:opacity-90"></span>
              <span className="relative flex items-center gap-2 px-5 py-2.5 bg-[#0a1128] rounded-[11px] text-white transition-all duration-300 group-hover:bg-transparent">
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" />
                <span>Get Early Access</span>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button 
              onClick={onOpenNewsletter}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              Early Access
            </button>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a1128]/95 backdrop-blur-2xl border-b border-cyan-500/20 px-4 pt-4 pb-6 mt-3 animate-fadeIn">
          <div className="flex flex-col gap-4">
            <a 
              href="#hero" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-200 hover:text-cyan-400 py-2 border-b border-slate-800"
            >
              Overview
            </a>
            <a 
              href="#tracking" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-200 hover:text-cyan-400 py-2 border-b border-slate-800 flex items-center justify-between"
            >
              <span>Live Tracking Preview</span>
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">Interactive</span>
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-200 hover:text-cyan-400 py-2 border-b border-slate-800"
            >
              Features
            </a>
            <a 
              href="#rate-estimator" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-200 hover:text-cyan-400 py-2 border-b border-slate-800"
            >
              Rate Estimator
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-200 hover:text-cyan-400 py-2 border-b border-slate-800"
            >
              Contact Us
            </a>

            <div className="pt-2 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-xs font-mono text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Next-Gen Global Logistics Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
