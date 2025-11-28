/**
 * Script para crear el empleado "V" con programación de todo el día todos los días
 * 
 * INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12)
 * 2. Ve a la pestaña "Console"
 * 3. Copia y pega este script completo
 * 4. Presiona Enter para ejecutar
 * 
 * El script creará:
 * - Empleado: V
 * - Programación: Todos los días (Lunes a Domingo) de 06:00 AM a 10:00 PM
 */

(async function createVEmployee() {
  try {
    console.log('🚀 Iniciando creación de empleado V...');
    
    // Verificar autenticación
    let isAuthenticated = false;
    try {
      const currentUser = localStorage.getItem('currentUser');
      const authToken = localStorage.getItem('authToken');
      
      if (currentUser || authToken) {
        isAuthenticated = true;
        console.log('✅ Usuario autenticado detectado');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          console.log('👤 Usuario:', user.nombre || user.correo || 'Usuario');
        }
      } else {
        console.warn('⚠️ No se detectó usuario autenticado. El script intentará usar cookies HttpOnly.');
      }
    } catch (e) {
      console.warn('⚠️ No se pudo verificar autenticación:', e);
    }
    
    // Función para convertir código de documento al formato del backend
    function toBackendDocCode(code) {
      const map = {
        RC: 'CC',
        TI: 'TI',
        CC: 'CC',
        TE: 'CE',
        CE: 'CE',
        NIT: 'NIT',
        PP: 'PAS',
        PEP: 'CC',
        DIE: 'CE',
        NUIP: 'TI',
        FOREIGN_NIT: 'NIT'
      };
      return map[code] || code;
    }
    
    // Generar datos únicos para evitar conflictos
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    
    // Datos del empleado V
    // IMPORTANTE: El backend espera snake_case, no camelCase
    // Nota: Cambiado de "Lucy" a "V" para evitar duplicados
    const employeeData = {
      nombre: 'V',
      tipo_documento: toBackendDocCode('CC'), // Backend espera snake_case y código convertido
      documento: `999${timestamp.toString().slice(-7)}`, // Documento único basado en timestamp
      telefono: `+57${3000000000 + randomSuffix}`, // Teléfono único con formato +57XXXXXXXXXX
      correo: `lucy.${timestamp}@capex.com`, // Correo único
      direccion: 'Dirección de prueba para empleado Lucy',
      estado: 'Activo'
    };
    
    console.log('📝 Datos del empleado:', employeeData);
    
    // Detectar URL base de la API
    const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 
                      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                        ? 'http://localhost:3000/api' 
                        : 'https://capex-back.onrender.com/api');
    
    console.log('🌐 URL base de la API:', apiBaseUrl);
    
    // Obtener token de autenticación si existe
    let authToken = null;
    try {
      authToken = localStorage.getItem('authToken');
      if (authToken) {
        console.log('🔑 Token de autenticación encontrado');
      } else {
        console.warn('⚠️ No se encontró token en localStorage. Verificando cookies...');
      }
    } catch (e) {
      console.warn('⚠️ No se pudo acceder a localStorage:', e);
    }
    
    // Preparar headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Agregar token si existe
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    console.log('📤 Headers de la petición:', { ...headers, Authorization: authToken ? 'Bearer ***' : 'No token' });
    
    // Crear empleado usando fetch
    const createEmployeeResponse = await fetch(`${apiBaseUrl}/empleados`, {
      method: 'POST',
      headers: headers,
      credentials: 'include', // Para incluir cookies de autenticación (HttpOnly)
      body: JSON.stringify(employeeData)
    });
    
    if (!createEmployeeResponse.ok) {
      const errorData = await createEmployeeResponse.json();
      console.error('❌ Error completo del backend:', errorData);
      console.error('📤 Datos enviados:', employeeData);
      
      // Mostrar detalles del error si están disponibles
      if (errorData.errors) {
        console.error('🔍 Errores de validación:', errorData.errors);
      }
      if (errorData.details) {
        console.error('📋 Detalles del error:', errorData.details);
      }
      
      throw new Error(`Error al crear empleado: ${JSON.stringify(errorData, null, 2)}`);
    }
    
    const employeeResult = await createEmployeeResponse.json();
    const createdEmployee = employeeResult.success ? employeeResult.data : employeeResult;
    
    console.log('✅ Empleado creado exitosamente:', createdEmployee);
    
    if (!createdEmployee.id_usuario && !createdEmployee.id) {
      throw new Error('No se recibió el ID del empleado creado');
    }
    
    const employeeId = createdEmployee.id_usuario || createdEmployee.id;
    console.log('🆔 ID del empleado:', employeeId);
    
    // Calcular fecha de inicio
    // Opción 1: Hoy (para poder crear citas inmediatamente)
    // Opción 2: Mañana (descomenta la siguiente línea y comenta la anterior)
    const today = new Date();
    const fechaInicio = today.toISOString().split('T')[0];
    
    // Si prefieres que inicie mañana, descomenta estas líneas:
    // const tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // const fechaInicio = tomorrow.toISOString().split('T')[0];
    
    // Crear programación recurrente para todos los días
    // IMPORTANTE: El backend espera formato HH:MM (sin segundos)
    // También requiere hora_entrada y hora_salida (primera entrada y última salida)
    const primeraHoraEntrada = '06:00'; // Primera hora de entrada del primer bloque
    const ultimaHoraSalida = '22:00';   // Última hora de salida del último bloque
    
    const schedulingData = {
      id_usuario: employeeId,
      hora_entrada: primeraHoraEntrada, // REQUERIDO: Primera hora de entrada
      hora_salida: ultimaHoraSalida,   // REQUERIDO: Última hora de salida
      bloques_horarios: [
        {
          inicio: primeraHoraEntrada, // 6:00 AM - formato HH:MM
          fin: ultimaHoraSalida       // 10:00 PM - formato HH:MM
        }
      ],
      dias_semana: [0, 1, 2, 3, 4, 5, 6], // Todos los días (Domingo=0, Lunes=1, ..., Sábado=6)
      fecha_inicio: fechaInicio,
      fecha_fin: '', // Vacío = indefinido
      estado: 'Activa',
      observaciones: 'Programación de prueba - Todo el día todos los días'
    };
    
    console.log('📅 Datos de programación:', schedulingData);
    
    const createSchedulingResponse = await fetch(`${apiBaseUrl}/programaciones-recurrentes`, {
      method: 'POST',
      headers: headers, // Usar los mismos headers con el token
      credentials: 'include', // Para incluir cookies de autenticación (HttpOnly)
      body: JSON.stringify(schedulingData)
    });
    
    if (!createSchedulingResponse.ok) {
      const errorData = await createSchedulingResponse.json();
      throw new Error(`Error al crear programación: ${JSON.stringify(errorData)}`);
    }
    
    const schedulingResult = await createSchedulingResponse.json();
    const createdScheduling = schedulingResult.success ? schedulingResult.data : schedulingResult;
    
    console.log('✅ Programación creada exitosamente:', createdScheduling);
    
    console.log('🎉 ¡Proceso completado!');
    console.log('📋 Resumen:');
    console.log(`   - Empleado: ${createdEmployee.nombre} (ID: ${employeeId})`);
    console.log(`   - Programación: Todos los días de 06:00 AM a 10:00 PM`);
    console.log(`   - Fecha inicio: ${fechaInicio}`);
    console.log(`   - Estado: Activa`);
    console.log(`\n💡 Tip: Si necesitas limpiar empleados "Lucy" duplicados, ejecuta el script cleanup-lucy-employees.js`);
    
    alert('✅ Empleado V creado exitosamente con programación de todo el día todos los días');
    
    return {
      employee: createdEmployee,
      scheduling: createdScheduling
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert(`Error: ${error.message}`);
    throw error;
  }
})();

