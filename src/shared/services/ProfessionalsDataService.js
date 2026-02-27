import apiRequest from '../config/apiConfig';
import { employeesService, recurringSchedulingService } from '../../features/dashboard/pages/employees/API/employeesService';

// ─────────────────────────────────────────────────────────────────────────────
// Convierte empleados al formato de profesionales para el selector de citas
// ─────────────────────────────────────────────────────────────────────────────
const convertEmployeesToProfessionals = (employees) => {
  return employees
    .filter(emp => emp.estado === 'Activo' || emp.estado === true)
    .map(emp => {
      const nombreCompleto = emp.nombre || emp.name || '';
      return {
        id:     emp.id_empleado ?? emp.id_usuario ?? emp.id,
        name:   nombreCompleto,
        active: emp.estado === 'Activo' || emp.estado === true,
        role:   'Empleado',
        phone:  emp.telefono || '',
        email:  emp.correo   || ''
      };
    });
};

const getEmployeesWithSchedule = async () => {
  try {
    const allSchedules = await recurringSchedulingService.getAll();

    // Solo programaciones activas
    const ids = new Set(
      allSchedules
        .filter(s => s.estado === 'Activa' || s.estado === 'Activo')
        .map(s => s.id_usuario || s.idUsuario)
        .filter(Boolean)
    );

    return ids; // Set con IDs válidos

  } catch (error) {
    // [BUG 8 FIX] 401 = sesión expirada → relanzar para que getProfessionals lo maneje
    if (error?.response?.status === 401 || error?.status === 401) {
      throw error; // El caller redirigirá al login
    }

    // Otros errores (red, 500, etc.) → retornar null como señal de "fallo parcial"
    console.error('⚠️ Error obteniendo programaciones recurrentes:', error.message || error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Exportación principal
// ─────────────────────────────────────────────────────────────────────────────
export const getProfessionals = async () => {
  try {
    // 1. Empleados desde la API
    const employees = await employeesService.getAll();
    const allProfessionals = convertEmployeesToProfessionals(employees || []);

    // 2. IDs con programación activa
    let employeesWithSchedule;
    try {
      employeesWithSchedule = await getEmployeesWithSchedule();
    } catch (scheduleError) {
      // [BUG 8 FIX] Si es 401, relanzar — la sesión expiró
      if (scheduleError?.response?.status === 401 || scheduleError?.status === 401) {
        throw scheduleError;
      }
      // Cualquier otro error: dejar null (se manejará abajo)
      employeesWithSchedule = null;
    }

    // 3. Filtrado:
    //    - null  → fallo al obtener programaciones → mostrar NINGUNO (conservador: no exponer
    //              empleados cuya disponibilidad no se pudo verificar)
    //    - Set vacío → se cargó correctamente pero ningún empleado tiene programación activa
    //    - Set con IDs → filtrar solo esos empleados
    if (employeesWithSchedule === null) {
      // No se pudo verificar disponibilidad — retornar lista vacía con advertencia
      console.warn(
        '⚠️ No se pudo verificar la disponibilidad de los profesionales. ' +
        'Se mostrará una lista vacía para evitar agendar con empleados sin horario.'
      );
      return [];
    }

    if (employeesWithSchedule.size === 0) {
      // Se obtuvo la lista pero ningún empleado tiene programación activa
      return [];
    }

    // Filtrar profesionales que tengan programación activa
    const professionals = allProfessionals.filter(p =>
      employeesWithSchedule.has(p.id)
    );

    return professionals;

  } catch (error) {
    // Relanzar errores de autenticación para que el AuthContext los gestione
    if (error?.response?.status === 401 || error?.status === 401) {
      throw error;
    }
    console.error('❌ Error obteniendo profesionales:', error.message || error);
    return [];
  }
};
