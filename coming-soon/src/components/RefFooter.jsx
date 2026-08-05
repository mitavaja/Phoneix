import React from 'react';
import Logo from './Logo';

export default function RefFooter() {
  return (
    <footer className="border-t border-[#FF6A00]/20 bg-[#040B1A] py-8 mt-12 text-xs text-slate-400 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <Logo className="h-10 sm:h-12 max-w-[200px]" />
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="text-slate-300">International Courier & Logistics Platform</span>
        </div>

        <div className="text-slate-400">
          © {new Date().getFullYear()} Phreights. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
