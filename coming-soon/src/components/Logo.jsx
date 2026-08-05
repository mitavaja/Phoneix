import React from 'react';

export default function Logo({ className = "h-10", showTagline = false }) {
  return (
    <div className="flex flex-col items-start">
      <img
        src="/images/phreights-logo.png"
        alt="PHREIGHTS - Delivering Beyond Borders"
        className={`${className} object-contain transition-transform hover:scale-105 duration-300 filter drop-shadow-[0_2px_10px_rgba(255,106,0,0.25)]`}
      />
    </div>
  );
}
