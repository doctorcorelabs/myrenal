import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from 'axios';
import * as cheerio from 'cheerio';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let query: string | undefined;
  try {
    const body = JSON.parse(event.body || '{}');
    query = body.query;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid 'query' parameter in request body." }) };
    }
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body." }) };
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const searchUrl = `https://www.mayoclinic.org/search/search-results?q=${encodedQuery}`;
  let diseasePageUrl: string | undefined;

  try {
    // 1. Fetch search results page
    console.log(`Fetching search results from: ${searchUrl}`);
    const searchResponse = await axios.get(searchUrl, {
      headers: { // Add a basic User-Agent header
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $search = cheerio.load(searchResponse.data);

    // 2. Find the first relevant link (heuristic: look for links within common result structures)
    // Adjusting selector based on previous failure. Trying a slightly broader list item link selector.
    diseasePageUrl = $search('div.results li a[href^="/diseases-conditions/"]').first().attr('href'); 
    
    if (diseasePageUrl && !diseasePageUrl.startsWith('http')) {
        diseasePageUrl = `https://www.mayoclinic.org${diseasePageUrl}`;
    }

    console.log(`Found potential disease page URL: ${diseasePageUrl}`);

    if (!diseasePageUrl) {
      return { 
        statusCode: 404, 
        body: JSON.stringify({ error: `Could not find a relevant disease page link on Mayo Clinic for "${query}". The search results page structure might have changed.` }) 
      };
    }

    // 3. Fetch the disease page
    console.log(`Fetching disease page content from: ${diseasePageUrl}`);
    const diseaseResponse = await axios.get(diseasePageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const $disease = cheerio.load(diseaseResponse.data);

    // 4. Extract main content text (heuristic: look for common content containers)
    // This selector is also a guess and likely needs refinement. Trying common article body selectors.
    let contentText = $disease('article .content > p, article .main-content > p, #main-content p').text(); 
    
    // Basic cleanup
    contentText = contentText.replace(/\s\s+/g, ' ').trim(); // Remove extra whitespace

    console.log(`Extracted content length: ${contentText.length}`);

    if (!contentText) {
        return { 
            statusCode: 404, 
            body: JSON.stringify({ error: `Could not extract main content from the disease page "${diseasePageUrl}". The page structure might have changed.` }) 
        };
    }

    // Limit content length to avoid overly large responses (e.g., first 2000 chars)
    const maxChars = 2000;
    if (contentText.length > maxChars) {
        contentText = contentText.substring(0, maxChars) + '... [truncated]';
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scrapedText: contentText }),
    };

  } catch (error: any) {
    console.error("Scraping error:", error.message);
    // Provide more specific error if possible
    let errorMessage = `Failed to scrape Mayo Clinic for "${query}".`;
    if (axios.isAxiosError(error)) {
        errorMessage += ` Axios Error: ${error.message} (Status: ${error.response?.status})`;
        if (error.response?.status === 403) {
            errorMessage += ` Access might be forbidden (403). Scraping could be blocked.`;
        }
    } else if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage, details: error.message }),
    };
  }
};

export { handler };
