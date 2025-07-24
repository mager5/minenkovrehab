import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@heygen/streaming-avatar', 'livekit-client'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          heygen: ['@heygen/streaming-avatar', 'livekit-client'],
        },
      },
    },
  },
});
