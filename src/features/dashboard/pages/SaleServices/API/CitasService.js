import apiRequest from '../../../../../shared/config/apiConfig';
import { normalizeText } from '../../../../../shared/normalizers';

const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';
const SALES_PRODUCTS_ENDPOINT = '/ventas-productos';

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

    // Agrupar servicios por cita/cliente antes de transformar
    const groupedServices = {};
    serviceDetails.forEach(service => {
      const citaId = service.id_cita;
      const clienteId = service.id_cliente;
      const fecha = service.fecha_programada || 'sin_fecha';
      
      // Crear clave única para agrupar
      const key = citaId 
        ? `cita_${citaId}` 
        : `cliente_${clienteId}_${fecha}`;
      
      if (!groupedServices[key]) {
        groupedServices[key] = {
          id_cita: citaId,
          id_cliente: clienteId,
          cliente: service.cliente || service.usuario,
          fecha_programada: fecha,
          servicios: []
        };
      }
      
      groupedServices[key].servicios.push(service);
    });

    // Transformar grupos al formato esperado
    const transformed = await Promise.all(Object.values(groupedServices).map(async (grupo) => {
      const servicios = grupo.servicios || [];
      if (servicios.length === 0) return null;

      // Usar el primer servicio como referencia para datos comunes
      const primerServicio = servicios[0];
      const cliente = primerServicio.cliente || primerServicio.usuario || {};
      const clienteNombre = cliente.nombre || cliente.Nombre || cliente.name || 'Cliente desconocido';

      // Transformar todos los servicios del grupo
      const serviciosTransformados = servicios.map(service => {
        const servicioNombre = service.servicio?.nombre || service.servicio?.Nombre || service.servicio?.name || 'Servicio desconocido';
        const empleadoNombre = service.empleado?.nombre || service.empleado?.Nombre || service.empleado?.name || 'Empleado desconocido';
        const empleadoId = service.id_empleado || 
                          service.empleado?.id_usuario || 
                          service.empleado?.id || 
                          null;
        const servicioId = service.id_servicio || 
                          service.servicio?.id_servicio || 
                          service.servicio?.id || 
                          null;

        return {
          id: service.id_detalle_servicio || service.id,
          id_detalle_servicio: service.id_detalle_servicio || service.id, // Asegurar que se incluya el ID correcto
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
          fecha_programada: service.fecha_programada,
          id_cita: service.id_cita
        };
      });

      // Cargar productos asociados a la cita si existe
      let productos = [];
      let totalProducts = 0;
      const citaId = grupo.id_cita;
      
      if (citaId) {
        try {
          const ventasProductos = await apiRequest.get(`${SALES_PRODUCTS_ENDPOINT}/cita/${citaId}`);
          if (ventasProductos.success && ventasProductos.data && ventasProductos.data.length > 0) {
            // Obtener los detalles de la primera venta encontrada
            const venta = ventasProductos.data[0];
            if (venta.detalles && Array.isArray(venta.detalles)) {
              productos = venta.detalles.map(detalle => ({
                id: detalle.id_producto,
                id_producto: detalle.id_producto,
                name: detalle.producto?.nombre || 'Producto desconocido',
                quantity: detalle.cantidad || 1,
                price: parseFloat(detalle.precio_unitario || 0),
                precio: parseFloat(detalle.precio_unitario || 0),
                subtotal: parseFloat(detalle.subtotal || 0)
              }));
              totalProducts = productos.reduce((sum, p) => sum + (p.subtotal || 0), 0);
            }
          }
        } catch (error) {
          console.error('Error al cargar productos de la cita:', error);
          // Continuar sin productos si hay error
        }
      }

      // Calcular totales
      const totalServices = serviciosTransformados.reduce((sum, s) => sum + (s.subtotal || 0), 0);
      const totalGeneral = totalServices + totalProducts;

      // Determinar estado (usar el más común o el primero)
      const estados = servicios.map(s => s.estado).filter(e => e);
      const estadoMasComun = estados.length > 0 
        ? estados.reduce((a, b, _, arr) => arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)
        : 'En ejecución';

      // Usar el ID del primer servicio como ID de la orden
      const ordenId = serviciosTransformados[0].id;

      return {
        id: ordenId,
        clientName: clienteNombre,
        date: grupo.fecha_programada !== 'sin_fecha' ? grupo.fecha_programada : new Date().toLocaleDateString('es-ES'),
        time: serviciosTransformados[0].hora_inicio?.substring(0, 5) || '08:00',
        status: mapStatus(estadoMasComun),
        servicios: serviciosTransformados,
        productos: productos,
        totalServices: totalServices,
        totalProducts: totalProducts,
        totalGeneral: totalGeneral,
        citaId: grupo.id_cita
      };
    }));

    // Filtrar nulls y retornar
    return transformed.filter(item => item !== null);
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
 * Optimizado: usa la orden ya cargada si está disponible, solo carga productos si es necesario
 */
