import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Or your preferred model

const generationConfig = {
  temperature: 0.7, // Adjust temperature for creativity vs. factuality
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192, // Adjust as needed
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const buildPrompt = (diseaseName: string): string => `
**INSTRUKSI SISTEM**

**Peran:** Anda adalah asisten informasi medis AI yang dirancang untuk memberikan ringkasan komprehensif, akurat, dan terstruktur dengan baik tentang kondisi medis untuk audiens dengan latar belakang medis (misalnya, mahasiswa kedokteran, profesional kesehatan).

**Tugas:** Hasilkan gambaran umum yang komprehensif tentang kondisi medis yang ditentukan: **${diseaseName}**.

**Persyaratan Struktur dan Konten Output:**
Strukturkan respons Anda menggunakan judul-judul berikut dalam Bahasa Indonesia. Di bawah setiap judul, berikan informasi yang rinci dan spesifik seperti yang dijelaskan:

1.  **Etiologi:**
    *   Identifikasi dengan jelas penyebab utama (misalnya, agen infeksius, mutasi genetik, proses autoimun, faktor lingkungan, idiopatik).
    *   Sebutkan secara spesifik patogen, gen, atau mekanisme yang diketahui.

2.  **Faktor Risiko:**
    *   Daftar faktor risiko yang diketahui terkait dengan kondisi tersebut.
    *   Kategorikan jika sesuai (misalnya, dapat dimodifikasi vs. tidak dapat dimodifikasi, demografi, genetik, lingkungan, gaya hidup).
    *   Jelaskan secara singkat hubungan antara faktor risiko utama dan kondisi tersebut, jika sudah mapan.

3.  **Patogenesis:**
    *   Berikan penjelasan langkah demi langkah tentang mekanisme perkembangan dan progresi penyakit.
    *   Jelaskan perubahan fisiologis, seluler, molekuler, atau imunologis utama yang terlibat.
    *   Jelaskan bagaimana etiologi dan faktor risiko berkontribusi pada proses patologis ini.

4.  **Manifestasi Klinis:**
    *   Jelaskan tanda dan gejala umum yang terkait dengan kondisi tersebut.
    *   Sertakan manifestasi yang kurang umum tetapi signifikan jika berlaku.
    *   Jelaskan presentasi pasien yang khas dan potensi variasinya.
    *   Sebutkan perjalanan atau progresi gejala yang biasa jika tidak diobati.

5.  **Pemeriksaan Fisik:**
    *   Rincikan temuan kunci yang diharapkan selama pemeriksaan fisik yang relevan dengan kondisi ini.
    *   Sebutkan teknik atau manuver pemeriksaan spesifik yang penting.
    *   Korelasikan temuan dengan patofisiologi yang mendasari jika relevan.

6.  **Investigasi Pendukung:**
    *   Daftar tes diagnostik yang relevan (misalnya, tes laboratorium [darah, urin, CSF], studi pencitraan [X-ray, CT, MRI, USG], patologi/biopsi, tes fungsional spesifik, sistem penilaian).
    *   Sebutkan temuan yang diharapkan atau karakteristik untuk setiap tes kunci.
    *   Jelaskan secara singkat nilai diagnostik, penentuan stadium, atau prognostik dari investigasi ini.

7.  **Manajemen:**
    *   Garis besar tujuan utama manajemen (misalnya, penyembuhan, kontrol gejala, pencegahan komplikasi, peningkatan kualitas hidup).
    *   Jelaskan pendekatan terapeutik utama:
        *   Intervensi non-farmakologis (perubahan gaya hidup, diet, fisioterapi, dll.).
        *   Perawatan farmakologis (kelas obat spesifik, mekanisme, contoh umum, pertimbangan penggunaan).
        *   Intervensi prosedural atau bedah, jika berlaku.
        *   Perawatan suportif.
    *   Sebutkan strategi pemantauan utama selama dan setelah perawatan.
    *   Singgung secara singkat prognosis jika sudah mapan.

**Nada dan Gaya:**
*   Gunakan terminologi medis yang tepat dan standar.
*   Pertahankan nada yang objektif dan informatif.
*   Pastikan informasi didasarkan pada pemahaman medis dan bukti terkini jika memungkinkan (meskipun kutipan spesifik tidak diperlukan kecuali diminta secara eksplisit).
*   Atur informasi secara logis dalam setiap bagian menggunakan poin-poin atau paragraf ringkas.

**Batasan:** Fokus semata-mata pada penyediaan informasi yang diminta yang terstruktur di bawah judul yang ditentukan. Jangan sertakan catatan pengantar/penutup di luar konten terstruktur kecuali penting untuk kejelasan dalam suatu bagian. Jangan berikan nasihat medis.
`;

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let diseaseName: string;
  try {
    const body = JSON.parse(event.body || '{}');
    diseaseName = body.diseaseName;
    if (!diseaseName || typeof diseaseName !== 'string' || diseaseName.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid diseaseName in request body' }) };
    }
    console.log(`[Netlify Function] Received request for disease: ${diseaseName}`); // Log received disease name
  } catch (error) {
    console.error("[Netlify Function] Error parsing request body:", error);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON in request body' }) };
  }

  const prompt = buildPrompt(diseaseName.trim());
  console.log("[Netlify Function] Generated prompt for Gemini."); // Log prompt generation

  try {
    console.log("[Netlify Function] Calling Gemini API..."); // Log before API call
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    console.log("[Netlify Function] Received response from Gemini API."); // Log after API call

    if (result.response) {
      const text = result.response.text();
      console.log("[Netlify Function] Raw text from Gemini API:", text); // Log the text
      // Check if the text is empty or just whitespace
      if (!text || text.trim() === "") {
        console.warn("[Netlify Function] Gemini API returned empty text.");
        return {
          statusCode: 200, // Still OK status, but indicate empty content
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ details: "" }), // Send empty details
        };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details: text }),
      };
    } else {
      // Handle cases where the response might be blocked or empty
      console.error("[Netlify Function] Gemini API response was empty or blocked:", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to get valid response from AI model. It might have been blocked due to safety settings or other issues.' }),
      };
    }
  } catch (error: any) {
    console.error("[Netlify Function] Error calling Gemini API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error fetching details from AI model: ${error.message || 'Unknown error'}` }),
    };
  }
};

export { handler };
