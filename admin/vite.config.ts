import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned so the origin always matches ADMIN_URL in backend/.env (CORS).
    // strictPort fails loudly instead of silently drifting to 5175+.
    port: 5174,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
