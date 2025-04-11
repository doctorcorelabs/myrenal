import React from 'react'; // Import React
import { Card } from './ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'; // Import Next/Previous
import Autoplay from "embla-carousel-autoplay"; // Import Autoplay plugin

const techStack = [
  {
    name: "React + TypeScript",
    category: "Frontend",
    description: "JavaScript library for building UI",
    logo: "/react.jpg"
  },
  {
    name: "Vite",
    category: "Build Tool",
    description: "Modern frontend tooling",
    logo: "/vite.png"
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    description: "Utility-first CSS framework",
    logo: "/tailwind.png"
  },
  {
    name: "Supabase",
    category: "Backend",
    description: "Open source Firebase alternative",
    logo: "/supabase.png"
  },
  {
    name: "Cloudflare Workers",
    category: "Edge Computing",
    description: "Serverless edge computing platform",
    logo: "/cloudflare.jpg"
  },
  {
    name: "DeepSeek",
    category: "AI Model",
    description: "Advanced AI model for complex reasoning and coding tasks.",
    logo: "/deep fix.png"
  },
  {
    name: "Google Gemini",
    category: "AI Model",
    description: "Google's powerful multimodal AI for diverse applications.",
    logo: "/gemini logo.png"
  }
];

export function TechnologyStackSection() {
  // Initialize Autoplay plugin using useRef
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    // Use container settings similar to HeroSection's tools section for consistency if needed, but keep max-w-4xl for now
    <section className="container max-w-4xl mx-auto px-4 py-12"> 
      {/* Apply styling similar to "Explore Medical Tools" title */}
      <h2 className="text-2xl md:text-3xl font-bold text-center text-medical-blue mb-12">
        Technology Stack
      </h2>
      <Carousel
        plugins={[autoplayPlugin.current]} // Use Autoplay plugin
        className="w-full" // Keep carousel width full within its container
        opts={{
          align: "start",
          loop: true,
        }}
        onMouseEnter={() => autoplayPlugin.current.stop()} // Pause on hover
        onMouseLeave={() => autoplayPlugin.current.play()} // Resume on leave
      >
        <CarouselContent className="-ml-4"> {/* Adjust margin for spacing */}
          {techStack.map((tech) => (
            // Adjust basis for responsiveness, similar to tools carousel
            <CarouselItem key={tech.name} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3"> 
              {/* Ensure card takes full height within the item */}
              <div className="p-1 h-full"> 
                {/* Apply card styling similar to tool card: border, shadow, hover effects */}
                <Card className="h-full p-6 flex flex-col items-center bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  {tech.logo && (
                    // Ensure logo container doesn't break flex layout
                    <div className="h-20 mb-4 flex items-center justify-center"> 
                      <img
                        src={tech.logo}
                        alt={`${tech.name} logo`}
                        // Adjust size constraints if needed, maintain aspect ratio
                        className="max-h-full max-w-[150px] object-contain" 
                      />
                    </div>
                  )}
                  {/* Apply text styling similar to tool card title */}
                  <h3 className="text-lg font-semibold text-medical-blue mb-1 text-center">{tech.name}</h3>
                  {/* Apply text styling similar to tool card description (muted color, size) */}
                  <span className="text-sm text-gray-500 mb-2">{tech.category}</span>
                  {/* Apply text styling, add flex-grow */}
                  <p className="text-sm text-gray-600 text-center flex-grow">{tech.description}</p>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Add Previous/Next buttons, hidden on smaller screens */}
        <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
        <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
      </Carousel>
    </section>
  );
}
