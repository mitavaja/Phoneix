import React, { useState } from 'react';
import { Plane, Truck, Ship, Navigation, Globe, Shield, Activity, Zap, MapPin } from 'lucide-react';

const HUBS = [
  { id: 'shanghai', name: 'Shanghai Gateway Hub', country: 'China', coords: { x: 80, y: 44 }, code: 'PVG', status: 'ACTIVE', load: '99.4%' },
  { id: 'dubai', name: 'Dubai Central Air Cargo', country: 'UAE', coords: { x: 62, y: 47 }, code: 'DXB', status: 'ACTIVE', load: '98.1%' },
  { id: 'frankfurt', name: 'Frankfurt Europort Hub', country: 'Germany', coords: { x: 50, y: 32 }, code: 'FRA', status: 'ACTIVE', load: '99.8%' },
  { id: 'london', name: 'London Heathrow Gateway', country: 'UK', coords: { x: 46, y: 30 }, code: 'LHR', status: 'ACTIVE', load: '97.6%' },
  { id: 'newyork', name: 'New York JFK Hub', country: 'USA', coords: { x: 28, y: 36 }, code: 'JFK', status: 'ACTIVE', load: '99.2%' },
  { id: 'tokyo', name: 'Tokyo Haneda Air Port', country: 'Japan', coords: { x: 86, y: 41 }, code: 'HND', status: 'ACTIVE', load: '98.9%' },
  { id: 'singapore', name: 'Singapore Changi Cargo', country: 'Singapore', coords: { x: 77, y: 58 }, code: 'SIN', status: 'ACTIVE', load: '99.9%' }
];

const FLIGHT_ROUTES = [
  { from: 'shanghai', to: 'dubai', delay: '0s', d: 'M 800 220 Q 710 210 620 235' },
  { from: 'dubai', to: 'frankfurt', delay: '1s', d: 'M 620 235 Q 560 180 500 160' },
  { from: 'frankfurt', to: 'london', delay: '2s', d: 'M 500 160 Q 480 150 460 150' },
  { from: 'london', to: 'newyork', delay: '0.5s', d: 'M 460 150 Q 370 140 280 180' },
  { from: 'shanghai', to: 'tokyo', delay: '1.5s', d: 'M 800 220 Q 830 215 860 205' },
  { from: 'singapore', to: 'dubai', delay: '2.2s', d: 'M 770 290 Q 700 280 620 235' },
];

