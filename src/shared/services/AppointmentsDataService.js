import apiRequest from '../config/apiConfig';
import appointmentsService from '../../features/dashboard/pages/appointments/API/appointmentsService';
import { employeesService } from '../../features/dashboard/pages/employees/API/employeesService';

// Estados posibles de la cita
export const APPOINTMENT_STATES = [
  { nombre: 'Agendada', descripcion: 'La cita ha sido creada por el cliente.', tipo: 'Automático' },
  { nombre: 'Confirmada', descripcion: 'El establecimiento ha confirmado la disponibilidad para la cita.', tipo: 'Manual' },
  { nombre: 'Reprogramada', descripcion: 'La cita ha sido modificada en fecha u hora.', tipo: 'Manual' },
  { nombre: 'En ejecución', descripcion: 'El servicio está siendo realizado actualmente.', tipo: 'Manual' },
  { nombre: 'Finalizada', descripcion: 'El servicio fue realizado con éxito.', tipo: 'Automático' },
  { nombre: 'Pagada', descripcion: 'El cliente pagó la cita.', tipo: 'Manual' },
  { nombre: 'Cancelada por el usuario', descripcion: 'El cliente canceló la cita.', tipo: 'Manual' },
  { nombre: 'No asistio', descripcion: 'El cliente no se presentó a la cita.', tipo: 'Automático' },
];

// Función para convertir datos del backend al formato esperado por el frontend
const normalizeAppointmentFromBackend = (cita) => {
  return {
    id: cita.id_cita,
    id_cita: cita.id_cita,
    cliente: cita.usuario?.nombre || cita.cliente?.nombre || '',
    telefono: cita.usuario?.telefono || cita.cliente?.telefono || '',
    tipoDocumento: cita.usuario?.tipo_documento || cita.cliente?.tipo_documento || '',
    documento: cita.usuario?.documento || cita.cliente?.documento || '',
    fecha: cita.fecha_servicio,
    fecha_servicio: cita.fecha_servicio,
    hora_entrada: cita.hora_entrada,
    hora_salida: cita.hora_salida,
    estado: cita.estado,
    motivo: cita.motivo || '',
    notas: cita.motivo || '',
    valor_total: cita.valor_total,
    servicios: (cita.servicios || []).map(servicio => ({
      id: servicio.id_detalle_servicio,
      servicioId: servicio.id_servicio,
      nombre: servicio.servicio?.nombre || servicio.nombre_servicio || '',
      descripcion: servicio.servicio?.descripcion || '',
      profesional: servicio.empleado?.nombre || servicio.empleado_nombre || '',
      id_empleado: servicio.id_empleado,
      inicio: servicio.hora_inicio || '',
      fin: servicio.hora_finalizacion || servicio.hora_fin || '',
      duracion: servicio.servicio?.duracion || servicio.duracion || 0,
      precio: servicio.precio_unitario || servicio.precio || 0,
      cantidad: servicio.cantidad || 1,
      estado: servicio.estado || 'Agendada'
    })),
    reprogramaciones: cita.reprogramaciones || 0
  };
};

