import React, { useEffect, useState } from 'react'; // Added useEffect, useState
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal } from 'lucide-react'; // Added Terminal
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Added hook
import { FeatureName } from '@/lib/quotas'; // Import FeatureName from quotas.ts
import { useToast } from '@/components/ui/use-toast'; // Added toast
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton

const resources = [
  {
    id: 'coursera',
    title: 'Coursera',
    description: 'Explore courses and specializations from top universities and companies.',
    path: '/tools/learning-resources/coursera',
  },
  {
    id: 'osmosis',
    title: 'Osmosis',
    description: 'Visual learning platform for medical students and professionals.',
    path: '/tools/learning-resources/osmosis',
  },
  {
    id: 'uptodate',
    title: 'UpToDate',
    description: 'Evidence-based clinical decision support resource.',
    path: '/tools/learning-resources/uptodate',
  },
  {
    id: 'other',
    title: 'Other Resources',
    description: 'A collection of various other learning materials and links.',
    path: '/tools/learning-resources/other',
  },
];

const LearningResources: React.FC = () => {
  const featureName: FeatureName = 'learning_resources';
  // Get isLoadingToggles from the hook
  const { checkAccess, isLoadingToggles } = useFeatureAccess();
  const { toast } = useToast();

  // State for initial access check
  const [isCheckingInitialAccess, setIsCheckingInitialAccess] = useState(true);
  const [initialAccessAllowed, setInitialAccessAllowed] = useState(false);
  const [initialAccessMessage, setInitialAccessMessage] = useState<string | null>(null);

  // Initial access check on mount
  useEffect(() => {
    // Only run verifyAccess if the hook is done loading toggles
    if (!isLoadingToggles) {
      const verifyInitialAccess = async () => {
        setIsCheckingInitialAccess(true); // Start page-specific check
        setInitialAccessMessage(null);
        try {
          const result = await checkAccess(featureName);
         // Learning Resources are only allowed if quota is not 0 (i.e., Researcher level)
         if (result.quota === 0) {
              setInitialAccessAllowed(false);
              setInitialAccessMessage(result.message || 'Access denied. This feature is only available for Researcher level.');
         } else {
              setInitialAccessAllowed(true);
         }
       } catch (error) {
         console.error("Error checking initial feature access:", error);
         setInitialAccessAllowed(false);
         setInitialAccessMessage('Failed to check feature access.');
         toast({
           title: "Error",
           description: "Could not verify feature access at this time.",
           variant: "destructive",
         });
       } finally {
          setIsCheckingInitialAccess(false); // Finish page-specific check
        }
      };
      verifyInitialAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingToggles]); // Re-run when hook loading state changes

  // Determine overall loading state
  const isLoading = isCheckingInitialAccess || isLoadingToggles;

  return (
    <>
      <PageHeader
        title="Learning Resources"
        subtitle="Curated educational materials and resources based on personal learning experiences"
      />
      <div className="container max-w-7xl mx-auto px-4 py-12">

        {/* Show Skeleton if overall loading is true */}
        {isLoading && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
             {[...Array(4)].map((_, i) => (
               <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
             ))}
           </div>
         )}

         {/* Access Denied Message (Show only if NOT loading and access is denied) */}
         {!isLoading && !initialAccessAllowed && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                {initialAccessMessage || 'You do not have permission to access this feature. This feature is only available for Researcher level.'}
              </AlertDescription>
            </Alert>
          )}

        {/* Render content only if NOT loading and access IS allowed */}
        {!isLoading && initialAccessAllowed && (
          <>
            {/* Changed lg:grid-cols-3 to lg:grid-cols-2 for better balance with 4 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Placeholder for potential future content within the card */}
                  </CardContent>
                  <CardFooter>
                    <Link to={resource.path} className="w-full">
                      <Button className="w-full bg-medical-teal hover:bg-medical-blue">Explore</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )} {/* End of initialAccessAllowed block */}

        {/* Add Back to Tools button */}
        <div className="mt-12 text-center"> 
          <Link to="/tools">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LearningResources;
