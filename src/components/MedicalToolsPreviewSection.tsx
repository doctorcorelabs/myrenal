import React from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, Calculator, Pill, Apple, Book, FileSearch, Brain, FileText, Computer, AlertTriangle, Network, ClipboardList, Bot } from 'lucide-react'; // Adjusted imports based on usage

// Define tool data array (Copied from HeroSection)
// Ensure this matches the tools you want to display in the preview
const toolsData = [
  { icon: Calculator, title: "Medical Calculator", description: "Calculate BMI, BSA, GFR, and other important clinical values.", link: "/tools/medical-calculator" },
  { icon: Pill, title: "Drug Reference", description: "Access comprehensive drug information database.", link: "/tools/drug-reference" },
  { icon: Apple, title: "Nutrition Database", description: "Explore nutritional information for various food items.", link: "/tools/nutrition-database" },
  { icon: Book, title: "Disease Library", description: "Comprehensive information on various conditions.", link: "/tools/disease-library" },
  { icon: FileSearch, title: "Clinical Guidelines", description: "Access the latest medical practice guidelines.", link: "/tools/clinical-guidelines" },
  { icon: Brain, title: "AI Chatbot", description: "Engage with an AI assistant for medical information and queries.", link: "/tools/ai-chatbot" },
  { icon: FileText, title: "AI Peer-Review", description: "Get AI-powered feedback on your clinical notes or case studies.", link: "/tools/ai-peer-review" },
  { icon: Computer, title: "Explore GEMINI", description: "Utilize Google's advanced AI for medical research exploration.", link: "/tools/explore-gemini" },
  { icon: Bot, title: "Explore DeepSeek", description: "Leverage DeepSeek AI for advanced medical insights.", link: "/tools/explore-deepseek" },
  { icon: AlertTriangle, title: "Drug Interaction Checker", description: "Check for potential interactions between multiple drugs.", link: "/tools/interaction-checker" },
  { icon: Network, title: "AI Mind Map Generator", description: "Generate visual mind maps from any topic using AI.", link: "/tools/ai-mindmap-generator" },
  { icon: ClipboardList, title: "Clinical Scoring Hub", description: "Access various validated clinical scoring calculators.", link: "/tools/clinical-scoring-hub" },
  // { icon: Book, title: "Learning Resources", description: "Access curated educational materials and resources.", link: "/tools/learning-resources" }, // Example: Comment out if not needed in preview
];


const MedicalToolsPreviewSection = () => {
  // Initialize Autoplay plugin for Tools Carousel (Copied from HeroSection)
  const toolsAutoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    // START: Medical Tools Preview Section (Extracted from HeroSection)
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-medical-blue mb-12">Explore Medical Tools</h2>

      {/* Carousel Implementation */}
      <Carousel
        plugins={[toolsAutoplayPlugin.current]} // Use tools plugin instance
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
        onMouseEnter={() => toolsAutoplayPlugin.current.stop()} // Use tools instance handler
        onMouseLeave={() => toolsAutoplayPlugin.current.play()} // Use tools instance handler
      >
        <CarouselContent className="-ml-4"> {/* Adjust margin for spacing */}
          {toolsData.map((tool, index) => (
            // Set basis for different screen sizes
            <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/4">
              <div className="p-1 h-full"> {/* Added padding and full height */}
                {/* Tool Card Structure */}
                <Link
                  to={tool.link}
                  className="tool-card group h-full p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors flex-shrink-0">
                    <tool.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-medical-blue mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 text-justify flex-grow">{tool.description}</p>
                  <span className="mt-auto inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors self-start">
                    Launch Tool
                    <ArrowRight size={16} className="ml-2" />
                  </span>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" /> {/* Position buttons outside on larger screens */}
        <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
      </Carousel>

      {/* Add the login message below the carousel */}
      <p className="text-center font-bold text-lg text-[#0A2463] mt-8">Ready to explore? Login to access all tools.</p>
    </div>
    // END: Medical Tools Preview Section
  );
};

export default MedicalToolsPreviewSection;
