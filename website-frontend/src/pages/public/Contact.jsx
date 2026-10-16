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
      title: "We're Here to Help",
      description: "Have a question about international shipping, documentation, customs, booking or an existing shipment? Contact the PHREIGHTS support team."
    },
    info: {
      email: "phoenixfreights@gmail.com",
      phone: "Monday–Saturday: 10:00 AM–6:00 PM IST",
      address: "Surat, Gujarat, India"
    },
    whatsapp: {
      buttonText: "Follow PHREIGHTS on WhatsApp",
      channelUrl: "https://whatsapp.com/channel/0029VbDi2MGI1rcrq6PGZO3t"
    }
  });

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const res = await API.get("/page-content/contact");
        if (res.data && res.data.sections) {
          setContactData(prev => ({
            ...prev,
            ...res.data.sections,
            whatsapp: res.data.sections.whatsapp || prev.whatsapp
          }));
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
    <div className="flex flex-col gap-12 pt-32 pb-20 bg-[#E5E7EB] text-[#0A1F44] min-h-screen px-6">

      {/* 🔥 HEADER */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-3 text-[#0A1F44]">
          {contactData.header.title}
        </h1>
        <p className="text-[#687280] leading-relaxed text-base">
          {contactData.header.description}
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 w-full items-start">

        {/* 📋 FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#687280]/20 rounded-2xl p-8 shadow-sm space-y-4"
        >
          <h2 className="text-xl font-bold text-[#0A1F44] mb-2">Send Us a Direct Message</h2>

          <div>
            <label className="block text-xs font-bold text-[#687280] uppercase tracking-wider mb-1.5">Your Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
              className="w-full p-3 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/20 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#687280] uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              className="w-full p-3 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/20 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#687280] uppercase tracking-wider mb-1.5">Your Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Describe your shipment query or support requirement..."
              rows="5"
              required
              className="w-full p-3 rounded-xl bg-[#E5E7EB]/30 border border-[#687280]/20 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF6A00] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 hover:shadow-lg hover:shadow-[#FF6A00]/25 transition duration-300 transform active:scale-[0.99]"
          >
            Send Message
          </button>
        </form>

        {/* 📍 CONTACT INFO & CHANNELS */}
        <div className="space-y-4">

          {/* Email */}
          <div className="bg-white border border-[#687280]/20 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00] shrink-0 font-bold">
              ✉
            </div>
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#687280]">Official Email</h3>
              <a href={`mailto:${contactData.info.email}`} className="text-base font-bold text-[#0A1F44] hover:text-[#FF6A00] transition">
                {contactData.info.email}
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white border border-[#687280]/20 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00] shrink-0 font-bold">
              🕒
            </div>
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#687280]">Support Hours</h3>
              <p className="text-base font-bold text-[#0A1F44]">{contactData.info.phone}</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-[#687280]/20 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00] shrink-0 font-bold">
              📍
            </div>
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#687280]">Location</h3>
              <p className="text-base font-bold text-[#0A1F44]">{contactData.info.address}</p>
            </div>
          </div>

          {/* Support Tickets Note */}
          <div className="bg-[#0A1F44] text-white p-5 rounded-2xl border border-white/10 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#FF6A00]">Account Support Tickets</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Logged-in customers can raise and track support tickets directly through their PHREIGHTS merchant portal.
            </p>
          </div>

          {/* WhatsApp Channel Button */}
          <div className="bg-emerald-50 border border-emerald-200/60 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💬</span>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Official WhatsApp Updates</h4>
                <p className="text-xs text-emerald-700">Stay updated on rate slabs, transit alerts and announcements</p>
              </div>
            </div>
            <a
              href={contactData.whatsapp?.channelUrl || "https://whatsapp.com/channel/0029VbDi2MGI1rcrq6PGZO3t"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-sm"
            >
              <span>{contactData.whatsapp?.buttonText || "Follow PHREIGHTS on WhatsApp"}</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.892-.472-1.603-.668-2.628-2.3-2.709-2.408-.08-.108-.654-.87-.654-1.659 0-.788.414-1.177.562-1.336.148-.159.324-.199.432-.199.108 0 .216.002.31.007.099.006.232-.038.363.277.135.324.464 1.135.505 1.218.041.083.068.181.013.29-.054.108-.082.176-.162.271-.08.095-.168.212-.241.285-.08.08-.163.167-.07.327.094.159.418.69 0.898 1.118.618.552 1.139.723 1.301.803.163.081.258.072.355-.041.096-.113.414-.482.525-.648.111-.167.222-.139.373-.083.152.055.961.453 1.127.536.166.083.277.125.318.194.041.069.041.403-.103.808z" />
              </svg>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Contact;