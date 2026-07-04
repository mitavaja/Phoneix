import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [contactData, setContactData] = useState({
    header: {
      title: "Contact Us",
      description: "Have questions? We are here to help you."
    },
    info: {
      email: "support@phreight.com",
      phone: "+91 98765 43210",
      address: "Global Headquarters, India"
    }
  });

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const res = await API.get("/page-content/contact");
        if (res.data && res.data.sections) {
          setContactData(res.data.sections);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic contact details, using local fallbacks.", err);
      }
    };
    fetchContactData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/contact", form);
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-20 pt-32 pb-20 bg-[#E5E7EB] text-[#0A1F44] min-h-screen px-6">

      {/* 🔥 HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">
          {contactData.header.title}
        </h1>
        <p className="text-[#687280]">
          {contactData.header.description}
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* 📋 FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#687280]/20 rounded-xl p-6 space-y-4"
        >

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="w-full p-3 rounded bg-white border border-[#687280]/20 focus:ring-2 focus:ring-[#FF6A00] outline-none"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="w-full p-3 rounded bg-white border border-[#687280]/20 focus:ring-2 focus:ring-[#FF6A00] outline-none"
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows="5"
            required
            className="w-full p-3 rounded bg-white border border-[#687280]/20 focus:ring-2 focus:ring-[#FF6A00] outline-none"
          />

          <button
            type="submit"
            className="w-full bg-[#FF6A00] text-[#0A1F44] font-bold py-3 rounded hover:scale-105 hover:bg-orange-600 transition"
          >
            Send Message
          </button>

        </form>

        {/* 📍 CONTACT INFO */}
        <div className="space-y-6">

          <div className="bg-white border border-[#687280]/20 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2 text-[#FF6A00]">Email</h3>
            <p className="text-[#687280]">{contactData.info.email}</p>
          </div>

          <div className="bg-white border border-[#687280]/20 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2 text-[#FF6A00]">Phone</h3>
            <p className="text-[#687280]">{contactData.info.phone}</p>
          </div>

          <div className="bg-white border border-[#687280]/20 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2 text-[#FF6A00]">Address</h3>
            <p className="text-[#687280]">{contactData.info.address}</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Contact;