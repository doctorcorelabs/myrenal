// src/components/admin/NucleusSubmissionsAdmin.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { useInView } from 'react-intersection-observer'; // Import useInView
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'; // Use Card for mobile view
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle, RefreshCw, Loader2, Inbox } from 'lucide-react'; // Icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react"; // Icon for error alert

// Define the structure for submission data fetched from the DB
interface NucleusSubmission {
  id: number;
  created_at: string;
  title: string;
  name?: string | null; // Submitter's name
  email?: string | null; // Submitter's email
  status: string;
  // Add other fields if needed for display, e.g., summary
  summary?: string | null;
}

const NucleusSubmissionsAdmin: React.FC = () => {
  const [submissions, setSubmissions] = useState<NucleusSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For subsequent loads
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<number, 'approving' | 'rejecting' | null>>({});
  const [page, setPage] = useState(0); // Start at page 0
  const [hasMore, setHasMore] = useState(true); // Assume there's more data initially
  const { toast } = useToast();
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({ threshold: 0.5 }); // Hook for intersection observer

  const ITEMS_PER_PAGE = 5; // Number of items to fetch per page

  const fetchPendingSubmissions = useCallback(async (pageNum: number) => {
    console.log(`Fetching page: ${pageNum}`); // Debug log
    if (pageNum === 0) {
      setIsLoading(true); // Initial load indicator
      setSubmissions([]); // Clear existing submissions on initial load/refresh
    } else {
      setIsLoadingMore(true); // Subsequent load indicator
    }
    setError(null);

    const from = pageNum * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const { data, error: dbError, count } = await supabase
        .from('nucleus_submissions')
        .select('id, created_at, title, name, email, status, summary', { count: 'exact' }) // Fetch count
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .range(from, to);

      if (dbError) throw dbError;

      const newSubmissions = data || [];
      console.log(`Fetched ${newSubmissions.length} items for page ${pageNum}`); // Debug log

      setSubmissions(prev => pageNum === 0 ? newSubmissions : [...prev, ...newSubmissions]);
      // Check if there are more items to load
      // If the number fetched is less than ITEMS_PER_PAGE, there are no more.
      setHasMore(newSubmissions.length === ITEMS_PER_PAGE);
      console.log(`Has more: ${newSubmissions.length === ITEMS_PER_PAGE}`); // Debug log

    } catch (err: any) {
      console.error('Error fetching pending NUCLEUS submissions:', err);
      setError(err.message || 'Could not load pending submissions.');
      // Don't clear submissions on error during load more
      if (pageNum === 0) setSubmissions([]);
    } finally {
      if (pageNum === 0) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [supabase]);

  // Effect to fetch initial data or when page changes
  useEffect(() => {
    fetchPendingSubmissions(page);
  }, [fetchPendingSubmissions, page]);

  // Effect to load more data when the sentinel element is in view
  useEffect(() => {
    if (loadMoreInView && hasMore && !isLoadingMore && !isLoading) {
      console.log("Load more triggered!"); // Debug log
      setPage(prevPage => prevPage + 1);
    }
  }, [loadMoreInView, hasMore, isLoadingMore, isLoading]);

  // Function to refresh data (resets to page 0)
  const handleRefresh = () => {
    setPage(0); // Reset page to 0
    fetchPendingSubmissions(0); // Explicitly fetch the first page
  };

  // Function to update submission status
  const updateSubmissionStatus = async (id: number, newStatus: 'approved' | 'rejected') => {
    setUpdatingStatus(prev => ({ ...prev, [id]: newStatus === 'approved' ? 'approving' : 'rejecting' }));
    try {
      const { error: updateError } = await supabase
        .from('nucleus_submissions')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Submission ${newStatus} successfully.`,
      });

      // Refresh the list after successful update by resetting to page 0
      setPage(0); // This will re-trigger the fetch useEffect

    } catch (err: any) {
      console.error(`Error updating submission ${id} to ${newStatus}:`, err);
      toast({
        title: `Error ${newStatus === 'approved' ? 'Approving' : 'Rejecting'} Submission`,
        description: err.message || `Could not update submission status.`,
        variant: "destructive",
      });
    } finally {
       setUpdatingStatus(prev => ({ ...prev, [id]: null })); // Clear loading state for this item
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>NUCLEUS Submissions Pending Review</CardTitle>
            <CardDescription>Review ideas submitted by users.</CardDescription>
           </div>
           <Button
             onClick={handleRefresh} // Use the correct handler
             variant="outline"
             size="sm"
            className="flex items-center gap-1 w-full md:w-auto"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading && page === 0 ? 'Refreshing...' : 'Refresh'}</span> {/* Adjust refresh text */}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Show initial loading indicator only when loading page 0 */}
        {isLoading && page === 0 && !error && <p>Loading pending submissions...</p>}
        {error && (
           <Alert variant="destructive" className="mb-4"> {/* Add margin bottom */}
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error Loading Submissions</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        {/* Show "No submissions" only if not loading initially and submissions array is empty */}
        {!isLoading && !isLoadingMore && submissions.length === 0 && !error && (
          <div className="text-center text-muted-foreground py-4">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <p>No pending submissions found.</p>
          </div>
        )}
        {/* Render submissions if available */}
        {submissions.length > 0 && (
          <>
            {/* Table View for Medium Screens and Up - Added horizontal scroll */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.title}</TableCell>
                      <TableCell>{sub.name || (sub.email ? `(${sub.email})` : 'Anonymous')}</TableCell>
                      <TableCell>{format(new Date(sub.created_at), 'PP')}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateSubmissionStatus(sub.id, 'approved')}
                          disabled={!!updatingStatus[sub.id]}
                          title="Approve Submission"
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                        >
                          {updatingStatus[sub.id] === 'approving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          <span className="ml-1 hidden lg:inline">Approve</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateSubmissionStatus(sub.id, 'rejected')}
                          disabled={!!updatingStatus[sub.id]}
                          title="Reject Submission"
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          {updatingStatus[sub.id] === 'rejecting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                           <span className="ml-1 hidden lg:inline">Reject</span>
                        </Button>
                        {/* Optional: Add a button/modal to view full details */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Card View for Small Screens - Remove max-height */}
            <div className="block md:hidden space-y-4">
              {submissions.map((sub, index) => (
                // Add ref to the last card for intersection observer on mobile
                <Card key={`card-sub-${sub.id}`} ref={index === submissions.length - 1 ? loadMoreRef : null}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">{sub.title}</CardTitle>
                    <CardDescription>
                      By: {sub.name || (sub.email ? `(${sub.email})` : 'Anonymous')} | Submitted: {format(new Date(sub.created_at), 'PP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-end space-x-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => updateSubmissionStatus(sub.id, 'approved')}
                       disabled={!!updatingStatus[sub.id]}
                       className="text-green-600 border-green-600 hover:bg-green-50"
                     >
                       {updatingStatus[sub.id] === 'approving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                       Approve
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => updateSubmissionStatus(sub.id, 'rejected')}
                       disabled={!!updatingStatus[sub.id]}
                       className="text-red-600 border-red-600 hover:bg-red-50"
                     >
                       {updatingStatus[sub.id] === 'rejecting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                       Reject
                     </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sentinel element for Intersection Observer (mostly for table view) */}
            {/* This div will trigger loading more when it becomes visible */}
            <div ref={loadMoreRef} className="h-10" />

            {/* Loading indicator for subsequent pages */}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading more...</span>
              </div>
            )}

            {/* Message when all items are loaded */}
            {!hasMore && !isLoadingMore && submissions.length > 0 && (
              <p className="text-center text-muted-foreground py-4">No more submissions to load.</p>
            )}
          </>
        )}
        {/* Handle case where initial load is done, no error, but submissions is still empty */}
         {!isLoading && !isLoadingMore && submissions.length === 0 && !error && (
           <div className="text-center text-muted-foreground py-4">
             <Inbox className="mx-auto h-12 w-12 text-gray-400" />
             <p>No pending submissions found.</p>
           </div>
         )}
      </CardContent>
    </Card>
  );
};

export default NucleusSubmissionsAdmin;
