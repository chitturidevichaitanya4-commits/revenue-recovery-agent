import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxies /api/* to the FastAPI backend so the dashboard can be run with
// `npm run dev` while the backend runs on http://127.0.0.1:8000 with no
// CORS configuration required on the backend side.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
