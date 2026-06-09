import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // html2pdf is already lazy-imported in SignPreview — keep it in its own
    // chunk so the main bundle stays lean. Raise limit to suppress warning.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('html2pdf')) return 'html2pdf';
          return undefined;
        },
      },
    },
  },
  // Proxy /api/* to the backend in dev so no CORS issues during development
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
