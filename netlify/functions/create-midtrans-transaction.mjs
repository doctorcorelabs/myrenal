import midtransClient from 'midtrans-client';

// Define plan types (should match frontend) - Removed TS type alias
// type Plan = 'Premium' | 'Researcher';

// --- IMPORTANT: Replace with your actual prices in IDR ---
const PLAN_PRICES = { // Removed TS type annotation
  Premium: 50000, // Example: 50,000 IDR
  Researcher: 150000, // Example: 150,000 IDR
};
// --- END IMPORTANT ---

// Initialize Midtrans Snap client
// Ensure MIDTRANS_SERVER_KEY is set in Netlify environment variables
const snap = new midtransClient.Snap({
  isProduction: process.env.CONTEXT === 'production', // Use Netlify's context variable
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  // clientKey: process.env.MIDTRANS_CLIENT_KEY // Client key not needed for server-side token creation
});

export const handler = async (event) => {
  // --- TEMPORARILY DISABLED ---
  console.log('create-midtrans-transaction.mjs called, but payment is temporarily disabled.');
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

    const grossAmount = PLAN_PRICES[plan]; // Removed TS type assertion
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
        // first_name: "Optional", // Add if you collect name
        // last_name: "Optional",
        email: userEmail,
        // phone: "Optional",
      },
      // Optional: Item details
      item_details: [{
          id: `PLAN_${plan.toUpperCase()}`,
          price: grossAmount,
          quantity: 1,
          name: `${plan} Plan Subscription`, // Adjust name as needed
      }],
      // Optional: Add callbacks if needed directly here, though webhook is primary
      // callbacks: {
      //   finish: 'YOUR_FRONTEND_SUCCESS_URL', // Redirect after payment page interaction
      //   error: 'YOUR_FRONTEND_ERROR_URL',
      //   pending: 'YOUR_FRONTEND_PENDING_URL'
      // },
      // Optional: expiry settings
      // expiry: {
      //   start_time: new Date().toISOString().slice(0, 19) + " +0700", // WIB example
      //   unit: "minutes",
      //   duration: 60
      // },
      // --- IMPORTANT: Include metadata for webhook ---
      metadata: {
        supabase_user_id: userId,
        purchased_plan: plan,
      }
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

  } catch (error) { // Removed TS type annotation
    console.error('Error creating Midtrans transaction:', error);
    // Check if it's a Midtrans API error
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
