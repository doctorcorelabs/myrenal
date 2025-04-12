import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Plugin for GitHub Flavored Markdown (tables, etc.)
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader'; // Assuming you have a standard PageHeader
import { Button } from '../components/ui/button'; // Assuming Shadcn UI Button
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns'; // Import date-fns format function

// Define the structure for a single post's full data
interface NucleusPostFull {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  featured_image_url?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  // Add new metadata fields
  category?: string | null;
  subtitle?: string | null;
  author?: string | null;
  location?: string | null;
  key_insights?: string[] | null; // Array of strings
}

const NucleusPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // Get the slug from the URL
  const [post, setPost] = useState<NucleusPostFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('Post slug not found in URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch all columns including new metadata
        const { data, error: dbError } = await supabase
          .from('nucleus_posts')
          .select('*') 
          .eq('slug', slug)
          .single();

        if (dbError) {
          if (dbError.code === 'PGRST116') { // PostgREST error code for 'Not found'
            setError('Post not found.');
          } else {
            throw dbError;
          }
        } else if (data) {
          setPost(data);
        } else {
          setError('Post not found.'); // Should be covered by PGRST116, but just in case
        }

      } catch (err: any) {
        console.error(`Error fetching NUCLEUS post with slug "${slug}":`, err);
        setError('Failed to load the post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]); // Re-run effect if the slug changes

  // Remove the Layout wrapper here, as it's applied in App.tsx routing
  return (
    <>
      <PageHeader
        title={loading ? 'Loading Post...' : post?.title || 'Post Not Found'}
        // Pass subtitle to PageHeader if available
        subtitle={post?.subtitle ?? undefined} 
      />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* --- START: Added Metadata Section --- */}
        {!loading && post && (
          <div className="mb-8 border-b pb-6">
            {/* Category */}
            {post.category && (
              <p className="text-sm font-semibold uppercase tracking-wider text-medical-teal mb-2">
                {post.category}
              </p>
            )}
            {/* Author, Date, Location */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {post.author && <span>By {post.author}</span>}
              {post.author && (post.published_at || post.location) && <span>•</span>}
              {post.published_at && <span>{format(new Date(post.published_at), 'PP')}</span>}
              {(post.author || post.published_at) && post.location && <span>•</span>}
              {post.location && <span>{post.location}</span>}
            </div>
          </div>
        )}
        {/* --- END: Added Metadata Section --- */}

        {/* --- START: Added Key Insights Section --- */}
         {!loading && post && post.key_insights && post.key_insights.length > 0 && (
          <div className="mb-10 p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4 text-medical-blue">Key Insights</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {post.key_insights.map((insight, index) => (
                <li key={index} className="text-justify">{insight}</li> 
              ))}
            </ol>
          </div>
         )} 
        {/* --- END: Added Key Insights Section --- */}


        {/* Button moved below the article content */}

        {loading && <p className="text-center">Loading posts...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {post && !loading && !error && (
          // Added text-justify to the article container
          // Added image centering classes here
          <article className="prose prose-lg max-w-none dark:prose-invert text-justify prose-img:mx-auto prose-img:block">
            {/* Optional: Display featured image at the top */}
            {post.featured_image_url && (
              <div className="flex justify-center mb-8">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="rounded-lg shadow-md max-w-full"
                />
              </div>
            )}

            {/* Render the Markdown content */}
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
            >
              {post.content || 'No content available for this post.'}
            </ReactMarkdown>

            <p className="mt-8 text-sm text-muted-foreground">
              Published on: {new Date(post.published_at).toLocaleDateString()}
            </p>
          </article>
        )}

        {/* Moved Back Button here */}
        {!loading && (
          <div className="mt-12 flex justify-center"> {/* Added top margin */}
            <Link to="/#nucleus"> {/* Or potentially a dedicated /nucleus page if you create one */}
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to NUCLEUS
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default NucleusPost;
