import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Send, MessageSquare, Twitter, Linkedin, Github, Youtube, CheckCircle2 } from 'lucide-react';

const OFFICES = [
  {
    city: 'Delaware, USA',
    role: 'Global Headquarters & US Air Hub',
    address: '1209 North Orange St, Wilmington, DE 19801',
    phone: '+1 (800) 492-7012',
    email: 'us-hub@phoenixcommerce.io',
  },
  {
    city: 'London, United Kingdom',
    role: 'European Freight Gateway',
    address: '25 Bank Street, Canary Wharf, London E14 5JP',
    phone: '+44 20 7946 0912',
    email: 'eu-hub@phoenixcommerce.io',
  },
  {
    city: 'Singapore',
    role: 'Asia-Pacific Cargo Operations',
    address: '8 Marina Boulevard, Marina Bay Financial Centre, Singapore 018981',
    phone: '+65 6789 0123',
    email: 'apac-hub@phoenixcommerce.io',
  }
];

export default function ContactSocial() {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMessage('');
    }, 4000);
  };

  return (
    <section id="contact" className="py-12 relative">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>GLOBAL DIRECTORY & PARTNERSHIPS</span>
        </div>

        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
          Connect With Phoenix Commerce
        </h2>
        <p className="text-sm text-slate-400">
          Have enterprise custom logistics requirements or integration questions? Reach our launch team 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Office Locations (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span>International Logistics Hubs</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {OFFICES.map((off, idx) => (
              <div key={idx} className="glass-card rounded-xl p-4 border border-cyan-500/20 space-y-2 hover:border-cyan-500/40 transition-all">
                <div className="font-display font-bold text-white text-base">{off.city}</div>
                <div className="text-[11px] font-mono text-cyan-400">{off.role}</div>
                <p className="text-xs text-slate-400 leading-normal">{off.address}</p>
                <div className="pt-2 border-t border-slate-800 space-y-1 text-xs font-mono">
                  <a href={`tel:${off.phone}`} className="text-slate-300 hover:text-cyan-400 block">{off.phone}</a>
                  <a href={`mailto:${off.email}`} className="text-cyan-400 hover:underline block truncate">{off.email}</a>
                </div>
              </div>
            ))}
          </div>

          {/* Social Media Links */}
          <div className="pt-6">
            <h4 className="font-mono text-xs text-slate-400 uppercase mb-3">Join Our Logistics Community</h4>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all"
              >
                <Twitter className="w-4 h-4 text-cyan-400" />
                <span>Twitter / X</span>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all"
              >
                <Github className="w-4 h-4 text-slate-200" />
                <span>GitHub SDKs</span>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all"
              >
                <Youtube className="w-4 h-4 text-rose-500" />
                <span>Platform Demos</span>
              </a>
            </div>
          </div>

        </div>

        {/* Instant Inquiry Form (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-cyan-500/30 shadow-2xl">
          <h3 className="font-display font-bold text-xl text-white mb-1 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>Direct Inquiry</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Send a note directly to our enterprise solutions team.</p>

          {inquirySent ? (
            <div className="p-5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-center space-y-2 animate-fadeIn">
              <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Inquiry Delivered!</h4>
              <p className="text-xs text-slate-300">Our enterprise logistics team will reply within 2 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  placeholder="s.jenkins@acme-corp.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Message / Freight Volume</label>
                <textarea
                  required
                  rows="3"
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="We ship ~500 international parcels monthly..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
