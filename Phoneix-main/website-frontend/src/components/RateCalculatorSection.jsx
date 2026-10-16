import React from "react";

const RateCalculatorSection = ({ data }) => {
  const title = data?.title || "Calculate Shipping Cost Instantly";
  const description = data?.description || "Enter your shipment details and get the best courier rates instantly.";
  const points = data?.points || ["✔ Real-time pricing", "✔ Multiple courier options", "✔ Transparent charges"];

  return (
    <section className="bg-white text-[#0A1F44] py-20 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>

          <p className="text-[#687280] mb-6">
            {description}
          </p>

          <ul className="space-y-3 text-[#687280]">
            {points.map((pt, idx) => (
              <li key={idx}>
                {pt.startsWith("✔") ? pt : `✔ ${pt}`}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT FORM */}
        <div className="bg-white border border-[#687280]/20 rounded-2xl p-8 shadow-xl">

          <form className="space-y-4">

            {/* Weight */}
            <input
              type="text"
              placeholder="Weight (kg)"
              className="w-full p-3 rounded-lg bg-white border border-[#687280]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] transition text-[#0A1F44] placeholder-[#687280]/60"
            />

            {/* Country */}
            <input
              type="text"
              placeholder="Destination Country"
              className="w-full p-3 rounded-lg bg-white border border-[#687280]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] transition text-[#0A1F44] placeholder-[#687280]/60"
            />

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="L"
                className="p-3 rounded-lg bg-white border border-[#687280]/30 focus:ring-2 focus:ring-[#FF6A00] text-[#0A1F44] placeholder-[#687280]/60 focus:outline-none"
              />
              <input
                type="text"
                placeholder="W"
                className="p-3 rounded-lg bg-white border border-[#687280]/30 focus:ring-2 focus:ring-[#FF6A00] text-[#0A1F44] placeholder-[#687280]/60 focus:outline-none"
              />
              <input
                type="text"
                placeholder="H"
                className="p-3 rounded-lg bg-white border border-[#687280]/30 focus:ring-2 focus:ring-[#FF6A00] text-[#0A1F44] placeholder-[#687280]/60 focus:outline-none"
              />
            </div>

            {/* Button */}
            <button
              type="button"
              className="w-full bg-[#FF6A00] text-white font-bold py-3 rounded-lg transition duration-300 hover:scale-105 hover:shadow-lg hover:bg-orange-600"
            >
              Calculate Rate
            </button>

          </form>

        </div>

      </div>

    </section>
  );
};

export default RateCalculatorSection;