import React, { useEffect, useState } from 'react'; // Added useEffect, useState
import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal } from 'lucide-react'; // Added Terminal
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Added hook
import { FeatureName } from '@/lib/quotas'; // Import FeatureName
import { useToast } from '@/hooks/use-toast'; // Added toast
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton

const LearningOther: React.FC = () => {
  const featureName: FeatureName = 'learning_resources'; // Use the same feature name for access check
  const { checkAccess, isLoadingToggles } = useFeatureAccess();
  const { toast } = useToast();

  const [isCheckingInitialAccess, setIsCheckingInitialAccess] = useState(true);
  const [initialAccessAllowed, setInitialAccessAllowed] = useState(false);
  const [initialAccessMessage, setInitialAccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoadingToggles) {
      const verifyInitialAccess = async () => {
        setIsCheckingInitialAccess(true);
        setInitialAccessMessage(null);
        try {
          const result = await checkAccess(featureName);
          if (result.quota === 0) { // Check if access is denied (Free tier)
              setInitialAccessAllowed(false);
              setInitialAccessMessage(result.message || 'Access denied. Upgrade your plan to access this feature.');
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
          setIsCheckingInitialAccess(false);
        }
      };
      verifyInitialAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingToggles, featureName]);

  const isLoading = isCheckingInitialAccess || isLoadingToggles;

  return (
    <>
      <PageHeader
        title="Learning Resources: Other"
        subtitle="A collection of various other learning materials and links." // Updated subtitle
      />
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {/* Access Denied Message */}
        {!isLoading && !initialAccessAllowed && (
          <Alert variant="destructive" className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              {initialAccessMessage || 'You do not have permission to access this feature. Please upgrade your plan.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Actual Content (only if not loading and access is allowed) */}
        {!isLoading && initialAccessAllowed && (
          <>
            {/* Placeholder content */}
            <p>Other learning resources content goes here.</p>
            {/* Add more specific content for Other Resources later */}
          </>
        )}

        {/* Back button (always show) */}
        <div className="mt-12">
          <Link to="/tools/learning-resources">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Learning Resources
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LearningOther;
