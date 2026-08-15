import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned so the origin always matches CLIENT_URL in backend/.env (CORS).
    // strictPort fails loudly instead of silently drifting to 5174+ (which
    // would collide with the admin app and be rejected by the API).
    port: 5173,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
