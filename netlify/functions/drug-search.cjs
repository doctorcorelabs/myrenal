// Use node-fetch v2.x with CommonJS syntax
const fetch = require('node-fetch');
// Import Google Generative AI
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use a standard, valid Gemini model name
const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest"; 
// Fields to potentially supplement with AI
const FIELDS_TO_SUPPLEMENT = [
  'indications_and_usage',
  'boxed_warning', // Note: AI generation for warnings needs extra caution
  'mechanism_of_action',
  'contraindications',
  'dosage_forms_and_strengths',
  'adverse_reactions'
];
// Safety settings for Gemini (adjust as needed, blocking harmful content)
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
// --- End Configuration ---

// Initialize Gemini Client (only if API key is present)
let genAI;
let geminiModel;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME, safetySettings });
    console.log(`[drug-search] Gemini client initialized with model: ${GEMINI_MODEL_NAME}`);
  } catch (initError) {
     console.error(`[drug-search] Failed to initialize Gemini client with model ${GEMINI_MODEL_NAME}:`, initError);
     // Consider falling back to a default model if initialization fails? For now, just log.
     geminiModel = null; 
  }
} else {
  console.warn("[drug-search] GEMINI_API_KEY environment variable not set. AI supplementation disabled.");
}

// Helper function to call Gemini
async function getAiSupplement(drugIdentifier, fieldName) {
  if (!geminiModel) {
    console.log(`[drug-search] Gemini model not available, skipping AI supplement for ${fieldName}.`);
    return null;
  }

  // Simple mapping for prompts - can be refined
  const fieldDescriptionMap = {
    'indications_and_usage': 'indications and usage',
    'boxed_warning': 'boxed warning (if any)',
    'mechanism_of_action': 'mechanism of action',
    'contraindications': 'contraindications',
    'dosage_forms_and_strengths': 'dosage forms and strengths',
    'adverse_reactions': 'common adverse reactions'
  };

  const description = fieldDescriptionMap[fieldName] || fieldName.replace(/_/g, ' ');
  const prompt = `What is the ${description} for the drug "${drugIdentifier}"? Provide a concise summary suitable for a drug reference. If no specific information is typically available for this field (e.g., boxed warning for a drug without one), state that clearly. Focus on factual medical information.`;

  console.log(`[drug-search] Calling Gemini for ${fieldName} of ${drugIdentifier}`);
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response; // Use await result.response for v1beta
    const text = response.text(); // Use await response.text() for v1beta
    console.log(`[drug-search] Gemini response received for ${fieldName}`);
    return text.trim();
  } catch (error) {
    console.error(`[drug-search] Gemini API error for ${fieldName} of ${drugIdentifier}:`, error);
    // Check for specific blocked content errors
     if (error.message && error.message.includes('response was blocked')) {
        return "AI response blocked due to safety settings.";
     }
    return `Error fetching AI supplement: ${error.message}`; // Return error message
  }
}


// Main handler function
module.exports.handler = async function(event, context) {
  const drugName = event.queryStringParameters.term;

  if (!drugName) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing search term' }) };
  }

  const encodedDrugName = encodeURIComponent(drugName.trim());
  const apiUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodedDrugName}"+openfda.generic_name:"${encodedDrugName}"&limit=1`;
  console.log(`[drug-search] Fetching URL: ${apiUrl}`);

  try {
    // 1. Fetch from OpenFDA
    const response = await fetch(apiUrl);
    console.log(`[drug-search] OpenFDA Response Status: ${response.status}`);
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[drug-search] Failed to parse OpenFDA JSON response:", responseText.substring(0, 500));
      return { statusCode: 500, body: JSON.stringify({ error: `Failed to parse OpenFDA response. Status: ${response.status}` }) };
    }

    if (!response.ok) {
      const errorBody = data.error ? data.error.message : `HTTP error ${response.status}`;
      console.error("[drug-search] OpenFDA API Error:", errorBody, "| Raw Response:", responseText.substring(0, 500));
      return { statusCode: response.status, body: JSON.stringify({ error: `OpenFDA API Error: ${errorBody}` }) };
    }

    if (!data.results || data.results.length === 0) {
      console.log(`[drug-search] No results found via OpenFDA for term: ${drugName}.`);
      return { statusCode: 404, body: JSON.stringify({ message: 'No results found' }) };
    }

    // 2. Process the result and supplement with AI if needed
    let resultData = data.results[0];
    console.log(`[drug-search] Found OpenFDA result for: ${drugName}`);

    // Determine a good identifier for the AI prompt (prefer brand name, fallback to generic)
    const drugIdentifier = resultData.openfda?.brand_name?.[0] || resultData.openfda?.generic_name?.[0] || drugName;

    // Process fields: structure as { text: '...', source: 'fda'/'ai' }
    const processedResult = { ...resultData }; // Clone the result

    for (const field of FIELDS_TO_SUPPLEMENT) {
      const fdaValue = resultData[field]?.[0]; // Get the first item if array exists

      if (fdaValue && fdaValue.trim() !== '') {
        // Field exists in FDA data
        processedResult[field] = [{ text: fdaValue, source: 'fda' }];
      } else if (geminiModel) {
        // Field missing or empty in FDA data, try AI supplement
        console.log(`[drug-search] Field '${field}' missing in FDA data for ${drugIdentifier}. Attempting AI supplement.`);
        const aiText = await getAiSupplement(drugIdentifier, field);
        if (aiText) {
          processedResult[field] = [{ text: aiText, source: 'ai' }];
        } else {
           // AI failed or returned null, mark as unavailable
           processedResult[field] = [{ text: 'Information not available from FDA or AI.', source: 'unavailable' }];
        }
      } else {
         // Field missing and AI disabled/unavailable
         processedResult[field] = [{ text: 'Information not available from FDA.', source: 'unavailable' }];
      }
    }
    
    // Also ensure openfda fields are structured if they exist, default source 'fda'
    if (processedResult.openfda) {
        for (const key in processedResult.openfda) {
            if (Array.isArray(processedResult.openfda[key])) {
                 // Assuming openfda fields don't need AI supplement, mark as fda
                 processedResult.openfda[key] = processedResult.openfda[key].map(text => ({ text, source: 'fda' }));
            }
        }
    }


    console.log(`[drug-search] Returning processed result for: ${drugName}`);
    return {
      statusCode: 200,
      body: JSON.stringify(processedResult), // Return the modified result
    };

  } catch (error) {
    console.error('[drug-search] Netlify function execution error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch or process drug data via serverless function.' }),
    };
  }
};
