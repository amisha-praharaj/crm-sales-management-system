import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Leads from "./pages/leads/Leads";
import Customers from "./pages/customers/Customers";
import Deals from "./pages/deals/Deals";
import Activities from "./pages/activities/Activities";
import Users from "./pages/users/Users";
import Contacts from "./pages/contacts/Contacts";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/activities" element={<Activities />} />
          <Route
            path="/users"
            element={<Users />}
          />
        </Route>
        <Route path="/contacts" element={<Contacts />} />
      </Route>
    </Routes>
  );
}

export default App;