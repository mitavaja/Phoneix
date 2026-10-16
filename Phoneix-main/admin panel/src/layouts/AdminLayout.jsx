import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const AdminLayout = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.warn("Failed to fetch user session profile. Using fallback UI profile.");
      }
    };
    fetchUser();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const getMonogram = () => {
    if (!user || !user.name) return "SA";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex bg-[#E5E7EB] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-20 border-b border-[#687280]/20 bg-white px-8 flex items-center justify-between sticky top-0 z-30 select-none shadow-sm">
          {/* Welcome Info */}
          <div>
            <h1 className="text-sm font-semibold text-[#0A1F44]">Website Editor Console</h1>
            <p className="text-xs text-[#FF6A00]/80 font-medium">{currentDate}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search sections, dynamic content..."
                className="w-80 px-4 py-2 pl-10 text-xs bg-white border border-[#687280]/30 focus:border-[#FF6A00]/50 rounded-xl text-[#0A1F44] focus:outline-none transition-all"
              />
              <svg
                className="w-4 h-4 text-gray-500 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl bg-[#E5E7EB] hover:bg-[#E5E7EB]/80 text-[#687280] hover:text-[#FF6A00] transition-all group border border-[#687280]/10">
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6A00] rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6A00] rounded-full"></span>
              <svg className="w-5 h-5 text-[#687280] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 border-l border-[#687280]/20 pl-6">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-semibold text-[#0A1F44]">{user ? user.name : "Super Admin"}</span>
                <span className="block text-[10px] text-green-600 font-bold uppercase tracking-wider">{user ? user.role : "Administrator"}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6A00] to-orange-500 flex items-center justify-center font-extrabold text-black shadow-lg text-sm transition-transform hover:scale-105 select-none">
                {getMonogram()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Wrapper */}
        <main className="flex-1 p-8 bg-[#E5E7EB] text-[#0A1F44]">
          <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;