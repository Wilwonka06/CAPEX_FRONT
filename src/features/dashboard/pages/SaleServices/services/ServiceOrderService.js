// Servicio para órdenes de servicio con conexión al backend
import apiRequest from '../../../../../shared/config/apiConfig';
import { validateServiceOrder } from '../../../../../shared/validations';

const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';

/**
 * Convierte datos del frontend al formato del backend
 */
const normalizeOrderToBackend = (orderData) => {
  const serviceDetails = (orderData.servicios || []).map(service => ({
    id_empleado: service.employee?.id || service.id_empleado,
    id_servicio: service.servicioId || service.id_servicio,
    id_cliente: orderData.id_cliente,
    id_cita: orderData.citaId || null,
    precio_unitario: parseFloat(service.price || 0),
    cantidad: parseInt(service.quantity || 1),
    hora_inicio: service.hora_inicio || '08:00:00',
    hora_finalizacion: service.hora_finalizacion || service.hora_fin || '09:00:00',
    duracion: parseInt(service.duracion || 60),
    fecha_programada: orderData.date || new Date().toISOString().split('T')[0],
    estado: 'En proceso',
    observaciones: service.observaciones || orderData.observaciones || ''
  }));

  return serviceDetails;
};

/**
 * Crea una nueva orden de servicio
 */
export const createServiceOrder = async (orderData, orders) => {
  try {
    // Calcular total general
    const totalServices = (orderData.servicios || []).reduce((sum, service) => sum + (service.subtotal || 0), 0);
    const totalProducts = (orderData.productos || []).reduce((sum, product) => sum + (product.subtotal || 0), 0);
    const totalGeneral = totalServices + totalProducts;

    // Validación centralizada
    const validation = validateServiceOrder(orderData, orders, totalGeneral, orderData.status || 'En ejecucion');
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    // Convertir datos al formato del backend
    const serviceDetails = normalizeOrderToBackend(orderData);

    // Crear cada detalle de servicio en el backend
    const createdServices = await Promise.all(
      serviceDetails.map(serviceDetail => 
        apiRequest.post(SERVICE_DETAILS_ENDPOINT, serviceDetail)
      )
    );

    // Obtener el primer servicio creado para usar como referencia
    const firstService = createdServices[0]?.data || createdServices[0];
    
    // Calcular devolución
    const dineroProporcionado = orderData.dineroProporcionado || 0;
    const devolucion = Math.max(0, dineroProporcionado - totalGeneral);

    // Retornar en formato del frontend
    return {
      id: firstService.id_cita || firstService.id_detalle_servicio,
      ...orderData,
      totalServices,
      totalProducts,
      totalGeneral,
      devolucion,
      date: orderData.date || new Date().toLocaleDateString('es-ES'),
      time: orderData.time || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      servicios: createdServices.map((s, idx) => ({
        id: s.data?.id_detalle_servicio || s.id_detalle_servicio,
        servicioId: orderData.servicios[idx]?.servicioId,
        name: orderData.servicios[idx]?.name,
        quantity: orderData.servicios[idx]?.quantity,
        price: orderData.servicios[idx]?.price,
        subtotal: orderData.servicios[idx]?.subtotal,
        employee: orderData.servicios[idx]?.employee
      }))
    };
  } catch (error) {
    console.error('Error creating service order:', error);
    throw error;
  }
};

/**
 * Edita una orden de servicio existente
 */
export const editServiceOrder = async (orderData, orders) => {
  try {
    // Calcular total general
    const totalServices = (orderData.servicios || []).reduce((sum, service) => sum + (service.subtotal || 0), 0);
    const totalProducts = (orderData.productos || []).reduce((sum, product) => sum + (product.subtotal || 0), 0);
    const totalGeneral = totalServices + totalProducts;

    // Validación centralizada
    const validation = validateServiceOrder(orderData, orders, totalGeneral, orderData.status);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    // Actualizar cada servicio en el backend
    const updatePromises = (orderData.servicios || []).map(service => {
      if (!service.id) {
        // Si no tiene ID, es un nuevo servicio, crearlo
        const newServiceDetail = normalizeOrderToBackend({
          ...orderData,
          servicios: [service]
        })[0];
        return apiRequest.post(SERVICE_DETAILS_ENDPOINT, newServiceDetail);
      } else {
        // Actualizar servicio existente
        const updateData = {
          id_empleado: service.employee?.id || service.id_empleado,
          id_servicio: service.servicioId || service.id_servicio,
          precio_unitario: parseFloat(service.price || 0),
          cantidad: parseInt(service.quantity || 1),
          hora_inicio: service.hora_inicio || '08:00:00',
          hora_finalizacion: service.hora_finalizacion || service.hora_fin || '09:00:00',
          duracion: parseInt(service.duracion || 60),
          observaciones: service.observaciones || ''
        };
        return apiRequest.put(`${SERVICE_DETAILS_ENDPOINT}/${service.id}`, updateData);
      }
    });

    await Promise.all(updatePromises);

    // Calcular devolución
    const dineroProporcionado = orderData.dineroProporcionado || 0;
    const devolucion = Math.max(0, dineroProporcionado - totalGeneral);

    // Retorna la orden editada
    return { 
      ...orderData,
      totalServices,
      totalProducts,
      totalGeneral,
      devolucion
    };
  } catch (error) {
    console.error('Error editing service order:', error);
    throw error;
  }
};

/**
 * Elimina una orden de servicio
 */
export const deleteServiceOrder = async (orderId, orders) => {
  try {
    // Obtener todos los servicios de la orden
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Orden no encontrada');
    }

    // Eliminar cada servicio de la orden
    const deletePromises = (order.servicios || []).map(service => {
      if (service.id) {
        return apiRequest.delete(`${SERVICE_DETAILS_ENDPOINT}/${service.id}`);
      }
      return Promise.resolve();
    });

    await Promise.all(deletePromises);
    
    // Retorna la lista filtrada
    return orders.filter(order => order.id !== orderId);
  } catch (error) {
    console.error('Error deleting service order:', error);
    throw error;
  }
};

/**
 * Anula una orden de servicio (cambia estado a "Cancelada por el usuario")
 */
export const anularServiceOrder = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("ID de orden requerido");
    }

    // Obtener la orden para encontrar todos sus servicios
    // Nota: En una implementación real, necesitarías obtener la orden primero
    // Por ahora, asumimos que orderId es el id_cita o id_detalle_servicio
    
    // Si es un id_cita, obtener todos los servicios de esa cita
    const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/cita/${orderId}`);
    const services = response.data || response;
    const serviceArray = Array.isArray(services) ? services : [services];

    // Actualizar estado de cada servicio
    const updatePromises = serviceArray.map(service => {
      const serviceId = service.id_detalle_servicio || service.id;
      return apiRequest.patch(`${SERVICE_DETAILS_ENDPOINT}/${serviceId}/status`, {
        estado: 'Cancelada por el usuario'
      });
    });

    await Promise.all(updatePromises);

    return { success: true, message: "Orden anulada exitosamente" };
  } catch (error) {
    console.error('Error anulando service order:', error);
    throw error;
  }
}; 