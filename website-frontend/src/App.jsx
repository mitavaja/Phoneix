import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import RateCalculator from "./pages/public/Rate";
import Tracking from "./pages/public/Tracking";
import Contact from "./pages/public/Contact";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import PolicyPage from "./pages/public/PolicyPage";

// Seller Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Layout wrapper for pages requiring Header & Footer
const PublicLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Pages WITH Header & Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/rate" element={<RateCalculator />} />
            <Route path="/rate-calculator" element={<RateCalculator />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Policies */}
            <Route path="/policies" element={<Navigate to="/policies/terms" replace />} />
            <Route path="/policies/:policySlug" element={<PolicyPage />} />
            <Route path="/privacy" element={<Navigate to="/policies/privacy" replace />} />
            <Route path="/terms" element={<Navigate to="/policies/terms" replace />} />
            <Route path="/refund" element={<Navigate to="/policies/refund" replace />} />
          </Route>

          {/* Public Pages WITHOUT Header & Footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Seller Dashboard WITHOUT Header & Footer */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default App;