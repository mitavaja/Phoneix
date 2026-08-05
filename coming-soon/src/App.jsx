import React from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import RefHeader from './components/RefHeader';
import RefHero from './components/RefHero';
import RefFeatures from './components/RefFeatures';
import RefJourney from './components/RefJourney';
import RefPromise from './components/RefPromise';
import RefNewsletter from './components/RefNewsletter';
import RefFooter from './components/RefFooter';

export default function App() {
  return (
    <div className="min-h-screen bg-[#040B1A] text-slate-100 font-sans selection:bg-[#FF6A00] selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Animated Background */}
      <AnimatedBackground />

      {/* Top Navbar */}
      <RefHeader />

      {/* Main Section Content */}
      <main className="relative z-10 space-y-8">
        
        {/* Section 01: WELCOME (Hero + Interactive Live Telemetry Route Simulator) */}
        <RefHero />

        {/* Section 02: WHAT TO EXPECT (6 Feature Cards Grid) */}
        <RefFeatures />

        {/* Section 03: OUR JOURNEY (5 Steps Timeline with Expandable Details) */}
        <RefJourney />

        {/* Section 04: OUR PROMISE (Warehouse 3D + 3 Stats) */}
        <RefPromise />

        {/* Section 05: STAY TUNED (Newsletter Subscription + Confetti + Mail 3D) */}
        <RefNewsletter />

      </main>

      {/* Footer Bar */}
      <RefFooter />

    </div>
  );
}
