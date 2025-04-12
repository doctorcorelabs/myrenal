import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Removed duplicate Link import
import { supabase } from '../lib/supabaseClient'; // Assuming your Supabase client is exported from here
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'; // Assuming you have Shadcn UI Card components
import { Badge } from './ui/badge'; // Import Badge component
import { ArrowRight } from 'lucide-react'; // Import ArrowRight icon

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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the latest 6 posts, ordered by publication date, including new fields
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

        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} to={`/nucleus/${post.slug}`} className="group block">
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
            ))}
          </div>
        )}

        {/* Link to the dedicated NUCLEUS archive page */}
        {!loading && !error && posts.length > 0 && (
          <div className="mt-12 text-center"> {/* Increased margin-top */}
            {/* Apply styles from MedicalToolsPreviewSection button */}
            <Link
              to="/nucleus"
              className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-colors" // Applied styles from Launch Tool span
            >
              View All Nucleus Posts
              <ArrowRight size={16} className="ml-2" /> {/* Added ArrowRight icon */}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default NucleusSection;
