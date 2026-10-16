import React from "react";
import { Truck, Globe, Package, BarChart3, ShieldCheck, Zap, Wallet } from "lucide-react";

const iconMap = {
  Globe: <Globe size={32} />,
  Truck: <Truck size={32} />,
  BarChart3: <BarChart3 size={32} />,
  Package: <Package size={32} />,
  ShieldCheck: <ShieldCheck size={32} />,
  Zap: <Zap size={32} />,
  Wallet: <Wallet size={32} />
};

const defaultServices = [
  {
    title: "International Shipping",
    icon: "Globe",
  },
  {
    title: "Pickup Service",
    icon: "Truck",
  },
  {
    title: "Live Tracking",
    icon: "BarChart3",
  },
  {
    title: "Courier Aggregation",
    icon: "Package",
  },
];

const ServicesSection = ({ data }) => {
  const title = data?.title || "Our Services";
  const description = data?.description || "Powerful shipping solutions designed for modern businesses";
  const items = data?.items || defaultServices;

  return (
    <section className="bg-white text-[#0A1F44] py-20 px-6">

      <div className="max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold">
          {title}
        </h2>
        <p className="text-[#687280] mt-3">
          {description}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">

        {items.map((service, index) => (
          <div
            key={index}
            className="group relative bg-[#E5E7EB]/30 border border-[#687280]/20 rounded-xl p-6 text-center transition duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#FF6A00]/10 overflow-hidden"
          >

            {/* 🔥 Gradient Hover Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A00]/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

            {/* ICON */}
            <div className="mb-4 flex justify-center text-[#FF6A00] group-hover:scale-110 transition">
              {iconMap[service.icon] || <Globe size={32} />}
            </div>

            {/* TITLE */}
            <h3 className="text-lg font-semibold relative z-10 text-[#0A1F44]">
              {service.title}
            </h3>

          </div>
        ))}

      </div>

    </section>
  );
};

export default ServicesSection;