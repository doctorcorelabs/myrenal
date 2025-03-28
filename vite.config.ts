import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: { // Add proxy configuration
      // Proxy requests starting with '/.netlify/functions/' (Keep for reference or other functions)
      '/.netlify/functions': {
        target: 'http://localhost:8888', // Default Netlify Dev port
        changeOrigin: true,
        // Optional: You might not need rewrite if the path matches directly
        // rewrite: (path) => path.replace(/^\/\.netlify\/functions/, ''), 
      },
      // Proxy requests starting with '/api' to the Express server
      '/api': {
        target: 'http://localhost:3000', // Your Express server port
        changeOrigin: true,
        // No rewrite needed if Express routes start with /api
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
