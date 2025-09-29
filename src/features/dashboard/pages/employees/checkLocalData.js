// Script para verificar qué datos tienes localmente
// Ejecutar antes de migrar para ver la estructura de tus datos

import axios from 'axios';

const LOCAL_API = 'http://localhost:3000/api/empleados';

async function checkLocalData() {
  console.log('🔍 Verificando datos locales...');
  console.log('================================');

  try {
    const response = await axios.get(LOCAL_API);
    const employees = response.data;

    console.log(`📊 Total de empleados encontrados: ${employees.length}`);
    console.log('');

    if (employees.length > 0) {
      console.log('👥 Lista de empleados:');
      employees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.nombre || 'SIN NOMBRE'} ${emp.apellido || 'SIN APELLIDO'}`);
        console.log(`   📄 Documento: ${emp.documento || 'SIN DOCUMENTO'}`);
        console.log(`   📧 Correo: ${emp.correo || 'SIN CORREO'}`);
        console.log(`   🔰 Estado: ${emp.estado || 'SIN ESTADO'}`);
        console.log(`   👤 Rol: ${emp.rol || 'SIN ROL'}`);
        console.log('');
      });

      console.log('🔧 Estructura completa del primer empleado:');
      console.log(JSON.stringify(employees[0], null, 2));
    } else {
      console.log('❌ No hay empleados en la base local');
      console.log('');
      console.log('💡 Sugerencias:');
      console.log('1. Ejecuta seedEmployees.js para crear datos de prueba');
      console.log('2. O crea empleados manualmente en tu aplicación local');
    }

  } catch (error) {
    console.error('❌ Error conectando a la API local:', error.message);
    console.log('');
    console.log('🔧 Verifica que:');
    console.log('1. Tu servidor local esté ejecutándose');
    console.log('2. La URL http://localhost:3000/api/empleados sea correcta');
    console.log('3. Tu base de datos local tenga datos');
  }
}

checkLocalData().catch(console.error);