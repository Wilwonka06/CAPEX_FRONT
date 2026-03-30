import appointmentsService from '../../features/dashboard/pages/appointments/API/appointmentsService';
import { normalizeAppointmentFromBackend, normalizeAppointmentToBackend } from './AppointmentsNormalizerService';

const isDev = import.meta.env.DEV;

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
