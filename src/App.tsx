import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import RoleGuard from "./components/RoleGuard";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import Estimates from "./pages/Estimates";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import DatabaseViewer from "./pages/DatabaseViewer";
import AdminSignup from "./pages/AdminSignup";
import AdminUserManagement from "./pages/AdminUserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/customers" element={<AuthGuard><RoleGuard allowedRoles={["admin", "accountant", "sales", "viewer"]}><Customers /></RoleGuard></AuthGuard>} />
          <Route path="/products" element={<AuthGuard><RoleGuard allowedRoles={["admin", "accountant", "sales"]}><Products /></RoleGuard></AuthGuard>} />
          <Route path="/invoices" element={<AuthGuard><RoleGuard allowedRoles={["admin", "accountant", "sales", "viewer"]}><Invoices /></RoleGuard></AuthGuard>} />
          <Route path="/estimates" element={<AuthGuard><RoleGuard allowedRoles={["admin", "accountant", "sales", "viewer"]}><Estimates /></RoleGuard></AuthGuard>} />
          <Route path="/payments" element={<AuthGuard><RoleGuard allowedRoles={["admin", "accountant", "sales", "viewer"]}><Payments /></RoleGuard></AuthGuard>} />
          <Route path="/reports" element={<AuthGuard><RoleGuard allowedRoles={["admin", "accountant", "viewer"]}><Reports /></RoleGuard></AuthGuard>} />
          <Route path="/notifications" element={<AuthGuard><RoleGuard allowedRoles={["admin", "accountant", "sales", "viewer"]}><Notifications /></RoleGuard></AuthGuard>} />
          <Route path="/users" element={<AuthGuard><RoleGuard allowedRoles={["admin"]}><Users /></RoleGuard></AuthGuard>} />
          <Route path="/admin/users" element={<AuthGuard><RoleGuard allowedRoles={["admin"]}><AdminUserManagement /></RoleGuard></AuthGuard>} />
          <Route path="/database" element={<AuthGuard><RoleGuard allowedRoles={["admin"]}><DatabaseViewer /></RoleGuard></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><RoleGuard allowedRoles={["admin"]}><Settings /></RoleGuard></AuthGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
