import React, { useEffect, useState } from "react";

const StatCard = ({ number, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(number);

    if (start === end) return;

    let duration = 1500;
    let incrementTime = Math.floor(duration / end);

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <div className="group bg-white border border-[#687280]/20 rounded-xl p-6 text-center transition duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#FF6A00]/10">

      <h2 className="text-3xl md:text-4xl font-bold text-[#FF6A00] mb-2">
        {count}+
      </h2>

      <p className="text-[#687280] group-hover:text-[#0A1F44] transition">
        {label}
      </p>
    </div>
  );
};

const StatsSection = ({ data }) => {
  const defaultItems = [
    { value: "10000", label: "Shipments Delivered" },
    { value: "500", label: "Active Sellers" },
    { value: "20", label: "Countries Covered" },
    { value: "99", label: "Success Rate %" }
  ];

  const items = data?.items || defaultItems;

  return (
    <section className="bg-[#E5E7EB] text-[#0A1F44] py-20 px-6">

      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">
          {data?.title || "Trusted by Thousands of Sellers"}
        </h2>
        <p className="text-[#687280] mt-2">
          {data?.description || "Our platform is growing fast with reliable shipping services"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {items.map((item, idx) => (
          <StatCard key={idx} number={item.value} label={item.label} />
        ))}
      </div>

    </section>
  );
};

export default StatsSection;