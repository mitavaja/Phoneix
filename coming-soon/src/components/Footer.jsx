import React from 'react';
import { Package, ShieldCheck, CheckCircle2, Lock, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 border-t border-cyan-500/20 bg-[#02050e] py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-[#070d1e] rounded-[7px] flex items-center justify-center">
                <Package className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-white text-base tracking-tight">PHOENIX COMMERCE</span>
              <span className="text-[10px] font-mono text-slate-400 block">International Courier Infrastructure Platform</span>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Global API & Dispatch Engine: 100% Operational</span>
          </div>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition-all"
            title="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Security & Compliance Badges */}
        <div className="py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 border-b border-slate-800/60 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              SOC-2 Type II Certified
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-4 h-4 text-cyan-400" />
              ISO 27001 Security Compliant
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              GDPR & CCPA Ready
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors">Carrier Agreement</a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 text-center text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} Phoenix Commerce Inc. All rights reserved. Registered trademark of global courier infrastructure.
        </div>

      </div>
    </footer>
  );
}
