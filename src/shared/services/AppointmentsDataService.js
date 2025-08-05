const APPOINTMENTS_KEY = 'appointments';

// Estados posibles de la cita
export const APPOINTMENT_STATES = [
  { nombre: 'Agendada', descripcion: 'La cita ha sido creada por el cliente.', tipo: 'Automático' },
  { nombre: 'Confirmada', descripcion: 'El establecimiento ha confirmado la disponibilidad para la cita.', tipo: 'Manual' },
  { nombre: 'Reprogramada', descripcion: 'La cita ha sido modificada en fecha u hora.', tipo: 'Manual' },
  { nombre: 'En Ejecucion', descripcion: 'El servicio está siendo realizado actualmente.', tipo: 'Manual' },
  { nombre: 'Finalizada', descripcion: 'El servicio fue realizado con éxito.', tipo: 'Automático' },
  { nombre: 'Cancelada por cliente', descripcion: 'El cliente canceló la cita antes de la hora programada.', tipo: 'Manual' },
  { nombre: 'Pagada', descripcion: 'El cliente pagó la cita.', tipo: 'Manual' },
  { nombre: 'No asistió', descripcion: 'El cliente no se presentó a la cita.', tipo: 'Automático' },
];

// Datos de ejemplo para pruebas
const initialAppointments = [
  {
    id: 1,
    cliente: 'María González',
    telefono: '3001234567',
    fecha: '2024-01-15',
    servicios: [
      {
        id: 1,
        servicioId: 1,
        nombre: 'Corte de cabello',
        profesional: 'Ana Torres',
        inicio: '10:00',
        fin: '10:30',
        duracion: 30,
        precio: 25000,
        cantidad: 1
      }
    ],
    estado: 'Agendada',
    notas: 'Corte de cabello para mujer',
    reprogramaciones: 0
  },
  {
    id: 2,
    cliente: 'Carlos Rodríguez',
    telefono: '3109876543',
    fecha: '2024-01-16',
    servicios: [
      {
        id: 2,
        servicioId: 2,
        nombre: 'Manicura Completa',
        profesional: 'Lucía Gómez',
        inicio: '14:00',
        fin: '14:45',
        duracion: 45,
        precio: 35000,
        cantidad: 1
      }
    ],
    estado: 'Confirmada',
    notas: 'Manicura con esmaltado rojo',
    reprogramaciones: 0
  }
];

function saveAppointmentsToStorage(appointments) {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

function loadAppointmentsFromStorage() {
  const data = localStorage.getItem(APPOINTMENTS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export const getAppointments = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let appointments = loadAppointmentsFromStorage();
      if (!appointments) {
        saveAppointmentsToStorage(initialAppointments);
        appointments = initialAppointments;
      }
      resolve(appointments);
    }, 200);
  });
};

export const addAppointment = (appointment) => {
  return new Promise((resolve, reject) => {
    try {
      // Validar estructura mínima
      if (!appointment || !appointment.cliente || !appointment.telefono || !appointment.fecha || !Array.isArray(appointment.servicios) || appointment.servicios.length === 0) {
        console.error('addAppointment: Datos incompletos', appointment);
        return reject(new Error('Datos incompletos para la cita.'));
      }
      getAppointments().then((appointments) => {
        const newAppointment = { ...appointment, id: Date.now(), reprogramaciones: 0 };
        const updatedAppointments = [...appointments, newAppointment];
        try {
          saveAppointmentsToStorage(updatedAppointments);
          console.log('addAppointment: Guardado exitoso', newAppointment);
          resolve(newAppointment);
        } catch (err) {
          console.error('addAppointment: Error guardando en localStorage', err);
          reject(new Error('Error guardando la cita en almacenamiento local.'));
        }
      }).catch(err => {
        console.error('addAppointment: Error obteniendo citas', err);
        reject(new Error('Error obteniendo citas previas.'));
      });
    } catch (err) {
      console.error('addAppointment: Error inesperado', err);
      reject(new Error('Error inesperado al guardar la cita.'));
    }
  });
};

export const updateAppointment = (updatedAppointment) => {
  return new Promise((resolve, reject) => {
    try {
      if (!updatedAppointment || !updatedAppointment.id) {
        console.error('updateAppointment: Falta el ID de la cita', updatedAppointment);
        return reject(new Error('Falta el ID de la cita a actualizar.'));
      }
      getAppointments().then((appointments) => {
        const updatedAppointments = appointments.map(a => {
          if (a.id === updatedAppointment.id) {
            if (updatedAppointment.estado === 'Reprogramada') {
              const nuevasReprogramaciones = (a.reprogramaciones || 0) + 1;
              return { ...updatedAppointment, reprogramaciones: nuevasReprogramaciones };
            }
            return { ...updatedAppointment, reprogramaciones: a.reprogramaciones || 0 };
          }
          return a;
        });
        try {
          saveAppointmentsToStorage(updatedAppointments);
          console.log('updateAppointment: Guardado exitoso', updatedAppointment);
          resolve(updatedAppointment);
        } catch (err) {
          console.error('updateAppointment: Error guardando en localStorage', err);
          reject(new Error('Error guardando la cita actualizada en almacenamiento local.'));
        }
      }).catch(err => {
        console.error('updateAppointment: Error obteniendo citas', err);
        reject(new Error('Error obteniendo citas previas.'));
      });
    } catch (err) {
      console.error('updateAppointment: Error inesperado', err);
      reject(new Error('Error inesperado al actualizar la cita.'));
    }
  });
};

export const deleteAppointment = (appointmentId) => {
  return new Promise((resolve) => {
    getAppointments().then((appointments) => {
      const updatedAppointments = appointments.filter(a => a.id !== appointmentId);
      saveAppointmentsToStorage(updatedAppointments);
      resolve(appointmentId);
    });
  });
}; 