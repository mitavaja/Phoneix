import React from 'react';
import Logo from './Logo';

export default function RefHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#040B1A]/90 backdrop-blur-xl border-b border-[#FF6A00]/20 py-2 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Official Brand Logo */}
        <a href="#" className="flex items-center group py-0.5 overflow-visible">
          <div className="transform scale-110 sm:scale-125 origin-left transition-transform duration-300">
            <Logo className="h-12 sm:h-15 lg:h-16 max-w-[260px] sm:max-w-[320px]" />
          </div>
        </a>

        {/* Unique Live Platform Status Pill Badge (No Notify button, no redirect) */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A1F44] border border-[#FF6A00]/40 text-xs font-mono text-[#FF6A00]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6A00]"></span>
          </span>
          <span className="font-bold text-white hidden sm:inline">PLATFORM STATUS:</span>
          <span>Q4 LAUNCH READY</span>
        </div>

      </div>
    </header>
  );
}
