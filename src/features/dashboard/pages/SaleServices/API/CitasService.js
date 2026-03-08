import apiRequest from '../../../../../shared/config/apiConfig';
import { mapStatusFromBackend, mapStatusToBackend } from '../../../../../shared/utils/entityMappers';

const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';
const SALES_PRODUCTS_ENDPOINT  = '/ventas-productos';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers locales (no de dominio — no se mueven a entityMappers)
// ─────────────────────────────────────────────────────────────────────────────

const formatearFecha = (fecha) => {
  if (!fecha || fecha === 'sin_fecha') return new Date().toLocaleDateString('es-ES');
  return fecha;
};

const formatearHora = (hora) => {
  if (!hora) return '08:00';
  return hora.substring(0, 5);
};

/**
 * Agrupa un array de serviceDetails por cliente/cita.
 * Devuelve un array de grupos { id_cita, cliente, fecha_programada, servicios[] }
 */
const groupServicesByClient = (serviceDetails) => {
  const grouped = {};

  serviceDetails.forEach((detail) => {
    const key = detail.id_cita
      ? `cita_${detail.id_cita}`
      : `cliente_${detail.id_cliente || detail.id_usuario}_${detail.fecha_programada}`;

    if (!grouped[key]) {
      grouped[key] = {
        id_cita:          detail.id_cita || null,
        id_cliente:       detail.id_cliente || detail.id_usuario,
        cliente:          detail.cliente || detail.usuario || {},
        fecha_programada: detail.fecha_programada || 'sin_fecha',
        servicios:        [],
      };
    }
    grouped[key].servicios.push(detail);
  });

  return Object.values(grouped);
};

/**
 * Transforma un grupo (cliente + servicios) al formato de VentaServicio
 * que usa el componente SaleServices.
 */
