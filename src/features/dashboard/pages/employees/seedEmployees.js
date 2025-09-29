// Script para poblar empleados de prueba en la base de datos
// Ejecutar este script localmente contra tu API

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/empleados'; // Cambia al puerto de tu API local

const testEmployees = [
  {
    name: 'Ana',
    document: '12345678',
    documentType: 'Cedula de ciudadania',
    phone: '+573001234567',
    email: 'ana.garcia@empresa.com',
    address: 'Carrera 15 #93-47, Medellín',
    role: 'Empleado'
  },
  {
    name: 'Luis',
    document: '87654321',
    documentType: 'Cedula de ciudadania',
    phone: '+573001234568',
    email: 'luis.perez@empresa.com',
    address: 'Carrera 16 #94-48, Medellín',
    role: 'Empleado'
  },
  {
    name: 'María',
    document: '11223344',
    documentType: 'Cedula de ciudadania',
    phone: '+573001234569',
    email: 'maria.lopez@empresa.com',
    address: 'Carrera 17 #95-49, Medellín',
    role: 'Empleado'
  },
  {
    name: 'Carlos',
    document: '99887766',
    documentType: 'Cedula de ciudadania',
    phone: '+573001234570',
    email: 'carlos.ramirez@empresa.com',
    address: 'Carrera 18 #96-50, Medellín',
    role: 'Empleado'
  }
];

async function seedEmployees() {
  console.log('🌱 Iniciando poblamiento de empleados...');

  for (const employee of testEmployees) {
    try {
      console.log(`📝 Creando empleado: ${employee.nombre}`);
      const response = await axios.post(API_BASE, employee);
      console.log(`✅ Empleado creado: ${response.data.nombre} (ID: ${response.data.id})`);
    } catch (error) {
      console.error(`❌ Error creando empleado ${employee.nombre}:`, error.response?.data || error.message);
    }
  }

  console.log('🎉 Poblamiento completado!');
}

// Ejecutar el script
seedEmployees().catch(console.error);

// Para usar en Node.js, guarda este archivo como seedEmployees.js y ejecuta:
// node seedEmployees.js