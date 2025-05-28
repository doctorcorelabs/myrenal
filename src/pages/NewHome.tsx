import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bot, BrainCircuit, Library, Pill, Calculator, Link as LinkIcon, Stethoscope, Microscope, BookOpen, Cpu, Database, ArrowRight, FileSearch } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { toolsData } from '@/pages/Tools'; // Import toolsData from Tools.tsx

const NewHome = () => {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );

  return (
    <div className="flex flex-col min-h-screen"> {/* Use flex layout for better structure */}
      {/* Hero Section - Improved spacing and responsiveness */}
      <section className="container mx-auto py-8 md:py-12 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 space-y-5">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">MyRenal</h1>
            <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">Platform Edukasi Kesehatan Ginjal Anda: Membantu Skrining, Diagnosis, dan Pemantauan</h2>
            <div className="w-24 h-1.5 bg-blue-600"></div> {/* Enhanced blue underline */}
            <p className="text-lg text-muted-foreground">
              MyRenal adalah platform yang menyediakan informasi dan alat bantu untuk mendukung skrining dini, membantu proses diagnosis, serta memfasilitasi pemantauan penyakit yang berkaitan dengan ginjal.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/screening">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Mulai Skrining <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/treatment">
                <Button size="lg" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold">Tatalaksana</Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 mt-8 md:mt-0">
            <div>
              <img src="/renal.png" alt="Kesehatan Ginjal" className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools & Resources Section - Improved card layout */}
      <section className="container mx-auto py-12 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 rounded-lg my-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Alat & Sumber Daya MyRenal</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Akses berbagai alat dan referensi untuk membantu memahami dan mengelola kesehatan ginjal
          </p>
        </div>
        
        <Carousel
          plugins={[plugin.current]}
          className="w-full max-w-6xl mx-auto"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-4">
            {toolsData.map((tool) => (
              <CarouselItem key={tool.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link to={tool.path} className="block group h-full">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-400 flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                        <tool.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button variant="link" className="text-blue-600 dark:text-blue-400 p-0 h-auto font-semibold group-hover:underline">
                        Launch Tool <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-6">
            <CarouselPrevious className="relative mr-2" />
            <CarouselNext className="relative ml-2" />
          </div>
        </Carousel>
        <p className="text-center text-muted-foreground mt-8 font-medium">Ready to explore? <span className="text-blue-600">Login</span> to access all tools.</p>
      </section>

      {/* Footer - Improved layout and readability */}
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">MyRenal</h3>
              <p className="text-gray-300 max-w-sm">
                Platform Edukasi untuk Skrining, Diagnosis & Pemantauan Kesehatan Ginjal.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/screening" className="hover:text-blue-400 transition-colors">Skrining dan Diagnosis</Link></li>
                <li><Link to="/treatment" className="hover:text-blue-400 transition-colors">Tatalaksana</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">Tentang Kami</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Kontak</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Kontak</h3>
              <p className="text-gray-300 flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail h-5 w-5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                daivanlabs@gmail.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            © 2025 MyRenal. Hak cipta dilindungi undang-undang.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewHome;
