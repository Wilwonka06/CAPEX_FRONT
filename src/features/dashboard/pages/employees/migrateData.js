// Script para migrar datos de empleados desde local a producción
// Ejecutar este script para copiar empleados de tu base local a producción

import axios from 'axios';

const LOCAL_API = 'http://localhost:3000/api/empleados'; // Tu API local
const PRODUCTION_API = 'https://capex-back.onrender.com/api/empleados'; // Tu API en producción

async function migrateEmployees() {
  console.log('🚀 Iniciando migración de empleados local → producción');
  console.log('==================================================');

  try {
    // 1. Obtener empleados de la base local
    console.log('📥 Obteniendo empleados de base local...');
    const localResponse = await axios.get(LOCAL_API);
    const localEmployees = localResponse.data;

    if (!Array.isArray(localEmployees) || localEmployees.length === 0) {
      console.log('❌ No hay empleados en la base local');
      return;
    }

    console.log(`📋 Encontrados ${localEmployees.length} empleados en local`);

    // Mostrar estructura de datos local para debugging
    if (localEmployees.length > 0) {
      console.log('🔍 Estructura del primer empleado local:');
      console.log(JSON.stringify(localEmployees[0], null, 2));
    }

    // 2. Verificar empleados existentes en producción
    console.log('📥 Verificando empleados en producción...');
    let existingEmployees = [];
    try {
      const prodResponse = await axios.get(PRODUCTION_API);
      existingEmployees = prodResponse.data || [];
    } catch (error) {
      console.log('⚠️ No se pudieron obtener empleados de producción (base vacía)');
    }

    // Crear mapa de empleados existentes por documento para evitar duplicados
    const existingDocs = new Set(existingEmployees.map(emp => emp.documento));

    // 3. Migrar empleados uno por uno
    let migrated = 0;
    let skipped = 0;

    for (const employee of localEmployees) {
      // Verificar si ya existe
      if (existingDocs.has(employee.documento)) {
        console.log(`⏭️ Saltando ${employee.nombre || 'Sin nombre'} ${employee.apellido || ''} (ya existe)`);
        skipped++;
        continue;
      }

      // Validar datos requeridos antes de migrar
      const validationErrors = [];
      if (!employee.nombre || employee.nombre.trim() === '') validationErrors.push('nombre');
      if (!employee.documento || employee.documento.trim() === '') validationErrors.push('documento');
      if (!employee.correo || employee.correo.trim() === '') validationErrors.push('correo');

      if (validationErrors.length > 0) {
        console.log(`⚠️ Saltando ${employee.nombre || 'Sin nombre'} - Campos requeridos faltantes: ${validationErrors.join(', ')}`);
        skipped++;
        continue;
      }

      try {
        // Preparar datos para producción con valores por defecto seguros
        const employeeData = {
          nombre: employee.nombre.trim(),
          documento: employee.documento.trim(),
          tipo_documento: (employee.tipo_documento || employee.tipoDocumento || 'CC').trim(),
          correo: employee.correo.trim().toLowerCase(),
          estado: (employee.estado === 'Activo' || employee.estado === true) ? 'Activo' : 'Inactivo',
          rol: (employee.rol || 'Empleado').trim()
        };

        console.log(`📤 Migrando: ${employeeData.nombre} ${employeeData.apellido} (${employeeData.documento})`);
        const createResponse = await axios.post(PRODUCTION_API, employeeData);

        if (createResponse.status === 200 || createResponse.status === 201) {
          console.log(`✅ Migrado: ${employeeData.nombre} (ID: ${createResponse.data.id})`);
          migrated++;
        }

      } catch (error) {
        const errorData = error.response?.data;
        if (errorData?.error?.errors) {
          // Mostrar errores específicos de validación
          const validationDetails = errorData.error.errors.map(err =>
            `${err.path}: ${err.message || err.validatorName}`
          ).join(', ');
          console.error(`❌ Error de validación migrando ${employee.nombre}: ${validationDetails}`);
        } else {
          console.error(`❌ Error migrando ${employee.nombre}:`, errorData?.message || error.message);
        }
      }

      // Pequeña pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Migración completada!');
    console.log(`📊 Resumen:`);
    console.log(`   ✅ Migrados: ${migrated}`);
    console.log(`   ⏭️ Saltados: ${skipped}`);
    console.log(`   📋 Total procesados: ${localEmployees.length}`);

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    try {
      const finalResponse = await axios.get(PRODUCTION_API);
      const finalEmployees = finalResponse.data || [];
      console.log(`📊 Empleados en producción después de migración: ${finalEmployees.length}`);
    } catch (error) {
      console.log('❌ Error verificando migración');
    }

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.log('\n🔧 Solución de problemas:');
    console.log('1. Asegúrate de que tu API local esté ejecutándose');
    console.log('2. Verifica que las URLs de API sean correctas');
    console.log('3. Revisa los logs de tu API en Render para errores');
  }
}

// Ejecutar migración
migrateEmployees().catch(console.error);

// Para usar: node migrateData.js