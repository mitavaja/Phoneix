import React, { useState } from 'react';
import { Calculator, DollarSign, Clock, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'DE', name: 'Germany' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'UAE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
];

export default function RateCalculator() {
  const [origin, setOrigin] = useState('CN');
  const [destination, setDestination] = useState('US');
  const [weight, setWeight] = useState(2.5);
  const [speed, setSpeed] = useState('express'); // 'express', 'standard', 'economy'

  // Dynamic pricing algorithm simulation
  const baseRate = speed === 'express' ? 18.5 : speed === 'standard' ? 12.0 : 7.5;
  const distFactor = origin === destination ? 1.0 : 2.4;
  const totalCost = (baseRate + weight * 4.2 * distFactor).toFixed(2);
  const legacyCost = (totalCost * 1.38).toFixed(2);
  const savings = (legacyCost - totalCost).toFixed(2);

  const transitDays = speed === 'express' ? '1 - 2 Days' : speed === 'standard' ? '3 - 5 Days' : '6 - 9 Days';

  return (
    <div id="rate-estimator" className="w-full glass-card rounded-2xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI FREIGHT ENGINE PREVIEW</span>
          </div>
          <h3 className="font-display font-bold text-2xl text-white">
            Instant Cross-Border Rate Estimator
          </h3>
          <p className="text-sm text-slate-400">
            Compare instant multi-courier rates powered by Phoenix AI Dynamic Routing.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <Zap className="w-4 h-4 fill-emerald-400" />
          <span>Save up to 38% vs Traditional Carriers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2 uppercase">Origin Country</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm focus:ring-2 focus:ring-cyan-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2 uppercase">Destination Country</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm focus:ring-2 focus:ring-cyan-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weight Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono text-slate-300 uppercase">Package Weight</label>
              <span className="font-mono font-bold text-cyan-300 text-sm">{weight} kg ({ (weight * 2.20462).toFixed(1) } lbs)</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="25"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>0.5 kg (Document)</span>
              <span>10 kg (Medium Box)</span>
              <span>25 kg (Freight Heavy)</span>
            </div>
          </div>

          {/* Speed Tier Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-2 uppercase">Service Priority</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSpeed('express')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  speed === 'express'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Air Priority</span>
                  {speed === 'express' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <span className="text-[10px] text-cyan-300 block font-mono mt-1">1-2 Days</span>
              </button>

              <button
                type="button"
                onClick={() => setSpeed('standard')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  speed === 'standard'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Standard Freight</span>
                  {speed === 'standard' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <span className="text-[10px] text-cyan-300 block font-mono mt-1">3-5 Days</span>
              </button>

              <button
                type="button"
                onClick={() => setSpeed('economy')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  speed === 'economy'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Ocean Saver</span>
                  {speed === 'economy' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <span className="text-[10px] text-cyan-300 block font-mono mt-1">6-9 Days</span>
              </button>
            </div>
          </div>

        </div>

        {/* Output Quote Summary Card */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-[#070d1e] border border-cyan-500/40 p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>ESTIMATED FREIGHT COST</span>
              <span className="text-cyan-400 font-bold">LIVE ALGORITHM</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
                ${totalCost}
              </span>
              <span className="text-sm font-mono text-slate-400 line-through">${legacyCost}</span>
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span>Savings: ${savings} USD</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800/80 pt-4 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Transit Time:</span>
              <span className="font-mono font-bold text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {transitDays}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Unified Courier API:</span>
              <span className="font-mono font-bold text-cyan-300">Included (FedEx/DHL/UPS)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Automated Duty Clearance:</span>
              <span className="font-mono text-emerald-400 font-bold">Included</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Cargo Insurance Protection:</span>
              <span className="font-mono text-white">$10,000 Included</span>
            </div>
          </div>

          <button
            onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <span>Lock In Founder Rates at Launch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
