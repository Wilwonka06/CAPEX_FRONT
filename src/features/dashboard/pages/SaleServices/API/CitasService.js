import apiRequest from '../../../../../shared/config/apiConfig';
import { normalizeText } from '../../../../../shared/normalizers';

const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';

/**
 * Obtiene todas las órdenes de servicio (todos los estados)
 */
export const getCitasEnEjecucion = async () => {
  try {
    console.log('🔄 Cargando todas las órdenes de servicio...');

    // Intentar obtener todos los servicios directamente
    const response = await apiRequest.get(SERVICE_DETAILS_ENDPOINT);

    console.log('📡 Respuesta del backend:', {
      success: response.success,
      data: response.data,
      length: response.data?.length || 0
    });

    if (!response.success || !response.data) {
      console.warn('⚠️ No se encontraron servicios');
      return [];
    }

    let serviceDetails = [];
    if (Array.isArray(response.data)) {
      serviceDetails = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      serviceDetails = response.data.data;
    }

    console.log('✅ Servicios obtenidos:', serviceDetails.length);

    // Transformar servicios al formato esperado
    const transformed = serviceDetails.map(service => {
      // Extraer datos del cliente de múltiples fuentes posibles
      const cliente = service.cliente || service.usuario || {};
      const clienteNombre = cliente.nombre || cliente.Nombre || cliente.name || 'Cliente desconocido';

      // Extraer datos del servicio con múltiples alternativas
      const servicioNombre = service.servicio?.nombre || service.servicio?.Nombre || service.servicio?.name || 'Servicio desconocido';
      const empleadoNombre = service.empleado?.nombre || service.empleado?.Nombre || service.empleado?.name || 'Empleado desconocido';
      // Obtener el ID del empleado - puede venir de diferentes campos
      const empleadoId = service.id_empleado || 
                        service.empleado?.id_usuario || 
                        service.empleado?.id || 
                        null;
      // Obtener el ID del servicio
      const servicioId = service.id_servicio || 
                        service.servicio?.id_servicio || 
                        service.servicio?.id || 
                        null;

      return {
        id: service.id_detalle_servicio || service.id,
        clientName: clienteNombre,
        date: service.fecha_programada || new Date().toLocaleDateString('es-ES'),
        time: service.hora_inicio?.substring(0, 5) || '08:00',
        status: mapStatus(service.estado),
        servicios: [{
          id: service.id_detalle_servicio || service.id,
          servicioId: servicioId,
          name: servicioNombre,
          quantity: service.cantidad || 1,
          price: service.precio_unitario || 0,
          subtotal: (service.precio_unitario || 0) * (service.cantidad || 1),
          employee: {
            id: empleadoId,
            name: empleadoNombre
          },
          id_empleado: empleadoId,
          hora_inicio: service.hora_inicio,
          hora_finalizacion: service.hora_finalizacion,
          duracion: service.duracion,
          fecha_programada: service.fecha_programada
        }],
        totalServices: (service.precio_unitario || 0) * (service.cantidad || 1),
        totalProducts: 0,
        totalGeneral: (service.precio_unitario || 0) * (service.cantidad || 1)
      };
    });

    return transformed;
  } catch (error) {
    console.error('❌ Error al obtener servicios:', error);
    return [];
  }
};

/**
 * Mapea estados del backend al frontend
 */
const mapStatus = (backendStatus) => {
  if (!backendStatus) return 'En ejecucion';

  const statusMap = {
    'En ejecución': 'En ejecucion',
    'En proceso': 'En ejecucion',
    'Pagada': 'Pagado',
    'Pagado': 'Pagado',
    'Cancelada por el usuario': 'Anulado',
    'Anulado': 'Anulado'
  };

  return statusMap[backendStatus] || 'En ejecucion';
};

/**
 * Obtiene una orden específica por ID
 */
export const getCitaById = async (serviceDetailId) => {
  try {
    const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}`);
    const service = response.data || response;

    // Extraer datos del cliente de múltiples fuentes posibles
    const cliente = service.cliente || service.usuario || {};
    const clienteNombre = cliente.nombre || cliente.Nombre || cliente.name || 'Cliente desconocido';

    // Extraer datos del servicio con múltiples alternativas
    const servicioNombre = service.servicio?.nombre || service.servicio?.Nombre || service.servicio?.name || 'Servicio desconocido';
    const empleadoNombre = service.empleado?.nombre || service.empleado?.Nombre || service.empleado?.name || 'Empleado desconocido';
    // Obtener el ID del empleado - puede venir de diferentes campos
    const empleadoId = service.id_empleado || 
                      service.empleado?.id_usuario || 
                      service.empleado?.id || 
                      null;
    // Obtener el ID del servicio
    const servicioId = service.id_servicio || 
                      service.servicio?.id_servicio || 
                      service.servicio?.id || 
                      null;

    return {
      id: service.id_detalle_servicio || service.id,
      clientName: clienteNombre,
      date: service.fecha_programada || new Date().toLocaleDateString('es-ES'),
      time: service.hora_inicio?.substring(0, 5) || '08:00',
      status: mapStatus(service.estado),
      servicios: [{
        id: service.id_detalle_servicio || service.id,
        servicioId: servicioId,
        name: servicioNombre,
        quantity: service.cantidad || 1,
        price: service.precio_unitario || 0,
        subtotal: (service.precio_unitario || 0) * (service.cantidad || 1),
        employee: {
          id: empleadoId,
          name: empleadoNombre
        },
        id_empleado: empleadoId,
        startTime: service.hora_inicio?.substring(0, 5),
        endTime: service.hora_finalizacion?.substring(0, 5),
        duration: service.duracion,
        fecha_programada: service.fecha_programada
      }],
      totalServices: (service.precio_unitario || 0) * (service.cantidad || 1),
      totalProducts: 0,
      totalGeneral: (service.precio_unitario || 0) * (service.cantidad || 1)
    };
  } catch (error) {
    console.error('Error al obtener orden:', error);
    throw new Error('Error al cargar la orden');
  }
};

/**
 * Busca órdenes por término
 */
export const buscarCitas = async (termino) => {
  try {
    const allServices = await getCitasEnEjecucion();
    return allServices.filter(service =>
      service.id.toString().includes(termino) ||
      service.clientName.toLowerCase().includes(termino.toLowerCase())
    );
  } catch (error) {
    console.error('Error al buscar:', error);
    return [];
  }
};

/**
 * Actualiza estado de una orden
 */
export const actualizarEstadoCita = async (serviceDetailId, nuevoEstado) => {
  try {
    const estadoMap = {
      'Anulado': 'Cancelada por el usuario',
      'Pagado': 'Pagada',
      'En ejecucion': 'En ejecución'
    };

    const resultado = await apiRequest.patch(`${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}/status`, {
      estado: estadoMap[nuevoEstado] || nuevoEstado
    });

    return resultado;
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    throw new Error('Error al actualizar estado');
  }
};