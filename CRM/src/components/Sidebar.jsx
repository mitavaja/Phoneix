import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

const Sidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");

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
    dashboard: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    kyc: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    wallet: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    rates: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    shipments: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
      </svg>
    ),
    discrepancy: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    pickups: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    reports: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tickets: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    coupons: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    claims: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    logout: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
      </svg>
    ),
  };

  return (
    <div className="w-64 h-screen bg-[#0A1F44] text-white fixed left-0 top-0 p-5 shadow-[4px_0_24px_rgba(0,0,0,0.25)] flex flex-col justify-between overflow-y-auto custom-scrollbar border-r border-[#687280]/20 select-none z-40">
      <div>
        {/* Brand Header */}
        <div className="mb-8 mt-2 px-2 pb-4 border-b border-[#687280]/20">
          <Logo showText={true} theme="navy" size="sm" />
          <div className="mt-2 text-[10px] text-[#FF6A00] font-semibold tracking-wider uppercase">Admin Control</div>
        </div>

        {/* Sidebar Nav */}
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              to="/crm/dashboard"
              className={`${baseItemClass} ${isActive("/crm/dashboard") ? activeClass : inactiveClass}`}
            >
              {icons.dashboard}
              <span>Dashboard</span>
            </Link>
          </li>

          {/* User Management */}
          <li>
            <button
              onClick={() => toggleMenu("users")}
              className={`w-full text-left flex justify-between items-center ${baseItemClass} ${
                location.pathname.startsWith("/crm/users")
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
                    to="/crm/users"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/users") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    All Users
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crm/users/pending"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/users/pending") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Pending Approval
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crm/users/blocked"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/users/blocked") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Blocked Users
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* KYC Management */}
          <li>
            <button
              onClick={() => toggleMenu("kyc")}
              className={`w-full text-left flex justify-between items-center ${baseItemClass} ${
                location.pathname.startsWith("/crm/kyc")
                  ? "text-[#FF6A00] font-semibold"
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5`}
            >
              <div className="flex items-center gap-3">
                {icons.kyc}
                <span>KYC Control</span>
              </div>
              <span className={`text-[10px] transform transition-transform duration-300 ${openMenu === "kyc" ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "kyc" ? "max-h-32 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="ml-5 space-y-1 border-l border-white/10 pl-4 py-1">
                <li>
                  <Link
                    to="/crm/kyc/pending"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/kyc/pending") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Pending KYC
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crm/kyc/verified"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/kyc/verified") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Verified KYC
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crm/kyc/rejected"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/kyc/rejected") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Rejected KYC
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Wallet Control */}
          <li>
            <button
              onClick={() => toggleMenu("wallet")}
              className={`w-full text-left flex justify-between items-center ${baseItemClass} ${
                location.pathname.startsWith("/crm/wallet")
                  ? "text-[#FF6A00] font-semibold"
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5`}
            >
              <div className="flex items-center gap-3">
                {icons.wallet}
                <span>Wallet Control</span>
              </div>
              <span className={`text-[10px] transform transition-transform duration-300 ${openMenu === "wallet" ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "wallet" ? "max-h-24 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="ml-5 space-y-1 border-l border-white/10 pl-4 py-1">
                <li>
                  <Link
                    to="/crm/wallet"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/wallet") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Transactions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crm/wallet/add"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/wallet/add") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Add Balance
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Rates */}
          <li>
            <Link
              to="/crm/rates"
              className={`${baseItemClass} ${isActive("/crm/rates") ? activeClass : inactiveClass}`}
            >
              {icons.rates}
              <span>Rate Manager</span>
            </Link>
          </li>

          {/* Shipments */}
          <li>
            <button
              onClick={() => toggleMenu("shipments")}
              className={`w-full text-left flex justify-between items-center ${baseItemClass} ${
                location.pathname.startsWith("/crm/shipments")
                  ? "text-[#FF6A00] font-semibold"
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5`}
            >
              <div className="flex items-center gap-3">
                {icons.shipments}
                <span>Shipment Control</span>
              </div>
              <span className={`text-[10px] transform transition-transform duration-300 ${openMenu === "shipments" ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "shipments" ? "max-h-32 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="ml-5 space-y-1 border-l border-white/10 pl-4 py-1">
                <li>
                  <Link
                    to="/crm/shipments"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/shipments") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    All Shipments
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crm/shipments/delivered"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/shipments/delivered") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Delivered
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crm/shipments/cancelled"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/shipments/cancelled") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Cancelled
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Weight Discrepancy */}
          <li>
            <Link
              to="/crm/discrepancy"
              className={`${baseItemClass} ${isActive("/crm/discrepancy") ? activeClass : inactiveClass}`}
            >
              {icons.discrepancy}
              <span>Weight Discrepancy</span>
            </Link>
          </li>

          {/* Pickup Control */}
          <li>
            <Link
              to="/crm/pickups"
              className={`${baseItemClass} ${isActive("/crm/pickups") ? activeClass : inactiveClass}`}
            >
              {icons.pickups}
              <span>Pickup Control</span>
            </Link>
          </li>

          {/* Reports */}
          <li>
            <Link
              to="/crm/reports"
              className={`${baseItemClass} ${isActive("/crm/reports") ? activeClass : inactiveClass}`}
            >
              {icons.reports}
              <span>Reports</span>
            </Link>
          </li>

          {/* Support Tickets */}
          <li>
            <button
              onClick={() => toggleMenu("tickets")}
              className={`w-full text-left flex justify-between items-center ${baseItemClass} ${
                location.pathname.startsWith("/crm/tickets")
                  ? "text-[#FF6A00] font-semibold"
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5`}
            >
              <div className="flex items-center gap-3">
                {icons.tickets}
                <span>Support Tickets</span>
              </div>
              <span className={`text-[10px] transform transition-transform duration-300 ${openMenu === "tickets" ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "tickets" ? "max-h-24 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="ml-5 space-y-1 border-l border-white/10 pl-4 py-1">
                <li>
                  <Link
                    to="/crm/tickets/open"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/tickets/open") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Open Tickets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/crm/tickets/closed"
                    className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                      isActive("/crm/tickets/closed") ? "text-[#FF6A00] font-semibold bg-[#FF6A00]/5" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Closed Tickets
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Insurance Claims */}
          <li>
            <Link
              to="/crm/claims"
              className={`${baseItemClass} ${isActive("/crm/claims") ? activeClass : inactiveClass}`}
            >
              {icons.claims}
              <span>Insurance Claims</span>
            </Link>
          </li>

          {/* Coupons */}
          <li>
            <Link
              to="/crm/coupons"
              className={`${baseItemClass} ${isActive("/crm/coupons") ? activeClass : inactiveClass}`}
            >
              {icons.coupons}
              <span>Offer Coupons</span>
            </Link>
          </li>

          {/* Settings */}
          <li>
            <Link
              to="/crm/settings"
              className={`${baseItemClass} ${isActive("/crm/settings") ? activeClass : inactiveClass}`}
            >
              {icons.settings}
              <span>Settings</span>
            </Link>
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
