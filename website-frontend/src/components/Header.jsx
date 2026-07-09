import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const Header = () => {
  const [headerConfig, setHeaderConfig] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHeaderConfig();
    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]); // Recheck authentication on route transitions

  const checkAuth = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.warn("Failed to verify user profile token", err.message);
      // Clear token on profile fetch failure
      localStorage.removeItem("token");
      localStorage.removeItem("jwt");
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    setUser(null);
    navigate("/login");
    setMobileOpen(false);
  };

  const fetchHeaderConfig = async () => {
    try {
      const res = await API.get("/page-content/header");
      if (res.data && res.data.sections) {
        setHeaderConfig(res.data.sections);
      }
    } catch (err) {
      console.warn("Failed to fetch header content settings", err.message);
    }
  };

  const isActive = (path) => location.pathname === path;

  const defaultMenus = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Rate", path: "/rate" },
    { name: "Tracking", path: "/tracking" },
    { name: "Contact", path: "/contact" },
  ];

  // Dynamically append Dashboard option to menu if merchant is authenticated
  const baseMenus = headerConfig?.navigation && headerConfig.navigation.length > 0 
    ? headerConfig.navigation 
    : defaultMenus;
  const navItems = user 
    ? [...baseMenus, { name: "Dashboard", path: "/dashboard" }]
    : baseMenus;

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0A1F44]/95 backdrop-blur-md shadow-lg py-2 border-b border-[#687280]/20"
          : "bg-[#0A1F44] py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* 🔥 LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <Logo 
            showText={true} 
            theme="navy" 
            size="md" 
            text={headerConfig?.logo?.text} 
            subtitle={headerConfig?.logo?.subtitle} 
          />
        </Link>

        {/* 🔥 DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8">

          {navItems.map((menu) => (
            <Link
              key={menu._id || menu.name}
              to={menu.path}
              className={`relative text-sm font-semibold transition ${
                isActive(menu.path)
                  ? "text-[#FF6A00]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {menu.name}

              {/* underline animation */}
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-[#FF6A00] transition-all duration-300 ${
                  isActive(menu.path) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}

          {/* CTA Buttons */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-[#FF6A00] font-semibold text-sm hidden lg:inline">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-5 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              {(!headerConfig || headerConfig.buttons?.showLogin !== false) && (
                <Link
                  to="/login"
                  className="px-5 py-2 border border-[#687280]/50 rounded-lg text-white hover:bg-white hover:text-black transition"
                >
                  {headerConfig?.buttons?.loginText || "Login"}
                </Link>
              )}

              {(!headerConfig || headerConfig.buttons?.showRegister !== false) && (
                <Link
                  to="/register"
                  className="px-5 py-2 bg-[#FF6A00] text-white font-bold rounded-lg hover:bg-orange-600 hover:scale-105 transition duration-300"
                >
                  {headerConfig?.buttons?.registerText || "Register"}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* 🔥 MOBILE BUTTON */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 🔥 MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A1F44] px-6 pb-6 space-y-4 border-t border-[#687280]/20 pt-4">

          {navItems.map((menu) => (
            <Link
              key={menu._id || menu.name}
              to={menu.path}
              onClick={() => setMobileOpen(false)}
              className="block text-gray-300 hover:text-white font-semibold"
            >
              {menu.name}
            </Link>
          ))}

          {user ? (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-[#FF6A00] font-semibold text-sm">
                Signed in as: {user.name}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-center border border-red-500 py-2 rounded-lg text-red-500 block font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-white/10">
              {(!headerConfig || headerConfig.buttons?.showLogin !== false) && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center border border-[#687280]/50 py-2 rounded-lg text-white font-semibold"
                >
                  {headerConfig?.buttons?.loginText || "Login"}
                </Link>
              )}

              {(!headerConfig || headerConfig.buttons?.showRegister !== false) && (
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center bg-[#FF6A00] text-white py-2 rounded-lg font-bold"
                >
                  {headerConfig?.buttons?.registerText || "Register"}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;