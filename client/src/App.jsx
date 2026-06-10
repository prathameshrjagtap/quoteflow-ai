import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Quotes from "./pages/Quotes";
import QuoteDetails from "./pages/QuoteDetails";
import CreateQuote from "./pages/CreateQuote";
import EditQuote from "./pages/EditQuote";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      {/* pt-14 on mobile offsets the fixed top bar height; no offset needed on md+ */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto min-w-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/:id" element={<QuoteDetails />} />
          <Route path="/quotes/:id/edit" element={<EditQuote />} />
          <Route path="/create-quote" element={<CreateQuote />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* All other routes are protected */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
