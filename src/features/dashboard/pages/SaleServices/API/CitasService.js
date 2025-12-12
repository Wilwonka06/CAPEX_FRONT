// Servicio para manejar citas en el módulo de Venta de Servicios
 import apiRequest from '../../../../../shared/config/apiConfig';
 import { normalizeText } from '../../../../../shared/normalizers';

 const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';

/**
 * Obtiene todas las órdenes de servicio en estado "En proceso" para mostrar en venta de servicios
 */
export const getCitasEnEjecucion = async () => {
  try {
    // Usar el endpoint correcto para obtener órdenes de servicio
    // NOTA: Este endpoint podría estar filtrando solo "En ejecución"
    // Si no devuelve servicios "Pagada", necesitamos obtener todos los estados
    const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/orden-servicio/list`);
    
    console.log('📡 Respuesta completa del backend:', {
      response: response,
      success: response.success,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : null,
      dataLength: response.data?.length || (Array.isArray(response.data) ? response.data.length : 0),
      firstService: response.data?.[0] || (Array.isArray(response.data) ? response.data[0] : null),
      estadosEncontrados: Array.isArray(response.data) 
        ? [...new Set(response.data.map(s => s.estado).filter(Boolean))]
        : []
    });
    
    // Manejar diferentes estructuras de respuesta
    let serviceDetails = [];
    
    // Si response.data es un objeto con una propiedad que contiene el array
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        serviceDetails = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        serviceDetails = response.data.data;
      } else if (response.data.servicios && Array.isArray(response.data.servicios)) {
        serviceDetails = response.data.servicios;
      } else if (response.data.detalles && Array.isArray(response.data.detalles)) {
        serviceDetails = response.data.detalles;
      }
    } else if (Array.isArray(response)) {
      serviceDetails = response;
    } else if (response.data && Array.isArray(response.data)) {
      serviceDetails = response.data;
    }

    console.log('📦 ServiceDetails procesados:', {
      total: serviceDetails.length,
      estados: [...new Set(serviceDetails.map(s => s.estado).filter(Boolean))],
      primerosEstados: serviceDetails.slice(0, 5).map(s => ({ 
        id: s.id_detalle_servicio || s.id, 
        estado: s.estado,
        id_cita: s.id_cita
      }))
    });
    
    // Si no hay servicios, intentar obtener todos los servicios sin filtrar por estado
    if (serviceDetails.length === 0) {
      console.warn('⚠️ No se encontraron servicios en el endpoint /orden-servicio/list. Intentando obtener todos los servicios...');
      
      try {
        // Intentar obtener todos los servicios directamente
        const allServicesResponse = await apiRequest.get(SERVICE_DETAILS_ENDPOINT);
        console.log('📡 Respuesta de todos los servicios:', {
          success: allServicesResponse.success,
          dataLength: allServicesResponse.data?.length || (Array.isArray(allServicesResponse.data) ? allServicesResponse.data.length : 0),
          estados: Array.isArray(allServicesResponse.data) 
            ? [...new Set(allServicesResponse.data.map(s => s.estado).filter(Boolean))]
            : []
        });
        
        if (allServicesResponse.success && allServicesResponse.data) {
          if (Array.isArray(allServicesResponse.data)) {
            serviceDetails = allServicesResponse.data;
          } else if (allServicesResponse.data.data && Array.isArray(allServicesResponse.data.data)) {
            serviceDetails = allServicesResponse.data.data;
          }
        }
      } catch (error) {
        console.error('❌ Error al obtener todos los servicios:', error);
      }
    }

    // Si no hay servicios después de intentar ambos endpoints, retornar array vacío
    if (serviceDetails.length === 0) {
      console.warn('⚠️ No se encontraron servicios en ningún endpoint. El backend podría estar filtrando por estado.');
      return [];
    }

    console.log('✅ Servicios obtenidos exitosamente:', {
      total: serviceDetails.length,
      estados: [...new Set(serviceDetails.map(s => s.estado).filter(Boolean))],
      conEstadoPagada: serviceDetails.filter(s => s.estado === 'Pagada' || s.estado === 'Pagado').length
    });

    // Agrupar servicios por cita/cliente y transformar al formato esperado
    const groupedServices = groupServicesByClient(serviceDetails);
    
    console.log('📋 Servicios agrupados antes de transformar:', groupedServices.map(g => ({
      id_cita: g.id_cita,
      estados: g.servicios?.map(s => s.estado),
      servicios: g.servicios?.length
    })));
    
    // Transformar al formato esperado por el componente SaleServices y filtrar nulls
    const transformed = groupedServices
      .map(transformarServiciosAVentaServicio)
      .filter(item => item !== null);
    
    console.log('📋 Órdenes transformadas:', transformed.map(t => ({
      id: t.id,
      status: t.status,
      statusType: typeof t.status,
      statusLength: t.status?.length,
      clientName: t.clientName
    })));
    
    // Log específico para órdenes con estado "Pagado"
    const pagadas = transformed.filter(t => t.status === 'Pagado' || t.status?.toLowerCase() === 'pagado');
    if (pagadas.length > 0) {
      console.log('💰 Órdenes pagadas encontradas:', pagadas.map(p => ({
        id: p.id,
        status: p.status,
        statusNormalized: normalizeText(p.status || ''),
        clientName: p.clientName
      })));
    }
    
    return transformed;
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
  const estados = servicios.map(s => s.estado).filter(e => e); // Filtrar estados nulos/undefined
  if (estados.length === 0) {
    estados.push('En ejecución'); // Estado por defecto si no hay estados
  }
  
  console.log('🔍 Estados de servicios encontrados:', {
    servicios: servicios.map(s => ({ id: s.id_detalle_servicio, estado: s.estado })),
    estados: estados
  });
  
  // Contar frecuencia de cada estado
  const estadoCounts = {};
  estados.forEach(e => {
    estadoCounts[e] = (estadoCounts[e] || 0) + 1;
  });
  
  // Obtener el estado más común
  const estadoMasComun = Object.keys(estadoCounts).reduce((a, b) => 
    estadoCounts[a] > estadoCounts[b] ? a : b
  );
  
  // Mapear estado del backend al frontend
  let estado = estadoMasComun;
  
  // Mapear todos los posibles estados del backend al frontend
  if (estadoMasComun === 'En ejecución' || estadoMasComun === 'En proceso') {
    estado = 'En ejecucion';
  } else if (estadoMasComun === 'Pagada') {
    estado = 'Pagado';
  } else if (estadoMasComun === 'Cancelada por el usuario') {
    estado = 'Anulado';
  } else if (estadoMasComun === 'Finalizada') {
    estado = 'Finalizada';
  } else {
    estado = 'En ejecucion';
  }
  
  console.log('🔄 Mapeo de estado:', {
    estadoMasComun,
    estadoMapeado: estado,
    estadoCounts,
    estadosOriginales: estados
  });

  // Usar id_cita del grupo si está disponible, de lo contrario usar el primer servicio
  const citaId = grupo.id_cita || primerServicio.id_cita;
  // Si no hay id_cita, usar el primer id_detalle_servicio como fallback
  const idFinal = citaId || primerServicio.id_detalle_servicio;

  // Obtener datos del cliente del grupo o del primer servicio
  const cliente = grupo.cliente || primerServicio.cliente || primerServicio.usuario || {};
  
  return {
    id: idFinal,
    clientName: cliente.nombre || 'Cliente no especificado',
    nombre: cliente.nombre || 'Cliente no especificado',
    documento: cliente.documento || '',
    telefono: cliente.telefono || '',
    correo: cliente.correo || cliente.email || '',
    tipoDocumento: cliente.tipo_documento || 'CC',
    tipo_documento: cliente.tipo_documento || 'CC',
    status: estado, // Usar el estado ya mapeado correctamente
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
    fechaCreacion: primerServicio.fecha_creacion,
    // Datos del cliente para facilitar la edición
    cliente: cliente,
    usuario: cliente
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

