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
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {data?.hero?.title || "About Phreight International Courier Company"}
        </h1>
        <p className="text-[#687280] max-w-2xl mx-auto">
          {data?.hero?.description || "We are redefining international shipping and global logistics for modern businesses with fast, reliable, and cost-effective delivery solutions."}
        </p>
      </section>

      {/* 📦 ABOUT CONTENT */}
      <section className="px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">
            {data?.whoWeAre?.title || "Who We Are"}
          </h2>
          <p className="text-[#687280] leading-relaxed">
            {data?.whoWeAre?.description || "Phreight International Courier Company is a smart global shipping platform designed for sellers who want to scale globally. We integrate with top international logistics providers to deliver the best shipping experience with transparent pricing and fast, precise delivery."}
          </p>
        </div>

        <div className="bg-white border border-[#687280]/20 rounded-xl p-6">
          <p className="text-[#687280] leading-loose whitespace-pre-line">
            {data?.whoWeAre?.points || `✔ International Shipping & Global Courier\n✔ Automated Route & Tariff Calculation\n✔ Wallet-Based Secure Payment System\n✔ Real-Time GPS Tracking & Alerts`}
          </p>
        </div>
      </section>

      {/* 🎯 MISSION & VISION */}
      <section className="bg-white border border-[#687280]/20 py-16 px-6 rounded-3xl max-w-7xl mx-auto w-full">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

          <div className="bg-white border border-[#687280]/20 p-8 rounded-2xl hover:scale-105 transition duration-500">
            <h3 className="text-2xl font-semibold mb-4 text-[#FF6A00]">
              {data?.missionVision?.missionTitle || "Our Mission"}
            </h3>
            <p className="text-[#687280] leading-relaxed">
              {data?.missionVision?.missionDesc || "To simplify global shipping for businesses by providing affordable, fast, and highly reliable logistics and courier solutions."}
            </p>
          </div>

          <div className="bg-white border border-[#687280]/20 p-8 rounded-2xl hover:scale-105 transition duration-500">
            <h3 className="text-2xl font-semibold mb-4 text-[#FF6A00]">
              {data?.missionVision?.visionTitle || "Our Vision"}
            </h3>
            <p className="text-[#687280] leading-relaxed">
              {data?.missionVision?.visionDesc || "To become a leading global shipping and courier platform and empower every seller to go international seamlessly."}
            </p>
          </div>

        </div>
      </section>

      {/* ⭐ WHY CHOOSE US */}
      <section className="px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">
          {data?.whyChooseUs?.title || "Why Choose Us"}
        </h2>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {(data?.whyChooseUs?.items || ["Lowest Rates", "Fast Pickup", "Live Tracking", "Secure Wallet"]).map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#687280]/20 p-6 rounded-xl hover:scale-105 transition duration-300"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* 📊 STATS */}
      <section className="bg-white border border-[#687280]/20 py-16 px-6 text-center rounded-3xl max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {(data?.stats?.items || [
            { value: "10K+", label: "Shipments" },
            { value: "500+", label: "Sellers" },
            { value: "20+", label: "Countries" },
            { value: "99%", label: "Success Rate" }
          ]).map((item, idx) => (
            <div key={idx}>
              <h2 className="text-4xl font-bold text-[#FF6A00] mb-2">{item.value}</h2>
              <p className="text-[#687280] font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className="text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {data?.cta?.title || "Ready to Start Shipping?"}
        </h2>
        <p className="text-[#687280] mb-8">
          {data?.cta?.description || "Join Phreight International Courier Company and grow your business globally."}
        </p>

        <Link to="/register" className="bg-[#FF6A00] text-white px-8 py-3 rounded-lg font-bold hover:scale-105 hover:shadow-lg hover:bg-orange-600 transition duration-300 inline-block">
          {data?.cta?.buttonText || "Get Started"}
        </Link>
      </section>

    </div>
  );
};

export default About;