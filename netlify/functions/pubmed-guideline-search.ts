import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from 'axios';
import { parseStringPromise } from 'xml2js'; // Import xml2js
import { format, subYears } from 'date-fns'; // Import date-fns for date calculations

// Helper for simple tag extraction (still needed for ESearch response)
const extractSimpleTagValue = (xmlString: string, tagName: string): string => {
    const tagPattern = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 's');
    const match = xmlString.match(tagPattern);
    return match ? match[1].trim() : '';
};
const extractMultipleSimpleTagValues = (xmlString: string, tagName: string): string[] => {
    const values: string[] = [];
    const tagPattern = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'gs');
    let match;
    while ((match = tagPattern.exec(xmlString)) !== null) {
        values.push(match[1].trim());
    }
    return values;
};

interface GuidelineResult {
    pmid: string;
    title: string;
    // authors: string; // Removed authors
    journal: string;
    pubDate: string;
    link: string;
    pmcid?: string; // Added optional PMCID field
}

// Helper to safely access potentially nested properties
const getSafe = (obj: any, path: string[], defaultValue: any = undefined): any => {
    return path.reduce((xs, x) => (xs && xs[x] !== undefined && xs[x] !== null) ? xs[x] : defaultValue, obj);
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // WARNING: Hardcoded API Key - Security Risk! Avoid committing this to public repositories.
    const apiKey = '1b0112bd513622f570ac6d1954a07805cc08'; 

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    let keywords = '';
    let dateFilter = 'none'; // Default to no date filter
    let page = 1; // Default to page 1
    let sortBy = 'relevance'; // Default sort order
    let freeFullTextOnly = false; // Default free text filter
    const resultsPerPage = 30; // Set results per page

    try {
        const body = JSON.parse(event.body || '{}');
        keywords = body.keywords?.trim();
        if (!keywords) {
            throw new Error("Keywords are required.");
        }
        // Validate and set dateFilter
        if (['5years', '10years', 'none'].includes(body.dateFilter)) {
            dateFilter = body.dateFilter;
        }
        // Validate and set sortBy
        if (['relevance', 'pub_date_newest'].includes(body.sortBy)) {
            sortBy = body.sortBy;
        }
         // Validate and set freeFullTextOnly
        if (typeof body.freeFullTextOnly === 'boolean') {
            freeFullTextOnly = body.freeFullTextOnly;
        }
        // Validate and set page number
        const requestedPage = parseInt(body.page, 10);
        if (!isNaN(requestedPage) && requestedPage > 0) {
            page = requestedPage;
        }

    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request body or missing keywords." }),
        };
    }

    const eSearchBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
    const eSummaryBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
    const db = 'pubmed';
    
    // Base search term
    let searchTerm = `${keywords} AND (Guideline[ptyp] OR Practice Guideline[ptyp])`;

    // Add date filter if applicable
    if (dateFilter === '5years' || dateFilter === '10years') {
        const yearsToSubtract = dateFilter === '5years' ? 5 : 10;
        const startDate = format(subYears(new Date(), yearsToSubtract), 'yyyy/MM/dd');
        // Use a far future date as the end date for simplicity
        const endDate = '3000/12/31'; 
        searchTerm += ` AND (${startDate}:${endDate}[dp])`;
    }

    // Add free full text filter if applicable
    if (freeFullTextOnly) {
        searchTerm += ` AND free full text[filter]`;
    }

    const retstart = (page - 1) * resultsPerPage;

    // Map frontend sortBy value to PubMed API sort value
    const pubmedSortParam = sortBy === 'pub_date_newest' ? 'pub+date' : 'relevance';

    try {
        // 1. ESearch: Find PMIDs for the current page
        const esearchResponse = await axios.get(eSearchBaseUrl, {
            params: { 
                db, 
                term: searchTerm, 
                retmax: resultsPerPage, 
                retstart: retstart, 
                sort: pubmedSortParam, // Add sort parameter
                usehistory: 'y', 
                api_key: apiKey, 
                retmode: 'xml' 
            },
        });
        const esearchXml = esearchResponse.data;
        const totalCount = parseInt(extractSimpleTagValue(esearchXml, 'Count') || '0', 10); // Get total count

        if (totalCount === 0) {
            // Return total count even if zero
            return { statusCode: 200, body: JSON.stringify({ totalCount: 0, results: [] }) }; 
        }
        const pmids = extractMultipleSimpleTagValues(esearchXml, 'Id');
        if (pmids.length === 0) {
             // Should ideally not happen if count > 0, but handle defensively
             return { statusCode: 200, body: JSON.stringify({ totalCount: totalCount, results: [] }) };
        }

        // 2. ESummary: Get details for the found PMIDs
        const esummaryResponse = await axios.get(eSummaryBaseUrl, {
            params: { db, id: pmids.join(','), api_key: apiKey, retmode: 'xml' },
        });
        const esummaryXml = esummaryResponse.data;
        
        // --- DEBUGGING: Log the raw XML response ---
        // console.log("--- PubMed ESummary Raw XML ---");
        // console.log(esummaryXml);
        // console.log("-------------------------------");
        // --- End Debugging Log --- // Keep commented out unless needed

        // Parse ESummary XML using xml2js, keeping attributes
        const parsedSummary = await parseStringPromise(esummaryXml, { 
            explicitArray: false, 
            trim: true,
            attrkey: '$' 
        });

        const results: GuidelineResult[] = [];
        const docSums = Array.isArray(getSafe(parsedSummary, ['eSummaryResult', 'DocSum'])) 
                        ? getSafe(parsedSummary, ['eSummaryResult', 'DocSum'], []) 
                        : [getSafe(parsedSummary, ['eSummaryResult', 'DocSum'])].filter(Boolean);

        for (const docSum of docSums) {
            const pmid = getSafe(docSum, ['Id']);
            if (!pmid) continue;

            let title = 'No Title Available';
            let pubDate = 'No Date';
            let source = 'No Journal';

            const items = Array.isArray(docSum.Item) ? docSum.Item : (docSum.Item ? [docSum.Item] : []);

            const titleItem = items.find(item => item?.$?.Name === 'Title');
            if (titleItem) title = titleItem._ || title; 

            const pubDateItem = items.find(item => item?.$?.Name === 'PubDate');
            if (pubDateItem) pubDate = pubDateItem._ || pubDate;

            const sourceItem = items.find(item => item?.$?.Name === 'Source');
            if (sourceItem) source = sourceItem._ || source;

            // --- Extract PMCID from ArticleIds ---
            let pmcid: string | undefined = undefined;
            const articleIdsItem = items.find(item => item?.$?.Name === 'ArticleIds'); 
            if (articleIdsItem && articleIdsItem.Item) { 
                const idItems = Array.isArray(articleIdsItem.Item) 
                                ? articleIdsItem.Item 
                                : [articleIdsItem.Item]; 
                // Find the specific ID item where the Name attribute is 'pmc'
                const pmcItem = idItems.find(idItem => idItem?.$?.Name === 'pmc');
                if (pmcItem && pmcItem._) {
                    pmcid = pmcItem._; // The value is directly the PMCID
                }
            }
            // --- End PMCID Extraction ---


            results.push({
                pmid: pmid,
                title: title,
                pmcid: pmcid, // Add pmcid to the result object
                journal: source,
                pubDate: pubDate,
                link: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
            });
        }

        // Return total count and results for the current page
        return {
            statusCode: 200,
            body: JSON.stringify({ totalCount: totalCount, results }), 
        };

    } catch (error: any) {
        console.error("PubMed API/Parsing Error:", error.response?.data || error.message);
        const errorMessage = error.message.includes('Non-whitespace before first tag') 
                             ? "Failed to parse PubMed XML response." 
                             : "Failed to fetch data from PubMed.";
        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage, details: error.message }),
        };
    }
};

export { handler };
