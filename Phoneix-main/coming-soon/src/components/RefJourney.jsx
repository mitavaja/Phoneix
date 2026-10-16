import React, { useState } from 'react';
import { Search, Code, Settings, Rocket, Gift, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { 
    id: '01', 
    title: 'Research', 
    icon: Search,
    detail: 'Surveyed 500+ Indian e-commerce merchants & freight forwarders to design zero-friction API workflows.' 
  },
  { 
    id: '02', 
    title: 'Development', 
    icon: Code,
    detail: 'Architected high-concurrency microservices with automated customs pre-clearance and multi-courier APIs.' 
  },
  { 
    id: '03', 
    title: 'Testing', 
    icon: Settings,
    detail: 'Stress-testing route latency, webhook delivery, and air cargo flight space booking algorithms.' 
  },
  { 
    id: '04', 
    title: 'Launching Soon', 
    icon: Rocket,
    detail: 'Preparing Q4 public onboarding for early-access merchants with zero platform fees.' 
  },
  { 
    id: '05', 
    title: 'Something Special', 
    icon: Gift,
    detail: 'Unlocking exclusive founder shipping credits and priority developer API endpoints at launch.' 
  },
];

export default function RefJourney() {
  const [activeStep, setActiveStep] = useState(STEPS[3]); // Default to Launching Soon

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#0A1F44] border border-[#FF6A00]/40 text-xs font-mono font-bold text-[#FF6A00]">
              <span className="w-5 h-5 rounded-md bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center text-[10px]">03</span>
              <span>OUR JOURNEY</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Building the Future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#38BDF8]">
                of Logistics
              </span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              We are working hard to bring you a seamless, smart and reliable platform that connects businesses and deliveries like never before.
            </p>

            {/* Interactive Selected Step Detail Box (No button, no redirect) */}
            <div className="p-4 rounded-xl bg-[#0A1F44] border border-[#FF6A00]/30 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF6A00] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>PHASE {activeStep.id}: {activeStep.title.toUpperCase()}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeStep.detail}
              </p>
            </div>
          </div>

          {/* Right Column: 5 Interactive Horizontal Step Timeline Nodes */}
          <div className="lg:col-span-7 relative">
            
            {/* Horizontal Line backdrop */}
            <div className="hidden sm:block absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#FF6A00]/20 via-[#FF6A00] to-[#FF6A00]/20 z-0"></div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isSelected = activeStep.id === step.id;

                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(step)}
                    className="flex flex-col items-center text-center space-y-3 group cursor-pointer"
                  >
                    
                    {/* Glowing Icon Orb */}
                    <div className={`w-14 h-14 rounded-2xl p-[1px] shadow-lg transition-transform duration-300 ${
                      isSelected
                        ? 'bg-[#FF6A00] shadow-[#FF6A00]/40 scale-110'
                        : 'bg-gradient-to-br from-[#FF6A00] via-[#FF8C00] to-[#0A1F44] shadow-[#FF6A00]/20 group-hover:scale-105'
                    }`}>
                      <div className="w-full h-full bg-[#0A1F44] rounded-[15px] flex items-center justify-center">
                        <Icon className={`w-6 h-6 transition-transform ${isSelected ? 'text-[#FF6A00] scale-110' : 'text-[#FF6A00] group-hover:rotate-12'}`} />
                      </div>
                    </div>

                    {/* Step Number Badge */}
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[#FF6A00]' : 'text-slate-400'}`}>
                      {step.id}
                    </span>

                    {/* Step Title */}
                    <span className={`font-display font-semibold text-xs transition-colors ${isSelected ? 'text-white font-bold' : 'text-slate-300 group-hover:text-[#FF6A00]'}`}>
                      {step.title}
                    </span>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
