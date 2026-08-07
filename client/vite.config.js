import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '127.0.0.1',
    strictPort: true,
    // Allow access from any host (Docker host, LAN, etc.). Safe in dev only.
    allowedHosts: true,
    proxy: {
      // forward every /api/* and /health request to the Node backend
      '/api':    'http://127.0.0.1:4000',
      '/health': { target: 'http://127.0.0.1:4000', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
