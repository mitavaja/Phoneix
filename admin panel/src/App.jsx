import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import CMSManager from "./pages/cms/CMSManager";
import TestimonialsManager from "./pages/testimonials/TestimonialsManager";
import InquireManager from "./pages/inquiries/InquireManager";
import AllUsers from "./pages/users/AllUsers";
import PendingUsers from "./pages/users/PendingUsers";
import BlockedUsers from "./pages/users/BlockedUsers";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Redirect */}
          <Route path="/" element={<Navigate to="/admin/cms/home" />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Admin Layout */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    {/* Website Editor (CMS Pages) */}
                    <Route path="cms/:page" element={<CMSManager />} />
                    <Route path="testimonials" element={<TestimonialsManager />} />
                    <Route path="inquire" element={<InquireManager />} />

                    {/* Users Control */}
                    <Route path="users" element={<AllUsers />} />
                    <Route path="users/pending" element={<PendingUsers />} />
                    <Route path="users/blocked" element={<BlockedUsers />} />

                    {/* Catch-all Redirect */}
                    <Route path="*" element={<Navigate to="cms/home" />} />
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