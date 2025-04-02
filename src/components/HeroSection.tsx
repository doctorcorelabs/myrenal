import React from 'react'; // Import React
import { ArrowRight, Calculator, Pill, Apple, Library, FileText, Bot, Users, BookOpen, Network, Sparkles, BrainCircuit, ClipboardList, ExternalLink } from 'lucide-react'; // Added ClipboardList and ExternalLink
import { Link } from 'react-router-dom';
import MedicalNewsSection from './MedicalNewsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card imports
import { Button } from '@/components/ui/button'; // Added Button import
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Import Carousel components
import Autoplay from "embla-carousel-autoplay"; // Import Autoplay plugin


// Define tool data array
const toolsData = [
  { icon: Calculator, title: "Medical Calculator", description: "Calculate BMI, BSA, GFR, and other important clinical values", link: "/tools/medical-calculator" },
  { icon: Pill, title: "Drug Reference", description: "Access comprehensive drug information database", link: "/tools/drug-reference" },
  { icon: Apple, title: "Nutrition Database", description: "Explore nutritional information for various food items", link: "/tools/nutrition-database" },
  { icon: Library, title: "Disease Library", description: "Comprehensive information on various conditions", link: "/tools/disease-library" },
  { icon: FileText, title: "Clinical Guidelines", description: "Access the latest medical practice guidelines", link: "/tools/clinical-guidelines" },
  { icon: Bot, title: "AI Chatbot", description: "Engage with an AI assistant for medical information and queries", link: "/tools/ai-chatbot" },
  { icon: Users, title: "AI Peer-Review", description: "Get AI-powered feedback on your clinical notes or case studies", link: "/tools/ai-peer-review" },
  { icon: BookOpen, title: "Learning Resources", description: "Access curated educational materials and resources", link: "/tools/learning-resources" },
  { icon: Network, title: "Interaction Checker", description: "Check for potential drug interactions", link: "/tools/interaction-checker" },
  { icon: Sparkles, title: "Explore Gemini", description: "Utilize Google's Gemini for advanced medical insights", link: "/tools/explore-gemini" },
  { icon: BrainCircuit, title: "AI Mind Map Generator", description: "Visually organize complex medical topics with AI assistance.", link: "/tools/ai-mindmap-generator" }, // Corrected link
  { icon: ClipboardList, title: "Clinical Scoring Hub", description: "Access various validated clinical scoring calculators.", link: "/tools/clinical-scoring-hub" }, // Added Clinical Scoring Hub
];

// Website Project Images
const websiteImages = ['/tb1.png', '/tb2.png', '/tb3.png', '/tb4.png'];

