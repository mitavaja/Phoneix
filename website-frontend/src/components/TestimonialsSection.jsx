import React from "react";
import { Star } from "lucide-react";

const defaultTestimonials = [
  {
    name: "Rahul Sharma",
    feedback: "Phreight made shipping super easy and affordable!",
  },
  {
    name: "Priya Patel",
    feedback: "Best platform for international shipping. Highly recommended!",
  },
  {
    name: "Amit Verma",
    feedback: "Smooth dashboard and fast pickup service. Loved it!",
  },
];

const TestimonialsSection = ({ data }) => {
  const title = data?.title || "What Our Clients Say";
  const description = data?.description || "Trusted by sellers across India";
  const items = data?.items || defaultTestimonials;

  return (
    <section className="bg-white text-[#0A1F44] py-20 px-6 border-t border-[#687280]/20">

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
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {items.map((item, index) => (
          <div
            key={index}
            className="group bg-white border border-[#687280]/20 rounded-xl p-6 transition duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#FF6A00]/10"
          >

            {/* Stars */}
            <div className="flex mb-3 text-amber-500">
              {[...Array(5)].map((_, i) => {
                const isFilled = i < (item.stars !== undefined ? item.stars : 5);
                return (
                  <Star 
                    key={i} 
                    size={18} 
                    fill={isFilled ? "currentColor" : "none"} 
                    stroke="currentColor"
                  />
                );
              })}
            </div>

            {/* Feedback */}
            <p className="text-[#687280] mb-4 group-hover:text-[#0A1F44] transition text-sm">
              "{item.description || item.feedback}"
            </p>

            {/* Name */}
            <h4 className="font-semibold text-[#0A1F44]">
              {item.name}
            </h4>

          </div>
        ))}

      </div>

    </section>
  );
};

export default TestimonialsSection;