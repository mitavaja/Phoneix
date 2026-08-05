import React, { useState } from 'react';
import { Plane, CheckCircle2, ShieldCheck, Zap, ArrowRight, RefreshCw } from 'lucide-react';

const HERO_ROUTES = [
  {
    id: 'BOM-JFK',
    code: 'PH-8890-US',
    origin: 'Mumbai (BOM)',
    dest: 'New York (JFK)',
    time: '18.5 hrs',
    status: 'In Air Freight Transit',
    customs: 'Pre-Cleared',
    progress: 75,
  },
  {
    id: 'DEL-FRA',
    code: 'PH-4421-EU',
    origin: 'Delhi (DEL)',
    dest: 'Frankfurt (FRA)',
    time: '14.2 hrs',
    status: 'Loaded on Flight PH-202',
    customs: 'Cleared',
    progress: 90,
  },
  {
    id: 'BLR-SIN',
    code: 'PH-9012-APAC',
    origin: 'Bengaluru (BLR)',
    dest: 'Singapore (SIN)',
    time: '8.0 hrs',
    status: 'Dispatched to Air Terminal',
    customs: 'Manifest Verified',
    progress: 45,
  }
];

export default function RefHero() {
  const [activeRoute, setActiveRoute] = useState(HERO_ROUTES[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRouteSelect = (route) => {
    setIsRefreshing(true);
    setActiveRoute(route);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <section className="pt-24 sm:pt-28 pb-16 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#FF6A00]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Tag Badge 01 WELCOME */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#0A1F44] border border-[#FF6A00]/40 text-xs font-mono font-bold text-[#FF6A00]">
              <span className="w-5 h-5 rounded-md bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center text-[10px]">01</span>
              <span>WELCOME</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
              Something <br />
              Amazing is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FFA04D] to-[#38BDF8] filter drop-shadow-[0_0_20px_rgba(255,106,0,0.3)]">
                Coming Soon!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed font-normal">
              <strong className="text-white">Phreights</strong> is building India's next-generation courier and logistics platform that will redefine the way you ship, track and grow your business.
            </p>

            {/* UNIQUE INTERACTIVE FEATURE: Live Route & Telemetry Tester (No Notify Button, No Redirects) */}
            <div className="pt-2">
              <div className="ref-card rounded-2xl p-4 sm:p-5 space-y-4 border border-[#FF6A00]/30 max-w-lg">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <Plane className="w-4 h-4 text-[#FF6A00]" />
                    LIVE ROUTE TELEMETRY SIMULATOR
                  </span>
                  <span className="text-[#FF6A00] text-[11px] font-bold">CLICK TO TEST</span>
                </div>

                {/* 3 Interactive Route Selector Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {HERO_ROUTES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleRouteSelect(r)}
                      className={`p-2 rounded-xl text-center text-xs font-mono transition-all ${
                        activeRoute.id === r.id
                          ? 'bg-[#FF6A00] text-white font-bold shadow-lg shadow-[#FF6A00]/25'
                          : 'bg-[#0A1F44]/90 border border-slate-800 text-slate-300 hover:border-[#FF6A00]/40'
                      }`}
                    >
                      <div>{r.origin.split(' ')[0]}</div>
                      <div className="text-[10px] opacity-80">➔ {r.dest.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>

                {/* Dynamic Telemetry Info Box */}
                <div className="bg-[#0A1F44] rounded-xl p-3.5 border border-[#FF6A00]/20 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-white">{activeRoute.code}</span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {activeRoute.customs}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>{activeRoute.origin} ➔ {activeRoute.dest}</span>
                    <span className="font-mono text-[#FF6A00] font-bold">{activeRoute.time}</span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6A00] to-[#38BDF8] transition-all duration-500"
                        style={{ width: `${activeRoute.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Visual 3D Hero Illustration */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6A00] via-[#0A1F44] to-[#38BDF8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-75 transition duration-1000"></div>
              
              <img
                src="/images/hero_logistics_3d.png"
                alt="Phreights 3D Hero Illustration"
                className="relative rounded-2xl border border-[#FF6A00]/30 shadow-2xl w-full object-cover animate-float"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
