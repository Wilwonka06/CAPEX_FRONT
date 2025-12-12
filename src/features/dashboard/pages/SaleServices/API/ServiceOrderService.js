// Servicio para órdenes de servicio con conexión al backend
 import apiRequest from '../../../../../shared/config/apiConfig';
 import { validateServiceOrder } from '../../../../../shared/validations';
 import appointmentsService from '../../appointments/API/appointmentsService';

 const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';

/**
 * Convierte datos del frontend al formato del backend
 */
const normalizeOrderToBackend = (orderData) => {
  const serviceDetails = (orderData.servicios || []).map(service => {
    // Convertir tiempos a formato HH:MM:SS
    const startTime = service.startTime || service.hora_inicio || '08:00:00';
    const endTime = service.endTime || service.hora_finalizacion || service.hora_fin || '09:00:00';

    // Asegurar formato HH:MM:SS
    const formatTimeToSeconds = (timeStr) => {
      if (timeStr.length === 5) { // HH:MM format
        return timeStr + ':00'; // Add seconds
      }
      return timeStr; // Already in HH:MM:SS format
    };

    return {
      id_empleado: service.employee?.id || service.employee?.id_usuario || service.id_empleado,
      id_servicio: service.servicioId || service.id_servicio || service.id,
      id_cliente: orderData.id_cliente,
      id_cita: orderData.citaId || null,
      precio_unitario: parseFloat(service.price || 0),
      cantidad: parseInt(service.quantity || 1),
      hora_inicio: formatTimeToSeconds(startTime),
      hora_finalizacion: formatTimeToSeconds(endTime),
      duracion: parseInt(service.duration || service.duracion || 60),
      fecha_programada: orderData.date || new Date().toISOString().split('T')[0],
      estado: 'En ejecución', // Cambiar a formato aceptado por backend
      observaciones: service.observaciones || orderData.observaciones || ''
    };
  });

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

    // Log para depuración
    console.log('📋 Datos normalizados para backend:', serviceDetails);

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
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
      throw new Error('Error de validación: ' + JSON.stringify(error.response.data.errors));
    }
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

    // Mapear estado del frontend al backend
    const estadoMap = {
      'Anulado': 'Cancelada por el usuario',
      'Pagado': 'Pagada',
      'En ejecucion': 'En ejecución',
      'En ejecución': 'En ejecución'
    };
    const estadoBackend = estadoMap[orderData.status] || orderData.status || 'En ejecución';
    
    console.log('🔄 Mapeando estado:', {
      estadoFrontend: orderData.status,
      estadoBackend: estadoBackend,
      estadoMap: estadoMap
    });

    // Actualizar cada servicio en el backend
    const updatePromises = (orderData.servicios || []).map(service => {
      if (!service.id) {
        // Si no tiene ID, es un nuevo servicio, crearlo
        const newServiceDetail = normalizeOrderToBackend({
          ...orderData,
          servicios: [service]
        })[0];
        // Agregar el estado al nuevo servicio
        newServiceDetail.estado = estadoBackend;
        
        // Validar que los campos requeridos estén presentes
        if (!newServiceDetail.id_cliente) {
          console.error('❌ Error: id_cliente es requerido para crear un nuevo servicio', {
            service: service,
            orderData: { id_cliente: orderData.id_cliente }
          });
          throw new Error('El ID del cliente es requerido para crear un nuevo servicio');
        }
        if (!newServiceDetail.id_empleado) {
          console.error('❌ Error: id_empleado es requerido para crear un nuevo servicio', {
            service: service,
            serviceEmployee: service.employee,
            serviceIdEmpleado: service.id_empleado,
            newServiceDetail: newServiceDetail
          });
          throw new Error(`El ID del empleado es requerido para crear un nuevo servicio. El servicio "${service.name || 'sin nombre'}" no tiene un empleado asignado. Por favor, asegúrate de que el servicio tenga un empleado asignado antes de guardar.`);
        }
        if (!newServiceDetail.id_servicio) {
          console.error('❌ Error: id_servicio es requerido para crear un nuevo servicio', {
            service: service,
            serviceServicioId: service.servicioId,
            serviceIdServicio: service.id_servicio
          });
          throw new Error('El ID del servicio es requerido para crear un nuevo servicio');
        }
        
        console.log('📤 Creando nuevo servicio:', {
          newServiceDetail: newServiceDetail,
          serviceOriginal: service,
          orderData: {
            id_cliente: orderData.id_cliente,
            date: orderData.date,
            citaId: orderData.citaId
          }
        });
        return apiRequest.post(SERVICE_DETAILS_ENDPOINT, newServiceDetail)
          .then(response => {
            console.log('✅ Nuevo servicio creado exitosamente:', response);
            return response;
          })
          .catch(error => {
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               'Error desconocido al crear servicio';
            const validationErrors = error.response?.data?.errors || 
                                   error.response?.data?.validation || 
                                   null;
            
            console.error('❌ Error al crear nuevo servicio:', {
              error: error,
              message: errorMessage,
              validationErrors: validationErrors,
              response: error.response?.data,
              newServiceDetail: newServiceDetail,
              serviceOriginal: service
            });
            
            // Crear un error más descriptivo
            const descriptiveError = new Error(
              validationErrors 
                ? `Error de validación: ${JSON.stringify(validationErrors)}` 
                : errorMessage
            );
            descriptiveError.response = error.response;
            throw descriptiveError;
          });
      } else {
        // Actualizar servicio existente
        const updateData = {
          id_empleado: service.employee?.id || service.id_empleado,
          id_servicio: service.servicioId || service.id_servicio,
          precio_unitario: parseFloat(service.price || 0),
          cantidad: parseInt(service.quantity || 1),
          hora_inicio: service.hora_inicio || service.startTime || '08:00:00',
          hora_finalizacion: service.hora_finalizacion || service.endTime || service.hora_fin || '09:00:00',
          duracion: parseInt(service.duration || service.duracion || 60),
          observaciones: service.observaciones || '',
          estado: estadoBackend // Agregar el estado a la actualización
        };
        
        console.log(`📡 Actualizando servicio ${service.id} con estado:`, {
          serviceId: service.id,
          estado: estadoBackend,
          updateData: updateData
        });
        
        return apiRequest.put(`${SERVICE_DETAILS_ENDPOINT}/${service.id}`, updateData)
          .then(response => {
            const estadoRecibido = response.data?.estado || response.data?.data?.estado || response.estado;
            console.log(`✅ Servicio ${service.id} actualizado exitosamente:`, {
              response: response,
              data: response.data,
              dataData: response.data?.data,
              estadoEnviado: estadoBackend,
              estadoRecibido: estadoRecibido,
              updateDataCompleto: updateData
            });
            
            // Verificar que el estado se haya guardado correctamente
            if (estadoRecibido !== estadoBackend) {
              console.warn(`⚠️ ADVERTENCIA: El estado recibido (${estadoRecibido}) no coincide con el enviado (${estadoBackend})`);
            }
            
            return response;
          })
          .catch(error => {
            console.error(`❌ Error al actualizar servicio ${service.id}:`, error);
            throw error;
          });
      }
    });

    const updateResults = await Promise.all(updatePromises);
    console.log('✅ Todos los servicios actualizados:', updateResults);

    // Calcular devolución
    const dineroProporcionado = orderData.dineroProporcionado || 0;
    const devolucion = Math.max(0, dineroProporcionado - totalGeneral);

    // Si el estado es "Pagada" y hay una cita relacionada, actualizar el estado y el dinero proporcionado
    if (estadoBackend === 'Pagada' && orderData.citaId) {
      try {
        console.log('🔄 Actualizando cita relacionada con estado Pagada:', {
          citaId: orderData.citaId,
          nuevoEstado: 'Pagada',
          dineroProporcionado: dineroProporcionado,
          totalGeneral: totalGeneral,
          devolucion: devolucion
        });
        
        // Actualizar el estado de la cita a "Pagada" y el dinero proporcionado
        await appointmentsService.update(orderData.citaId, {
          cita: {
            estado: 'Pagada',
            dinero_proporcionado: dineroProporcionado
          }
        });
        
        console.log('✅ Cita actualizada exitosamente:', {
          estado: 'Pagada',
          dineroProporcionado: dineroProporcionado
        });
      } catch (error) {
        console.error('❌ Error al actualizar la cita:', error);
        // No lanzar error para no interrumpir el flujo, solo registrar
      }
    }

    // Retorna la orden editada con el estado correcto
    return { 
      ...orderData,
      totalServices,
      totalProducts,
      totalGeneral,
      dineroProporcionado: dineroProporcionado, // Asegurar que el dinero proporcionado se incluya en la respuesta
      devolucion,
      status: orderData.status // Asegurar que el estado se incluya en la respuesta
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