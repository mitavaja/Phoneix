import React, { useState } from 'react';
import { Globe, Code2, Shield, Cpu, Terminal, ArrowRight, CheckCircle } from 'lucide-react';

export default function CompanyIntro() {
  const [activeTab, setActiveTab] = useState('architecture');

  return (
    <section className="py-12 relative">
      <div className="glass-card rounded-2xl p-6 sm:p-10 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-slate-800">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>NEXT-GEN LOGISTICS DISPATCH</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Reinventing Cross-Border Courier Infrastructure
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Traditional international courier networks rely on legacy mainframe EDI feeds, fragmented carrier APIs, and manual customs clearance delays. 
              <strong> Phoenix Commerce</strong> unifies global air, ocean, and last-mile freight into one real-time programmable API layer.
            </p>
          </div>

          {/* Key Stat Highlights Box */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="font-mono font-extrabold text-2xl sm:text-3xl text-cyan-400">190+</div>
              <div className="text-xs text-slate-400 font-medium">Countries & Territories</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="font-mono font-extrabold text-2xl sm:text-3xl text-emerald-400">50+</div>
              <div className="text-xs text-slate-400 font-medium">Global Carrier APIs</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="font-mono font-extrabold text-2xl sm:text-3xl text-cyan-400">&lt; 45ms</div>
              <div className="text-xs text-slate-400 font-medium">API Response Time</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="font-mono font-extrabold text-2xl sm:text-3xl text-blue-400">99.99%</div>
              <div className="text-xs text-slate-400 font-medium">Delivery Guarantee</div>
            </div>
          </div>
        </div>

        {/* Interactive Tabbed Content */}
        <div className="pt-8">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                activeTab === 'architecture'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Routing Architecture</span>
            </button>

            <button
              onClick={() => setActiveTab('developer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                activeTab === 'developer'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Developer SDK Example</span>
            </button>

            <button
              onClick={() => setActiveTab('customs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                activeTab === 'customs'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Automated Customs Clearance</span>
            </button>
          </div>

          {/* Tab 1: Architecture */}
          {activeTab === 'architecture' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-[#070d1e] p-5 rounded-xl border border-cyan-900/50 space-y-2">
                <div className="text-cyan-400 font-mono text-xs font-bold uppercase">Step 01</div>
                <h4 className="font-display font-bold text-white text-base">Smart Rate Engine</h4>
                <p className="text-xs text-slate-400">
                  Calculates real-time freight rates, volumetric weight discounts, and carrier flight space availability in milliseconds.
                </p>
              </div>

              <div className="bg-[#070d1e] p-5 rounded-xl border border-cyan-900/50 space-y-2">
                <div className="text-cyan-400 font-mono text-xs font-bold uppercase">Step 02</div>
                <h4 className="font-display font-bold text-white text-base">Automated Labeling</h4>
                <p className="text-xs text-slate-400">
                  Generates compliant IATA/ICAO air cargo barcodes, commercial invoices, and duty tax declarations automatically.
                </p>
              </div>

              <div className="bg-[#070d1e] p-5 rounded-xl border border-cyan-900/50 space-y-2">
                <div className="text-cyan-400 font-mono text-xs font-bold uppercase">Step 03</div>
                <h4 className="font-display font-bold text-white text-base">Live Webhook Radar</h4>
                <p className="text-xs text-slate-400">
                  Streams real-time package scan events to your e-commerce storefront or ERP via enterprise webhooks.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Developer Code Snippet */}
          {activeTab === 'developer' && (
            <div className="rounded-xl bg-[#04091a] border border-cyan-900/50 p-4 font-mono text-xs overflow-x-auto text-slate-300 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-2 text-cyan-400">
                  <Terminal className="w-4 h-4" />
                  phoenix-shipment.js (Node.js SDK)
                </span>
                <span className="text-emerald-400 font-bold">Phoenix API v1.4</span>
              </div>
              <pre className="text-slate-200">
{`import { PhoenixLogistics } from '@phoenix/sdk';

const phoenix = new PhoenixLogistics({ apiKey: process.env.PHOENIX_KEY });

// Create instant cross-border courier booking
const shipment = await phoenix.shipments.create({
  origin: { country: 'CN', city: 'Shanghai', airportCode: 'PVG' },
  destination: { country: 'US', city: 'New York', postalCode: '10001' },
  parcels: [{ weightKg: 4.8, lengthCm: 30, widthCm: 20, heightCm: 15 }],
  serviceTier: 'AIR_EXPRESS_PRIORITY',
  customsDeclaration: { hsCode: '8517.12', declaredValueUSD: 850 }
});

console.log(\`Tracking ID: \${shipment.trackingCode} | Carrier: \${shipment.assignedCarrier}\`);`}
              </pre>
            </div>
          )}

          {/* Tab 3: Automated Customs Clearance */}
          {activeTab === 'customs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <div className="bg-[#070d1e] p-5 rounded-xl border border-cyan-900/50 space-y-3">
                <h4 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Pre-Cleared Digital Manifests
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our system submits digital customs declarations to destination airport customs before the cargo plane even takes off, reducing port clearance times by over 70%.
                </p>
              </div>

              <div className="bg-[#070d1e] p-5 rounded-xl border border-cyan-900/50 space-y-3">
                <h4 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Automated Duty & Tariff Calculator
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Integrated HS-Code classification engine calculates landed costs, import VAT, and tariffs upfront to prevent surprise charges at the recipient's door.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
