import React from 'react';
import { Package, MapPin, Wallet, Truck, ShieldCheck, Globe } from 'lucide-react';

const FEATURES = [
  { id: 1, title: 'Fast Shipping', icon: Package, color: 'from-[#FF6A00] to-[#FFA04D]' },
  { id: 2, title: 'Live Tracking', icon: MapPin, color: 'from-[#38BDF8] to-[#0A1F44]' },
  { id: 3, title: 'Wallet System', icon: Wallet, color: 'from-[#FF6A00] to-[#0A1F44]' },
  { id: 4, title: 'Multi Courier', icon: Truck, color: 'from-[#0A1F44] to-[#FF6A00]' },
  { id: 5, title: 'Secure Payments', icon: ShieldCheck, color: 'from-[#38BDF8] to-[#FF6A00]' },
  { id: 6, title: 'International Shipping', icon: Globe, color: 'from-[#FF6A00] to-[#38BDF8]' },
];

export default function RefFeatures() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        
        {/* Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#0A1F44] border border-[#FF6A00]/40 text-xs font-mono font-bold text-[#FF6A00]">
            <span className="w-5 h-5 rounded-md bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center text-[10px]">02</span>
            <span>WHAT TO EXPECT</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Powerful Features <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#38BDF8]">
              Built for You
            </span>
          </h2>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;

            return (
              <div
                key={feat.id}
                className="ref-card ref-card-hover rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer"
              >
                {/* 3D Icon Container */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} p-[1px] shadow-lg shadow-[#FF6A00]/20 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full bg-[#0A1F44] rounded-[15px] flex items-center justify-center">
                    <Icon className="w-7 h-7 text-[#FF6A00] group-hover:rotate-6 transition-transform" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-[#FF6A00] transition-colors leading-tight">
                  {feat.title}
                </h3>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
