import React from 'react';

export default function AnimatedBackground() {
  // Generate floating particles
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 12 + 8,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.6 + 0.2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      
      {/* 1. Ambient Floating Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#FF6A00]/12 rounded-full blur-[150px] animate-float"></div>
      <div className="absolute top-[30%] right-[-10%] w-[700px] h-[700px] bg-[#0A1F44]/80 rounded-full blur-[180px] animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#38BDF8]/10 rounded-full blur-[160px] animate-float" style={{ animationDelay: '2.5s' }}></div>

      {/* 2. Animated Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#FF6A00]"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              boxShadow: '0 0 8px #FF6A00',
              animation: `particleFloat ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 3. Subtle Moving Scanning Beam */}
      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00]/30 to-transparent animate-scan"></div>

    </div>
  );
}
