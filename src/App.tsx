
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
import DrugReference from "./pages/DrugReference"; 
import NutritionDatabase from "./pages/NutritionDatabase"; // Import NutritionDatabase
import DiseaseLibrary from "./pages/DiseaseLibrary"; // Import DiseaseLibrary
import ClinicalGuidelines from "./pages/ClinicalGuidelines"; // Import ClinicalGuidelines
import AIChatbot from "./pages/AIChatbot"; // Import AIChatbot
import AIPeerReview from "./pages/AIPeerReview"; // Import AIPeerReview
import LearningResources from "./pages/LearningResources"; // Import LearningResources
import LearningCoursera from "./pages/LearningCoursera"; // Import LearningCoursera
import LearningOsmosis from "./pages/LearningOsmosis"; // Import LearningOsmosis
import LearningUpToDate from "./pages/LearningUpToDate"; // Import LearningUpToDate
import LearningOther from "./pages/LearningOther"; // Import LearningOther
import ExploreGemini from "./pages/ExploreGemini"; // Import ExploreGemini
import InteractionChecker from "./pages/InteractionChecker"; // Import InteractionChecker
import MindMapMaker from "./pages/MindMapMaker"; // Import MindMapMaker
import ClinicalScoringHub from "./pages/ClinicalScoringHub"; // Import ClinicalScoringHub
// Removed StreamInteraction import
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
            {/* Add route for Nutrition Database */}
            <Route 
              path="/tools/nutrition-database" 
              element={
                <ProtectedRoute>
                  <Layout><NutritionDatabase /></Layout>
                </ProtectedRoute>
              } 
            />
            {/* Add route for Disease Library */}
            <Route 
              path="/tools/disease-library" 
              element={
                <ProtectedRoute>
                  <Layout><DiseaseLibrary /></Layout>
                 </ProtectedRoute>
               } 
             />
             {/* Add route for Clinical Guidelines */}
             <Route 
               path="/tools/clinical-guidelines" 
               element={
                 <ProtectedRoute>
                   <Layout><ClinicalGuidelines /></Layout>
                 </ProtectedRoute>
               }
             />
             {/* Add route for Explore GEMINI */}
             <Route
               path="/tools/explore-gemini"
               element={
                 <ProtectedRoute>
                   <Layout><ExploreGemini /></Layout>
                 </ProtectedRoute>
               }
             />
             {/* Add route for AI Chatbot */}
             <Route 
               path="/tools/ai-chatbot"
               element={
                 <ProtectedRoute>
                  <Layout><AIChatbot /></Layout>
                </ProtectedRoute>
              } 
            />
            {/* Add route for AI Peer-Review */}
            <Route 
              path="/tools/ai-peer-review" 
              element={
                <ProtectedRoute>
                  <Layout><AIPeerReview /></Layout>
                </ProtectedRoute>
              } 
            />
            {/* Add route for Learning Resources */}
            <Route 
              path="/tools/learning-resources" 
              element={
                <ProtectedRoute>
                  <Layout><LearningResources /></Layout>
                </ProtectedRoute>
              } 
            />
            {/* Add routes for specific learning resources */}
            <Route 
              path="/tools/learning-resources/coursera" 
              element={
                <ProtectedRoute>
                  <Layout><LearningCoursera /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tools/learning-resources/osmosis" 
              element={
                <ProtectedRoute>
                  <Layout><LearningOsmosis /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tools/learning-resources/uptodate" 
              element={
                <ProtectedRoute>
                  <Layout><LearningUpToDate /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tools/learning-resources/other" 
              element={
                <ProtectedRoute>
                  <Layout><LearningOther /></Layout>
                </ProtectedRoute>
              }
            />
            {/* Add route for Interaction Checker */}
            <Route
              path="/tools/interaction-checker"
              element={
                <ProtectedRoute>
                  <Layout><InteractionChecker /></Layout>
                 </ProtectedRoute>
               }
             />
             {/* Add route for AI Mind Map Generator */}
             <Route
               path="/tools/ai-mindmap-generator"
               element={
                 <ProtectedRoute>
                   <Layout><MindMapMaker /></Layout>
                 </ProtectedRoute>
               }
             />
             {/* Add route for Clinical Scoring Hub */}
            <Route
              path="/tools/clinical-scoring-hub"
              element={
                <ProtectedRoute>
                  <Layout><ClinicalScoringHub /></Layout>
                 </ProtectedRoute>
               }
             />
             {/* Removed Stream Interaction route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
