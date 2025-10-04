import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import RoleGuard from "./components/RoleGuard";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Claims from "./pages/Claims";
import Allocations from "./pages/Allocations";
import Verification from "./pages/Verification";
import Approval from "./pages/Approval";
import Employees from "./pages/Employees";
import ExpenseTypes from "./pages/ExpenseTypes";
import AdminAllocations from "./pages/AdminAllocations";
import Reports from "./pages/Reports";
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
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/claims" element={<AuthGuard><Claims /></AuthGuard>} />
          <Route path="/allocations" element={<AuthGuard><Allocations /></AuthGuard>} />
          <Route path="/verification" element={<AuthGuard><RoleGuard allowedRoles={["engineer", "admin"]}><Verification /></RoleGuard></AuthGuard>} />
          <Route path="/approval" element={<AuthGuard><RoleGuard allowedRoles={["approver", "admin"]}><Approval /></RoleGuard></AuthGuard>} />
          <Route path="/employees" element={<AuthGuard><RoleGuard allowedRoles={["admin"]}><Employees /></RoleGuard></AuthGuard>} />
          <Route path="/expense-types" element={<AuthGuard><RoleGuard allowedRoles={["admin"]}><ExpenseTypes /></RoleGuard></AuthGuard>} />
          <Route path="/admin-allocations" element={<AuthGuard><RoleGuard allowedRoles={["admin"]}><AdminAllocations /></RoleGuard></AuthGuard>} />
          <Route path="/reports" element={<AuthGuard><RoleGuard allowedRoles={["admin", "approver"]}><Reports /></RoleGuard></AuthGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
