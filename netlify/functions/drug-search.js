// Use node-fetch v3+ with ES Module syntax
import fetch from 'node-fetch'; 

export const handler = async function(event, context) {
  const drugName = event.queryStringParameters.term;

  if (!drugName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing search term' }),
    };
  }

  const encodedDrugName = encodeURIComponent(drugName.trim());
  // Using the specific field search without boosting/parentheses, as it's less prone to syntax errors
  const apiUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodedDrugName}"+openfda.generic_name:"${encodedDrugName}"&limit=1`;
  // Fallback simple search if needed:
  // const apiUrl = `https://api.fda.gov/drug/label.json?search=${encodedDrugName}&limit=1`;

  console.log(`[drug-search] Fetching URL: ${apiUrl}`); // Log the URL

  try {
    const response = await fetch(apiUrl);
    console.log(`[drug-search] OpenFDA Response Status: ${response.status}`); // Log the status

    // Try to read the body regardless of status for logging purposes
    const responseText = await response.text(); 
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[drug-search] Failed to parse OpenFDA JSON response:", responseText);
      throw new Error(`Failed to parse OpenFDA response. Status: ${response.status}`);
    }


    if (!response.ok) {
       const errorBody = data.error ? data.error.message : `HTTP error ${response.status}`;
       console.error("[drug-search] OpenFDA API Error:", errorBody, "| Raw Response:", responseText.substring(0, 500)); // Log error and raw response
       return {
         statusCode: response.status,
         body: JSON.stringify({ error: `OpenFDA API Error: ${errorBody}` }),
       };
    }

    if (data.results && data.results.length > 0) {
      console.log(`[drug-search] Found ${data.results.length} result(s) for term: ${drugName}`); // Log success
      return {
        statusCode: 200,
        body: JSON.stringify(data.results[0]),
      };
    } else {
      console.log(`[drug-search] No results found for term: ${drugName}. Raw Response:`, responseText.substring(0, 500)); // Log no results and raw response
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No results found' }),
      };
    }
  } catch (error) {
    console.error('[drug-search] Netlify function execution error:', error); // Add prefix to error log
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch drug data via serverless function.' }),
    };
  }
};
