import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Eliminar console.* y debugger en producción — en dev se conservan para depuración
  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react', 'lucide-react', 'react-icons'],
          'utils-vendor': ['axios', 'sweetalert2', 'react-hot-toast'],
          'calendar-vendor': [
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
            '@fullcalendar/resource-daygrid'
          ],
          'pdf-vendor': ['jspdf', 'xlsx']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  },
  server: {},
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
}))
