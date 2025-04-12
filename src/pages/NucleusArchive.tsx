import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import clsx from 'clsx'; // Keep clsx commented out
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import PageHeader from '../components/PageHeader';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from 'use-debounce'; // Restore useDebounce import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  // PaginationLink, // We might use this for page numbers later (Removed as unused for now)
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"; // Import Pagination components

// Define the structure of a post (same as in NucleusSection)
interface NucleusPost {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  featured_image_url?: string;
  published_at: string;
  category?: string | null;
  author?: string | null;
}

const POSTS_PER_PAGE = 9; // Define posts per page

const NucleusArchive: React.FC = () => { // Add React.FC back
  const [posts, setPosts] = useState<NucleusPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('published_at-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // Restore debouncedSearchTerm

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE); // Re-introduce constant

  // Fetch unique categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use Supabase function or distinct query if available, otherwise process client-side
        // Simple client-side processing for now:
        const { data, error } = await supabase
          .from('nucleus_posts')
          .select('category');

        if (error) throw error;

        const uniqueCategories = Array.from(new Set(data?.map(p => p.category).filter(Boolean) as string[]));
        setCategories(uniqueCategories.sort()); // Sort alphabetically
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Handle error appropriately, maybe show a toast
      }
    };
    fetchCategories();
  }, []);


  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Base query
        let query = supabase.from('nucleus_posts');

        // --- Filtering & Searching (for count) ---
        let countQuery = query.select('*', { count: 'exact', head: true });
        if (selectedCategory !== 'all') {
          countQuery = countQuery.eq('category', selectedCategory);
        }
         // Apply search filter for count
        if (debouncedSearchTerm) { // Use debouncedSearchTerm
          // IMPORTANT: Ensure 'title' column has FTS enabled in Supabase or use .ilike()
          // Using .ilike() for broader compatibility without specific FTS setup:
          countQuery = countQuery.ilike('title', `%${debouncedSearchTerm}%`); // Use debouncedSearchTerm
          // If FTS is set up on 'title':
          // countQuery = countQuery.textSearch('title', `${debouncedSearchTerm}:*`); // Use appropriate FTS syntax
        }
        // 1. Fetch total count with filters and search applied
        const { count, error: countError } = await countQuery;

        if (countError) {
          throw countError;
        }
        // Reset to page 1 if the current page becomes invalid after filtering/searching
        const newTotalPages = Math.ceil((count ?? 0) / POSTS_PER_PAGE);
        const newCurrentPage = Math.min(currentPage, newTotalPages > 0 ? newTotalPages : 1);
        // Only update state if the calculated page is different, to avoid infinite loops
        if (currentPage !== newCurrentPage) {
            setCurrentPage(newCurrentPage);
            // No need to return early, the rest of the logic will use newCurrentPage
        }
        setTotalPosts(count ?? 0);


        // Calculate range for the potentially adjusted current page
        const startIndex = (newCurrentPage - 1) * POSTS_PER_PAGE;
        const endIndex = startIndex + POSTS_PER_PAGE - 1;

        // --- Sorting ---
        let dataQuery = query.select('id, title, slug, summary, featured_image_url, published_at, category, author');
        const [sortColumn, sortDirection] = sortOrder.split('-');
        dataQuery = dataQuery.order(sortColumn, { ascending: sortDirection === 'asc' });

        // --- Filtering & Searching (applied again for data fetching) ---
         if (selectedCategory !== 'all') {
           dataQuery = dataQuery.eq('category', selectedCategory);
         }
         // Apply search filter for data
         if (debouncedSearchTerm) { // Use debouncedSearchTerm
           // Using .ilike() for broader compatibility:
           dataQuery = dataQuery.ilike('title', `%${debouncedSearchTerm}%`); // Use debouncedSearchTerm
           // If FTS is set up on 'title':
           // dataQuery = dataQuery.textSearch('title', `${debouncedSearchTerm}:*`);
         }

        // 2. Fetch posts for the current page with filters, sorting, and search
        const { data, error: dbError } = await dataQuery.range(startIndex, endIndex);

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
    // Re-fetch when page, category, sort order, or debounced search term changes
  }, [currentPage, selectedCategory, sortOrder, debouncedSearchTerm]); // Restore debouncedSearchTerm dependency

  const handlePageChange = (newPage: number) => {
    // Calculate total pages based on current totalPosts
    const currentTotalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    if (newPage >= 1 && newPage <= currentTotalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(1); // Reset page on sort change
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset page on search change
  };

  // Handler for the Previous button click
  const handlePreviousPageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePageChange(currentPage - 1);
  };

  // Handler for the Next button click (Adding for consistency)
  const handleNextPageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePageChange(currentPage + 1);
  };

  return (
    <>
      <PageHeader
        title="NUCLEUS Archive"
        subtitle="All News Uncovering Clinical Learning & Engineering Updates from Science"
      />
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Filter, Sort, and Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Category Filter */}
          <div>
            <Label htmlFor="category-filter">Filter by Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category-filter" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div>
            <Label htmlFor="sort-order">Sort by</Label>
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger id="sort-order" className="w-full">
                <SelectValue placeholder="Select order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published_at-desc">Newest</SelectItem>
                <SelectItem value="published_at-asc">Oldest</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div>
            <Label htmlFor="search-posts">Search Posts</Label>
            <Input
              id="search-posts"
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && <p className="text-center mt-8">Loading posts...</p>}
        {error && <p className="text-center text-red-600 mt-8">{error}</p>}

        {/* No Posts State */}
        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">No posts found matching your criteria.</p>
        )}

        {/* Post Grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {posts.map((post) => {
              const publishedDate = new Date(post.published_at).toLocaleDateString();
              return (
                <Link key={post.id} to={`/nucleus/${post.slug}`} className="group block">
                  <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 h-full flex flex-col">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        width={400}
                        height={225}
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-video w-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No Image</span>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300 text-medical-blue text-justify">
                        {post.title}
                      </CardTitle>
                      {post.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">{post.category}</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-600 line-clamp-3 text-justify">
                        {post.summary || 'No summary available.'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end items-center">
                      <p className="text-xs text-muted-foreground">
                        {publishedDate}
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={currentPage > 1 ? handlePreviousPageClick : undefined}
                    className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  />
                </PaginationItem>

                <PaginationItem>
                  <span className="px-4 py-2 text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={currentPage < totalPages ? handleNextPageClick : undefined}
                    className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Back to Home Button */}
        <div className="flex justify-center mt-12 mb-10">
          <Link 
            to="/" 
            className="bg-[#0A2463] text-white py-2 px-6 rounded flex items-center space-x-2 hover:bg-opacity-90 transition-opacity"
          >
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NucleusArchive;
