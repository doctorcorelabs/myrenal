import { useState, useEffect } from 'react'; // Added useEffect
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Label might not be used, but keep for now
// import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Loader2, Terminal } from 'lucide-react'; // Added Terminal
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Added hook
import { useAuth } from '@/contexts/AuthContext'; // Added Auth context
import { useToast } from '@/components/ui/use-toast'; // Added toast
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import PageHeader from '../components/PageHeader';

// Define a type for the data items (text + source)
interface DataItem {
  text: string;
  source: 'fda' | 'ai' | 'unavailable';
}

// Update the result structure to use DataItem
interface DrugResult {
  openfda?: {
    generic_name?: DataItem[];
    brand_name?: DataItem[];
    manufacturer_name?: DataItem[];
    spl_set_id?: DataItem[]; // Assuming spl_set_id remains simple string or needs adjustment
  };
  indications_and_usage?: DataItem[];
  boxed_warning?: DataItem[];
  mechanism_of_action?: DataItem[];
  contraindications?: DataItem[];
  dosage_forms_and_strengths?: DataItem[];
  adverse_reactions?: DataItem[];
}


const DrugReference = () => {
  const featureName: string = 'drug_reference';
  // Get isLoadingToggles from the hook
  const { checkAccess, isLoadingToggles } = useFeatureAccess();
  const { toast } = useToast();
  const { } = useAuth(); // Removed openUpgradeDialog

  // State for initial access check
  const [isCheckingInitialAccess, setIsCheckingInitialAccess] = useState(true);
  const [initialAccessAllowed, setInitialAccessAllowed] = useState(false);
  const [initialAccessMessage, setInitialAccessMessage] = useState<string | null>(null);

  // Component state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<DrugResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for search action
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  // Initial access check on mount
  useEffect(() => {
    // Only run verifyAccess if the hook is done loading toggles
    if (!isLoadingToggles) {
      const verifyInitialAccess = async () => {
        setIsCheckingInitialAccess(true); // Start page-specific check
        setInitialAccessMessage(null);
        try {
          const result = await checkAccess(featureName);
          setInitialAccessAllowed(result.allowed);
          setInitialAccessMessage(result.message);
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


  const handleSearch = async () => {
    // --- Action Access Check ---
     const accessResult = await checkAccess(featureName);
     if (!accessResult.allowed) {
       toast({
         title: "Access Denied",
         description: accessResult.message || 'You cannot perform a search at this time.',
         variant: "destructive",
       });
       return; // Stop the search
    }
    // --- End Action Access Check ---

    if (!searchTerm.trim()) {
      setError('Please enter a drug name.');
      setResults(null);
      setSearched(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setSearched(true);

    const encodedDrugName = encodeURIComponent(searchTerm.trim());
    const functionUrl = `/.netlify/functions/drug-search?term=${encodedDrugName}`;

    try {
      const response = await fetch(functionUrl);

      // Handle non-OK responses first
      if (!response.ok) {
        if (response.status === 404) {
          setError(`No results found for "${searchTerm}". Please check spelling or try another name.`);
        } else {
          // Try to get error message from function response body
          let errorMsg = `Request failed with status: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMsg = errorData.error;
            }
          } catch (parseError) {
            // Ignore if parsing fails, stick with the status code message
            console.error("Could not parse error response:", parseError);
          }
          setError(errorMsg);
        }
        // Important: Stop further processing on error
        return; 
      }

      // If response is OK (200), parse the result
      const resultData = await response.json();
      setResults(resultData);

    } catch (err) {
      // Handle network errors or errors during fetch/parsing
      console.error('Error fetching drug data:', err);
      let message = 'An error occurred while fetching data. Please check your network connection and try again later.';
      if (err instanceof Error) {
        message = err.message; // Use specific error message if available
      }
      setError(message);
    } finally {
      // This block always executes
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper component to display text with AI disclaimer
  const DisplayField = ({ label, data }: { label: string; data?: DataItem[] }) => {
    const item = data?.[0]; // Get the first item
    if (!item || item.source === 'unavailable' || !item.text || item.text.trim() === '') {
       // Don't render the section if data is unavailable or empty
       // Optionally, render a placeholder:
       // return (
       //   <div>
       //     <h4 className="font-semibold text-gray-800 mb-1">{label}:</h4>
       //     <p className="text-gray-500 italic">Information not available.</p>
       //   </div>
       // );
       return null;
    }

    const isAi = item.source === 'ai';

    // Define allowed elements for safety if needed, or use defaults
    // const allowedElements = ['p', 'strong', 'em', 'ul', 'ol', 'li']; 
    
    return (
      <div>
        <h4 className="font-semibold text-gray-800 mb-1">{label}:</h4>
        <div className="text-gray-700 text-justify prose prose-sm max-w-none"> {/* Add prose classes for basic styling */}
          <ReactMarkdown 
            // allowedElements={allowedElements} // Uncomment to restrict elements
            // unwrapDisallowed={true} // Unwrap disallowed elements instead of removing them
          >
            {item.text}
          </ReactMarkdown>
          {isAi && <span className="text-xs italic text-orange-600 ml-1 block mt-1">(AI generated, verify with a professional)</span>} {/* Make disclaimer block */}
        </div>
      </div>
    );
  };

   // Helper component for Boxed Warning specifically
   const DisplayBoxedWarning = ({ data }: { data?: DataItem[] }) => {
    const item = data?.[0];
    if (!item || item.source === 'unavailable' || !item.text || item.text.trim() === '') {
      return null; // Don't show warning section if no data
    }
    const isAi = item.source === 'ai';
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-500 text-red-800">
        <AlertTriangle className="h-4 w-4 !text-red-800" />
        <AlertTitle className="font-bold">Boxed Warning</AlertTitle>
        <AlertDescription> {/* Removed asChild prop */}
           <div className="prose prose-sm max-w-none text-justify"> {/* Add prose classes AND text-justify */}
             <ReactMarkdown>{item.text}</ReactMarkdown>
             {isAi && <span className="text-xs italic text-orange-600 ml-1 block mt-1">(AI generated, verify with a professional)</span>} {/* Make disclaimer block */}
           </div>
        </AlertDescription>
      </Alert>
    );
  };


  // Helper to display results safely using the new structure
  const displayResults = (result: DrugResult) => {
    // Helper to join text from DataItem arrays
    const joinDataItems = (items?: DataItem[]): string => 
      items?.map(item => item.text).join(', ') ?? 'Information Not Available';

    const genericName = joinDataItems(result.openfda?.generic_name);
    const brandName = joinDataItems(result.openfda?.brand_name);
    const manufacturer = joinDataItems(result.openfda?.manufacturer_name);
    
    // Assuming splSetId is still simple, adjust if backend changes it
    const splSetId = (result.openfda?.spl_set_id as unknown as string[])?.[0] ?? null; 
    const dailyMedLink = splSetId ? `https://dailymed.nlm.nih.gov/dailymed/spl.cfm?setid=${splSetId}` : null;

    return (
      <div className="space-y-6"> {/* Increased spacing */}
        {/* Basic Info */}
        <h3 className="text-2xl font-semibold text-medical-blue">{brandName} <span className="text-lg font-normal text-gray-600">({genericName})</span></h3>
        <p><strong className="text-gray-700">Manufacturer:</strong> {manufacturer}</p>

        {/* Boxed Warning */}
        <DisplayBoxedWarning data={result.boxed_warning} />

        {/* Other Fields */}
        <DisplayField label="Indications and Usage" data={result.indications_and_usage} />
        <DisplayField label="Mechanism of Action" data={result.mechanism_of_action} />
        <DisplayField label="Contraindications" data={result.contraindications} />
        <DisplayField label="Dosage Forms & Strengths" data={result.dosage_forms_and_strengths} />
        <DisplayField label="Adverse Reactions" data={result.adverse_reactions} />
        {/* Removed extra closing tags from previous edit */}
        {/* Removed DailyMed Link Section - This comment was misplaced */}
      </div> // This closes the main div started for space-y-6
    );
  }; // This closes displayResults function


  return (
    <div>
      <PageHeader 
        title="Referensi Obat" 
        subtitle="Cari informasi label obat US FDA melalui OpenFDA."
      />

      <div className="container-custom">
        <div className="max-w-4xl mx-auto">

          {/* Show Skeleton if overall loading is true */}
          {(isCheckingInitialAccess || isLoadingToggles) && (
             <div className="flex flex-col space-y-3 mt-8">
               <Skeleton className="h-[120px] w-full rounded-lg" />
               <Skeleton className="h-[200px] w-full rounded-lg" />
             </div>
           )}

           {/* Access Denied Message (Show only if NOT loading and access is denied) */}
           {!(isCheckingInitialAccess || isLoadingToggles) && !initialAccessAllowed && (
              <Alert variant="destructive" className="mt-8">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  {initialAccessMessage || 'You do not have permission to access this feature.'}
                </AlertDescription>
              </Alert>
            )}

          {/* Render content only if NOT loading and access IS allowed */}
          {!(isCheckingInitialAccess || isLoadingToggles) && initialAccessAllowed && (
            <>
              {/* Disclaimer */}
              <Alert variant="destructive" className="mb-8 bg-yellow-50 border-yellow-500 text-yellow-800">
            <AlertTriangle className="h-4 w-4 !text-yellow-800" />
            <AlertTitle className="font-bold">Important Disclaimer</AlertTitle>
            <AlertDescription className="text-justify"> {/* Added text-justify */}
              {/* Wrap the disclaimer content in ReactMarkdown */}
              <ReactMarkdown> 
                {`This tool provides information primarily sourced from OpenFDA (US FDA). Where official data is unavailable for certain fields, **Artificial Intelligence (AI) may be used to supplement the information.**

All information, whether from official sources or AI, is for **informational and educational purposes ONLY.** It may not be complete, fully up-to-date, or applicable outside the US. **AI-generated content requires extra scrutiny and verification.**

This tool **DOES NOT substitute for professional medical advice, diagnosis, or treatment.** Always consult your doctor or pharmacist regarding medications and health concerns. Never disregard professional medical advice or delay seeking it because of something you have read here.`}
              </ReactMarkdown>
            </AlertDescription>
          </Alert>

          {/* Search Area */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Drug Information Search</CardTitle>
              <CardDescription>Enter a drug name (generic or brand)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="text" 
                id="drugSearchInput" 
                placeholder="e.g., Lisinopril, Advil" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow"
              />
              <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Search
              </Button>
            </CardContent>
          </Card>

          {/* Results Area */}
          <Card>
             <CardHeader>
               <CardTitle>Results</CardTitle>
             </CardHeader>
             <CardContent className="min-h-[150px]"> {/* Minimum height */}
                {isLoading && (
                  <div className="flex items-center justify-center text-gray-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </div>
                )}
                {error && !isLoading && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {results && !isLoading && displayResults(results)}
                {!results && !isLoading && !error && searched && (
                   <p className="text-center text-gray-500">No results found for the search term.</p>
                )}
                 {!results && !isLoading && !error && !searched && (
                   <p className="text-center text-gray-500">Enter a drug name above and click Search.</p>
                 )}
             </CardContent>
          </Card>
            </>
          )} {/* End of initialAccessAllowed block */}

          {/* Back Button */}
          <div className="mt-12 flex justify-center">
            <Link to="/treatment">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugReference;