const HeroSection = () => {
  // Initialize Autoplay plugin for Tools Carousel
  const toolsAutoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  // Initialize Autoplay plugin for Website Project Carousel
  const websiteAutoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <section className="relative bg-gradient-to-b from-medical-light to-white pt-20"> {/* Removed min-h-screen */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-32"> {/* Adjusted padding */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"> {/* Adjusted gap */}
          <div className="flex flex-col order-2 md:order-1">
            {/* Reverted to breakpoint sizes, centered mobile, removed justify */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-medical-blue mb-4 animate-fade-in text-center md:text-left whitespace-nowrap"> 
              Daivan Febri Juan Setiya
            </h1>
             {/* Reverted to breakpoint sizes, centered mobile, removed justify */}
            <p className="text-lg sm:text-xl text-gray-600 mb-6 animate-slide-up text-center md:text-left" style={{ animationDelay: '0.2s' }}>
              Medical Student | Researcher | Beasiswa Unggulan Awardee
            </p>
            <div className="h-1 w-32 bg-medical-teal mb-8 animate-slide-up mx-auto md:mx-0" style={{ animationDelay: '0.3s' }}></div> {/* Centered divider on mobile */}
            {/* Removed fluid font size, added base size, kept justify */}
            <p className="text-base text-gray-700 mb-8 leading-relaxed animate-slide-up text-justify" style={{ animationDelay: '0.4s' }}> 
              "A third year undergraduate student majoring in Medicine at Islamic University of Indonesia. 
              Deeply passionate about acquiring new knowledge and having diverse experiences. 
              Aiming to enhance the health standards in Indonesia, bring about sustainable change, 
              and create lasting positive impacts."
            </p>
            {/* Added items-center for mobile centering */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up items-center" style={{ animationDelay: '0.5s' }}>
              {/* Reverted to breakpoint padding */}
              <Link 
                to="/about" 
                className="px-4 py-2 sm:px-6 sm:py-3 bg-medical-blue text-white rounded-md hover:bg-opacity-90 transition-all flex items-center justify-center"
              >
                View Full Profile
                <ArrowRight size={16} className="ml-2" />
              </Link>
              {/* Reverted to breakpoint padding */}
              <Link 
                to="/contact" 
                className="px-4 py-2 sm:px-6 sm:py-3 border border-medical-blue text-medical-blue rounded-md hover:bg-medical-blue hover:text-white transition-all flex items-center justify-center"
              >
                Contact Me
              </Link>
            </div>
          </div>
          <div className="flex justify-center order-1 md:order-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
             {/* Restored original image size */}
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img
                src="/profile.jpg"
                alt="Daivan Febri Juan Setiya"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-medical-blue mb-12">Key Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Added transition and hover effect classes */}
          <div className="achievement-card animate-slide-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-semibold text-medical-blue mb-3 text-center">Gold Medal - IIF & ISIF</h3> {/* Added text-center */}
            <p className="text-gray-600 text-justify"> {/* Added text-justify */}
              Gold Medal as 1st Author at the Invention and Innovation Fair (IIF) 2025 and International Science and Invention Fair (ISIF) 2024.
            </p>
          </div>
          {/* Added transition and hover effect classes */}
          <div className="achievement-card animate-slide-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-xl font-semibold text-medical-blue mb-3 text-center">Beasiswa Unggulan Awardee</h3> {/* Added text-center */}
            <p className="text-gray-600 text-justify"> {/* Added text-justify */}
              Recipient of the prestigious scholarship "Beasiswa Unggulan" from the Ministry of Education, Culture, Research, and Technology.
            </p>
          </div>
          {/* Added transition and hover effect classes */}
          <div className="achievement-card animate-slide-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-xl font-semibold text-medical-blue mb-3 text-center">International Presentations</h3> {/* Added text-center */}
            <p className="text-gray-600 text-justify"> {/* Added text-justify */}
              Presented research at multiple international conferences including ENDO 2024 in Seoul, Korea and ICKSH 2024.
            </p>
          </div>
        </div>
      </div>

      {/* Website Project Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-medical-blue mb-12">
            Website Project
          </h2>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>TBControl Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel 
                className="w-full mb-6"
                plugins={[websiteAutoplayPlugin.current]} // Use separate plugin instance
                opts={{ // Add options
                  align: "start",
                  loop: true,
                }}
                onMouseEnter={() => websiteAutoplayPlugin.current.stop()} // Restore hover handler with correct instance
                onMouseLeave={() => websiteAutoplayPlugin.current.play()} // Restore hover handler with correct instance
              >
                <CarouselContent>
                  {websiteImages.map((src, index) => (
                    <CarouselItem key={index}>
                      <img
                        src={src}
                        alt={`TBControl Screenshot ${index + 1}`}
                        className="w-full h-auto object-contain rounded-md border"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
              </Carousel>
              <p className="text-muted-foreground text-justify">
                Developed TBControl, a dedicated web platform aimed at increasing Tuberculosis awareness and providing accessible support. Key features include comprehensive TB information, an interactive symptom checker, details on screening options, advanced tools, and a health facilities directory, all designed to help users 'Know the Symptoms, Stop the Spread'.
              </p>
              <div className="mt-4 flex justify-center"> {/* Add flex and justify-center */}
                <a href="https://tbcontrol.daivanlabs.site/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* START: Medical Tools Preview Section */}
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
                  {/* Tool Card Structure (copied from original grid) */}
                  <Link 
                    to={tool.link} 
                    className="tool-card group block h-full p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col" // Added h-full and flex flex-col
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors flex-shrink-0"> {/* Added flex-shrink-0 */}
                      <tool.icon size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-medical-blue mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 text-justify flex-grow">{tool.description}</p> {/* Added flex-grow */}
                    <span className="mt-auto inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors self-start"> {/* Added mt-auto and self-start */}
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
        <p className="text-center font-bold text-lg text-[#0A2463] mt-8">Ready to explore? Login to access all tools.</p> {/* Increased margin-top */}
        {/* Removed the "View All Tools" button container as all tools are now displayed */}
      </div>
      {/* END: Medical Tools Preview Section */}

      {/* START: Medical News Section */}
      <MedicalNewsSection />
      {/* END: Medical News Section */}
    </section>
  );
};

export default HeroSection;
