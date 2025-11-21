import apiRequest from '../config/apiConfig';
import { employeesService } from '../../features/dashboard/pages/employees/API/employeesService';

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

export const getProfessionals = async () => {
  try {
    console.log('🔄 Obteniendo profesionales desde la API...');
    
    // Obtener empleados desde la API
    const employees = await employeesService.getAll();
    
    console.log('👥 Empleados obtenidos:', employees?.length || 0, employees);
    
    // Convertir a formato de profesionales
    const professionals = convertEmployeesToProfessionals(employees || []);
    
    console.log('✅ Profesionales convertidos:', professionals.length, professionals);
    
    return professionals;
  } catch (error) {
    console.error('❌ Error fetching professionals from API:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    // Retornar array vacío en caso de error
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