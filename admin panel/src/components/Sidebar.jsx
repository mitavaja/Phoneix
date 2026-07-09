import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

const Sidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("legal");

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  const isActive = (path) => location.pathname === path;

  // Premium design styling tokens
  const baseItemClass = "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 font-medium text-sm border border-transparent";
  const activeClass = "bg-white/5 text-[#FF6A00] border-[#FF6A00]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_12px_rgba(255,106,0,0.08)] transform translate-x-1 font-semibold";
  const inactiveClass = "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1";

  // Reusable custom premium SVGs (zero dependencies, glowing gradients)
  const icons = {
    header: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM4 13h16M4 17h16" />
      </svg>
    ),
    home: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    about: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    services: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    contact: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    footer: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    legal: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    testimonial: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.564-.371-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
      </svg>
    ),
    inquire: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    logout: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
      </svg>
    ),
  };

  const isLegalActive = () => {
    const paths = [
      "/admin/cms/privacy",
      "/admin/cms/terms",
      "/admin/cms/shipping",
      "/admin/cms/refund",
      "/admin/cms/claims",
      "/admin/cms/prohibited-items",
      "/admin/cms/customs",
      "/admin/cms/cookie"
    ];
    return paths.includes(location.pathname);
  };

  return (
    <div className="w-64 h-screen bg-[#0A1F44] text-white fixed left-0 top-0 p-5 shadow-[4px_0_24px_rgba(0,0,0,0.25)] flex flex-col justify-between overflow-y-auto custom-scrollbar border-r border-[#687280]/20 select-none z-40">
      <div>
        {/* Brand Header */}
        <div className="mb-8 mt-2 px-2 pb-4 border-b border-[#687280]/20">
          <Logo showText={true} theme="navy" size="sm" />
          <div className="mt-2 text-[10px] text-[#FF6A00] font-semibold tracking-wider uppercase">Website Editor</div>
        </div>

        {/* Sidebar Nav */}
        <ul className="space-y-1">
          {/* Header Settings */}
          <li>
            <Link
              to="/admin/cms/header"
              className={`${baseItemClass} ${isActive("/admin/cms/header") ? activeClass : inactiveClass}`}
            >
              {icons.header}
              <span>Header Settings</span>
            </Link>
          </li>

          {/* Home Page */}
          <li>
            <Link
              to="/admin/cms/home"
              className={`${baseItemClass} ${isActive("/admin/cms/home") ? activeClass : inactiveClass}`}
            >
              {icons.home}
              <span>Home Page</span>
            </Link>
          </li>

          {/* About Page */}
          <li>
            <Link
              to="/admin/cms/about"
              className={`${baseItemClass} ${isActive("/admin/cms/about") ? activeClass : inactiveClass}`}
            >
              {icons.about}
              <span>About Page</span>
            </Link>
          </li>

          {/* Service Page */}
          <li>
            <Link
              to="/admin/cms/services"
              className={`${baseItemClass} ${isActive("/admin/cms/services") ? activeClass : inactiveClass}`}
            >
              {icons.services}
              <span>Service Page</span>
            </Link>
          </li>

          {/* Contact Page */}
          <li>
            <Link
              to="/admin/cms/contact"
              className={`${baseItemClass} ${isActive("/admin/cms/contact") ? activeClass : inactiveClass}`}
            >
              {icons.contact}
              <span>Contact Page</span>
            </Link>
          </li>

          {/* Footer */}
          <li>
            <Link
              to="/admin/cms/footer"
              className={`${baseItemClass} ${isActive("/admin/cms/footer") ? activeClass : inactiveClass}`}
            >
              {icons.footer}
              <span>Footer</span>
            </Link>
          </li>

          {/* Testimonials */}
          <li>
            <Link
              to="/admin/testimonials"
              className={`${baseItemClass} ${isActive("/admin/testimonials") ? activeClass : inactiveClass}`}
            >
              {icons.testimonial}
              <span>Testimonials</span>
            </Link>
          </li>

          {/* Inquiries */}
          <li>
            <Link
              to="/admin/inquire"
              className={`${baseItemClass} ${isActive("/admin/inquire") ? activeClass : inactiveClass}`}
            >
              {icons.inquire}
              <span>Inquiries</span>
            </Link>
          </li>

          {/* User Control */}
          <li>
            <button
              onClick={() => toggleMenu("users")}
              className={`w-full text-left flex justify-between items-center ${baseItemClass} ${
                location.pathname.startsWith("/admin/users")
                  ? "text-[#FF6A00] font-semibold"
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5`}
            >
              <div className="flex items-center gap-3">
                {icons.users}
                <span>User Control</span>
              </div>
              <span className={`text-[10px] transform transition-transform duration-300 ${openMenu === "users" ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "users" ? "max-h-32 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="ml-5 space-y-1 border-l border-white/10 pl-4 py-1">
                <li>
                  <Link
                    to="/admin/users"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/users") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    All Users
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/users/pending"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/users/pending") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Pending Approval
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/users/blocked"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/users/blocked") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Blocked Users
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Legal Pages Dropdown */}
          <li>
            <button
              onClick={() => toggleMenu("legal")}
              className={`w-full text-left flex justify-between items-center ${baseItemClass} ${
                isLegalActive()
                  ? "text-[#FF6A00] font-semibold"
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5`}
            >
              <div className="flex items-center gap-3">
                {icons.legal}
                <span>Legal Pages</span>
              </div>
              <span className={`text-[10px] transform transition-transform duration-300 ${openMenu === "legal" ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "legal" ? "max-h-[350px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="ml-5 space-y-1 border-l border-white/10 pl-4 py-1">
                <li>
                  <Link
                    to="/admin/cms/privacy"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/cms/privacy") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cms/terms"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/cms/terms") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cms/shipping"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/cms/shipping") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cms/refund"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/cms/refund") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Refund & Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cms/claims"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/cms/claims") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Claims & Compensation Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cms/prohibited-items"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/cms/prohibited-items") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Prohibited Items Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cms/customs"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/cms/customs") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Customs & Duties Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cms/cookie"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/admin/cms/cookie") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      {/* Logout */}
      <div className="pt-4 border-t border-[#687280]/20">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("jwt");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:translate-x-1"
        >
          {icons.logout}
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;