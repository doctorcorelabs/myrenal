import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate __dirname functionality for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Use port provided by hosting or default to 3000

// Middleware to parse JSON bodies (optional, but good practice)
app.use(express.json());

// API endpoint for drug search
app.get('/api/drug-search', async (req, res) => {
  const drugName = req.query.term; // Get term from query parameters

  if (!drugName) {
    return res.status(400).json({ error: 'Missing search term' });
  }

  const encodedDrugName = encodeURIComponent(drugName.trim());
  // Using the specific field search
  const apiUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodedDrugName}"+openfda.generic_name:"${encodedDrugName}"&limit=1`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
       const errorBody = data.error ? data.error.message : `HTTP error ${response.status}`;
       console.error("OpenFDA API Error:", errorBody);
       return res.status(response.status).json({ error: `OpenFDA API Error: ${errorBody}` });
    }

    if (data.results && data.results.length > 0) {
      return res.status(200).json(data.results[0]);
    } else {
      return res.status(404).json({ message: 'No results found' });
    }
  } catch (error) {
    console.error('Server API error:', error);
    return res.status(500).json({ error: 'Failed to fetch drug data via server.' });
  }
});

// Serve static files from the 'dist' directory (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
