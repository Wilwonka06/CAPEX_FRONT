export const normalizeAppointmentFromBackend = (appointment) => {
  if (!appointment) return null;

  return {
    id: appointment.id_cita || appointment.id,
    id_cita: appointment.id_cita || appointment.id,
    fecha: appointment.fecha_servicio || appointment.fecha,
    fecha_servicio: appointment.fecha_servicio || appointment.fecha,
    hora_inicio: appointment.hora_inicio || appointment.horaInicio || appointment.hora_entrada,
    hora_salida: appointment.hora_salida || appointment.horaSalida,
    estado: appointment.estado || 'Agendada',
    valor_total: parseFloat(appointment.valor_total || appointment.valorTotal || 0),
    motivo: appointment.motivo || null,
    observaciones: appointment.observaciones || '',
    id_cliente: appointment.id_cliente || appointment.idCliente || appointment.usuario?.id_usuario,
    cliente: appointment.usuario ? {
      id: appointment.usuario.id_usuario || appointment.usuario.id,
      nombre: appointment.usuario.nombre || '',
      correo: appointment.usuario.correo || '',
      telefono: appointment.usuario.telefono || '',
      documento: appointment.usuario.documento || '',
      tipo_documento: appointment.usuario.tipo_documento || 'CC',
    } : null,
    servicios: (appointment.servicios || appointment.detalles || []).map(s => ({
      id: s.id_detalle_servicio || s.id,
      id_servicio: s.id_servicio || s.servicio?.id_servicio,
      nombre: s.servicio?.nombre || s.nombre || 'Servicio',
      duracion: s.duracion || s.servicio?.duracion || 0,
      precio: parseFloat(s.precio_unitario || s.servicio?.precio || 0),
      hora_inicio: s.hora_inicio || '',
      hora_finalizacion: s.hora_finalizacion || s.hora_fin || '',
      id_empleado: s.id_empleado || s.empleado?.id_usuario,
      empleado: s.empleado ? {
        id: s.empleado.id_usuario || s.empleado.id,
        nombre: s.empleado.nombre || '',
      } : null,
      estado: s.estado || 'Pendiente',
    })),
    createdAt: appointment.createdAt || appointment.created_at,
    updatedAt: appointment.updatedAt || appointment.updated_at,
  };
};

/**
 * Normaliza una cita del frontend al formato del backend
 */
export const normalizeAppointmentToBackend = (appointment, currentUser = null) => {
  if (!appointment) return null;

  const idCliente = appointment.id_cliente 
    || appointment.idCliente 
    || appointment.cliente?.id 
    || currentUser?.id_usuario 
    || currentUser?.id;

  return {
    cita: {
      id_cliente: idCliente,
      fecha_servicio: appointment.fecha_servicio || appointment.fecha,
      hora_inicio: appointment.hora_inicio || appointment.horaInicio,
      estado: appointment.estado || 'Agendada',
      motivo: appointment.motivo || null,
      observaciones: appointment.observaciones || '',
    },
    servicios: (appointment.servicios || []).map(s => ({
      id_servicio: s.id_servicio || s.servicioId || s.id,
      id_empleado: s.id_empleado || s.empleadoId || s.empleado?.id,
      hora_inicio: s.hora_inicio || s.horaInicio,
      observaciones: s.observaciones || '',
    })),
  };
};

export default {
  normalizeAppointmentFromBackend,
  normalizeAppointmentToBackend,
};
