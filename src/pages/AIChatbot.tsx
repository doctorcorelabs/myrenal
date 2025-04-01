import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal } from 'lucide-react'; // Added Terminal
import { useEffect, useState } from 'react';
import { useFeatureAccess, FeatureName } from '@/hooks/useFeatureAccess';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
const AIChatbot = () => {
  const featureName: FeatureName = 'ai_chatbot';
  const { checkAccess, incrementUsage } = useFeatureAccess();
  const { toast } = useToast();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccess = async () => {
      setIsCheckingAccess(true);
      setAccessMessage(null); // Clear previous message
      try {
        const result = await checkAccess(featureName);
        setAccessAllowed(result.allowed);
        if (result.allowed) {
          // Increment usage only if access is granted
          // We increment usage *before* the user interacts with the iframe
          // Alternatively, could increment based on iframe interaction, but that's more complex.
          await incrementUsage(featureName);
          // Optionally show remaining quota
          // if (result.remaining !== null) {
          //   toast({ title: "Info", description: `Sisa kuota ${featureName.replace(/_/g, ' ')}: ${result.remaining}` });
          // }
        } else {
          setAccessMessage(result.message || 'Akses ditolak.'); // Set message if denied
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
        title="AI Chatbot"
         subtitle="Engage with an AI assistant for medical information and queries" 
       />
       {/* Make this container grow and use flexbox for the iframe */}
       <div className="container max-w-7xl mx-auto px-4 flex flex-col flex-grow">

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
             className="flex-grow mt-4" // Make iframe grow and add top margin
             src="https://udify.app/chatbot/75qYJluLWB08Iupl"
             style={{ width: '100%', border: 'none', minHeight: '700px' }} // Removed fixed height, keep minHeight
              allow="microphone">
            </iframe>
         )}

          {/* Back to Tools Button */}
          <div className="flex justify-center mt-8 mb-4"> {/* Added mb-4 for spacing above footer */}
            <Link to="/tools">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Tools
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
};

export default AIChatbot;
