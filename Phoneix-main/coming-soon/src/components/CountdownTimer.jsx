import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CountdownTimer({ onOpenNewsletter }) {
  // Target Launch Date: November 15, 2026
  const TARGET_DATE = new Date('2026-11-15T00:00:00');

  const calculateTimeLeft = () => {
    const difference = +TARGET_DATE - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [calendarAdded, setCalendarAdded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCalendar = () => {
    setCalendarAdded(true);
    setTimeout(() => setCalendarAdded(false), 4000);
  };

  const timerItems = [
    { label: 'DAYS', value: String(timeLeft.days).padStart(3, '0') },
    { label: 'HOURS', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'MINUTES', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'SECONDS', value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <div className="w-full glass-card rounded-2xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Column: Headline & Status */}
        <div className="text-center lg:text-left space-y-2 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>PLATFORM DEPLOYMENT COUNTDOWN</span>
          </div>

          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Launching Phoenix Platform in
          </h3>
          <p className="text-sm text-slate-400">
            Our next-generation global courier engine is undergoing final stress tests across 190+ international transit hubs.
          </p>

          {/* Launch Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">System Readiness Status</span>
              <span className="text-cyan-400 font-bold">88.4% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-[1px]">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-400 transition-all duration-1000 shadow-[0_0_12px_#06b6d4]"
                style={{ width: '88.4%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Animated Digit Cards */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {timerItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative group">
                {/* Digit Container */}
                <div className="w-20 sm:w-24 h-24 sm:h-28 rounded-2xl bg-gradient-to-b from-slate-900 via-[#0a1128] to-slate-950 border border-cyan-500/30 shadow-xl flex items-center justify-center relative overflow-hidden backdrop-blur-xl">
                  {/* Top Gloss */}
                  <div className="absolute top-0 left-0 right-0 h-[50%] bg-white/[0.04] border-b border-white/5"></div>
                  
                  {/* Number Display */}
                  <span className="font-mono font-extrabold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-400 tracking-wider filter drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]">
                    {item.value}
                  </span>

                  {/* Corner Accent Dots */}
                  <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-cyan-400/40"></div>
                  <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-cyan-400/40"></div>
                </div>
              </div>

              <span className="mt-2 text-[11px] font-mono tracking-widest text-cyan-400/90 font-bold uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Footer Callout */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Official Public Launch Date: <strong className="text-white font-mono">November 15, 2026</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddToCalendar}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold text-slate-200 hover:text-white transition-all"
          >
            {calendarAdded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Launch Saved to Calendar!</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save Launch Date</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenNewsletter}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Notify Me First</span>
          </button>
        </div>
      </div>
    </div>
  );
}
