import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const About = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const res = await API.get("/page-content/about");
        setData(res.data.sections);
      } catch (error) {
        console.warn("Using default static content because About API call failed", error);
      }
    };
    fetchAboutContent();
  }, []);

  return (
    <div className="flex flex-col gap-20 pt-32 pb-20 bg-[#E5E7EB] text-[#0A1F44]">

      {/* 🔥 HERO */}
      <section className="text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#0A1F44]">
          {data?.hero?.title || "About PHREIGHTS | International Shipping & Courier Solutions"}
        </h1>
        <p className="text-[#FF6A00] font-semibold text-lg md:text-xl max-w-2xl mx-auto">
          {data?.hero?.description || "Delivering Beyond Borders."}
        </p>
      </section>

      {/* 📦 ABOUT CONTENT */}
      <section className="px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-[#0A1F44]">
            {data?.whoWeAre?.title || "What PHREIGHTS Provides"}
          </h2>
          <p className="text-[#687280] leading-relaxed whitespace-pre-line text-sm md:text-base">
            {data?.whoWeAre?.description || "PHREIGHTS is an international shipping and courier platform operated by Phoenix Commerce, designed to simplify cross-border shipping for businesses and individuals.\n\nWe help customers ship internationally through a streamlined platform that combines shipment booking, pickup coordination, international transportation, tracking, customs assistance and customer support under one PHREIGHTS experience.\n\nOur technology-enabled platform connects customers with suitable logistics solutions while keeping the customer experience simple and transparent."}
          </p>
        </div>

        <div className="bg-white border border-[#687280]/20 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#FF6A00] mb-3">Key Solutions</h3>
          <p className="text-[#0A1F44] text-sm leading-loose whitespace-pre-line font-medium">
            {data?.whoWeAre?.points || `✔ International shipment booking\n✔ Door-to-door international shipping\n✔ Automated pickup allocation\n✔ Multiple international logistics solutions\n✔ Competitive shipment quotations\n✔ DDU and DDP service options\n✔ PHREIGHTS shipment tracking\n✔ Last-mile tracking\n✔ Customs documentation assistance\n✔ Shipment support\n✔ Wallet-based booking payments\n✔ Shipment protection for eligible loss scenarios`}
          </p>
        </div>
      </section>

      {/* 🎯 OUR APPROACH & BUSINESS DETAILS */}
      <section className="bg-white border border-[#687280]/20 py-16 px-6 rounded-3xl max-w-7xl mx-auto w-full shadow-sm">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

          <div className="bg-[#E5E7EB]/25 border border-[#687280]/20 p-8 rounded-2xl hover:shadow-md transition duration-300">
            <h3 className="text-2xl font-bold mb-4 text-[#FF6A00]">
              {data?.missionVision?.missionTitle || "Our Approach"}
            </h3>
            <p className="text-[#687280] leading-relaxed whitespace-pre-line text-sm md:text-base">
              {data?.missionVision?.missionDesc || "One platform. Multiple logistics possibilities. One PHREIGHTS experience.\n\nCustomers do not need to select individual underlying logistics partners during booking. PHREIGHTS determines the appropriate pickup and logistics routing based on available service options and operational requirements."}
            </p>
          </div>

          <div className="bg-[#E5E7EB]/25 border border-[#687280]/20 p-8 rounded-2xl hover:shadow-md transition duration-300">
            <h3 className="text-2xl font-bold mb-4 text-[#0A1F44]">
              {data?.missionVision?.visionTitle || "Business Details"}
            </h3>
            <p className="text-[#687280] leading-relaxed whitespace-pre-line text-sm md:text-base font-medium">
              {data?.missionVision?.visionDesc || "PHREIGHTS (Operated by Phoenix Commerce)\nRegistered Business Address: 2051, International Fashion Market, Opp. Raajmahal AC Mall, Sitanagar, Surat – 395010, Gujarat, India\nPublic Location: Surat, Gujarat, India\nGSTIN: 24DYHPA2082J1ZL | PAN: DYHPA2082J\nIEC: DYHPA2082J | AD Code: 01800J65600009"}
            </p>
          </div>

        </div>
      </section>

      {/* ⭐ WHY CHOOSE US */}
      <section className="px-6 text-center">
        <h2 className="text-3xl font-extrabold mb-10 text-[#0A1F44]">
          {data?.whyChooseUs?.title || "Why Choose PHREIGHTS"}
        </h2>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {(data?.whyChooseUs?.items || ["Door-to-Door Shipping", "Automated Pickup Allocation", "Full Last-Mile Tracking", "Wallet-Based Payments"]).map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#687280]/20 p-6 rounded-xl hover:scale-105 transition duration-300 font-bold text-[#0A1F44] shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* 📊 STATS */}
      <section className="bg-white border border-[#687280]/20 py-16 px-6 text-center rounded-3xl max-w-7xl mx-auto w-full shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {(data?.stats?.items || [
            { value: "10K+", label: "Shipments Delivered" },
            { value: "500+", label: "Active Merchants" },
            { value: "20+", label: "Destinations Covered" },
            { value: "99%", label: "Delivery Success" }
          ]).map((item, idx) => (
            <div key={idx}>
              <h2 className="text-4xl font-extrabold text-[#FF6A00] mb-2">{item.value}</h2>
              <p className="text-[#687280] font-semibold text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className="text-center px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#0A1F44]">
          {data?.cta?.title || "Customer Support & Hours"}
        </h2>
        <p className="text-[#687280] mb-8 max-w-2xl mx-auto leading-relaxed whitespace-pre-line text-sm md:text-base">
          {data?.cta?.description || "Monday–Saturday: 10:00 AM–6:00 PM IST | Email: phoenixfreights@gmail.com\nCustomers can also raise support tickets after logging into their PHREIGHTS account."}
        </p>

        <Link to="/register" className="bg-[#FF6A00] text-white px-8 py-3.5 rounded-xl font-bold hover:scale-105 hover:shadow-lg hover:shadow-[#FF6A00]/25 transition duration-300 inline-block">
          {data?.cta?.buttonText || "Start Shipping Now"}
        </Link>
      </section>

    </div>
  );
};

export default About;