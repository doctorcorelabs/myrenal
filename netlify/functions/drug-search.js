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

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
       const errorBody = data.error ? data.error.message : `HTTP error ${response.status}`;
       console.error("OpenFDA API Error:", errorBody);
       return {
         statusCode: response.status,
         body: JSON.stringify({ error: `OpenFDA API Error: ${errorBody}` }),
       };
    }

    if (data.results && data.results.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(data.results[0]), 
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No results found' }),
      };
    }
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch drug data via serverless function.' }),
    };
  }
};
