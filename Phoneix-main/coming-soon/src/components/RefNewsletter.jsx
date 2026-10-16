import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RefNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitted(true);
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#FF6A00', '#FFA04D', '#38BDF8', '#FF8C00']
    });
  };

  return (
    <section id="newsletter" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Form Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#0A1F44] border border-[#FF6A00]/40 text-xs font-mono font-bold text-[#FF6A00]">
              <span className="w-5 h-5 rounded-md bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center text-[10px]">05</span>
              <span>STAY TUNED</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Be the First to Know <br />
              When <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#38BDF8]">We Launch!</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
              Join our exclusive list and get early access, special offers and the latest updates.
            </p>

            {/* Email Form (100% Inline Interactive, No Redirects) */}
            {submitted ? (
              <div className="p-5 rounded-2xl bg-[#0A1F44] border border-[#FF6A00]/40 space-y-2 text-left animate-fadeIn max-w-md">
                <div className="flex items-center gap-2 text-[#FF6A00] font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>VIP Access Reserved!</span>
                </div>
                <p className="text-xs text-slate-300">
                  We will notify <strong className="text-[#FF6A00]">{email}</strong> as soon as <strong className="text-white">Phreights</strong> launches.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md pt-2 space-y-3">
                <div className="relative flex items-center p-1.5 rounded-full bg-[#0A1F44] border border-[#FF6A00]/40 shadow-2xl focus-within:border-[#FF6A00] transition-all">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent px-5 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] hover:from-[#E05D00] hover:to-[#FF6A00] text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shadow-lg shadow-[#FF6A00]/30 transition-all hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Reserve Access</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
                  <span>No spam, only important updates.</span>
                </div>
              </form>
            )}

          </div>

          {/* Right Visual: 3D Mail & Bell Illustration */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6A00] to-[#0A1F44] rounded-3xl blur-2xl opacity-40 group-hover:opacity-75 transition duration-1000"></div>
              
              <img
                src="/images/newsletter_bell_3d.png"
                alt="3D Mail Envelope and Bell Illustration"
                className="relative rounded-2xl border border-[#FF6A00]/30 shadow-2xl w-full object-cover animate-float"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