export const getCitaById = async (serviceDetailId, cachedOrder = null) => {
  try {
    // Si tenemos la orden en caché y tiene todos los datos, usarla directamente
    if (cachedOrder && cachedOrder.servicios && cachedOrder.servicios.length > 0) {
      // Solo cargar productos si no están cargados
      if (!cachedOrder.productos || cachedOrder.productos.length === 0) {
        const citaId = cachedOrder.citaId;
        if (citaId) {
          try {
            const ventasProductos = await apiRequest.get(`${SALES_PRODUCTS_ENDPOINT}/cita/${citaId}`);
            if (ventasProductos.success && ventasProductos.data && ventasProductos.data.length > 0) {
              const venta = ventasProductos.data[0];
              if (venta.detalles && Array.isArray(venta.detalles)) {
                const productos = venta.detalles.map(detalle => ({
                  id: detalle.id_producto,
                  id_producto: detalle.id_producto,
                  name: detalle.producto?.nombre || 'Producto desconocido',
                  quantity: detalle.cantidad || 1,
                  price: parseFloat(detalle.precio_unitario || 0),
                  precio: parseFloat(detalle.precio_unitario || 0),
                  subtotal: parseFloat(detalle.subtotal || 0)
                }));
                const totalProducts = productos.reduce((sum, p) => sum + (p.subtotal || 0), 0);
                return {
                  ...cachedOrder,
                  productos,
                  totalProducts,
                  totalGeneral: (cachedOrder.totalServices || 0) + totalProducts
                };
              }
            }
          } catch (error) {
            // Continuar sin productos si hay error
          }
        }
      }
      return cachedOrder;
    }

    // Si no hay caché, obtener el servicio individual
    const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}`);
    const service = response.data || response;

    // Obtener el id_cita
    const citaId = service.id_cita ? (typeof service.id_cita === 'number' ? service.id_cita : parseInt(service.id_cita)) : null;

    // Si hay cita, intentar obtener servicios relacionados usando el endpoint específico
    // Si falla, usar solo el servicio individual (más rápido que cargar todos)
    let servicios = [service];
    if (citaId) {
      try {
        const citaResponse = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/cita/${citaId}`);
        if (citaResponse.success && citaResponse.data) {
          let serviciosArray = [];
          if (Array.isArray(citaResponse.data)) {
            serviciosArray = citaResponse.data;
          } else if (citaResponse.data.data && Array.isArray(citaResponse.data.data)) {
            serviciosArray = citaResponse.data.data;
          }
          if (serviciosArray.length > 0) {
            servicios = serviciosArray;
          }
        }
      } catch (error) {
        // Si falla, usar solo el servicio individual (más rápido)
      }
    }

    // Extraer datos del cliente de múltiples fuentes posibles
    const cliente = service.cliente || service.usuario || {};
    const clienteNombre = cliente.nombre || cliente.Nombre || cliente.name || 'Cliente desconocido';

    // Transformar todos los servicios
    const serviciosTransformados = servicios.map(serv => {
      const servicioNombre = serv.servicio?.nombre || serv.servicio?.Nombre || serv.servicio?.name || 'Servicio desconocido';
      const empleadoNombre = serv.empleado?.nombre || serv.empleado?.Nombre || serv.empleado?.name || 'Empleado desconocido';
      const empleadoId = serv.id_empleado || 
                        serv.empleado?.id_usuario || 
                        serv.empleado?.id || 
                        null;
      const servicioId = serv.id_servicio || 
                        serv.servicio?.id_servicio || 
                        serv.servicio?.id || 
                        null;

      return {
        id: serv.id_detalle_servicio || serv.id,
        id_detalle_servicio: serv.id_detalle_servicio || serv.id,
        servicioId: servicioId,
        name: servicioNombre,
        quantity: serv.cantidad || 1,
        price: serv.precio_unitario || 0,
        subtotal: (serv.precio_unitario || 0) * (serv.cantidad || 1),
        employee: {
          id: empleadoId,
          name: empleadoNombre
        },
        id_empleado: empleadoId,
        startTime: serv.hora_inicio?.substring(0, 5),
        endTime: serv.hora_finalizacion?.substring(0, 5),
        hora_inicio: serv.hora_inicio,
        hora_finalizacion: serv.hora_finalizacion,
        duration: serv.duracion,
        fecha_programada: serv.fecha_programada,
        id_cita: serv.id_cita
      };
    });

    // Cargar productos asociados a la cita si existe
    let productos = [];
    let totalProducts = 0;
    
    if (citaId) {
      try {
        const ventasProductos = await apiRequest.get(`${SALES_PRODUCTS_ENDPOINT}/cita/${citaId}`);
        if (ventasProductos.success && ventasProductos.data && ventasProductos.data.length > 0) {
          // Obtener los detalles de la primera venta encontrada
          const venta = ventasProductos.data[0];
          if (venta.detalles && Array.isArray(venta.detalles)) {
            productos = venta.detalles.map(detalle => ({
              id: detalle.id_producto,
              id_producto: detalle.id_producto,
              name: detalle.producto?.nombre || 'Producto desconocido',
              quantity: detalle.cantidad || 1,
              price: parseFloat(detalle.precio_unitario || 0),
              precio: parseFloat(detalle.precio_unitario || 0),
              subtotal: parseFloat(detalle.subtotal || 0)
            }));
            totalProducts = productos.reduce((sum, p) => sum + (p.subtotal || 0), 0);
          }
        }
      } catch (error) {
        console.error('Error al cargar productos de la cita:', error);
        // Continuar sin productos si hay error
      }
    }

    // Calcular totales
    const totalServices = serviciosTransformados.reduce((sum, s) => sum + (s.subtotal || 0), 0);
    const totalGeneral = totalServices + totalProducts;

    // Determinar estado (usar el más común o el primero)
    const estados = servicios.map(s => s.estado).filter(e => e);
    const estadoMasComun = estados.length > 0 
      ? estados.reduce((a, b, _, arr) => arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)
      : 'En ejecución';

    // Obtener dinero proporcionado y devolución si están disponibles
    const dineroProporcionado = service.dinero_proporcionado || service.dineroProporcionado || 0;
    const devolucion = Math.max(0, dineroProporcionado - totalGeneral);

    return {
      id: serviciosTransformados[0].id,
      clientName: clienteNombre,
      date: service.fecha_programada || new Date().toLocaleDateString('es-ES'),
      time: serviciosTransformados[0].hora_inicio?.substring(0, 5) || '08:00',
      status: mapStatus(estadoMasComun),
      servicios: serviciosTransformados,
      productos: productos,
      totalServices: totalServices,
      totalProducts: totalProducts,
      totalGeneral: totalGeneral,
      citaId: citaId,
      dineroProporcionado: dineroProporcionado,
      devolucion: devolucion
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