export default function LogisticsCanvas() {
  const [selectedHub, setSelectedHub] = useState(HUBS[0]);
  const [activeTab, setActiveTab] = useState('flight'); // 'flight', 'ocean', 'road'

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-cyan-500/30 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-cyan-950/40">
      
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
              Global Parcel Transit Radar
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                LIVE TELEMETRY
              </span>
            </h3>
            <p className="text-xs text-slate-400">Interactive cross-border courier routing & air space mapping</p>
          </div>
        </div>

        {/* Transport Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('flight')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'flight' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Air Express</span>
          </button>
          <button
            onClick={() => setActiveTab('ocean')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ocean' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Ocean Freight</span>
          </button>
          <button
            onClick={() => setActiveTab('road')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'road' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Overland Hubs</span>
          </button>
        </div>
      </div>

      {/* Main Map Visual Container */}
      <div className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] my-4 rounded-xl bg-[#04091a] border border-cyan-900/40 overflow-hidden group">
        
        {/* Subtle Map Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-radial from-cyan-900/10 via-transparent to-[#04091a]"></div>

        {/* SVG Route Canvas */}
        <svg className="w-full h-full text-cyan-500" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Continents Vector Outline Background */}
          <path
            d="M150 120 Q 200 100 250 140 Q 300 220 220 280 Q 140 240 150 120 Z 
               M450 100 Q 520 80 580 120 Q 550 200 480 220 Q 420 180 450 100 Z 
               M650 120 Q 820 90 900 160 Q 850 300 750 320 Q 640 260 650 120 Z 
               M750 350 Q 880 340 920 400 Q 840 450 760 420 Z"
            fill="rgba(15, 23, 42, 0.6)"
            stroke="rgba(59, 130, 246, 0.15)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Animated Flight Path Lines */}
          {FLIGHT_ROUTES.map((route, idx) => (
            <g key={idx}>
              {/* Glow backdrop path */}
              <path
                d={route.d}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="opacity-70"
              />

              {/* Moving Pulse Bullet along path */}
              <circle r="4" fill="#06b6d4" filter="url(#glow)">
                <animateMotion
                  path={route.d}
                  dur="4s"
                  repeatCount="indefinite"
                  begin={route.delay}
                />
              </circle>

              {/* Additional plane indicator */}
              <g filter="url(#glow)">
                <animateMotion
                  path={route.d}
                  dur="7s"
                  repeatCount="indefinite"
                  begin={route.delay}
                  rotate="auto"
                />
                <polygon points="-5,-3 8,0 -5,3 -2,0" fill="#38bdf8" />
              </g>
            </g>
          ))}

          {/* Interactive Hub Node Dots */}
          {HUBS.map((hub) => {
            const isSelected = selectedHub.id === hub.id;
            const cx = (hub.coords.x / 100) * 1000;
            const cy = (hub.coords.y / 100) * 500;

            return (
              <g
                key={hub.id}
                className="cursor-pointer group/node"
                onClick={() => setSelectedHub(hub)}
              >
                {/* Radar Ring animation */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? "18" : "12"}
                  className={`transition-all duration-300 ${isSelected ? 'fill-cyan-500/20 stroke-cyan-400' : 'fill-blue-500/10 stroke-blue-500/30 group-hover/node:stroke-cyan-400'}`}
                  strokeWidth="1.5"
                >
                  <animate
                    attributeName="r"
                    values={isSelected ? "14;22;14" : "10;16;10"}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Inner Core Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  className={isSelected ? 'fill-cyan-300 filter drop-shadow-[0_0_8px_#06b6d4]' : 'fill-blue-500 group-hover/node:fill-cyan-400'}
                />

                {/* Hub Label Badge */}
                <text
                  x={cx}
                  y={cy - 16}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-bold tracking-wider ${
                    isSelected ? 'fill-cyan-300' : 'fill-slate-400 group-hover/node:fill-white'
                  }`}
                >
                  {hub.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Realtime Moving Stats Overlay Box */}
        <div className="absolute top-4 left-4 glass-panel rounded-xl p-3 border border-cyan-500/30 max-w-[200px] sm:max-w-xs text-xs space-y-1.5 hidden sm:block">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-semibold">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>GLOBAL DISPATCH ENGINE</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Active Cargo Flights:</span>
            <span className="font-mono text-cyan-300 font-bold">1,842</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Customs Clearance:</span>
            <span className="font-mono text-emerald-400 font-bold">99.87%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Avg Air Transit:</span>
            <span className="font-mono text-cyan-300 font-bold">18.4 hrs</span>
          </div>
        </div>

        {/* Selected Hub Floating Drawer Tooltip */}
        <div className="absolute bottom-4 right-4 sm:right-6 glass-panel rounded-xl p-4 border border-cyan-500/40 shadow-2xl max-w-[280px] sm:max-w-xs w-full animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              Selected Gateway
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
              {selectedHub.status}
            </span>
          </div>

          <h4 className="font-display font-bold text-white text-base leading-tight">
            {selectedHub.name}
          </h4>
          <p className="text-xs text-slate-400 mb-3">{selectedHub.country} • Airport Code: <span className="font-mono text-cyan-300 font-bold">{selectedHub.code}</span></p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Node Capacity</div>
              <div className="font-mono font-bold text-cyan-300 text-sm">{selectedHub.load}</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Dispatch Speed</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">Ultra Fast</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hub Cards Carousel Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
        {HUBS.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHub(h)}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedHub.id === h.id
                ? 'bg-cyan-950/60 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
              <span>{h.code}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedHub.id === h.id ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`}></span>
            </div>
            <div className="text-xs text-white font-medium truncate mt-0.5">{h.name.split(' ')[0]}</div>
          </button>
        ))}
      </div>

    </div>
  );
}