const transformarGrupoAVentaServicio = (grupo) => {
  const servicios = grupo.servicios || [];
  if (!servicios.length) return null;

  const primerServicio = servicios[0];

  // Datos del cliente
  const cliente = grupo.cliente || primerServicio.cliente || primerServicio.usuario || {};
  const clienteNombre = cliente.nombre || 'Cliente no especificado';

  // Fecha / hora
  const fecha = grupo.fecha_programada !== 'sin_fecha'
    ? grupo.fecha_programada
    : primerServicio.fecha_programada || new Date().toISOString().split('T')[0];
  const hora  = primerServicio.hora_inicio || '08:00:00';

  // Totales
  const serviciosTransformados = servicios.map((s) => ({
    id:        s.id_detalle_servicio,
    servicioId: s.id_servicio,
    name:      s.servicio?.nombre || 'Servicio',
    quantity:  parseInt(s.cantidad || 1),
    price:     parseFloat(s.precio_unitario || 0),
    subtotal:  parseFloat(s.precio_unitario || 0) * parseInt(s.cantidad || 1),
    employee:  { id: s.id_empleado, name: s.empleado?.nombre || 'Empleado no asignado' },
    hora_inicio:       s.hora_inicio,
    hora_finalizacion: s.hora_finalizacion || s.hora_fin,
    duracion:          s.servicio?.duracion || s.duracion || 60,
    estado:            s.estado,
    id_cita:           s.id_cita,
  }));

  const totalServices = serviciosTransformados.reduce((sum, s) => sum + s.subtotal, 0);

  // Estado más común (voto mayoritario)
  const estados     = servicios.map((s) => s.estado).filter(Boolean);
  const estadoCounts = estados.reduce((acc, e) => ({ ...acc, [e]: (acc[e] || 0) + 1 }), {});
  const estadoMasComun = estados.length
    ? Object.keys(estadoCounts).reduce((a, b) => estadoCounts[a] >= estadoCounts[b] ? a : b)
    : 'En ejecución';

  const dineroProporcionado = primerServicio.dinero_proporcionado || 0;
  const devolucion = Math.max(0, dineroProporcionado - totalServices);

  return {
    id:            grupo.id_cita || primerServicio.id_detalle_servicio,
    clientName:    clienteNombre,
    nombre:        clienteNombre,
    documento:     cliente.documento     || '',
    telefono:      cliente.telefono      || '',
    correo:        cliente.correo        || cliente.email || '',
    tipoDocumento: cliente.tipo_documento || 'CC',
    tipo_documento: cliente.tipo_documento || 'CC',
    status:        mapStatusFromBackend(estadoMasComun),   // [FIX #7]
    date:          formatearFecha(fecha),
    time:          formatearHora(hora),
    servicios:     serviciosTransformados,
    productos:     [],
    totalServices,
    totalProducts: 0,
    totalGeneral:  totalServices,
    citaId:        grupo.id_cita || null,
    dineroProporcionado,
    devolucion,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// API Pública
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene todas las citas/servicios en ejecución desde el backend
 * y las transforma al formato VentaServicio.
 */
export const getCitasEnEjecucion = async () => {
  try {
    const response = await apiRequest.get(SERVICE_DETAILS_ENDPOINT);

    let serviceDetails = [];
    if (response?.success && Array.isArray(response.data)) {
      serviceDetails = response.data;
    } else if (Array.isArray(response)) {
      serviceDetails = response;
    }

    const grupos = groupServicesByClient(serviceDetails);
    const transformed = await Promise.all(
      grupos.map(async (grupo) => {
        const base = transformarGrupoAVentaServicio(grupo);
        if (!base) return null;

        // Cargar productos de la cita si existe id_cita
        if (grupo.id_cita) {
          try {
            const ventasProductos = await apiRequest.get(
              `${SALES_PRODUCTS_ENDPOINT}/cita/${grupo.id_cita}`
            );
            if (ventasProductos?.success && ventasProductos.data?.length > 0) {
              const venta = ventasProductos.data[0];
              if (Array.isArray(venta.detalles)) {
                base.productos = venta.detalles.map((d) => ({
                  id:         d.id_producto,
                  id_producto: d.id_producto,
                  name:       d.producto?.nombre || 'Producto',
                  quantity:   parseInt(d.cantidad || 1),
                  price:      parseFloat(d.precio_unitario || 0),
                  subtotal:   parseFloat(d.precio_unitario || 0) * parseInt(d.cantidad || 1),
                }));
                base.totalProducts = base.productos.reduce((s, p) => s + p.subtotal, 0);
                base.totalGeneral  = base.totalServices + base.totalProducts;
              }
            }
          } catch {
            // No bloquear si no hay productos
          }
        }

        return base;
      })
    );

    return transformed.filter(Boolean);
  } catch (error) {
    console.error('❌ Error al obtener servicios:', error);
    return [];
  }
};

/**
 * Obtiene una orden específica por ID.
 * Usa la orden ya cargada si está disponible en caché.
 */
export const getCitaById = async (serviceDetailId, cachedOrder = null) => {
  try {
    if (cachedOrder?.servicios?.length > 0) {
      if (!cachedOrder.productos?.length && cachedOrder.citaId) {
        try {
          const ventasProductos = await apiRequest.get(
            `${SALES_PRODUCTS_ENDPOINT}/cita/${cachedOrder.citaId}`
          );
          if (ventasProductos?.success && ventasProductos.data?.length > 0) {
            const venta = ventasProductos.data[0];
            if (Array.isArray(venta.detalles)) {
              cachedOrder.productos = venta.detalles.map((d) => ({
                id:         d.id_producto,
                id_producto: d.id_producto,
                name:       d.producto?.nombre || 'Producto',
                quantity:   parseInt(d.cantidad || 1),
                price:      parseFloat(d.precio_unitario || 0),
                subtotal:   parseFloat(d.precio_unitario || 0) * parseInt(d.cantidad || 1),
              }));
            }
          }
        } catch {
          // Silencioso — la orden puede no tener productos
        }
      }
      return cachedOrder;
    }

    // Cargar desde el backend
    const response = await apiRequest.get(
      `${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}`
    );
    const service = response?.data || response;
    if (!service) throw new Error('Orden no encontrada');

    const cliente = service.cliente || service.usuario || {};
    const serviciosTransformados = [{
      id:        service.id_detalle_servicio,
      servicioId: service.id_servicio,
      name:      service.servicio?.nombre || 'Servicio',
      quantity:  parseInt(service.cantidad || 1),
      price:     parseFloat(service.precio_unitario || 0),
      subtotal:  parseFloat(service.precio_unitario || 0) * parseInt(service.cantidad || 1),
      employee:  { id: service.id_empleado, name: service.empleado?.nombre || 'Empleado no asignado' },
      hora_inicio:       service.hora_inicio,
      hora_finalizacion: service.hora_finalizacion || service.hora_fin,
      duracion:          service.servicio?.duracion || 60,
      estado:            service.estado,
    }];

    const totalServices       = serviciosTransformados.reduce((s, x) => s + x.subtotal, 0);
    const dineroProporcionado = service.dinero_proporcionado || 0;
    const devolucion          = Math.max(0, dineroProporcionado - totalServices);

    const orden = {
      id:            serviceDetailId,
      clientName:    cliente.nombre || 'Cliente no especificado',
      date:          service.fecha_programada || new Date().toLocaleDateString('es-ES'),
      time:          formatearHora(service.hora_inicio),
      status:        mapStatusFromBackend(service.estado),   // [FIX #7]
      servicios:     serviciosTransformados,
      productos:     [],
      totalServices,
      totalProducts: 0,
      totalGeneral:  totalServices,
      citaId:        service.id_cita || null,
      dineroProporcionado,
      devolucion,
    };

    return orden;
  } catch (error) {
    console.error('Error al obtener orden:', error);
    throw new Error('Error al cargar la orden');
  }
};

/**
 * Busca órdenes que coincidan con un término.
 */
export const buscarCitas = async (termino) => {
  try {
    const allServices = await getCitasEnEjecucion();
    return allServices.filter(
      (s) =>
        s.id?.toString().includes(termino) ||
        s.clientName?.toLowerCase().includes(termino.toLowerCase())
    );
  } catch (error) {
    console.error('Error al buscar:', error);
    return [];
  }
};

/**
 * Actualiza el estado de una orden de servicio.
 * [FIX #7] Usa mapStatusToBackend() en vez del objeto inline.
 */
export const actualizarEstadoCita = async (serviceDetailId, nuevoEstado) => {
  try {
    return await apiRequest.patch(
      `${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}/status`,
      { estado: mapStatusToBackend(nuevoEstado) }   // [FIX #7]
    );
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    throw new Error('Error al actualizar estado');
  }
};

/**
 * Inicia un servicio (cambia estado a "En ejecución").
 */
export const iniciarServicio = async (serviceDetailId) => {
  try {
    return await apiRequest.patch(
      `${SERVICE_DETAILS_ENDPOINT}/${serviceDetailId}/iniciar`
    );
  } catch (error) {
    console.error('Error al iniciar servicio:', error);
    throw new Error('Error al iniciar el servicio');
  }
};