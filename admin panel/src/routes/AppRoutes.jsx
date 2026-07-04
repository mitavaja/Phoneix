import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
};

export default AppRoutes;