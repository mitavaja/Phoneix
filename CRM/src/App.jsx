import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AllUsers from "./pages/users/AllUsers";
import PendingUsers from "./pages/users/PendingUsers";
import BlockedUsers from "./pages/users/BlockedUsers";
import PendingKYC from "./pages/kyc/PendingKYC";
import VerifiedKYC from "./pages/kyc/VerifiedKYC";
import RejectedKYC from "./pages/kyc/RejectedKYC";
import WalletTransactions from "./pages/wallet/WalletTransactions";
import AddBalance from "./pages/wallet/AddBalance";
import RateManager from "./pages/rates/RateManager";
import Shipments from "./pages/shipments/Shipments";
import Delivered from "./pages/shipments/Delivered";
import Cancelled from "./pages/shipments/Cancelled";
import Discrepancy from "./pages/discrepancy/Discrepancy";
import Pickups from "./pages/pickups/Pickups";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import CouponManager from "./pages/coupons/CouponManager";

// Dynamic CMS & Support Tickets
import OpenTickets from "./pages/tickets/OpenTickets";
import ClosedTickets from "./pages/tickets/ClosedTickets";
import ClaimsManager from "./pages/claims/ClaimsManager";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Redirect */}
          <Route path="/" element={<Navigate to="/crm/dashboard" />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Admin Layout */}
          <Route
            path="/crm/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* Users */}
                    <Route path="users" element={<AllUsers />} />
                    <Route path="users/pending" element={<PendingUsers />} />
                    <Route path="users/blocked" element={<BlockedUsers />} />

                    {/* KYC */}
                    <Route path="kyc/pending" element={<PendingKYC />} />
                    <Route path="kyc/verified" element={<VerifiedKYC />} />
                    <Route path="kyc/rejected" element={<RejectedKYC />} />

                    {/* Wallet */}
                    <Route path="wallet" element={<WalletTransactions />} />
                    <Route path="wallet/add" element={<AddBalance />} />

                    {/* Rates */}
                    <Route path="rates" element={<RateManager />} />

                    {/* Shipments */}
                    <Route path="shipments" element={<Shipments />} />
                    <Route path="shipments/delivered" element={<Delivered />} />
                    <Route path="shipments/cancelled" element={<Cancelled />} />

                    {/* Logistical Controls */}
                    <Route path="discrepancy" element={<Discrepancy />} />
                    <Route path="pickups" element={<Pickups />} />
                    <Route path="reports" element={<Reports />} />
                    
                    {/* Support Tickets */}
                    <Route path="tickets/open" element={<OpenTickets />} />
                    <Route path="tickets/closed" element={<ClosedTickets />} />

                    <Route path="settings" element={<Settings />} />
                    <Route path="coupons" element={<CouponManager />} />
                    
                    {/* Insurance Claims */}
                    <Route path="claims" element={<ClaimsManager />} />

                    {/* Catch-all Redirect */}
                    <Route path="*" element={<Navigate to="/crm/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
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