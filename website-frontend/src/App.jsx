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
import RateCalculatorPublic from "./pages/public/Rate";
import Tracking from "./pages/public/Tracking";
import Contact from "./pages/public/Contact";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import PolicyPage from "./pages/public/PolicyPage";

// Seller Dashboard Modules
import DashboardLayout from "./layouts/DashboardLayout";
import Profile from "./pages/dashboard/Profile";
import Overview from "./pages/dashboard/Overview";
import Shipments from "./pages/dashboard/Shipments";
import RateCalculator from "./pages/dashboard/RateCalculator";
import BulkUpload from "./pages/dashboard/BulkUpload";
import SingleBooking from "./pages/dashboard/SingleBooking";
import WalletLedger from "./pages/dashboard/WalletLedger";
import Warehouses from "./pages/dashboard/Warehouses";
import RecipientCustomer from "./pages/dashboard/RecipientCustomer";
import Dashboard from "./pages/dashboard/Dashboard";
import InsuranceClaims from "./pages/dashboard/InsuranceClaims";
import Tickets from "./pages/dashboard/Tickets";
import HelpGuide from "./pages/dashboard/HelpGuide";

const PublicLayout = () => (
    <>
        <Header />
        <Outlet />
        <Footer />
    </>
);

const App = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Public Pages */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/rate" element={<RateCalculatorPublic />} />
                        <Route path="/tracking" element={<Tracking />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/policies/:policySlug" element={<PolicyPage />} />
                    </Route>

                    {/* Auth Pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Seller Dashboard (Nested Routing) */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="overview" element={<Overview />} />
                        <Route path="shipments" element={<Shipments />} />
                        <Route path="calculator" element={<RateCalculator />} />
                        <Route path="single-booking" element={<SingleBooking />} />
                        <Route path="bulk-upload" element={<BulkUpload />} />
                        <Route path="help-guide" element={<HelpGuide />} />
                        <Route path="wallet" element={<WalletLedger />} />
                        <Route path="warehouses" element={<Warehouses />} />
                        <Route path="customers" element={<RecipientCustomer />} />
                        <Route path="old" element={<Dashboard />} />
                        <Route path="claims" element={<InsuranceClaims />} />
                        <Route path="tickets" element={<Tickets />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </>
    );
};

export default App;