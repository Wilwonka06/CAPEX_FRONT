import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks grandes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react', 'lucide-react', 'react-icons'],
          'utils-vendor': ['axios', 'sweetalert2', 'react-hot-toast', 'react-toastify'],
          'calendar-vendor': [
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
            '@fullcalendar/resource-daygrid'
          ],
          'redux-vendor': ['redux', 'react-redux', '@reduxjs/toolkit'],
          'pdf-vendor': ['jspdf', 'xlsx']
        },
        // Optimizar nombres de chunks
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Aumentar el límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 1000,
    // Optimizaciones adicionales (esbuild es más rápido que terser)
    minify: 'esbuild',
    // Eliminar console.log en producción (requiere plugin adicional o se puede hacer manualmente)
  },
  server: {
    // Deshabilitar proxy en desarrollo para evitar conflictos con configuración CORS
    // El frontend usa Axios directamente apuntando al backend local
    // proxy: {
    //   '/api': {
    //     target: 'https://capex-back.onrender.com',
    //     changeOrigin: true,
    //     secure: true,
    //     configure: (proxy, _options) => {
    //       proxy.on('error', (err, _req, _res) => {
    //         console.log('proxy error', err);
    //       });
    //       proxy.on('proxyReq', (proxyReq, req, _res) => {
    //         console.log('Sending Request to the Target:', req.method, req.url);
    //       });
    //       proxy.on('proxyRes', (proxyRes, req, _res) => {
    //         console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
    //       });
    //     },
    //   }
    // }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
