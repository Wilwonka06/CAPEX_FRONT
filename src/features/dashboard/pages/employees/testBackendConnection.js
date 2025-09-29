// Script para probar la conexión al backend
// Ejecutar en la consola del navegador: node testBackendConnection.js

import axios from 'axios';

const BASE_URL = 'https://capex-back.onrender.com';

async function testConnection() {
  console.log('🔍 Probando conexión al backend...');

  const endpoints = [
    '/api/empleados',
    '/api/servicios',
    '/api/scheduling'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Probando ${BASE_URL}${endpoint}`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 10000 });
      console.log(`✅ ${endpoint}: ${response.status} - OK`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.code || error.response?.status || 'ERROR'} - ${error.message}`);
    }
  }

  console.log('\n🏁 Prueba completada');
}

// Ejecutar la prueba
testConnection().catch(console.error);

// Para usar en Node.js:
// 1. Instalar axios: npm install axios
// 2. Ejecutar: node testBackendConnection.js

// Para usar en el navegador:
// 1. Abrir la consola del navegador
// 2. Copiar y pegar este código
// 3. Ejecutar