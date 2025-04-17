import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, MessageSquarePlus } from 'lucide-react'; // Import ArrowRight and MessageSquarePlus icons
import { Button } from '@/components/ui/button'; // Import Button
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription, // Added DialogDescription for context
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Import Dialog components
import NucleusSubmissionForm from './NucleusSubmissionForm'; // Import the new form
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Added Carousel imports
import Autoplay from "embla-carousel-autoplay"; // Added Autoplay import

// Define the structure of a post
interface NucleusPost {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  featured_image_url?: string;
  published_at: string;
  // Add new fields
  category?: string | null;
  author?: string | null;
}

const NucleusSection: React.FC = () => {
  const [posts, setPosts] = useState<NucleusPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  // Initialize Autoplay plugin for Nucleus Carousel
  const nucleusAutoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true }) // Changed delay to 3 seconds
  );

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the latest 3 posts, ordered by publication date, including new fields
        const { data, error: dbError } = await supabase
          .from('nucleus_posts')
          .select('id, title, slug, summary, featured_image_url, published_at, category, author') // Added category and author
          .order('published_at', { ascending: false })
          .limit(3); // Limit the number of posts shown on the homepage to 3

        if (dbError) {
          throw dbError;
        }

        setPosts(data || []);
      } catch (err: any) {
        console.error('Error fetching NUCLEUS posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Effect to manually remove body overflow style when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      // Ensure scrolling is re-enabled when dialog is closed
      document.body.style.overflow = '';
    }
    // Note: Dialog component might add overflow:hidden itself when open.
    // This effect primarily ensures cleanup on close.
  }, [isModalOpen]);

  return (
    // Change background to white
    <section className="py-12 md:py-16 lg:py-20 bg-white"> {/* Changed background class */}
      <div className="container mx-auto px-4 md:px-6">
        {/* Apply styles from MedicalToolsPreviewSection title */}
        <div className="text-center mb-12"> {/* Use same margin bottom as tools section */}
          <h2 className="text-2xl md:text-3xl font-bold text-medical-blue"> {/* Apply matching size, weight, color */}
            NUCLEUS
          </h2>
          {/* Match subtitle style closer to title */}
          <p className="mt-2 text-lg text-medical-blue"> {/* Changed size and color */}
            News Uncovering Clinical Learning & Engineering Updates from Science
          </p>
        </div>

        {loading && <p className="text-center">Loading posts...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-muted-foreground">No posts available yet.</p>
        )}

        {/* Conditional rendering for posts */}
        {!loading && !error && posts.length > 0 && (
          // Wrap Carousel and Link div in a Fragment
          <>
            {/* Start Carousel Implementation */}
            <Carousel
              plugins={[nucleusAutoplayPlugin.current]}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
              onMouseEnter={() => nucleusAutoplayPlugin.current.stop()}
              onMouseLeave={() => nucleusAutoplayPlugin.current.play()}
            >
              <CarouselContent className="-ml-4"> {/* Adjust margin for spacing */}
                {posts.map((post) => (
                  // Set basis for different screen sizes
                  <CarouselItem key={post.id} className="pl-4 basis-full lg:basis-1/3">
                    <div className="p-1 h-full"> {/* Added padding and full height */}
                      {/* Post Card Structure */}
                      <Link to={`/nucleus/${post.slug}`} className="group block h-full"> {/* Ensure link takes full height */}
                        <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg h-full flex flex-col">
                          {post.featured_image_url ? (
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              width={400}
                              height={225}
                              className="aspect-video w-full object-cover"
                            />
                          ) : (
                            // Placeholder if no image
                            <div className="aspect-video w-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No Image</span>
                            </div>
                          )}
                          <CardHeader>
                            {/* Match tool card title style */}
                            <CardTitle className="text-lg font-semibold text-medical-blue text-justify"> {/* Changed size, color, removed hover/transition */}
                              {post.title}
                            </CardTitle>
                            {/* Display Category Badge if available */}
                            {post.category && (
                              <Badge variant="secondary" className="mt-2 text-xs">{post.category}</Badge>
                            )}
                          </CardHeader>
                          <CardContent className="flex-grow">
                            {/* Match tool card description style */}
                            <p className="text-gray-600 text-sm line-clamp-3 text-justify"> {/* Changed color */}
                              {post.summary || 'No summary available.'}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center pt-4"> {/* Added padding top for separation */}
                            {/* Display Author if available - Match tool card description style */}
                            {post.author && (
                              <p className="text-sm text-gray-600"> {/* Changed size and color */}
                                By {post.author}
                              </p>
                            )}
                            {/* Keep Published Date - Match tool card description style */}
                            <p className={`text-sm text-gray-600 ${post.author ? '' : 'ml-auto'}`}> {/* Changed size and color */}
                              {new Date(post.published_at).toLocaleDateString()}
                            </p>
                          </CardFooter>
                        </Card>
                      </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:inline-flex" /> {/* Position buttons inside on larger screens */}
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
            </Carousel>
                {/* End Carousel Implementation */}

                {/* Buttons Container */}
                <div className="mt-12 text-center space-y-4 flex flex-col items-center"> {/* Added flex column and center alignment */}
                  {/* View All Button */}
                  <Link
                    to="/nucleus#nucleus-posts-grid"
                className="inline-flex items-center px-4 py-2 h-10 bg-medical-blue text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-colors" // Added h-10
              >
                View All Nucleus Posts
                <ArrowRight size={16} className="ml-2" />
              </Link>

              {/* Speak Your Mind Button & Dialog */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="inline-flex items-center px-4 py-2 h-10 border-medical-blue text-medical-blue hover:bg-medical-blue/10"> {/* Added h-10 */}
                    <MessageSquarePlus size={16} className="mr-2" />
                    Speak your mind!
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"> {/* Wider modal, max height and scroll */}
                  <DialogHeader>
                    <DialogTitle>Share Your Nucleus Idea</DialogTitle>
                    <DialogDescription>
                      Got an idea for a NUCLEUS post? Fill out the form below to submit it for review.
                    </DialogDescription>
                  </DialogHeader>
                  <NucleusSubmissionForm
                    onSaveSuccess={() => setIsModalOpen(false)} // Close modal on success
                    onCancel={() => setIsModalOpen(false)} // Close modal on cancel
                  />
                  {/* Footer removed as form has its own Cancel/Submit */}
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
        {/* Link div is now correctly inside the conditional block above */}
      </div>
    </section>
  );
};

export default NucleusSection;
