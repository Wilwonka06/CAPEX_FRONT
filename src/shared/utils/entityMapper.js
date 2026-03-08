/**
 * src/shared/utils/entityMappers.js
 *
 * [FIX #7] Mappers centralizados de entidades frontend ↔ backend.
 *
 * PROBLEMA ANTERIOR:
 *   Cada módulo (suppliersService, customersService, CitasService,
 *   ServiceOrderService) definía sus propias funciones de transformación
 *   inline, y el mismo estadoMap estaba duplicado en hasta 3 archivos.
 *
 * SOLUCIÓN:
 *   Un único archivo con todas las funciones de transformación.
 *   Los servicios importan desde aquí en vez de redefinirlas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PROVEEDORES
// ─────────────────────────────────────────────────────────────────────────────

export const mapSupplierFromBackend = (supplier) => {
  if (!supplier) return null;
  return {
    id:        supplier.id_proveedor,
    nit:       supplier.nit,
    tipo:      supplier.tipo_proveedor,
    nombre:    supplier.nombre,
    contacto:  supplier.contacto,
    direccion: supplier.direccion,
    correo:    supplier.correo,
    telefono:  supplier.telefono,
    isActive:  supplier.estado === 'Activo',
  };
};

export const mapSupplierToBackend = (supplier) => {
  const cleanPhone = supplier.telefono?.replace(/[-\s]/g, '').trim();
  const tipo = supplier.tipo?.toUpperCase();
  const nitValue = tipo === 'J'
    ? supplier.nit?.trim()?.replace(/\./g, '')
    : supplier.numeroDocumento?.trim()?.replace(/\s/g, '');
  return {
    nit:            nitValue,
    tipo_proveedor: tipo,
    nombre:         supplier.nombre?.trim(),
    contacto:       supplier.contacto?.trim(),
    direccion:      supplier.direccion?.trim(),
    correo:         supplier.correo?.trim()?.toLowerCase(),
    telefono:       cleanPhone,
    estado:         supplier.isActive ? 'Activo' : 'Inactivo',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTES (usuarios con rol Cliente)
// ─────────────────────────────────────────────────────────────────────────────

export const mapUserToCustomer = (user) => ({
  id:             user.id_usuario || user.id,
  documentType:   user.tipo_documento || 'Cedula de ciudadania',
  documentNumber: user.documento || '',
  nombre:         user.nombre || '',
  firstName:      user.nombre ? user.nombre.split(' ')[0] : '',
  lastName:       user.nombre ? user.nombre.split(' ').slice(1).join(' ') : '',
  email:          user.correo || '',
  phone:          user.telefono || '',
  status:         user.estado || 'Activo',
  createdAt:      user.createdAt || user.created_at || new Date().toISOString(),
  updatedAt:      user.updatedAt || user.updated_at || new Date().toISOString(),
  // Aliases para compatibilidad con código legacy
  userId:         user.id_usuario || user.id,
  role:           user.rol?.nombre || 'Cliente',
  foto:           user.foto || null,
  direccion:      user.direccion || null,
  tipo_documento: user.tipo_documento || 'Cedula de ciudadania',
  documento:      user.documento || '',
  correo:         user.correo || '',
  telefono:       user.telefono || '',
  estado:         user.estado || 'Activo',
});

export const mapCustomerToUser = (customerData) => ({
  nombre: customerData.firstName && customerData.lastName
    ? `${customerData.firstName} ${customerData.lastName}`.trim()
    : customerData.nombre || '',
  correo:         customerData.email         || customerData.correo         || '',
  telefono:       customerData.phone         || customerData.telefono       || '',
  tipo_documento: customerData.documentType  || customerData.tipo_documento || 'CC',
  documento:      customerData.documentNumber|| customerData.documento      || '',
  roleId:         customerData.roleId        || null,
  estado:         customerData.status        || customerData.estado         || 'Activo',
  ...(customerData.foto        && { foto:      customerData.foto }),
  ...(customerData.direccion   && { direccion: customerData.direccion }),
  ...(customerData.contrasena  && { contrasena: customerData.contrasena }),
});

// ─────────────────────────────────────────────────────────────────────────────
// ESTADOS DE ÓRDENES DE SERVICIO
// Antes duplicados en CitasService.js, CitasService.backup.js,
// ServiceOrderService.js y EditServiceOrder.jsx
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_BACKEND_TO_FRONTEND = {
  'En ejecución':             'En ejecucion',
  'En proceso':               'En ejecucion',
  'Pagada':                   'Pagado',
  'Pagado':                   'Pagado',
  'Cancelada por el usuario': 'Anulado',
  'Anulado':                  'Anulado',
  'Finalizada':               'Finalizada',
};

const STATUS_FRONTEND_TO_BACKEND = {
  'En ejecucion':  'En ejecución',
  'En ejecución':  'En ejecución',
  'Pagado':        'Pagada',
  'Anulado':       'Cancelada por el usuario',
  'Finalizada':    'Finalizada',
};

/**
 * Convierte un estado del backend al formato del frontend.
 * Reemplaza la función mapStatus() que estaba inline en CitasService.js
 */
export const mapStatusFromBackend = (backendStatus) => {
  if (!backendStatus) return 'En ejecucion';
  return STATUS_BACKEND_TO_FRONTEND[backendStatus] ?? 'En ejecucion';
};

/**
 * Convierte un estado del frontend al formato del backend.
 * Reemplaza los objetos estadoMap inline en ServiceOrderService.js
 */
export const mapStatusToBackend = (frontendStatus) => {
  if (!frontendStatus) return 'En ejecución';
  return STATUS_FRONTEND_TO_BACKEND[frontendStatus] ?? frontendStatus;
};

// ─────────────────────────────────────────────────────────────────────────────
// ÓRDENES DE SERVICIO — normalización al formato del backend
// ─────────────────────────────────────────────────────────────────────────────

const ensureSeconds = (timeStr) =>
  timeStr && timeStr.length === 5 ? `${timeStr}:00` : (timeStr || '08:00:00');

/**
 * Convierte una orden de servicio del frontend al array de ServiceDetail
 * que espera el backend en POST /api/ventas/detalles-servicios.
 *
 * Reemplaza normalizeOrderToBackend() que estaba inline en ServiceOrderService.js
 * y se llamaba en 2 puntos del mismo archivo.
 *
 * @param {Object} orderData - Orden del frontend
 * @returns {Array} Array de objetos ServiceDetail para el backend
 */
export const normalizeOrderToBackend = (orderData) =>
  (orderData.servicios || []).map((service) => ({
    id_empleado:       service.employee?.id || service.employee?.id_usuario || service.id_empleado,
    id_servicio:       service.servicioId   || service.id_servicio || service.id,
    id_cliente:        orderData.id_cliente,
    id_cita:           orderData.citaId || null,
    precio_unitario:   parseFloat(service.price || 0),
    cantidad:          parseInt(service.quantity || 1),
    hora_inicio:       ensureSeconds(service.startTime || service.hora_inicio),
    hora_finalizacion: ensureSeconds(service.endTime   || service.hora_finalizacion || service.hora_fin),
    duracion:          parseInt(service.duration || service.duracion || 60),
    fecha_programada:  orderData.date || new Date().toISOString().split('T')[0],
    estado:            'En ejecución',
    observaciones:     service.observaciones || orderData.observaciones || '',
  }));