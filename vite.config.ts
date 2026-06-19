import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
server: {
    // Add your ngrok domain here to give it permission to access Vite
    allowedHosts: ['sustainer-contort-penalty.ngrok-free.dev']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
