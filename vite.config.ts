import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        pet: resolve(__dirname, 'pet.html'),
        studio: resolve(__dirname, 'studio.html'),
        website: resolve(__dirname, 'website/index.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
