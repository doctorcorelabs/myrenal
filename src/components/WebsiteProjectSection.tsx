import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ExternalLink } from 'lucide-react';

// Website Project Images (Copied from HeroSection)
const websiteImages = ['/tb1.png', '/tb2.png', '/tb3.png', '/tb4.png'];

const WebsiteProjectSection = () => {
  // Initialize Autoplay plugin for Website Project Carousel (Copied from HeroSection)
  const websiteAutoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
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
  );
};

export default WebsiteProjectSection;
