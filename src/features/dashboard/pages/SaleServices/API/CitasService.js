// Servicio para manejar citas en el módulo de Venta de Servicios
 import apiRequest from '../../../../../shared/config/apiConfig';

 const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';

/**
 * Obtiene todas las órdenes de servicio en estado "En proceso" para mostrar en venta de servicios
 */
export const getCitasEnEjecucion = async () => {
  try {
    // Usar el endpoint correcto para obtener órdenes de servicio
    const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/orden-servicio/list`);
    
    // Manejar diferentes estructuras de respuesta
    let serviceDetails = [];
    if (response.success && response.data) {
      serviceDetails = Array.isArray(response.data) ? response.data : [];
    } else if (Array.isArray(response)) {
      serviceDetails = response;
    } else if (response.data && Array.isArray(response.data)) {
      serviceDetails = response.data;
    }

    // Si no hay servicios, retornar array vacío
    if (serviceDetails.length === 0) {
      return [];
    }

    // Agrupar servicios por cita/cliente y transformar al formato esperado
    const groupedServices = groupServicesByClient(serviceDetails);
    
    // Transformar al formato esperado por el componente SaleServices y filtrar nulls
    return groupedServices
      .map(transformarServiciosAVentaServicio)
      .filter(item => item !== null);
  } catch (error) {
    console.error('Error al obtener órdenes de servicio:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Retornar array vacío en lugar de lanzar error para mejor UX
    return [];
  }
};

/**
 * Obtiene una orden de servicio específica por ID
 */
export const getCitaById = async (serviceDetailId) => {
  try {
    const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}`);
    const serviceDetail = response.data || response;
    
    // Obtener todos los servicios relacionados con la misma cita/cliente
    const relatedServices = await getServiceDetailsByClient(serviceDetail.id_cliente, serviceDetail.id_cita);
    
    // Agrupar servicios
    const grouped = groupServicesByClient(relatedServices);
    if (grouped.length > 0) {
      return transformarServiciosAVentaServicio(grouped[0]);
    }
    
    // Si no hay grupo, crear uno con el servicio individual
    return transformarServiciosAVentaServicio({
      id_cita: serviceDetail.id_cita,
      id_cliente: serviceDetail.id_cliente,
      cliente: serviceDetail.cliente || serviceDetail.usuario,
      fecha_programada: serviceDetail.fecha_programada,
      servicios: [serviceDetail]
    });
  } catch (error) {
    console.error('Error al obtener orden de servicio:', error);
    throw new Error('Error al cargar la orden de servicio');
  }
};

/**
 * Obtiene servicios relacionados por cliente y cita
 */
const getServiceDetailsByClient = async (idCliente, idCita) => {
  try {
    let services = [];
    
    // Si hay cita, buscar por cita
    if (idCita) {
      const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/cita/${idCita}`);
      if (response.success && response.data) {
        services = Array.isArray(response.data) ? response.data : [response.data];
      }
    } else {
      // Si no hay cita, buscar todos los servicios del cliente en estado "En ejecución"
      const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/status/En ejecución`);
      if (response.success && response.data) {
        services = Array.isArray(response.data) 
          ? response.data.filter(s => s.id_cliente === idCliente)
          : [];
      }
    }
    
    return services;
  } catch (error) {
    console.error('Error al obtener servicios relacionados:', error);
    return [];
  }
};

/**
 * Busca órdenes de servicio por término de búsqueda
 */
export const buscarCitas = async (termino) => {
  try {
    // Obtener todas las órdenes de servicio
    const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/orden-servicio/list`);
    
    let serviceDetails = [];
    if (response.success && response.data) {
      serviceDetails = Array.isArray(response.data) ? response.data : [];
    } else if (Array.isArray(response)) {
      serviceDetails = response;
    }
    
    // Filtrar por término de búsqueda
    const filtered = serviceDetails.filter(detail => {
      const searchTerm = termino.toLowerCase();
      const clienteNombre = detail.cliente?.nombre || detail.usuario?.nombre || '';
      const servicioNombre = detail.servicio?.nombre || '';
      const empleadoNombre = detail.empleado?.nombre || '';
      const id = detail.id_detalle_servicio?.toString() || '';
      
      return clienteNombre.toLowerCase().includes(searchTerm) ||
             servicioNombre.toLowerCase().includes(searchTerm) ||
             empleadoNombre.toLowerCase().includes(searchTerm) ||
             id.includes(searchTerm);
    });
    
    // Agrupar y transformar
    const groupedServices = groupServicesByClient(filtered);
    return groupedServices.map(transformarServiciosAVentaServicio);
  } catch (error) {
    console.error('Error al buscar órdenes de servicio:', error);
    throw new Error('Error al buscar órdenes de servicio');
  }
};

/**
 * Inicia un servicio (cambia estado a "En ejecución")
 */
export const iniciarServicio = async (serviceDetailId) => {
  try {
    const resultado = await apiRequest.patch(`${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}/iniciar`);
    return resultado;
  } catch (error) {
    console.error('Error al iniciar servicio:', error);
    throw new Error('Error al iniciar el servicio');
  }
};

/**
 * Actualiza el estado de una orden de servicio
 */
export const actualizarEstadoCita = async (serviceDetailId, nuevoEstado) => {
  try {
    // Mapear estados del frontend a estados del backend
    const estadoMap = {
      'Anulado': 'Cancelada por el usuario',
      'Pagado': 'Pagada',
      'En ejecucion': 'En ejecución'  // Mapear estado interno del frontend al estado del backend
    };
    
    const estadoBackend = estadoMap[nuevoEstado] || nuevoEstado;
    
    const resultado = await apiRequest.patch(`${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}/status`, {
      estado: estadoBackend
    });
    return resultado;
  } catch (error) {
    console.error('Error al actualizar estado de orden de servicio:', error);
    throw new Error('Error al actualizar el estado de la orden de servicio');
  }
};

/**
 * Agrupa servicios por cliente/cita
 */
const groupServicesByClient = (serviceDetails) => {
  const grouped = {};
  
  serviceDetails.forEach(detail => {
    const key = detail.id_cita 
      ? `cita_${detail.id_cita}` 
      : `cliente_${detail.id_cliente}_${detail.fecha_programada || 'sin_fecha'}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        id_cita: detail.id_cita,
        id_cliente: detail.id_cliente,
        cliente: detail.cliente || detail.usuario,
        fecha_programada: detail.fecha_programada,
        servicios: []
      };
    }
    
    grouped[key].servicios.push(detail);
  });
  
  return Object.values(grouped);
};