// Función para convertir datos del frontend al formato esperado por el backend
const normalizeAppointmentToBackend = async (appointment, currentUser) => {
  // Si hay usuario autenticado, usar su ID
  const id_cliente = currentUser?.id_usuario || currentUser?.id;
  
  // Si no hay usuario autenticado, el backend creará el usuario automáticamente
  // Necesitamos enviar los datos del cliente
  const clienteData = !id_cliente ? {
    nombre: appointment.cliente || '',
    correo: appointment.correo || '',
    telefono: appointment.telefono || '',
    tipoDocumento: appointment.tipoDocumento || appointment.tipo_documento || 'CC',
    documento: appointment.documento || ''
  } : null;
  
  // Validar que si no hay usuario, se tengan todos los datos del cliente
  if (!id_cliente && clienteData) {
    if (!clienteData.nombre || !clienteData.correo || !clienteData.telefono) {
      throw new Error('Debes proporcionar nombre, correo y teléfono para crear la cita sin estar autenticado.');
    }
  }

  // Calcular hora_entrada y hora_salida desde los servicios
  const servicios = appointment.servicios || [];
  if (servicios.length === 0) {
    throw new Error('Debe incluir al menos un servicio');
  }

  // Función auxiliar para convertir hora HH:MM a HH:MM:SS
  const formatTimeToHHMMSS = (timeStr) => {
    if (!timeStr) return '08:00:00';
    // Si ya tiene segundos, devolverlo tal cual
    if (timeStr.split(':').length === 3) return timeStr;
    // Si solo tiene HH:MM, agregar :00
    return timeStr + ':00';
  };

  // Ordenar servicios por hora de inicio
  const serviciosOrdenados = [...servicios].sort((a, b) => {
    const horaA = a.inicio ? a.inicio.split(':').map(Number) : [0, 0];
    const horaB = b.inicio ? b.inicio.split(':').map(Number) : [0, 0];
    return (horaA[0] * 60 + horaA[1]) - (horaB[0] * 60 + horaB[1]);
  });

  const hora_entrada = formatTimeToHHMMSS(serviciosOrdenados[0].inicio || '08:00');
  const ultimoServicio = serviciosOrdenados[serviciosOrdenados.length - 1];
  const hora_salida = formatTimeToHHMMSS(ultimoServicio.fin || calcularHoraFin(ultimoServicio.inicio, ultimoServicio.duracion));

  // Obtener IDs de empleados para todos los servicios
  const serviciosConEmpleados = await Promise.all(
    servicios.map(async (s) => {
      let id_empleado = s.id_empleado;
      
      // Si no hay ID pero hay nombre de profesional, buscarlo
      if (!id_empleado && s.profesional) {
        id_empleado = await obtenerIdEmpleadoPorNombre(s.profesional);
        if (!id_empleado) {
          throw new Error(`No se encontró el empleado "${s.profesional}". Por favor, verifica que el profesional esté registrado.`);
        }
      }
      
      if (!id_empleado) {
        throw new Error(`El servicio "${s.nombre}" no tiene un profesional asignado.`);
      }
      
      // Asegurar formato HH:MM:SS para hora_inicio
      const horaInicioFormateada = formatTimeToHHMMSS(s.inicio || '08:00');
      
      return {
        id_servicio: s.servicioId,
        id_empleado: id_empleado,
        hora_inicio: horaInicioFormateada,
        cantidad: s.cantidad || 1,
        observaciones: s.observaciones || ''
      };
    })
  );

  // Si hay usuario autenticado, usar su ID
  // Si no, enviar datos del cliente para que el backend lo cree
  const citaData = {
    fecha_servicio: appointment.fecha,
    estado: appointment.estado || 'Agendada',
    motivo: appointment.notas || appointment.motivo || '',
    hora_entrada: hora_entrada
  };
  
  if (id_cliente) {
    citaData.id_cliente = id_cliente;
  }
  
  const result = {
    cita: citaData,
    servicios: serviciosConEmpleados
  };
  
  // Si no hay usuario autenticado, agregar datos del cliente
  if (clienteData) {
    result.cliente = clienteData;
  }
  
  return result;
};

