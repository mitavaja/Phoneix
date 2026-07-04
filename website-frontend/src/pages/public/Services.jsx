import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Truck, BarChart3, Package, Check, ArrowRight } from "lucide-react";
import API from "../../services/api";

const renderIcon = (iconName) => {
  switch (iconName) {
    case "Globe": return <Globe size={32} />;
    case "Truck": return <Truck size={32} />;
    case "BarChart3": return <BarChart3 size={32} />;
    case "Package": return <Package size={32} />;
    default: return <Package size={32} />;
  }
};

const Services = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchServicesContent = async () => {
      try {
        const res = await API.get("/page-content/services");
        setData(res.data.sections);
      } catch (error) {
        console.warn("Using default static content because Services API call failed", error);
      }
    };
    fetchServicesContent();
  }, []);

  const defaultServices = [
    {
      title: "International Shipping",
      desc: "Ship your products globally with reliable courier partners.",
      icon: "Globe",
    },
    {
      title: "Pickup Service",
      desc: "Schedule pickups from your location with ease and convenience.",
      icon: "Truck",
    },
    {
      title: "Live Tracking",
      desc: "Track your shipments in real-time with accurate updates.",
      icon: "BarChart3",
    },
    {
      title: "Courier Aggregation",
      desc: "Access multiple courier services in one platform.",
      icon: "Package",
    },
  ];

  const servicesGridItems = data?.servicesGrid?.items || defaultServices;

  return (
    <div className="flex flex-col gap-20 pt-32 pb-20 bg-[#E5E7EB] text-[#0A1F44]">

      {/* 🔥 HERO */}
      <section className="text-center py-20 px-6 max-w-4xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {data?.hero?.title || "Our Services"}
        </h1>
        <p className="text-[#687280] max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {data?.hero?.description || "Explore powerful shipping solutions designed for modern businesses."}
        </p>
      </section>

      {/* 🚀 SERVICES GRID */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-4 gap-6">
          {servicesGridItems.map((item, index) => (
            <div
              key={index}
              className="group bg-white border border-[#687280]/20 rounded-2xl p-6 text-center transition duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#FF6A00]/10 flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-4">
                <div className="mb-4 text-[#FF6A00] flex justify-center group-hover:scale-110 transition duration-300">
                  {renderIcon(item.icon)}
                </div>

                <h3 className="text-lg font-bold text-[#0A1F44]">
                  {item.title}
                </h3>

                <p className="text-[#687280] text-sm leading-relaxed group-hover:text-[#0A1F44] transition duration-300">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 📦 FEATURES DETAIL */}
      <section className="bg-white border-t border-b border-[#687280]/20 py-20 px-6 w-full">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#FF6A00] leading-tight">
              {data?.featuresDetail?.title || "Powerful Shipping Platform"}
            </h2>
            <p className="text-[#687280] text-sm md:text-base leading-relaxed">
              {data?.featuresDetail?.description || "Phreight provides everything you need to manage shipping, calculate rates, track orders, and grow your business globally."}
            </p>
          </div>

          <div className="bg-[#E5E7EB]/30 border border-[#687280]/20 rounded-2xl p-6 md:p-8 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A1F44] border-b border-[#687280]/20 pb-2">Core Features Included</h4>
            <ul className="space-y-3.5">
              {(data?.featuresDetail?.points || [
                "Automated rate calculation",
                "Wallet-based payments",
                "Bulk shipment upload",
                "Label generation",
                "Real-time tracking"
              ]).map((pt, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm text-[#687280] font-medium">
                  <span className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 text-green-600">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 🧠 PROCESS */}
      <section className="py-16 px-6 text-center space-y-12 w-full max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1F44]">
          {data?.process?.title || "How Our Service Works"}
        </h2>

        <div className="relative">
          {/* Horizontal line for desktop, hidden on mobile */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-[#687280]/20 -translate-y-1/2"></div>
          
          <div className="grid md:grid-cols-4 gap-6 relative z-10">
            {(data?.process?.items || ["Signup", "Add Wallet", "Create Shipment", "Track Delivery"]).map((item, idx) => {
              const stepNumbers = ["01", "02", "03", "04"];
              const stepDescs = [
                "Create your account and complete simple KYC",
                "Top up your wallet with Razorpay instant credits",
                "Enter shipment details or upload in bulk",
                "Get real-time tracking updates until destination"
              ];
              return (
                <div 
                  key={idx} 
                  className="group bg-white border border-[#687280]/20 p-6 rounded-2xl transition duration-500 hover:scale-105 hover:shadow-xl space-y-4 flex flex-col justify-between min-h-[180px] text-center"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/25 text-[#FF6A00] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition duration-300">
                    {stepNumbers[idx] || (idx + 1).toString().padStart(2, "0")}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0A1F44]">{item}</h3>
                    <p className="text-xs text-[#687280] leading-relaxed">{stepDescs[idx] || "Our automated platform takes care of all logistics requirements."}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className="py-20 text-center px-6 w-full max-w-4xl mx-auto">
        <div className="space-y-6 bg-white border border-[#687280]/20 rounded-3xl p-10 md:p-16 shadow-xl relative overflow-hidden">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A1F44]">
              {data?.cta?.title || "Start Shipping Today"}
            </h2>
            <p className="text-[#687280] max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              {data?.cta?.description || "Join Phreight and scale your business globally."}
            </p>
          </div>

          <Link 
            to="/register" 
            className="bg-gradient-to-r from-[#FF6A00] to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold hover:scale-105 hover:brightness-110 active:scale-95 transition duration-300 inline-flex items-center gap-2 shadow-lg shadow-[#FF6A00]/25"
          >
            {data?.cta?.buttonText || "Get Started"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Services;