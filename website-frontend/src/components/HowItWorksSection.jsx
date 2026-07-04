import React from "react";

const defaultSteps = [
  {
    step: "01",
    title: "Signup",
    desc: "Create your account and complete KYC verification",
  },
  {
    step: "02",
    title: "Add Wallet",
    desc: "Recharge your wallet to start shipping",
  },
  {
    step: "03",
    title: "Create Shipment",
    desc: "Enter shipment details and generate label",
  },
  {
    step: "04",
    title: "Track Delivery",
    desc: "Track your shipment in real-time",
  },
];

const HowItWorksSection = ({ data }) => {
  const title = data?.title || "How It Works";
  const description = data?.description || "Simple steps to start shipping with Phreight";
  const items = data?.items || defaultSteps;

  return (
    <section className="bg-[#E5E7EB] text-[#0A1F44] py-20 px-6 border-t border-[#687280]/20">

      <div className="max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold">
          {title}
        </h2>
        <p className="text-[#687280] mt-3">
          {description}
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto">

        {/* 🔥 Connecting Line (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-[#FF6A00]/10 via-[#FF6A00] to-[#FF6A00]/10"></div>

        <div className="grid md:grid-cols-4 gap-8 relative z-10">

          {items.map((item, index) => (
            <div
              key={index}
              className="group bg-white border border-[#687280]/20 rounded-xl p-6 text-center transition duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#FF6A00]/10"
            >

              {/* Step Number */}
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#FF6A00] text-white font-bold text-lg group-hover:scale-110 transition">
                {item.step}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-2 text-[#0A1F44]">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-[#687280] group-hover:text-[#0A1F44] transition">
                {item.desc}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default HowItWorksSection;