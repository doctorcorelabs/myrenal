import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import ChadsvascScore from '@/components/scores/ChadsvascScore';
import WellsScoreDvt from '@/components/scores/WellsScoreDvt';
import WellsScorePe from '@/components/scores/WellsScorePe';
import GcsScore from '@/components/scores/GcsScore';
import Curb65Score from '@/components/scores/Curb65Score';
import MeldScore from '@/components/scores/MeldScore';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal } from 'lucide-react'; // Added Terminal
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Import hook
import { FeatureName } from '@/lib/quotas'; // Import FeatureName from quotas.ts
import { useToast } from '@/components/ui/use-toast'; // Added toast
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert
import { Skeleton } from '@/components/ui/skeleton'; // Added Skeleton

const ClinicalScoringHub: React.FC = () => {
  const featureName: FeatureName = 'clinical_scoring';
  const { checkAccess, incrementUsage, isLoadingToggles } = useFeatureAccess();
  const { toast } = useToast();

  // State for access check result
  const [initialAccessAllowed, setInitialAccessAllowed] = useState(false);
  const [initialAccessMessage, setInitialAccessMessage] = useState<string | null>(null);

  // Initial access check on mount
  useEffect(() => {
    // Define the async function first
    const verifyInitialAccess = async () => {
      setInitialAccessMessage(null);
      try {
        const result = await checkAccess(featureName);
        // Check the result inside the try block
        if (result.quota === 0 || result.isDisabled) {
           setInitialAccessAllowed(false);
           setInitialAccessMessage(result.message || 'Akses ditolak.');
        } else {
           setInitialAccessAllowed(true);
        }
      } catch (error) { // Catch block correctly placed for the try
        console.error("Error checking initial feature access:", error);
        setInitialAccessAllowed(false);
        setInitialAccessMessage('Gagal memeriksa akses fitur.');
        toast({
          title: "Error",
          description: "Tidak dapat memverifikasi akses fitur saat ini.",
          variant: "destructive",
        });
      }
    }; // End of verifyInitialAccess async function

    // Only run verifyAccess if the hook is done loading toggles
    if (!isLoadingToggles) {
      verifyInitialAccess(); // Call the function conditionally
    } // End of if (!isLoadingToggles)
  }, [isLoadingToggles]); // Simplify dependency array

  // TODO: Pass incrementUsage down to individual score components or have them use the hook.
  // For now, usage is only checked on initial load.

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Clinical Scoring Hub"
        subtitle="A collection of validated clinical scoring calculators for risk stratification, diagnosis, severity assessment, and prognosis."
      />

      {/* Show Skeleton only based on the hook's loading state */}
      {isLoadingToggles && (
         <div className="flex flex-col space-y-3 mt-6">
           <Skeleton className="h-[150px] w-full rounded-lg" />
           <Skeleton className="h-[150px] w-full rounded-lg" />
           <Skeleton className="h-[300px] w-full rounded-lg" />
         </div>
       )}

      {/* Access Denied Message (Show only if hook is NOT loading and access is denied) */}
      {!isLoadingToggles && !initialAccessAllowed && (
         <Alert variant="destructive" className="mt-6">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Akses Ditolak</AlertTitle>
           <AlertDescription>
             {initialAccessMessage || 'Anda tidak memiliki izin untuk mengakses fitur ini.'}
           </AlertDescription>
         </Alert>
       )}

      {/* Render content only if NOT loading and access IS allowed */}
      {!isLoadingToggles && initialAccessAllowed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Placeholder for Score Categories/Calculators */}
            <Card>
          <CardHeader>
            <CardTitle>Cardiology Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Calculators related to cardiovascular risk and conditions.</p>
            {/* Links or embedded calculators will go here */}
            <p className="mt-4 text-sm text-muted-foreground text-justify">(CHADS2-VASc, HEART Score, etc.)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pulmonology/Critical Care Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Calculators for respiratory conditions and critical illness.</p>
            {/* Links or embedded calculators will go here */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(Wells' PE, CURB-65, GCS, etc.)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastroenterology Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Calculators relevant to liver and digestive diseases.</p>
            {/* Links or embedded calculators will go here */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(MELD Score, etc.)</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Other Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Various other useful clinical scores.</p>
            {/* Links or embedded calculators will go here */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(Wells' DVT, etc.)</p>
          </CardContent>
        </Card>
        {/* Add more category cards as needed */}
      </div>

      {/* Display Calculators Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Calculators</h2>
        {/* We can add logic here later to select which calculator to show */}
        {/* For now, just display the CHADS2-VASc */}
        <ChadsvascScore />
        <WellsScoreDvt />
        <WellsScorePe />
        <GcsScore />
        <Curb65Score />
        <MeldScore />

        {/* Placeholder for other calculators */}
      </div>

      {/* Back to Tools Button */}
      <div className="mt-12 mb-8 flex justify-center">
        <Link to="/tools">
          <Button variant="outline" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </Link>
      </div>
     </>
    )} {/* End of initialAccessAllowed block */}
    </div>
  );
};

export default ClinicalScoringHub;
