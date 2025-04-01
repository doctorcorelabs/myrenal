// Use require for standard Node.js environment in Netlify Functions
const midtransClient = require('midtrans-client');

// Use the provided prices
const PLAN_PRICES = {
  Premium: 50000, // IDR 50.000
  Researcher: 100000, // IDR 100.000
};

// Determine environment
const isProductionEnv = process.env.CONTEXT === 'production';
const serverKeyFromEnv = process.env.MIDTRANS_SERVER_KEY;

// Log the environment info AND the key being used
console.log(`Netlify CONTEXT: ${process.env.CONTEXT}, isProduction flag set to: ${isProductionEnv}`);
console.log(`Using Midtrans Server Key: ${serverKeyFromEnv ? serverKeyFromEnv.substring(0, 10) + '...' : 'NOT FOUND'}`); // Log first 10 chars for verification without exposing full key

// Initialize Midtrans Snap client
// Ensure MIDTRANS_SERVER_KEY is set in Netlify environment variables
const snap = new midtransClient.Snap({
  isProduction: isProductionEnv, // Use the determined flag
  serverKey: serverKeyFromEnv, // Use the variable
});

exports.handler = async (event) => {
  // --- TEMPORARILY DISABLED ---
  console.log('create-midtrans-transaction.js called, but payment is temporarily disabled.');
  return {
    statusCode: 503, // Service Unavailable
    headers: {
      'Access-Control-Allow-Origin': '*', // Keep CORS headers for consistency
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Payment processing is temporarily disabled.' }),
  };
  // --- END TEMPORARY DISABLE ---

  // Allow OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // Adjust in production if needed
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Check for required environment variables
  if (!process.env.MIDTRANS_SERVER_KEY) {
    console.error('MIDTRANS_SERVER_KEY environment variable is not set.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Configuration Error' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, userEmail, plan } = body;

    // Validate input
    if (!userId || !userEmail || !plan || !['Premium', 'Researcher'].includes(plan)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid parameters (userId, userEmail, plan)' }) };
    }

    const grossAmount = PLAN_PRICES[plan];
    if (!grossAmount) {
       return { statusCode: 400, body: JSON.stringify({ error: `Invalid plan specified: ${plan}` }) };
    }

    // Create a unique order ID including plan and user ID for easy reference in webhook
    const orderId = `UPG-${plan}-${userId}-${Date.now()}`;

    // Prepare transaction parameters for Midtrans Snap API
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        email: userEmail,
      },
      item_details: [{
          id: `PLAN_${plan.toUpperCase()}`,
          price: grossAmount,
          quantity: 1,
          name: `${plan} Plan Subscription`,
      }],
      // --- IMPORTANT: Include metadata for webhook ---
      metadata: {
        supabase_user_id: userId,
        purchased_plan: plan,
      }
      // Add other optional parameters like callbacks, expiry if needed
    };

    console.log(`Creating Midtrans transaction for order: ${orderId}, plan: ${plan}, amount: ${grossAmount}`);

    // Create transaction token using Midtrans Snap API
    const transaction = await snap.createTransaction(parameter);
    const transactionToken = transaction.token;

    console.log(`Midtrans transaction token created: ${transactionToken} for order ${orderId}`);

    // Return the transaction token to the frontend
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Adjust in production
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: transactionToken }),
    };

  } catch (error) {
    console.error('Error creating Midtrans transaction:', error);
    const errorMessage = error.ApiResponse?.message || error.message || 'Failed to create payment transaction.';
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Adjust in production
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};
