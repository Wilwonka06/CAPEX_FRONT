import apiRequest from '../config/apiConfig';
import { employeesService, recurringSchedulingService } from '../../features/dashboard/pages/employees/API/employeesService';

// Función para convertir empleados a formato de profesionales
const convertEmployeesToProfessionals = (employees) => {
  return employees
    .filter(emp => emp.estado === 'Activo' || emp.estado === true) // Solo empleados activos
    .map(emp => {
      // Usar solo el campo nombre (nombre completo)
      const nombreCompleto = emp.nombre || emp.name || "";
      
      return {
        id: emp.id_empleado ?? emp.id_usuario ?? emp.id,
        name: nombreCompleto,
        active: emp.estado === 'Activo' || emp.estado === true,
        role: 'Empleado',
        phone: emp.telefono || '',
        email: emp.correo || ''
      };
    });
};

// Función para obtener IDs de empleados que tienen programación recurrente activa
const getEmployeesWithSchedule = async () => {
  try {
    const allSchedules = await recurringSchedulingService.getAll();
    // Filtrar solo programaciones activas y obtener IDs únicos de usuarios
    const employeeIdsWithSchedule = new Set(
      allSchedules
        .filter(schedule => schedule.estado === 'Activa' || schedule.estado === 'Activo')
        .map(schedule => schedule.id_usuario || schedule.idUsuario)
        .filter(Boolean)
    );
    return employeeIdsWithSchedule;
  } catch (error) {
    console.warn('⚠️ Error obteniendo programaciones recurrentes:', error);
    // Si es error 401, significa que no hay acceso - retornar Set vacío
    // Si es otro error, también retornar Set vacío para no bloquear la funcionalidad
    if (error?.response?.status === 401) {
      console.warn('⚠️ No se tiene acceso a programaciones recurrentes (401). Mostrando todos los empleados activos.');
    }
    // Retornar Set vacío para no filtrar nada (conservador - mostrar todos los empleados activos)
    return new Set();
  }
};

export const getProfessionals = async () => {
  try {
    console.log('🔄 Obteniendo profesionales desde la API...');
    
    // Obtener empleados desde la API
    const employees = await employeesService.getAll();
    
    console.log('👥 Empleados obtenidos:', employees?.length || 0, employees);
    
    // Obtener IDs de empleados con programación
    const employeesWithSchedule = await getEmployeesWithSchedule();
    console.log('📅 Empleados con programación:', employeesWithSchedule.size);
    
    // Convertir a formato de profesionales
    const allProfessionals = convertEmployeesToProfessionals(employees || []);
    
    // Si no se pudo obtener programaciones (error 401 u otro), mostrar todos los empleados activos
    // Si se obtuvieron programaciones, filtrar solo los que tienen programación
    const professionals = employeesWithSchedule.size > 0
      ? allProfessionals.filter(prof => employeesWithSchedule.has(prof.id))
      : allProfessionals; // Si hay error, mostrar todos los empleados activos
    
    console.log('✅ Profesionales con programación:', professionals.length, professionals);
    
    return professionals;
  } catch (error) {
    console.error('❌ Error fetching professionals from API:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    // Retornar array vacío en caso de error crítico
    return [];
  }
};

export const addProfessional = (professional) => {
  return new Promise((resolve) => {
    getProfessionals().then((professionals) => {
      const newProfessional = { ...professional, id: Date.now() };
      const updatedProfessionals = [...professionals, newProfessional];
      saveProfessionalsToStorage(updatedProfessionals);
      resolve(newProfessional);
    });
  });
};

export const updateProfessional = (updatedProfessional) => {
  return new Promise((resolve) => {
    getProfessionals().then((professionals) => {
      const updatedProfessionals = professionals.map(p => p.id === updatedProfessional.id ? updatedProfessional : p);
      saveProfessionalsToStorage(updatedProfessionals);
      resolve(updatedProfessional);
    });
  });
};

export const deleteProfessional = (professionalId) => {
  return new Promise((resolve) => {
    getProfessionals().then((professionals) => {
      const updatedProfessionals = professionals.filter(p => p.id !== professionalId);
      saveProfessionalsToStorage(updatedProfessionals);
      resolve(professionalId);
    });
  });
}; 