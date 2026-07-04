import React, { useState, useEffect } from "react";
import HeroSection from "../../components/Hero";
import StatsSection from "../../components/Stats";
import ServicesSection from "../../components/ServicesSection";
import HowItWorksSection from "../../components/HowItWorksSection";
import RateCalculatorSection from "../../components/RateCalculatorSection";
import FeaturesSection from "../../components/FeaturesSection";
import DashboardPreviewSection from "../../components/DashboardPreviewSection";
import TestimonialsSection from "../../components/TestimonialsSection";
import CTASection from "../../components/CTASection";
import API from "../../services/api";

const Home = () => {
  const [data, setData] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const res = await API.get("/page-content/home");
        setData(res.data.sections);
      } catch (err) {
        console.warn("Using default static content because API call failed", err);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const res = await API.get("/testimonials");
        setTestimonials(res.data);
      } catch (err) {
        console.warn("Failed to fetch testimonials from database collection API", err);
      }
    };

    fetchHomeContent();
    fetchTestimonials();
  }, []);

  return (
    <div className="flex flex-col gap-12 pt-32 pb-20 bg-[#E5E7EB]">
      
      {/* 🔥 Hero Section */}
      <HeroSection data={data?.hero} />
      {/* 🔥 Stats Section */}
      <StatsSection data={data?.stats} />
      {/* 🔥 Services Section */}
      <ServicesSection data={data?.services} />
      {/* 🔥 How It Works Section */}
      <HowItWorksSection data={data?.howItWorks} />
      {/* 🔥 Rate Calculator Section */}
      <RateCalculatorSection data={data?.rateCalc} />
      {/* 🔥 Features Section */}
      <FeaturesSection data={data?.whyChoose} />
      {/* 🔥 Dashboard Preview Section */}
      <DashboardPreviewSection />
      {/* 🔥 Testimonials Section */}
      <TestimonialsSection data={testimonials.length > 0 ? { items: testimonials } : data?.testimonials} />
      {/* 🔥 CTA Section */}
      <CTASection data={data?.cta} />
    </div>
  );
};

export default Home;
