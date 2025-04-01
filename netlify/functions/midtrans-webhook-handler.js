// Use require for standard Node.js environment in Netlify Functions
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const midtransClient = require('midtrans-client'); // Needed for status check potentially

// Initialize Supabase client with Service Role Key
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Netlify env vars
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is missing.');
}
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Initialize Midtrans Core API client (optional, but useful for status check)
// Ensure MIDTRANS_SERVER_KEY is set
const core = new midtransClient.CoreApi({
  isProduction: process.env.CONTEXT === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});


// Function to verify Midtrans signature (adjust if Midtrans changes method)
function verifyMidtransSignature(notificationPayload, serverKey) {
    const { order_id, status_code, gross_amount, signature_key } = notificationPayload;
    if (!order_id || !status_code || !gross_amount || !signature_key || !serverKey) {
        console.error('Missing fields for signature verification');
        return false;
    }
    const generatedSignatureKey = crypto.createHash('sha512')
                                    .update(order_id + status_code + gross_amount + serverKey)
                                    .digest('hex');
    return generatedSignatureKey === signature_key;
}


exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Check for required environment variables
  if (!process.env.MIDTRANS_SERVER_KEY || !supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables (Midtrans Server Key, Supabase URL/Key).');
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Configuration Error' }) };
  }

  try {
    const notificationPayload = JSON.parse(event.body || '{}');
    console.log('Received Midtrans Webhook:', JSON.stringify(notificationPayload, null, 2));

    // --- Verification (Example using signature_key) ---
    // IMPORTANT: Midtrans might recommend verifying by checking transaction status via API instead
    // const isSignatureValid = verifyMidtransSignature(notificationPayload, process.env.MIDTRANS_SERVER_KEY);
    // if (!isSignatureValid) {
    //     console.warn('Midtrans signature verification failed.');
    //     return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
    // }
    // --- OR Verify using API status check (Recommended by Midtrans) ---
    const orderId = notificationPayload.order_id;
    const transactionStatus = notificationPayload.transaction_status;
    const fraudStatus = notificationPayload.fraud_status;

    if (!orderId) {
         console.error('Webhook missing order_id');
         return { statusCode: 400, body: JSON.stringify({ error: 'Missing order_id' }) };
    }

    // Check transaction status directly via Midtrans API for better security
    let serverTransactionStatus;
    try {
        const statusResponse = await core.transaction.status(orderId);
        serverTransactionStatus = statusResponse.transaction_status;
        console.log(`Midtrans API status check for ${orderId}: ${serverTransactionStatus}`);
    } catch (statusError) {
        console.error(`Error checking Midtrans transaction status for ${orderId}:`, statusError);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to verify transaction status' }) };
    }

    // Process only successful payments ('settlement')
    if (serverTransactionStatus === 'settlement') {
        // Extract metadata (adjust key if you used something different than 'metadata')
        const metadata = notificationPayload.metadata || {}; // Use metadata from payload if available
        const userId = metadata.supabase_user_id;
        const purchasedPlan = metadata.purchased_plan; // 'Premium' or 'Researcher'

        if (!userId || !purchasedPlan) {
            console.error(`Webhook for order ${orderId} is missing supabase_user_id or purchased_plan in metadata.`);
            // Still return 200 to Midtrans, but log the error
            return { statusCode: 200, body: JSON.stringify({ message: 'Webhook received but missing metadata.' }) };
        }

        console.log(`Processing successful payment for order ${orderId}, user ${userId}, plan ${purchasedPlan}`);

        // Update user level in Supabase profiles table
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ level: purchasedPlan }) // Update the level based on the plan
            .eq('id', userId)                 // Match the user ID
            .select();                         // Optionally select to confirm update

        if (error) {
            console.error(`Error updating profile for user ${userId} to level ${purchasedPlan}:`, error);
            // Decide how to handle this - maybe retry later? For now, log and return 200 to Midtrans.
            return { statusCode: 200, body: JSON.stringify({ message: 'Webhook received but failed to update profile.' }) };
        }

        console.log(`Successfully updated profile for user ${userId} to level ${purchasedPlan}. Result:`, data);

        // --- TODO: Trigger Email Verification Manually (If Needed) ---
        // If you disabled automatic email confirmation in Supabase, you'd call
        // the Supabase Admin API here to send the confirmation link.
        // Example (conceptual - check Supabase docs for exact method):
        // try {
        //   const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        //     type: 'signup', // Or 'invite' or 'recovery' depending on exact need
        //     email: notificationPayload.customer_details?.email, // Get email from payload
        //     // password: '...', // Might not be needed for signup link
        //     // data: { ... } // Optional additional data
        //   });
        //   if (linkError) throw linkError;
        //   console.log(`Generated verification link for ${notificationPayload.customer_details?.email}`);
        //   // You might need to actually *send* this link via your own email service if generateLink doesn't send it.
        // } catch (emailError) {
        //   console.error(`Error triggering verification email for user ${userId}:`, emailError);
        // }
        // --- End TODO ---


    } else {
        console.log(`Ignoring Midtrans webhook for order ${orderId} with status: ${serverTransactionStatus}`);
    }

    // Always return 200 OK to Midtrans to acknowledge receipt,
    // unless there was a fundamental error like missing keys or invalid signature.
    return { statusCode: 200, body: JSON.stringify({ message: 'Webhook received' }) };

  } catch (error) {
    console.error('Error processing Midtrans webhook:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error processing webhook.' }) };
  }
};
