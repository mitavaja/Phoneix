import React from 'react';
import { 
  Radio, 
  Wallet, 
  Layers, 
  Code2, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight,
  Globe2,
  Cpu,
  Lock
} from 'lucide-react';

const FEATURES = [
  {
    id: 'live-tracking',
    icon: Radio,
    title: 'Live Tracking & Telemetry',
    category: 'REAL-TIME TELEMETRY',
    description: 'Sub-second GPS parcel updates, flight radar telemetry, and real-time webhook events across 190+ countries.',
    metrics: '99.99% Uptime SLA',
    highlight: 'GPS & Flight Radar',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'wallet',
    icon: Wallet,
    title: 'Multi-Currency Freight Wallet',
    category: 'FINANCIAL INFRASTRUCTURE',
    description: 'Instant automated settlements in USD, EUR, GBP, AED, SGD, and JPY with zero cross-border FX markup fees.',
    metrics: '140+ Currencies',
    highlight: 'Zero FX Markup',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'multi-courier',
    icon: Layers,
    title: 'Unified Multi-Courier Engine',
    category: 'LOGISTICS AGGREGATION',
    description: 'Access FedEx, DHL Express, UPS, Aramex, and regional last-mile fleets through one intelligent unified API portal.',
    metrics: '50+ Logistics Partners',
    highlight: 'Single API Key',
    color: 'from-cyan-400 to-teal-500'
  },
  {
    id: 'api-integration',
    icon: Code2,
    title: 'Developer REST & GraphQL API',
    category: 'ENTERPRISE INTEGRATION',
    description: 'Plug-and-play SDKs for Node.js, Python, PHP, Ruby, and Go with automated label generation and webhooks.',
    metrics: '< 45ms Latency',
    highlight: 'SDKs & Webhooks',
    color: 'from-indigo-500 to-cyan-500'
  },
  {
    id: 'fast-delivery',
    icon: Zap,
    title: 'AI Smart Dynamic Flight Routing',
    category: 'AI OPTIMIZATION',
    description: 'Self-learning algorithms dynamically reroute packages around weather delays, airport congestion, and customs bottlenecks.',
    metrics: '38% Faster Transit',
    highlight: 'AI Auto-Rerouting',
    color: 'from-sky-400 to-blue-600'
  },
  {
    id: 'secure-shipping',
    icon: ShieldCheck,
    title: 'Insured & Encrypted Cargo',
    category: 'SECURITY & COMPLIANCE',
    description: 'Full cargo insurance up to $50,000 per parcel with tamper-evident digital proof of delivery and SOC-2 compliance.',
    metrics: 'Up to $50k Coverage',
    highlight: 'Digital POD',
    color: 'from-emerald-400 to-teal-600'
  }
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-12 relative">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>ENTERPRISE LOGISTICS ARCHITECTURE</span>
        </div>

        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
          Built for High-Volume E-Commerce & Global Freight
        </h2>
        <p className="text-base text-slate-400">
          Phoenix Commerce eliminates international logistics friction with unified APIs, real-time telemetry, and AI route dispatch.
        </p>
      </div>

      {/* 6 Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => {
          const IconComponent = feature.icon;

          return (
            <div
              key={feature.id}
              className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top glowing line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.color} opacity-80`}></div>

              <div>
                {/* Header Badge & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all duration-300 shadow-md">
                    <IconComponent className="w-6 h-6 text-cyan-400 group-hover:rotate-6 transition-transform" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400/90 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/20 uppercase">
                    {feature.category}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-white group-hover:text-cyan-300 transition-colors mb-2.5 flex items-center justify-between">
                  <span>{feature.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-cyan-400" />
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Metrics Pill */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{feature.highlight}</span>
                <span className="font-bold text-cyan-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                  {feature.metrics}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
