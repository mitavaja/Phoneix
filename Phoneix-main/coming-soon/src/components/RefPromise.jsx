import React from 'react';
import { ShieldCheck, Clock, Users } from 'lucide-react';

export default function RefPromise() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual: 3D Warehouse Illustration */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6A00] to-[#0A1F44] rounded-3xl blur-2xl opacity-40 group-hover:opacity-75 transition duration-1000"></div>
              
              <img
                src="/images/journey_warehouse_3d.png"
                alt="3D Warehouse Logistics Scene"
                className="relative rounded-2xl border border-[#FF6A00]/30 shadow-2xl w-full object-cover animate-float"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#0A1F44] border border-[#FF6A00]/40 text-xs font-mono font-bold text-[#FF6A00]">
              <span className="w-5 h-5 rounded-md bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center text-[10px]">04</span>
              <span>OUR PROMISE</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Reliable. Fast. Secure. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#38BDF8]">
                Every Time.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We promise to deliver not just parcels, but trust, speed and value that help your business grow globally.
            </p>

            {/* 3 Stat Cards */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              
              <div className="ref-card rounded-xl p-4 text-center space-y-1">
                <ShieldCheck className="w-6 h-6 text-[#FF6A00] mx-auto" />
                <div className="font-mono font-extrabold text-lg text-white">100%</div>
                <div className="text-[11px] font-medium text-slate-400">Secure</div>
              </div>

              <div className="ref-card rounded-xl p-4 text-center space-y-1">
                <Clock className="w-6 h-6 text-[#FF6A00] mx-auto" />
                <div className="font-mono font-extrabold text-lg text-white">24/7</div>
                <div className="text-[11px] font-medium text-slate-400">Support</div>
              </div>

              <div className="ref-card rounded-xl p-4 text-center space-y-1">
                <Users className="w-6 h-6 text-[#FF6A00] mx-auto" />
                <div className="font-mono font-extrabold text-lg text-white">10K+</div>
                <div className="text-[11px] font-medium text-slate-400">Happy Users</div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
