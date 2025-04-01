import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, ArrowLeft, Terminal } from 'lucide-react'; // Added Terminal
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useFeatureAccess, FeatureName } from '@/hooks/useFeatureAccess'; // Added hook
import { useToast } from '@/components/ui/use-toast'; // Added toast
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Link } from 'react-router-dom'; // Ensure Link is imported

interface GuidelineResult {
    pmid: string;
    title: string;
    journal: string;
    pubDate: string;
    link: string;
    pmcid?: string; 
}

const RESULTS_PER_PAGE = 30;

const ClinicalGuidelines = () => {
    const featureName: FeatureName = 'clinical_guidelines';
    const { checkAccess, incrementUsage } = useFeatureAccess();
    const { toast } = useToast();

    // State for initial access check
    const [isCheckingInitialAccess, setIsCheckingInitialAccess] = useState(true);
    const [initialAccessAllowed, setInitialAccessAllowed] = useState(false);
    const [initialAccessMessage, setInitialAccessMessage] = useState<string | null>(null);

    // Component state
    const [keywords, setKeywords] = useState('');
    const [results, setResults] = useState<GuidelineResult[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Loading state for search action
    const [error, setError] = useState<string | null>(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [targetPage, setTargetPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [dateFilter, setDateFilter] = useState('none');
    const [sortBy, setSortBy] = useState('relevance');
    const [freeFullTextOnly, setFreeFullTextOnly] = useState(false);

    const totalPages = totalResults > 0 ? Math.ceil(totalResults / RESULTS_PER_PAGE) : 0;

    // Initial access check on mount
    useEffect(() => {
        const verifyInitialAccess = async () => {
          setIsCheckingInitialAccess(true);
          setInitialAccessMessage(null);
          try {
            const result = await checkAccess(featureName);
            if (result.quota === 0) {
                 setInitialAccessAllowed(false);
                 setInitialAccessMessage(result.message || 'Akses ditolak untuk level Anda.');
            } else {
                 setInitialAccessAllowed(true);
            }
          } catch (error) {
            console.error("Error checking initial feature access:", error);
            setInitialAccessAllowed(false);
            setInitialAccessMessage('Gagal memeriksa akses fitur.');
            toast({
              title: "Error",
              description: "Tidak dapat memverifikasi akses fitur saat ini.",
              variant: "destructive",
            });
          } finally {
            setIsCheckingInitialAccess(false);
          }
        };

        verifyInitialAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); // Run only once on mount


    const fetchPageData = async (pageToFetch: number) => {
        // --- Action Access Check (for subsequent page fetches) ---
        // We assume initial access was granted to reach this point,
        // but we still check quota for fetching more pages.
        const accessResult = await checkAccess(featureName);
        if (!accessResult.allowed) {
          toast({
            title: "Akses Ditolak",
            description: accessResult.message || 'Anda tidak dapat memuat halaman selanjutnya saat ini.',
            variant: "destructive",
          });
          setIsLoading(false); // Ensure loading stops if denied
          return;
        }
        // --- End Action Access Check ---

        const trimmedKeywords = keywords.trim();
        if (trimmedKeywords === '') return;

        setIsLoading(true);
        setError(null);
        setTargetPage(pageToFetch); 

        const backendSortBy = (sortBy === 'pub_date_oldest' || sortBy === 'pub_date_newest') 
                              ? 'pub_date_newest' 
                              : 'relevance';

        try {
            const response = await axios.post(
                '/.netlify/functions/pubmed-guideline-search',
                { 
                    keywords: trimmedKeywords,
                    dateFilter: dateFilter, 
                    sortBy: backendSortBy, 
                    freeFullTextOnly: freeFullTextOnly, 
                    page: pageToFetch 
                }
            );

            if (response.data && Array.isArray(response.data.results)) {
                let finalResults = response.data.results;
                if (sortBy === 'pub_date_oldest') {
                    finalResults = finalResults.reverse();
                }
                setResults(finalResults);
                if (totalResults === 0 || pageToFetch === 1) {
                    setTotalResults(response.data.totalCount || 0);
                }
            } else {
                console.error("Unexpected response structure:", response.data);
                setError("Received an unexpected response from the server.");
                setResults([]);
                setTotalResults(0);
            }

        } catch (err: any) {
            console.error("Error fetching PubMed guidelines:", err);
            setError(err.response?.data?.error || err.message || "An unknown error occurred while searching PubMed.");
            setResults([]);
            setTotalResults(0);
        } finally {
            setIsLoading(false);
        }

        // --- Increment Usage (for subsequent page fetches) ---
        // Increment after successfully fetching a new page's data
        await incrementUsage(featureName);
        // --- End Increment Usage ---
    };

    const performPubmedSearch = async (resetPage = true) => {
        // --- Action Access Check (for initial search) ---
        const accessResult = await checkAccess(featureName);
        if (!accessResult.allowed) {
          toast({
            title: "Akses Ditolak",
            description: accessResult.message || 'Anda tidak dapat melakukan pencarian saat ini.',
            variant: "destructive",
          });
          return; // Stop the search
        }
        // --- End Action Access Check ---

        const trimmedKeywords = keywords.trim();
        if (trimmedKeywords === '') {
            toast({ title: "Input Required", description: "Please enter keywords to search." }); // Use toast instead of alert
            return;
        }
        
        if (resetPage) {
            setCurrentPage(1); 
            setTotalResults(0); 
            setResults([]);
        }
        setSearchPerformed(true); 

        setIsLoading(true);
        setError(null);
        const backendSortBy = (sortBy === 'pub_date_oldest' || sortBy === 'pub_date_newest') ? 'pub_date_newest' : 'relevance';

        try {
            const initialResponse = await axios.post(
                 '/.netlify/functions/pubmed-guideline-search',
                 { 
                    keywords: trimmedKeywords, 
                    dateFilter, 
                    sortBy: backendSortBy, 
                    freeFullTextOnly, 
                    page: 1 
                 }
            );

            if (initialResponse.data && typeof initialResponse.data.totalCount === 'number') {
                const fetchedTotalResults = initialResponse.data.totalCount || 0;
                setTotalResults(fetchedTotalResults);
                const calculatedTotalPages = fetchedTotalResults > 0 ? Math.ceil(fetchedTotalResults / RESULTS_PER_PAGE) : 0;

                if (fetchedTotalResults === 0) {
                    setResults([]);
                    setIsLoading(false);
                    return; 
                }

                const firstPageToFetch = sortBy === 'pub_date_oldest' ? calculatedTotalPages : 1;
                setCurrentPage(1); 
                await fetchPageData(firstPageToFetch); 

            } else {
                 console.error("Unexpected initial response structure:", initialResponse.data);
                 setError("Received an unexpected response structure while getting total count.");
                 setResults([]);
                 setTotalResults(0);
                 setIsLoading(false);
            }
        } catch (err) {
             console.error("Error fetching initial PubMed data:", err);
             setError("An error occurred while initiating the search.");
             setResults([]);
             setTotalResults(0);
             setIsLoading(false);
        }

        // --- Increment Usage (for initial search) ---
        // Increment after confirming the search will proceed
        await incrementUsage(featureName);
        // --- End Increment Usage ---
    };


    const handleSearchSubmit = () => {
        performPubmedSearch(true); 
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearchSubmit();
        }
    };

    const goToPreviousPage = () => {
        if (isLoading) return;
        if (sortBy === 'pub_date_oldest') {
            if (targetPage < totalPages) {
                setCurrentPage(currentPage + 1); 
                fetchPageData(targetPage + 1);
            }
        } else {
            if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
                fetchPageData(targetPage - 1);
            }
        }
    };

    const goToNextPage = () => {
         if (isLoading) return;
         if (sortBy === 'pub_date_oldest') {
            if (targetPage > 1) {
                setCurrentPage(currentPage - 1); 
                fetchPageData(targetPage - 1);
            }
         } else {
            if (currentPage < totalPages) {
                 setCurrentPage(currentPage + 1);
                 fetchPageData(targetPage + 1);
            }
         }
    };

    useEffect(() => {
        if (searchPerformed) { 
             performPubmedSearch(true); 
        }
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFilter, sortBy, freeFullTextOnly]); 

    const displayTotalPages = totalPages; 
    const isPrevDisabled = isLoading || currentPage <= 1;
    const isNextDisabled = isLoading || currentPage >= displayTotalPages;


    return (
        <>
            <PageHeader
                title="Clinical Guidelines"
                subtitle="Search PubMed for clinical practice guidelines."
            />
            <div className="container max-w-7xl mx-auto px-4 py-12">

                {/* Initial Loading State */}
                {isCheckingInitialAccess && (
                   <div className="flex flex-col space-y-3 mt-4">
                     <Skeleton className="h-[200px] w-full rounded-lg" /> {/* Placeholder for search card */}
                     <Skeleton className="h-[300px] w-full rounded-lg" /> {/* Placeholder for results area */}
                   </div>
                 )}

                {/* Initial Access Denied Message */}
                {!isCheckingInitialAccess && !initialAccessAllowed && (
                   <Alert variant="destructive" className="mt-4">
                     <Terminal className="h-4 w-4" />
                     <AlertTitle>Akses Ditolak</AlertTitle>
                     <AlertDescription>
                       {initialAccessMessage || 'Anda tidak memiliki izin untuk mengakses fitur ini.'}
                     </AlertDescription>
                   </Alert>
                 )}

                {/* Render content only if initial access is allowed */}
                {!isCheckingInitialAccess && initialAccessAllowed && (
                  <>
                    {/* PubMed Guideline Search Feature */}
                    <div className="pubmed-search-feature p-5 border border-gray-200 dark:border-gray-700 rounded-md mb-6 shadow-sm bg-card">
                     <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Search PubMed for Guidelines
                    </h3>
                    
                    {/* Search Input */}
                    <div className="search-controls flex flex-col sm:flex-row gap-3 items-center mb-4">
                        <Input
                            type="text"
                            id="pubmedSearchInput"
                            placeholder="Enter guideline keywords..."
                            className="flex-grow"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <Button
                            id="pubmedSearchButton"
                            onClick={handleSearchSubmit}
                            className="w-full sm:w-auto"
                            disabled={isLoading || keywords.trim() === ''} 
                        >
                            {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Search className="mr-2 h-4 w-4" /> )}
                            Search PubMed
                        </Button>
                    </div>


                    {/* Filters Row */}
                    <div className="flex flex-col gap-y-4 mb-4"> 
                        {/* Date Filter */}
                        <div className="date-filter"> 
                            <Label className="mb-2 block text-sm font-medium">Filter by Date:</Label>
                            <RadioGroup 
                                defaultValue="none" 
                                className="flex flex-row flex-wrap gap-4" 
                                value={dateFilter}
                                onValueChange={(value) => setDateFilter(value)}
                                disabled={isLoading}
                            >
                                <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="date-none" /><Label htmlFor="date-none">All Time</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="5years" id="date-5years" /><Label htmlFor="date-5years">Last 5 Years</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="10years" id="date-10years" /><Label htmlFor="date-10years">Last 10 Years</Label></div>
                            </RadioGroup>
                        </div>

                        {/* Sort By Filter */}
                        <div className="sort-filter">
                            <Label htmlFor="sort-by-select" className="mb-2 block text-sm font-medium">Sort by:</Label>
                            <Select 
                                value={sortBy} 
                                onValueChange={(value) => setSortBy(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="sort-by-select" className="w-full sm:w-[200px]"> 
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relevance">Relevance</SelectItem>
                                    <SelectItem value="pub_date_newest">Newest Date</SelectItem>
                                    <SelectItem value="pub_date_oldest">Oldest Date First</SelectItem> 
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Free Full Text Filter */}
                        <div className="flex items-center space-x-2"> 
                            <Checkbox 
                                id="free-text-checkbox" 
                                checked={freeFullTextOnly}
                                onCheckedChange={(checked) => setFreeFullTextOnly(checked === true)} 
                                disabled={isLoading}
                            />
                            <Label htmlFor="free-text-checkbox" className="text-sm font-medium">
                                Free Full Text Only
                            </Label>
                        </div>
                    </div>
                    </div>

                    {/* Results Section */}
                <div className="results-section mt-8">
                    {/* Loading/Error/No Results States */}
                    {isLoading && ( <div className="flex justify-center items-center gap-2 text-muted-foreground py-4"><Loader2 className="h-5 w-5 animate-spin" /><span>Searching PubMed...</span></div> )}
                    {error && ( <div className="flex justify-center items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md"><AlertCircle className="h-5 w-5" /><span>Error: {error}</span></div> )}
                    {!isLoading && !error && searchPerformed && results.length === 0 && ( <p className="text-center text-muted-foreground">No guidelines found matching your criteria.</p> )}

                    {/* Results Display */}
                    {!isLoading && !error && results.length > 0 && (
                        <>
                            {/* Result Count and Pagination Info */}
                            <div className="mb-4 text-sm text-muted-foreground flex justify-between items-center">
                                <span>Found {totalResults} results.</span>
                                {displayTotalPages > 1 && ( <span>Page {currentPage} of {displayTotalPages}</span> )}
                            </div>

                            {/* Results List */}
                            <div className="space-y-4">
                                {results.map((result) => (
                                    <Card key={result.pmid} className="overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base text-justify"> 
                                                <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{result.title}</a>
                                            </CardTitle>
                                            <CardDescription className="text-xs pt-1">PMID: {result.pmid}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground space-y-1 text-justify"> 
                                            <p><strong>Journal:</strong> {result.journal}</p>
                                            <p><strong>Date:</strong> {result.pubDate}</p>
                                            {result.pmcid && (
                                                <div className="mt-2"> 
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a 
                                                            href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${result.pmcid}/`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600" 
                                                        >
                                                            View on PubMed Central (PMC)
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {displayTotalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-6">
                                    <Button variant="outline" size="icon" onClick={goToPreviousPage} disabled={isPrevDisabled}><ChevronLeft className="h-4 w-4" /><span className="sr-only">Previous Page</span></Button>
                                    <span className="text-sm">Page {currentPage}</span>
                                    <Button variant="outline" size="icon" onClick={goToNextPage} disabled={isNextDisabled}><ChevronRight className="h-4 w-4" /><span className="sr-only">Next Page</span></Button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                 {/* Back to Tools Button */}
                 <div className="mt-12 text-center">
                    <Button variant="outline" asChild>
                        <Link to="/tools" className="inline-flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4" /> {/* Added icon */}
                            Back to Tools
                        </Link>
                    </Button>
                 </div>
                </>
               )} {/* End of initialAccessAllowed block */}
            </div>
        </>
    );
};

export default ClinicalGuidelines;
