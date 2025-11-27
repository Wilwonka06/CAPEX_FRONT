import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        // IMPORTANTE: Timeout debe ser MENOR que el del backend (30s)
        testTimeout: 20000, // 20 segundos
        hookTimeout: 20000,
        // Evitar que los tests se cuelguen
        bail: 1, // Detener después del primer fallo
    },
});
