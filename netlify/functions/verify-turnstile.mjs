import fetch from 'node-fetch'; // Pastikan node-fetch terinstall atau gunakan fetch bawaan jika env mendukung

export default async (req, context) => {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let requestBody;
    try {
      // Coba parse body sebagai JSON
      requestBody = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { turnstileToken } = requestBody;

    // Periksa apakah token ada
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'CAPTCHA token is missing.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    // Periksa apakah secret key ada di environment variables
    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY environment variable is not set.');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Siapkan data untuk dikirim ke Cloudflare
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', turnstileToken);
    // Anda bisa menambahkan IP pengguna jika diperlukan untuk keamanan tambahan
    // const clientIp = context.ip || req.headers['x-nf-client-connection-ip'];
    // if (clientIp) {
    //   params.append('remoteip', clientIp);
    // }

    // Kirim permintaan verifikasi ke Cloudflare
    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params,
    });

    // Periksa apakah permintaan ke Cloudflare berhasil
    if (!verificationResponse.ok) {
        const errorText = await verificationResponse.text();
        console.error(`Cloudflare API error: ${verificationResponse.status} ${errorText}`);
        return new Response(JSON.stringify({ error: 'Failed to verify CAPTCHA with Cloudflare.' }), {
            status: 502, // Bad Gateway
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const verificationData = await verificationResponse.json();

    // Periksa hasil verifikasi
    if (!verificationData.success) {
      console.warn('Turnstile verification failed:', verificationData['error-codes']);
      return new Response(JSON.stringify({ success: false, error: 'CAPTCHA verification failed.', codes: verificationData['error-codes'] }), {
        status: 403, // Forbidden
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Verifikasi Berhasil ---
    console.log('Turnstile verification successful.');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-turnstile function:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
