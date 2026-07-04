import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  const [menus, setMenus] = useState([]);
  const [footerData, setFooterData] = useState({
    brand: {
      description: "Smart global courier platform helping businesses deliver faster, cheaper, and with reliable international logistics."
    },
    contact: {
      email: "support@phreight.com",
      phone: "+91 98765 43210",
      address: "Global Headquarters, India"
    },
    copyright: {
      text: "Phreight International Courier Company. All rights reserved."
    }
  });

  useEffect(() => {
    fetchMenus();
    fetchFooterData();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await API.get("/menu");
      const footerMenus = res.data.filter((m) => m.position === "footer");
      setMenus(footerMenus);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFooterData = async () => {
    try {
      const res = await API.get("/page-content/footer");
      if (res.data && res.data.sections) {
        setFooterData(res.data.sections);
      }
    } catch (err) {
      console.warn("Failed to fetch dynamic footer data, using local fallbacks.", err);
    }
  };

  const defaultMenus = [
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Rate Calculator", path: "/rate" },
    { name: "Tracking", path: "/tracking" },
    { name: "Contact", path: "/contact" },
  ];

  const navItems = menus.length > 0 ? menus : defaultMenus;

  return (
    <footer className="bg-[#0A1F44] text-white pt-20 pb-8 border-t border-[#687280]/20">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">

        {/* 🔥 BRAND */}
        <div>
          <div className="mb-4">
            <Logo showText={true} theme="navy" size="md" />
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mt-4">
            {footerData.brand.description}
          </p>
        </div>

        {/* 🔗 QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#FF6A00]">Quick Links</h3>

          <div className="flex flex-col gap-3">
            {navItems.map((menu) => (
              <Link
                key={menu._id || menu.name}
                to={menu.path}
                className="text-gray-400 hover:text-white transition hover:translate-x-1"
              >
                {menu.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ⚖️ POLICIES */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#FF6A00]">Policies</h3>

          <div className="flex flex-col gap-2.5 text-sm">
            <Link to="/policies/privacy" className="text-gray-400 hover:text-white transition">
              Privacy Policy
            </Link>
            <Link to="/policies/terms" className="text-gray-400 hover:text-white transition">
              Terms & Conditions
            </Link>
            <Link to="/policies/shipping" className="text-gray-400 hover:text-white transition">
              Shipping Policy
            </Link>
            <Link to="/policies/refund" className="text-gray-400 hover:text-white transition">
              Refund & Cancellation Policy
            </Link>
            <Link to="/policies/claims" className="text-gray-400 hover:text-white transition">
              Claims & Compensation Policy
            </Link>
            <Link to="/policies/prohibited-items" className="text-gray-400 hover:text-white transition">
              Prohibited Items Policy
            </Link>
            <Link to="/policies/customs" className="text-gray-400 hover:text-white transition">
              Customs & Duties Policy
            </Link>
            <Link to="/policies/cookie" className="text-gray-400 hover:text-white transition">
              Cookie Policy
            </Link>
          </div>
        </div>

        {/* 📞 CONTACT */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#FF6A00]">Contact</h3>

          <div className="flex flex-col gap-3 text-gray-400 text-sm">

            <div className="flex items-center gap-2">
              <Mail size={16} /> {footerData.contact.email}
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} /> {footerData.contact.phone}
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} /> {footerData.contact.address}
            </div>

          </div>
        </div>

      </div>

      {/* 🔥 BOTTOM */}
      <div className="mt-16 pt-6 border-t border-[#687280]/20 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} {footerData.copyright.text}
      </div>

    </footer>
  );
};

export default Footer;