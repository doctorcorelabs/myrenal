import React, { useState, useEffect, useRef } from 'react';
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { supabase } from '@/lib/supabaseClient'; // Import your Supabase client instance

// Interface matching the Supabase table structure
interface NewsItem {
  id: number;
  title?: string | null;
  link: string;
  pub_date?: string | null; // Comes as string from Supabase
  content_snippet?: string | null;
  source?: string | null;
  fetched_at: string;
}

const MedicalNewsSection: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [plugin] = useState(() => 
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchNewsFromSupabase = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch latest news from Supabase table, ordered by pub_date descending, limit 15
        const { data, error: supabaseError } = await supabase
          .from('latest_medical_news')
          .select('*')
          .order('pub_date', { ascending: false, nullsFirst: false }) // Show newest first
           .limit(15); // Fetch 15 items as before

         if (supabaseError) {
           throw supabaseError;
         }

         // We still display up to 15 items as decided earlier
         setNewsItems(data || []);


       } catch (err) {
        console.error("Failed to fetch medical news from Supabase:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred fetching news');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchNewsFromSupabase();

    // Set up interval to refetch every 10 hours (36,000,000 ms)
    const intervalId = setInterval(fetchNewsFromSupabase, 10 * 60 * 60 * 1000);

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel('latest_medical_news_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'latest_medical_news' },
        (payload) => {
          console.log('Change received!', payload);
          // Refetch news when any change occurs in the table
          fetchNewsFromSupabase();
        }
      )
      .subscribe();

    // Cleanup subscription and interval on component unmount
    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId); // Clear the interval
    };
  }, []); // Empty dependency array still correct, setup runs once

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    try {
      // Use pub_date which should be TIMESTAMPTZ
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-muted/40">
      <div className="container px-4 md:px-6">
        {/* Updated classes to match "Explore Medical Tools" */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-medical-blue mb-12">
          Latest Medical News
        </h2>
        {loading && (
          <div className="flex justify-center">
             {/* Simple Skeleton Loader for Carousel */}
             <Skeleton className="w-full max-w-3xl h-64" />
          </div>
        )}
        {error && (
          <p className="text-center text-red-600">
            Failed to load news: {error}
          </p>
        )}
        {!loading && !error && newsItems.length > 0 && (
          <Carousel
            plugins={[plugin]}
            className="w-full max-w-3xl mx-auto"
            onMouseEnter={() => plugin.stop()}
            onMouseLeave={() => plugin.play()}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-4"> {/* Add negative margin like tools carousel */}
              {newsItems.map((item) => ( // Use item.id as key
                // Adjust basis for responsiveness, show 2 on md+, add padding
                <CarouselItem key={item.id} className="pl-4 basis-full md:basis-1/2"> 
                  <div className="p-1 h-full">
                    {/* Apply card styling similar to tool card */}
                    <Card className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"> 
                      <CardHeader className="pb-2"> {/* Reduce bottom padding */}
                        {/* Apply text styling similar to tool card title */}
                        <CardTitle className="text-lg font-semibold text-medical-blue mb-1 text-justify"> 
                           {item.title || 'No Title'}
                        </CardTitle>
                        {/* Apply text styling similar to tool card description (muted) */}
                        <CardDescription className="text-sm text-gray-500"> 
                          {item.source || 'Unknown Source'} - {formatDate(item.pub_date)}
                        </CardDescription>
                      </CardHeader>
                      {/* Apply text styling similar to tool card description, keep flex-grow */}
                      <CardContent className="flex-grow text-sm text-gray-600 pb-2"> {/* Reduce bottom padding */}
                        <p className="line-clamp-3 text-justify"> 
                           {item.content_snippet || 'No snippet available.'}
                        </p>
                      </CardContent>
                      {/* Apply styling similar to tool card link/button */}
                      <div className="p-4 pt-0 mt-auto"> 
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          // Use medical-blue color, similar font weight/size
                          className="text-sm font-medium text-medical-blue hover:underline" 
                        >
                          Read More &rarr;
                        </a>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:inline-flex" /> {/* Position buttons inside on larger screens */}
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:inline-flex" /> {/* Position buttons inside on larger screens */}
          </Carousel>
        )}
         {!loading && !error && newsItems.length === 0 && (
           <p className="text-center text-muted-foreground">No news items available at the moment.</p>
         )}
      </div>
    </section>
  );
};

export default MedicalNewsSection;
