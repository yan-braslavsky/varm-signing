import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Standard output directory for Firebase hosting
    sourcemap: false, // Disable source maps in production for security
    minify: 'terser', // Better minification
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5174,
    host: true, // Allow external connections for testing
  },
  preview: {
    port: 4173,
    host: true,
  },
})
