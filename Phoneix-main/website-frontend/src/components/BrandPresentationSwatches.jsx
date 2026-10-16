import React from "react";

const BrandPresentationSwatches = () => {
  const swatches = [
    { name: "Midnight Blue", hex: "#0A1F44", textClass: "text-white" },
    { name: "Electric Orange", hex: "#FF6A00", textClass: "text-white" },
    { name: "Steel Gray", hex: "#687280", textClass: "text-white" },
    { name: "Ice Silver", hex: "#E5E7EB", textClass: "text-[#0A1F44]" },
    { name: "Pure White", hex: "#FFFFFF", textClass: "text-[#0A1F44]" },
  ];

  return (
    <div className="w-full bg-[#0A1F44] border-b border-[#687280]/20 pb-4">
      <div className="max-w-7xl mx-auto px-6 mb-2 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#FF6A00]">
        <span>Brand Identity Standards</span>
        <span>Corporate Palette Presentation</span>
      </div>
      <div className="w-full grid grid-cols-5 h-12 border-t border-b border-white/10">
        {swatches.map((swatch, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-1 h-full text-[8px] sm:text-xs select-none transition-all duration-300 hover:brightness-105"
            style={{ backgroundColor: swatch.hex }}
          >
            <span className={`font-bold uppercase tracking-wider ${swatch.textClass} opacity-90`}>
              {swatch.name}
            </span>
            <span className={`font-mono font-black ${swatch.textClass}`}>
              {swatch.hex}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandPresentationSwatches;
