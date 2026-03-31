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

    return ids;

  } catch (error) {
    // 401 = sesión expirada → relanzar para que getProfessionals lo maneje
    if (error?.response?.status === 401 || error?.status === 401) {
      throw error;
    }

    // Otros errores (red, 500, etc.) → retornar null como señal de "fallo parcial"
    if (import.meta.env.DEV) {
      console.error('⚠️ Error obteniendo programaciones recurrentes:', error.message || error);
    }
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Resultado con metadata para que el componente pueda mostrar feedback
// ─────────────────────────────────────────────────────────────────────────────
export const getProfessionalsWithStatus = async () => {
  try {
    // 1. Empleados desde la API
    const employees = await employeesService.getAll();
    const allProfessionals = convertEmployeesToProfessionals(employees || []);

    // 2. IDs con programación activa
    let employeesWithSchedule;
    try {
      employeesWithSchedule = await getEmployeesWithSchedule();
    } catch (scheduleError) {
      if (scheduleError?.response?.status === 401 || scheduleError?.status === 401) {
        throw scheduleError;
      }
      employeesWithSchedule = null;
    }

    // 3. Determinar estado y filtrar
    if (employeesWithSchedule === null) {
      return {
        professionals: [],
        status: 'error',
        message: 'No se pudo verificar la disponibilidad de los profesionales. Por favor, intenta de nuevo.'
      };
    }

    if (employeesWithSchedule.size === 0) {
      return {
        professionals: [],
        status: 'empty',
        message: 'No hay profesionales con horario disponible en este momento.'
      };
    }

    const professionals = allProfessionals.filter(p =>
      employeesWithSchedule.has(p.id)
    );

    return {
      professionals,
      status: 'success',
      message: null
    };

  } catch (error) {
    if (error?.response?.status === 401 || error?.status === 401) {
      throw error;
    }
    if (import.meta.env.DEV) {
      console.error('❌ Error obteniendo profesionales:', error.message || error);
    }
    return {
      professionals: [],
      status: 'error',
      message: 'Error al cargar los profesionales. Por favor, intenta de nuevo.'
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Exportación compatible con código existente (retorna solo el array)
// ─────────────────────────────────────────────────────────────────────────────
export const getProfessionals = async () => {
  const result = await getProfessionalsWithStatus();
  return result.professionals;
};

export default {
  getProfessionals,
  getProfessionalsWithStatus,
};
