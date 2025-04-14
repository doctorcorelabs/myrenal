import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (ensure these env vars are set in Netlify)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check environment variables.");
  // Return a generic error or handle appropriately if needed during build/runtime
}

// Note: Use service_role key for inserts if RLS prevents anon key inserts
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
// Using anon key for now, assuming RLS allows authenticated or specific inserts
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Cloudflare Turnstile Secret Key (ensure this is set in Netlify)
const TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    };
  }

  if (!TURNSTILE_SECRET_KEY) {
     console.error("Turnstile secret key not configured.");
     return {
       statusCode: 500,
       body: JSON.stringify({ success: false, error: 'Server configuration error [Turnstile].' }),
       headers: { 'Content-Type': 'application/json' },
     };
  }

  try {
    const { formData, turnstileToken } = JSON.parse(event.body);

    // --- 1. Verify Turnstile Token ---
    if (!turnstileToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'CAPTCHA token missing.' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const verifyResponse = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Body needs to be URL encoded
      body: `secret=${encodeURIComponent(TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(turnstileToken)}`,
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      console.error('Turnstile verification failed:', verifyResult['error-codes']);
      return {
        statusCode: 400, // Bad Request - verification failed
        body: JSON.stringify({ success: false, error: 'CAPTCHA verification failed.', codes: verifyResult['error-codes'] }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // --- 2. Insert into Supabase ---
    // Ensure formData exists and has necessary fields (basic check)
     if (!formData || !formData.title || !formData.content) {
       return {
         statusCode: 400,
         body: JSON.stringify({ success: false, error: 'Missing required form data (title, content).' }),
         headers: { 'Content-Type': 'application/json' },
       };
     }

    // Prepare data for Supabase (already done mostly in frontend, but good to be explicit)
    const submissionDataToSave = {
        title: formData.title,
        category: formData.category || null,
        author: formData.author || null,
        location: formData.location || null,
        featured_image_url: formData.featured_image_url || null,
        subtitle: formData.subtitle || null,
        summary: formData.summary || null,
        key_insights: formData.key_insights || null,
        content: formData.content,
        name: formData.name || null,
        email: formData.email || null,
        // status defaults to 'pending' in the database schema
      };


    const { data, error: dbError } = await supabase
      .from('nucleus_submissions')
      .insert(submissionDataToSave)
      .select() // Optionally select the inserted data if needed
      .single(); // Assuming you expect one row back

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      throw new Error(`Database error: ${dbError.message}`); // Throw to be caught below
    }

    // --- 3. Return Success ---
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Submission received successfully!', insertedId: data?.id }), // Optionally return inserted ID
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error('Error processing submission:', error);
    return {
      statusCode: 500,
      // Avoid exposing detailed internal errors to the client
      body: JSON.stringify({ success: false, error: error.message || 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
