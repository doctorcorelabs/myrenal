import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal } from 'lucide-react'; // Added Terminal
import { useEffect, useState } from 'react';
import { useFeatureAccess, FeatureName } from '@/hooks/useFeatureAccess';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

const AIPeerReview = () => {
  const featureName: FeatureName = 'ai_peer_review';
  const { checkAccess, incrementUsage } = useFeatureAccess();
  const { toast } = useToast();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccess = async () => {
      setIsCheckingAccess(true);
      setAccessMessage(null);
      try {
        const result = await checkAccess(featureName);
        setAccessAllowed(result.allowed);
        if (result.allowed) {
          await incrementUsage(featureName);
          // Optionally show remaining quota
          // if (result.remaining !== null) {
          //   toast({ title: "Info", description: `Sisa kuota ${featureName.replace(/_/g, ' ')}: ${result.remaining}` });
          // }
        } else {
          setAccessMessage(result.message || 'Akses ditolak.');
        }
      } catch (error) {
        console.error("Error checking feature access:", error);
        setAccessAllowed(false);
        setAccessMessage('Gagal memeriksa akses fitur.');
        toast({
          title: "Error",
          description: "Tidak dapat memverifikasi akses fitur saat ini.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingAccess(false);
      }
    };

    verifyAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  return (
    <>
      <PageHeader
        title="AI Peer-Review"
        subtitle="Get AI-powered feedback on your clinical notes or case studies"
      />
      <div className="container max-w-7xl mx-auto px-4 py-8 flex flex-col flex-grow"> {/* Adjusted padding and added flex */}

        {/* Loading State */}
        {isCheckingAccess && (
           <div className="flex flex-col space-y-3 mt-4">
             <Skeleton className="h-[50px] w-full rounded-lg" />
             <Skeleton className="h-[600px] w-full rounded-lg" />
           </div>
         )}

        {/* Access Denied Message */}
        {!isCheckingAccess && !accessAllowed && (
           <Alert variant="destructive" className="mt-4">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Akses Ditolak</AlertTitle>
             <AlertDescription>
               {accessMessage || 'Anda tidak memiliki izin untuk mengakses fitur ini.'}
             </AlertDescription>
           </Alert>
         )}

        {/* Feature Content (Iframe) - Render only if access allowed */}
        {!isCheckingAccess && accessAllowed && (
          <iframe
            className="flex-grow mt-4" // Added class for consistency
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
