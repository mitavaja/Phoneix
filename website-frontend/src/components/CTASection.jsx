import React from "react";
import { Link } from "react-router-dom";

const CTASection = ({ data }) => {
  return (
    <section className="relative bg-[#0A1F44] text-white py-20 px-6 overflow-hidden border-t border-[#687280]/20">

      {/* 🔥 Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF6A00]/10 via-transparent to-[#FF6A00]/10"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          {data?.title || "Ready to Scale Your Logistics?"}
        </h2>

        {/* Subtext */}
        <p className="text-gray-400 mb-8">
          {data?.description || "Join thousands of merchants using Phreight to automate their shipping pipeline."}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">

          {/* Primary CTA */}
          <Link to="/register" className="bg-[#FF6A00] text-white px-8 py-3 rounded-lg font-bold transition duration-300 hover:scale-105 hover:shadow-lg hover:bg-orange-600 inline-block">
            {data?.buttonText || "Create Free Account"}
          </Link>

          {/* Secondary CTA */}
          <Link to="/contact" className="border border-[#687280]/50 px-8 py-3 rounded-lg transition duration-300 hover:bg-white hover:text-black inline-block">
            Contact Us
          </Link>

        </div>

      </div>

    </section>
  );
};

export default CTASection;