/**
 * Transforma servicios agrupados del backend al formato esperado por SaleServices
 */
const transformarServiciosAVentaServicio = (grupo) => {
  const servicios = grupo.servicios || [];
  
  if (servicios.length === 0) {
    return null;
  }
  
  // Usar el primer servicio como referencia para datos comunes
  const primerServicio = servicios[0];
  
  // Calcular totales de servicios
  const totalServices = servicios.reduce((sum, servicio) => {
    const precio = parseFloat(servicio.precio_unitario || 0);
    const cantidad = parseInt(servicio.cantidad || 1);
    return sum + (precio * cantidad);
  }, 0);

  // Calcular totales de productos (si los hay en el futuro)
  const totalProducts = 0; // Por ahora no hay productos en detalles de servicios
  const totalGeneral = totalServices + totalProducts;

  // Obtener fecha y hora del primer servicio
  const fecha = primerServicio.fecha_programada || primerServicio.fecha_creacion || new Date().toISOString().split('T')[0];
  const hora = primerServicio.hora_inicio || '08:00:00';

  // Determinar estado (usar el más común o el primero)
  const estados = servicios.map(s => s.estado);
  const estado = estados.includes('En ejecución') ? 'En ejecucion' :  // Estado interno del frontend
                 estados.includes('En proceso') ? 'En ejecucion' :  // Compatibilidad con estado antiguo
                 estados.includes('Pagada') ? 'Pagado' :
                 estados.includes('Finalizada') ? 'Finalizada' :
                 estados[0] || 'En ejecucion';

  // Usar id_cita del grupo si está disponible, de lo contrario usar el primer servicio
  const citaId = grupo.id_cita || primerServicio.id_cita;
  // Si no hay id_cita, usar el primer id_detalle_servicio como fallback
  const idFinal = citaId || primerServicio.id_detalle_servicio;

  return {
    id: idFinal,
    clientName: grupo.cliente?.nombre || primerServicio.cliente?.nombre || primerServicio.usuario?.nombre || 'Cliente no especificado',
    status: (estado === 'En ejecución' || estado === 'En proceso') ? 'En ejecucion' : estado === 'Pagada' ? 'Pagado' : estado,
    date: formatearFecha(fecha),
    time: formatearHora(hora),
    dineroProporcionado: 0, // Se calculará cuando se edite
    devolucion: 0, // Se calculará cuando se edite
    servicios: servicios.map(servicio => ({
      id: servicio.id_detalle_servicio,
      servicioId: servicio.id_servicio,
      name: servicio.servicio?.nombre || 'Servicio',
      quantity: parseInt(servicio.cantidad || 1),
      price: parseFloat(servicio.precio_unitario || 0),
      subtotal: parseFloat(servicio.precio_unitario || 0) * parseInt(servicio.cantidad || 1),
      employee: {
        id: servicio.id_empleado,
        name: servicio.empleado?.nombre || 'Empleado no asignado'
      },
      hora_inicio: servicio.hora_inicio,
      hora_finalizacion: servicio.hora_finalizacion,
      duracion: servicio.duracion,
      observaciones: servicio.observaciones
    })),
    productos: [], // Por ahora no hay productos
    totalServices,
    totalProducts,
    totalGeneral,
    // Información adicional
    citaId: primerServicio.id_cita,
    id_cliente: primerServicio.id_cliente,
    observaciones: primerServicio.observaciones || '',
    fechaCreacion: primerServicio.fecha_creacion
  };
};

/**
 * Formatea una fecha al formato DD/MM/YYYY
 */
const formatearFecha = (fecha) => {
  if (!fecha) return new Date().toLocaleDateString('es-ES');
  
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES');
  } catch (error) {
    return new Date().toLocaleDateString('es-ES');
  }
};

/**
 * Formatea una hora al formato HH:MM AM/PM
 */
const formatearHora = (hora) => {
  if (!hora) return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  try {
    // Si la hora viene en formato HH:MM:SS, tomar solo HH:MM
    const timeString = hora.includes(':') ? hora.split(':').slice(0, 2).join(':') : hora;
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
};

