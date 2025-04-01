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

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true }) // Autoplay every 3 seconds
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

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
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
            plugins={[plugin.current]}
            className="w-full max-w-3xl mx-auto" // Center the carousel
            onMouseEnter={() => plugin.current.stop()} // Wrap in arrow function
            onMouseLeave={() => plugin.current.play()} // Change to play and wrap in arrow function
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {newsItems.map((item) => ( // Use item.id as key
                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/1"> {/* Adjust basis for responsiveness if needed */}
                  <div className="p-1 h-full">
                    <Card className="h-full flex flex-col"> {/* Ensure card takes full height */}
                      <CardHeader>
                        <CardTitle className="text-lg leading-tight text-justify"> {/* Add text-justify */}
                           {item.title || 'No Title'}
                        </CardTitle>
                        <CardDescription>
                          {item.source || 'Unknown Source'} - {formatDate(item.pub_date)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow text-sm"> {/* Allow content to grow */}
                        <p className="line-clamp-3 text-justify"> {/* Add text-justify & Limit snippet lines */}
                           {item.content_snippet || 'No snippet available.'}
                        </p>
                      </CardContent>
                      <div className="p-4 pt-0 mt-auto"> {/* Push link to bottom */}
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Read More &rarr;
                        </a>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" /> {/* Responsive display */}
            <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" /> {/* Responsive display */}
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
