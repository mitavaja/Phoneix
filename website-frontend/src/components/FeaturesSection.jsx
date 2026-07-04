import React from "react";
import { ShieldCheck, Zap, Globe, Wallet } from "lucide-react";

const iconMap = {
  Wallet: <Wallet size={30} />,
  Zap: <Zap size={30} />,
  Globe: <Globe size={30} />,
  ShieldCheck: <ShieldCheck size={30} />,
};

const defaultFeatures = [
  {
    title: "Lowest Shipping Rates",
    desc: "Get unbeatable prices with smart rate optimization",
    icon: "Wallet",
  },
  {
    title: "Fast Pickup Service",
    desc: "Schedule pickups easily and save time",
    icon: "Zap",
  },
  {
    title: "Global Coverage",
    desc: "Ship to 20+ countries with reliable partners",
    icon: "Globe",
  },
  {
    title: "Secure & Trusted",
    desc: "Safe transactions with wallet protection",
    icon: "ShieldCheck",
  },
];

const FeaturesSection = ({ data }) => {
  const title = data?.title || "Why Choose Phreight";
  const description = data?.description || "Powerful features designed to simplify your shipping experience";
  const items = data?.items || defaultFeatures;

  return (
    <section className="bg-[#E5E7EB] text-[#0A1F44] py-20 px-6 border-t border-[#687280]/20">

      {/* Heading */}
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold">
          {title}
        </h2>
        <p className="text-[#687280] mt-3">
          {description}
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">

        {items.map((item, index) => (
          <div
            key={index}
            className="group relative bg-white border border-[#687280]/20 rounded-xl p-6 transition duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#FF6A00]/10 overflow-hidden"
          >

            {/* Gradient hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A00]/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

            {/* Icon */}
            <div className="mb-4 text-[#FF6A00] group-hover:scale-110 transition">
              {iconMap[item.icon] || <ShieldCheck size={30} />}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2 relative z-10 text-[#0A1F44]">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-[#687280] text-sm group-hover:text-[#0A1F44] transition relative z-10">
              {item.desc}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
};

export default FeaturesSection;