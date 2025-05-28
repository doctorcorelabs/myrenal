import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal } from 'lucide-react'; // Added Terminal
import { useEffect, useState } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Import hook
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const AIPeerReview = () => {
  const featureName: string = 'ai_peer_review';
  // Get isLoadingToggles from the hook
  const { checkAccess, isLoadingToggles } = useFeatureAccess();
  const { toast } = useToast();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true); // Still track page-specific check
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Only run verifyAccess if the hook is done loading toggles
    if (!isLoadingToggles) {
      const verifyAccess = async () => {
        setIsCheckingAccess(true); // Start page-specific check
        setAccessMessage(null);
        try {
          const result = await checkAccess(featureName);
          setAccessAllowed(result.allowed);
          setAccessMessage(result.message);
        } catch (error) {
          console.error("Error checking feature access:", error);
          setAccessAllowed(false);
          setAccessMessage('Failed to check feature access.');
          toast({
            title: "Error",
            description: "Could not verify feature access at this time.",
            variant: "destructive",
          });
        } finally {
          setIsCheckingAccess(false); // Finish page-specific check
        }
      };
      verifyAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingToggles]); // Re-run when hook loading state changes

  // Determine overall loading state
  const isLoading = isCheckingAccess || isLoadingToggles;

  return (
    <>
      <PageHeader
        title="Peninjauan Sejawat AI"
        subtitle="Dapatkan umpan balik bertenaga AI pada catatan klinis atau studi kasus Anda"
      />
      <div className="container max-w-7xl mx-auto px-4 py-8 flex flex-col flex-grow">

        {/* Show Skeleton if overall loading is true */}
        {isLoading && (
           <div className="flex flex-col space-y-3 mt-4">
             <Skeleton className="h-[50px] w-full rounded-lg" />
             <Skeleton className="h-[600px] w-full rounded-lg" />
           </div>
         )}

        {/* Access Denied Message (Show only if NOT loading and access is denied) */}
        {!isLoading && !accessAllowed && (
           <Alert variant="destructive" className="mt-4">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Access Denied</AlertTitle>
             <AlertDescription>
               {accessMessage || 'You do not have permission to access this feature.'}
             </AlertDescription>
           </Alert>
         )}

        {/* Feature Content (Iframe) - Render only if NOT loading and access IS allowed */}
        {!isLoading && accessAllowed && (
          <iframe
            className="flex-grow mt-4"
            src="https://udify.app/chatbot/8SCgHRUgX4NWc7YJ"
            style={{ width: '100%', border: 'none', minHeight: '700px' }} // Standardized style
            frameBorder="0"
            allow="microphone">
          </iframe>
        )}
      </div>
      {/* Add Back to Tools button */}
      <div className="container max-w-7xl mx-auto px-4 pb-12 text-center"> {/* Added pb-12 for spacing and text-center */}
        <Link to="/tools">
          <Button variant="outline" className="inline-flex items-center gap-2"> {/* Use inline-flex for button content alignment */}
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </Link>
      </div>
    </>
  );
};

export default AIPeerReview;
