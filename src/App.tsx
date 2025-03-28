
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Education from "./pages/Education";
import Honors from "./pages/Honors";
import Research from "./pages/Research";
import Experience from "./pages/Experience";
import Certifications from "./pages/Certifications";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Tools from "./pages/Tools";
import MedicalCalculator from "./pages/MedicalCalculator";
import DrugReference from "./pages/DrugReference"; // Import the new component
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/education" element={<Layout><Education /></Layout>} />
            <Route path="/honors" element={<Layout><Honors /></Layout>} />
            <Route path="/research" element={<Layout><Research /></Layout>} />
            <Route path="/experience" element={<Layout><Experience /></Layout>} />
            <Route path="/certifications" element={<Layout><Certifications /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/tools" 
              element={
                <ProtectedRoute>
                  <Layout><Tools /></Layout> {/* Wrap Tools in Layout */}
                </ProtectedRoute>
              } 
            />
            {/* Add route for Medical Calculator */}
            <Route 
              path="/tools/medical-calculator" 
              element={
                <ProtectedRoute>
                  <Layout><MedicalCalculator /></Layout>
                </ProtectedRoute>
              } 
            />
            {/* Add route for Drug Reference */}
            <Route 
              path="/tools/drug-reference" 
              element={
                <ProtectedRoute>
                  <Layout><DrugReference /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
