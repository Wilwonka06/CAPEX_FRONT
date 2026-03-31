import appointmentsService from '../../features/dashboard/pages/appointments/API/appointmentsService';
import { normalizeAppointmentFromBackend, normalizeAppointmentToBackend } from './AppointmentsNormalizerService';

const isDev = import.meta.env.DEV;

export const getAppointments = async (filters = {}) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    let response;
    
    // Si hay un usuario logueado y es cliente, obtener solo sus citas
    if (currentUser?.id_usuario || currentUser?.id) {
      const userId = currentUser.id_usuario || currentUser.id;
      const roleName = typeof currentUser.rol === 'string' 
        ? currentUser.rol 
        : currentUser.rol?.nombre || '';
      
      // Si es cliente, solo sus citas
      if (roleName.toLowerCase() === 'cliente' || roleName.toLowerCase() === 'usuario') {
        response = await appointmentsService.getByUser(userId, filters);
      } else {
        // Admin o empleado: todas las citas
        response = await appointmentsService.getAll(filters);
      }
    } else {
      response = await appointmentsService.getAll(filters);
    }

    // Normalizar respuesta
    let appointments = [];
    if (response?.success && response?.data) {
      appointments = Array.isArray(response.data) 
        ? response.data 
        : (response.data.citas || []);
    } else if (Array.isArray(response)) {
      appointments = response;
    }

    return appointments.map(normalizeAppointmentFromBackend);
  } catch (error) {
    if (isDev) console.error('Error fetching appointments:', error);
    return [];
  }
};

export const createAppointment = async (newAppointment) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const appointmentData = await normalizeAppointmentToBackend(newAppointment, currentUser);

    const response = await appointmentsService.create(appointmentData);

    if (response.success && response.data) {
      return normalizeAppointmentFromBackend(response.data);
    } else if (response.id_cita) {
      return normalizeAppointmentFromBackend(response);
    }

    throw new Error(response.message || response.error || 'Error al crear la cita en el servidor.');
  } catch (error) {
    if (isDev) console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointment = async (updatedAppointment) => {
  try {
    if (!updatedAppointment || (!updatedAppointment.id && !updatedAppointment.id_cita)) {
      throw new Error('Falta el ID de la cita a actualizar.');
    }

    const appointmentId = updatedAppointment.id_cita || updatedAppointment.id;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const appointmentData = await normalizeAppointmentToBackend(updatedAppointment, currentUser);

    const response = await appointmentsService.update(appointmentId, appointmentData);

    if (response.success && response.data) {
      return normalizeAppointmentFromBackend(response.data);
    } else if (response.id_cita) {
      return normalizeAppointmentFromBackend(response);
    }

    throw new Error('Error al actualizar la cita en el servidor.');
  } catch (error) {
    if (isDev) console.error('Error updating appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId) => {
  try {
    if (!appointmentId) throw new Error('ID de la cita es requerido.');
    await appointmentsService.cancel(appointmentId);
    return appointmentId;
  } catch (error) {
    if (isDev) console.error('Error deleting appointment:', error);
    throw error;
  }
};
