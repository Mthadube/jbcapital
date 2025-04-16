import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Application from "./pages/Application";
import ApplicationSuccess from "./pages/ApplicationSuccess";
import Eligibility from "./pages/Eligibility";
import DocumentUpload from "./pages/DocumentUpload";
import AdminDashboard from "./pages/AdminDashboard";
import ApplicationDetail from "./pages/ApplicationDetail";
import AdminUserDetail from "./pages/AdminUserDetail";
import UserProfileDashboard from "./pages/UserProfileDashboard";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import { AppDataProvider } from "./utils/AppDataContext";
import { ThemeProvider } from "./utils/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppDataProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/application" element={<Application />} />
              <Route path="/application-success" element={<ApplicationSuccess />} />
              <Route path="/eligibility" element={<Eligibility />} />
              <Route path="/documents" element={<DocumentUpload />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/application/:id" element={<ApplicationDetail />} />
              <Route path="/admin/applications/:id" element={<ApplicationDetail />} />
              <Route path="/admin/user/:id" element={<AdminUserDetail />} />
              <Route path="/profile" element={<UserProfileDashboard />} />
              <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AppDataProvider>
  </QueryClientProvider>
);

export default App;
