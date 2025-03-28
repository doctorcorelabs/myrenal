import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

// Define a type for the expected result structure
interface DrugResult {
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    manufacturer_name?: string[];
    spl_set_id?: string[];
  };
  indications_and_usage?: string[];
  boxed_warning?: string[];
  mechanism_of_action?: string[]; // Added
  contraindications?: string[]; // Added
  dosage_forms_and_strengths?: string[]; // Added
  adverse_reactions?: string[]; // Added
}

const DrugReference = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<DrugResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = async () => {
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

  // Helper to display results safely
  const displayResults = (result: DrugResult) => {
    const genericName = result.openfda?.generic_name?.join(', ') ?? 'N/A';
    const brandName = result.openfda?.brand_name?.join(', ') ?? 'N/A';
    const manufacturer = result.openfda?.manufacturer_name?.join(', ') ?? 'N/A';
    const indications = result.indications_and_usage?.[0]?.substring(0, 700) ?? 'N/A';
    const indicationsTruncated = result.indications_and_usage?.[0]?.length > 700;
    const boxedWarning = result.boxed_warning?.[0]?.substring(0, 700) ?? null;
    const boxedWarningTruncated = result.boxed_warning?.[0]?.length > 700;
    // Extract new fields
    const mechanism = result.mechanism_of_action?.[0]?.substring(0, 700) ?? 'N/A';
    const mechanismTruncated = result.mechanism_of_action?.[0]?.length > 700;
    const contraindications = result.contraindications?.[0]?.substring(0, 700) ?? 'N/A';
    const contraindicationsTruncated = result.contraindications?.[0]?.length > 700;
    const dosageForms = result.dosage_forms_and_strengths?.[0]?.substring(0, 700) ?? 'N/A';
    const dosageFormsTruncated = result.dosage_forms_and_strengths?.[0]?.length > 700;
    const adverseReactions = result.adverse_reactions?.[0]?.substring(0, 700) ?? 'N/A';
    const adverseReactionsTruncated = result.adverse_reactions?.[0]?.length > 700;

    const splSetId = result.openfda?.spl_set_id?.[0] ?? null;
    const dailyMedLink = splSetId ? `https://dailymed.nlm.nih.gov/dailymed/spl.cfm?setid=${splSetId}` : null;

    return (
      <div className="space-y-6"> {/* Increased spacing */}
        <h3 className="text-2xl font-semibold text-medical-blue">{brandName} <span className="text-lg font-normal text-gray-600">({genericName})</span></h3>
        <p><strong className="text-gray-700">Manufacturer:</strong> {manufacturer}</p>
        
        {boxedWarning && (
          <Alert variant="destructive" className="bg-red-50 border-red-500 text-red-800">
             <AlertTriangle className="h-4 w-4 !text-red-800" />
             <AlertTitle className="font-bold">Boxed Warning</AlertTitle>
             <AlertDescription>{boxedWarning}{boxedWarningTruncated ? '...' : ''}</AlertDescription>
          </Alert>
        )}

        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Indications and Usage:</h4>
          <p className="text-gray-700 text-justify">{indications}{indicationsTruncated ? '...' : ''}</p>
        </div>

        {/* Added Sections */}
        {mechanism !== 'N/A' && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Mechanism of Action:</h4>
            <p className="text-gray-700 text-justify">{mechanism}{mechanismTruncated ? '...' : ''}</p>
          </div>
        )}
        {contraindications !== 'N/A' && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Contraindications:</h4>
            <p className="text-gray-700 text-justify">{contraindications}{contraindicationsTruncated ? '...' : ''}</p>
          </div>
        )}
         {dosageForms !== 'N/A' && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Dosage Forms & Strengths:</h4>
            <p className="text-gray-700 text-justify">{dosageForms}{dosageFormsTruncated ? '...' : ''}</p>
          </div>
        )}
         {adverseReactions !== 'N/A' && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Adverse Reactions:</h4>
            <p className="text-gray-700 text-justify">{adverseReactions}{adverseReactionsTruncated ? '...' : ''}</p>
          </div>
        )}
        {/* End Added Sections */}

        {/* Removed DailyMed Link Section */}
      </div>
    );
  };


  return (
    <div>
      <PageHeader 
        title="Drug Reference" 
        subtitle="Search US FDA drug label information via OpenFDA." 
      />
      
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Disclaimer */}
          <Alert variant="destructive" className="mb-8 bg-yellow-50 border-yellow-500 text-yellow-800">
            <AlertTriangle className="h-4 w-4 !text-yellow-800" />
            <AlertTitle className="font-bold">Disclaimer</AlertTitle>
            <AlertDescription>
              This feature is for informational and educational purposes ONLY, utilizing data from OpenFDA (US FDA). Information may not be complete, fully up-to-date, or applicable outside the US. It DOES NOT substitute for professional medical advice, diagnosis, or treatment. Always consult your doctor or pharmacist regarding medications.
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

          {/* Back Button */}
          <div className="mt-12 flex justify-center"> 
            <Link to="/tools">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Tools
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugReference;