// Función auxiliar para calcular hora fin
const calcularHoraFin = (inicio, duracion) => {
  if (!inicio || !duracion) return '09:00:00';
  const [h, m] = inicio.split(':').map(Number);
  const totalMin = h * 60 + m + Number(duracion);
  const newH = Math.floor(totalMin / 60);
  const newM = totalMin % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}:00`;
};

// Cache de empleados para evitar múltiples llamadas
let empleadosCache = null;
let empleadosCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función auxiliar para obtener empleados (con cache)
const obtenerEmpleados = async () => {
  const now = Date.now();
  if (empleadosCache && (now - empleadosCacheTime) < CACHE_DURATION) {
    return empleadosCache;
  }
  
  try {
    empleadosCache = await employeesService.getAll();
    empleadosCacheTime = now;
    return empleadosCache;
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    return empleadosCache || [];
  }
};

// Función auxiliar para obtener ID de empleado por nombre
const obtenerIdEmpleadoPorNombre = async (nombre) => {
  if (!nombre || nombre.trim() === '') {
    return null;
  }
  
  const empleados = await obtenerEmpleados();
  const empleado = empleados.find(emp => {
    const nombreCompleto = emp.nombre || '';
    return nombreCompleto.toLowerCase().trim() === nombre.toLowerCase().trim();
  });
  
  return empleado ? (empleado.id_empleado || empleado.id_usuario || empleado.id) : null;
};

export const getAppointments = async (filters = {}) => {
  try {
    // Si hay un usuario autenticado, filtrar por su ID
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser?.id_usuario || currentUser?.id) {
      filters.id_cliente = currentUser.id_usuario || currentUser.id;
    }

    const response = await appointmentsService.getAll(filters);
    
    // Normalizar respuesta del backend
    let appointments = [];
    if (response.success && response.data) {
      appointments = (response.data.citas || response.data || []).map(normalizeAppointmentFromBackend);
    } else if (Array.isArray(response)) {
      appointments = response.map(normalizeAppointmentFromBackend);
    }

    return appointments;
  } catch (error) {
    console.error('Error fetching appointments from API:', error);
    // Retornar array vacío en caso de error
    return [];
  }
};

export const addAppointment = async (appointment) => {
  try {
    // Validar estructura mínima
    if (!appointment || !appointment.cliente || !appointment.telefono || !appointment.fecha || !Array.isArray(appointment.servicios) || appointment.servicios.length === 0) {
      console.error('addAppointment: Datos incompletos', appointment);
      throw new Error('Datos incompletos para la cita.');
    }

    // Validar que tenga correo si no está autenticado (necesario para crear usuario)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser && (!appointment.correo || !appointment.correo.trim())) {
      throw new Error('Debes proporcionar un correo electrónico válido para crear la cita.');
    }

    // Validar formato de correo si se proporciona
    if (appointment.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appointment.correo.trim())) {
      throw new Error('El correo electrónico proporcionado no es válido.');
    }

    console.log('📋 Datos de cita antes de normalizar:', {
      cliente: appointment.cliente,
      correo: appointment.correo ? '***' : 'NO PROPORCIONADO',
      telefono: appointment.telefono,
      fecha: appointment.fecha,
      serviciosCount: appointment.servicios?.length || 0,
      tieneUsuario: !!currentUser
    });

    // Convertir datos al formato del backend (ahora es async)
    const appointmentData = await normalizeAppointmentToBackend(appointment, currentUser);
    
    console.log('📤 Datos normalizados para enviar al backend:', {
      tieneCita: !!appointmentData.cita,
      tieneCliente: !!appointmentData.cliente,
      serviciosCount: appointmentData.servicios?.length || 0,
      clienteCorreo: appointmentData.cliente?.correo ? '***' : 'NO INCLUIDO'
    });

    // Llamar al servicio del backend
    const response = await appointmentsService.create(appointmentData);
    
    console.log('📥 Respuesta del backend:', {
      success: response.success,
      tieneData: !!response.data,
      tieneId: !!response.id_cita,
      message: response.message
    });
    
    // Normalizar respuesta
    if (response.success && response.data) {
      const normalized = normalizeAppointmentFromBackend(response.data);
      console.log('✅ Cita creada exitosamente:', normalized.id);
      return normalized;
    } else if (response.id_cita) {
      const normalized = normalizeAppointmentFromBackend(response);
      console.log('✅ Cita creada exitosamente:', normalized.id);
      return normalized;
    }
    
    throw new Error(response.message || response.error || 'Error al crear la cita en el servidor.');
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointment = async (updatedAppointment) => {
  try {
    if (!updatedAppointment || (!updatedAppointment.id && !updatedAppointment.id_cita)) {
      console.error('updateAppointment: Falta el ID de la cita', updatedAppointment);
      throw new Error('Falta el ID de la cita a actualizar.');
    }

    const appointmentId = updatedAppointment.id_cita || updatedAppointment.id;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Convertir datos al formato del backend (ahora es async)
    const appointmentData = await normalizeAppointmentToBackend(updatedAppointment, currentUser);

    // Llamar al servicio del backend
    const response = await appointmentsService.update(appointmentId, appointmentData);
    
    // Normalizar respuesta
    if (response.success && response.data) {
      return normalizeAppointmentFromBackend(response.data);
    } else if (response.id_cita) {
      return normalizeAppointmentFromBackend(response);
    }
    
    throw new Error('Error al actualizar la cita en el servidor.');
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId) => {
  try {
    if (!appointmentId) {
      throw new Error('ID de la cita es requerido.');
    }

    // El backend no tiene un endpoint DELETE directo, usar cancelar
    await appointmentsService.cancel(appointmentId);
    return appointmentId;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}; 