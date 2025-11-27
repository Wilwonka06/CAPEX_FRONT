import { defineConfig, loadEnv } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

export default defineConfig(({ mode }) => {
    // Cargar variables de entorno del archivo .env.test
    // loadEnv carga variables con prefijo VITE_ por defecto, pero con '' carga todas
    const env = loadEnv(mode || 'test', process.cwd(), '');
    
    // Leer NODE_ENV del archivo .env.test manualmente
    // porque loadEnv no expone NODE_ENV automáticamente
    let nodeEnv = 'test'; // Valor por defecto
    try {
        const envTestContent = readFileSync('.env.test', 'utf-8');
        const nodeEnvMatch = envTestContent.match(/^NODE_ENV=(.+)$/m);
        if (nodeEnvMatch) {
            nodeEnv = nodeEnvMatch[1].trim();
        }
    } catch (error) {
        console.warn('⚠️ No se pudo leer .env.test, usando NODE_ENV=test por defecto');
    }
    
    // Establecer NODE_ENV explícitamente para el entorno de pruebas
    process.env.NODE_ENV = nodeEnv;
    
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        // Definir variables de entorno para que estén disponibles en import.meta.env
        define: {
            'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3000/api'),
            'import.meta.env.MODE': JSON.stringify(mode || 'test'),
            'import.meta.env.DEV': JSON.stringify(false), // En tests, DEV debe ser false
            'import.meta.env.PROD': JSON.stringify(false),
            'process.env.NODE_ENV': JSON.stringify(nodeEnv),
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
            // Establecer variables de entorno para los tests
            env: {
                NODE_ENV: nodeEnv,
                VITE_API_URL: env.VITE_API_URL || 'http://localhost:3000/api',
            },
        },
    };
});
