import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

const Sidebar = ({ user, wallet, handleLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Premium design styling tokens (matching CRM & Admin Panel)
  const baseItemClass = "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 font-medium text-sm border border-transparent";
  const activeClass = "bg-white/5 text-[#FF6A00] border-[#FF6A00]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_12px_rgba(255,106,0,0.08)] transform translate-x-1 font-semibold";
  const inactiveClass = "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1";

  // Zero-dependency crisp SVGs matching CRM/Admin theme
  const icons = {
    overview: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    shipments: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
      </svg>
    ),
    calculator: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    booking: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bulkUpload: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    wallet: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    warehouses: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    customers: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    claims: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    tickets: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    guide: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    profile: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    logout: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
      </svg>
    ),
  };

  const navItems = [
    { label: "Overview", path: "/dashboard/overview", icon: icons.overview },
    { label: "Shipments Register", path: "/dashboard/shipments", icon: icons.shipments },
    { label: "Rate Calculator", path: "/dashboard/calculator", icon: icons.calculator },
    { label: "Single Booking", path: "/dashboard/single-booking", icon: icons.booking },
    { label: "Bulk CSV Upload", path: "/dashboard/bulk-upload", icon: icons.bulkUpload },
    { label: "Wallet & Ledger", path: "/dashboard/wallet", icon: icons.wallet },
    { label: "Warehouses", path: "/dashboard/warehouses", icon: icons.warehouses },
    { label: "Recipient Customers", path: "/dashboard/customers", icon: icons.customers },
    { label: "Insurance Claims", path: "/dashboard/claims", icon: icons.claims },
    { label: "Helpdesk Tickets", path: "/dashboard/tickets", icon: icons.tickets },
    { label: "Help & Guide", path: "/dashboard/help-guide", icon: icons.guide },
    { label: "My Profile", path: "/dashboard/profile", icon: icons.profile },
  ];

  return (
    <div className="w-64 h-screen bg-[#0A1F44] text-white fixed left-0 top-0 p-5 shadow-[4px_0_24px_rgba(0,0,0,0.25)] flex flex-col justify-between overflow-y-auto custom-scrollbar border-r border-[#687280]/20 select-none z-40">
      <div>
        {/* Brand Header */}
        <div className="mb-6 mt-2 px-2 pb-4 border-b border-[#687280]/20 flex flex-col items-center text-center">
          <div className="flex justify-center w-full">
            <Logo showText={true} theme="navy" size="lg" className="justify-center" />
          </div>
          <div className="mt-2 text-[10px] text-[#FF6A00] font-bold tracking-wider uppercase bg-[#FF6A00]/10 px-3 py-1 rounded-full border border-[#FF6A00]/20">
            Seller Portal
          </div>

          {/* Store / User Info Card */}
          <div className="mt-3.5 w-full bg-white/5 p-2.5 rounded-xl border border-white/10 text-left">
            <div className="text-xs font-bold text-white truncate">
              {wallet?.storeName || user?.name || "Merchant Store"}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${user?.status === "Active" ? "bg-green-500" : "bg-orange-500 animate-pulse"}`}></span>
              <span className="text-[10px] text-gray-300 font-semibold">{user?.status || "Active"} Merchant</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${baseItemClass} ${isActive(item.path) ? activeClass : inactiveClass}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout & Footer */}
      <div className="pt-4 border-t border-[#687280]/20 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:translate-x-1"
        >
          {icons.logout}
          <span>Logout</span>
        </button>
        <div className="text-[10px] text-gray-400 text-center font-medium">Phreights Logistics v1.1</div>
      </div>
    </div>
  );
};

export default Sidebar;
