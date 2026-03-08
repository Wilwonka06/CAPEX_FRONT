import apiRequest from '../../../../../shared/config/apiConfig';
import { executeWithToast } from '../../../../../shared/utils/toastHelpers';
import { validateServiceOrder } from '../../../../../shared/validations';
import appointmentsService from '../../appointments/API/appointmentsService';
import {
  normalizeOrderToBackend,
  mapStatusToBackend,
} from '../../../../../shared/utils/entityMappers';

const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';
const SALES_PRODUCTS_ENDPOINT  = '/ventas-productos';

export const createServiceOrder = async (orderData, orders) => {
  return executeWithToast({
    operation:      'create',
    entity:         'orden de servicio',
    loadingMessage: 'Creando orden de servicio...',
    successMessage: 'Orden creada exitosamente',
    promiseFn: async () => {
      const totalServices = (orderData.servicios || []).reduce(
        (sum, s) => sum + (s.subtotal || 0),
        0
      );
      const totalProducts = (orderData.productos || []).reduce(
        (sum, p) => sum + (p.subtotal || 0),
        0
      );
      const totalGeneral = totalServices + totalProducts;

      const validation = validateServiceOrder(
        orderData,
        orders,
        totalGeneral,
        orderData.status || 'En ejecucion'
      );
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      // [FIX #7] normalizeOrderToBackend viene de entityMappers
      const serviceDetails = normalizeOrderToBackend(orderData);
      console.log('📋 Datos normalizados para backend:', serviceDetails);

      const createdServices = await Promise.all(
        serviceDetails.map((sd) => apiRequest.post(SERVICE_DETAILS_ENDPOINT, sd))
      );

      const firstService         = createdServices[0]?.data || createdServices[0];
      const dineroProporcionado  = orderData.dineroProporcionado || 0;
      const devolucion           = Math.max(0, dineroProporcionado - totalGeneral);

      // Crear venta de productos si hay productos
      if (orderData.productos?.length > 0 && firstService) {
        try {
          const citaId = firstService.id_cita || orderData.citaId || null;
          const ventaProductos = {
            id_usuario: orderData.id_cliente,
            id_cita:    citaId,
            detalles:   orderData.productos.map((p) => ({
              id_producto:     p.id || p.id_producto,
              cantidad:        parseInt(p.quantity || p.cantidad || 1),
              precio_unitario: parseFloat(p.price || p.precio_unitario || 0),
            })),
          };
          await apiRequest.post(SALES_PRODUCTS_ENDPOINT, ventaProductos);
        } catch (err) {
          console.warn('⚠️ Error al crear venta de productos (no bloquea la orden):', err);
        }
      }

      return {
        success:      true,
        serviceId:    firstService?.id_detalle_servicio || firstService?.id,
        totalGeneral,
        totalServices,
        totalProducts,
        dineroProporcionado,
        devolucion,
      };
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Editar orden de servicio
// ─────────────────────────────────────────────────────────────────────────────

export const editServiceOrder = async (orderId, orderData, orders) => {
  return executeWithToast({
    operation:      'update',
    entity:         'orden de servicio',
    loadingMessage: 'Actualizando orden de servicio...',
    successMessage: 'Orden actualizada exitosamente',
    promiseFn: async () => {
      const totalServices = (orderData.servicios || []).reduce(
        (sum, s) => sum + (s.subtotal || 0),
        0
      );
      const totalProducts = (orderData.productos || []).reduce(
        (sum, p) => sum + (p.subtotal || 0),
        0
      );
      const totalGeneral = totalServices + totalProducts;

      const validation = validateServiceOrder(
        orderData,
        orders,
        totalGeneral,
        orderData.status || 'En ejecucion'
      );
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      // [FIX #7] mapStatusToBackend en vez del objeto estadoMap inline
      const estadoBackend = mapStatusToBackend(orderData.status);

      const updatePromises = (orderData.servicios || []).map((service) => {
        if (!service.id) {
          // Servicio nuevo — crear
          const newServiceDetail = normalizeOrderToBackend({
            ...orderData,
            servicios: [service],
          })[0];
          newServiceDetail.estado = estadoBackend;

          if (!newServiceDetail.id_cliente) {
            throw new Error('El ID del cliente es requerido para crear un nuevo servicio');
          }
          if (!newServiceDetail.id_empleado) {
            throw new Error(
              `El ID del empleado es requerido. El servicio "${service.name || 'sin nombre'}" no tiene empleado asignado.`
            );
          }
          return apiRequest.post(SERVICE_DETAILS_ENDPOINT, newServiceDetail);
        }

        // Servicio existente — actualizar
        const updateData = {
          id_empleado:       service.employee?.id || service.employee?.id_usuario || service.id_empleado,
          precio_unitario:   parseFloat(service.price || 0),
          cantidad:          parseInt(service.quantity || 1),
          hora_inicio:       service.startTime || service.hora_inicio || '08:00:00',
          hora_finalizacion: service.endTime   || service.hora_finalizacion || service.hora_fin || '09:00:00',
          estado:            estadoBackend,
          dinero_proporcionado: orderData.dineroProporcionado || 0,
          observaciones:     service.observaciones || '',
        };
        return apiRequest.put(`${SERVICE_DETAILS_ENDPOINT}/${service.id}`, updateData);
      });

      await Promise.all(updatePromises);

      // Actualizar productos si hay cambios
      if (orderData.citaId && orderData.productos !== undefined) {
        try {
          const ventaExistente = await apiRequest.get(
            `${SALES_PRODUCTS_ENDPOINT}/cita/${orderData.citaId}`
          );
          if (ventaExistente?.success && ventaExistente.data?.length > 0) {
            const ventaId = ventaExistente.data[0].id_venta_productos;
            await apiRequest.put(`${SALES_PRODUCTS_ENDPOINT}/${ventaId}`, {
              detalles: (orderData.productos || []).map((p) => ({
                id_producto:     p.id || p.id_producto,
                cantidad:        parseInt(p.quantity || p.cantidad || 1),
                precio_unitario: parseFloat(p.price || p.precio_unitario || 0),
              })),
            });
          } else if (orderData.productos?.length > 0) {
            await apiRequest.post(SALES_PRODUCTS_ENDPOINT, {
              id_usuario: orderData.id_cliente,
              id_cita:    orderData.citaId,
              detalles:   orderData.productos.map((p) => ({
                id_producto:     p.id || p.id_producto,
                cantidad:        parseInt(p.quantity || p.cantidad || 1),
                precio_unitario: parseFloat(p.price || p.precio_unitario || 0),
              })),
            });
          }
        } catch (err) {
          console.warn('⚠️ Error al actualizar productos (no bloquea la orden):', err);
        }
      }

      const dineroProporcionado = orderData.dineroProporcionado || 0;
      const devolucion = Math.max(0, dineroProporcionado - totalGeneral);

      return { success: true, totalGeneral, totalServices, totalProducts, dineroProporcionado, devolucion };
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Anular orden de servicio
// ─────────────────────────────────────────────────────────────────────────────

export const anularServiceOrder = async (orderId, orderData) => {
  return executeWithToast({
    operation:      'delete',
    entity:         'orden de servicio',
    loadingMessage: 'Anulando orden de servicio...',
    successMessage: 'Orden anulada exitosamente',
    promiseFn: async () => {
      let serviciosParaAnular = orderData?.servicios || [];

      if (!serviciosParaAnular.length) {
        // Intentar recuperar servicios desde el backend
        try {
          const response = await apiRequest.get(SERVICE_DETAILS_ENDPOINT);
          const allServices = response?.data || response || [];
          const citaId = orderData?.citaId;

          if (citaId) {
            serviciosParaAnular = allServices.filter(
              (s) => (s.id_cita === citaId || s.id_cita === parseInt(citaId))
            );
          } else {
            serviciosParaAnular = allServices.filter(
              (s) => (s.id_detalle_servicio || s.id) === orderId ||
                     (s.id_detalle_servicio || s.id) === parseInt(orderId)
            );
          }
        } catch {
          throw new Error('No se pudieron obtener los servicios para anular');
        }
      }

      if (!serviciosParaAnular.length) {
        throw new Error('No se encontraron servicios para anular');
      }

      await Promise.all(
        serviciosParaAnular.map((service) => {
          const serviceId = service.id_detalle_servicio || service.id;
          if (!serviceId) return Promise.resolve();
          return apiRequest.patch(`${SERVICE_DETAILS_ENDPOINT}/${serviceId}/status`, {
            estado: 'Cancelada por el usuario',
          });
        })
      );

      return { success: true, message: 'Orden anulada exitosamente' };
    },
  });
};