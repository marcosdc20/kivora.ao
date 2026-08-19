import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      // PNG: reduz para 80% qualidade (de 2MB para ~400KB)
      png: {
        quality: 80,
      },
      // JPG/JPEG: reduz para 85% qualidade mantendo boa resolução
      jpg: {
        quality: 85,
      },
      jpeg: {
        quality: 85,
      },
      // WebP: qualidade alta com compressão superior
      webp: {
        lossless: false,
        quality: 82,
        alphaQuality: 85,
        force: false,
      },
    }),
  ],
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/imagens/**', '**/dist/**']
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts'],
        }
      }
    }
  }
});



