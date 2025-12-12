// Servicio para órdenes de servicio con conexión al backend
 import apiRequest from '../../../../../shared/config/apiConfig';
 import { executeWithToast } from '../../../../../shared/utils/toastHelpers';
 import { validateServiceOrder } from '../../../../../shared/validations';
 import appointmentsService from '../../appointments/API/appointmentsService';

 const SERVICE_DETAILS_ENDPOINT = '/ventas/detalles-servicios';
 const SALES_PRODUCTS_ENDPOINT = '/ventas-productos';

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
  return executeWithToast({
    operation: 'create',
    entity: 'orden de servicio',
    loadingMessage: 'Creando orden de servicio...',
    successMessage: 'Orden creada exitosamente',
    promiseFn: async () => {
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
    }
  });
};

/**
 * Edita una orden de servicio existente
 */
export const editServiceOrder = async (orderData, orders) => {
  return executeWithToast({
    operation: 'update',
    entity: 'orden de servicio',
    loadingMessage: 'Actualizando orden de servicio...',
    successMessage: 'Orden actualizada exitosamente',
    promiseFn: async () => {
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
        
        // Obtener el ID correcto del servicio (puede ser id_detalle_servicio o id)
        const serviceId = service.id_detalle_servicio || service.id;
        
        if (!serviceId) {
          console.error('❌ Error: No se encontró ID del servicio para actualizar:', service);
          throw new Error('El servicio no tiene un ID válido para actualizar');
        }
        
        console.log(`📡 Actualizando servicio ${serviceId} con estado:`, {
          serviceId: serviceId,
          serviceIdOriginal: service.id,
          serviceIdDetalleServicio: service.id_detalle_servicio,
          estado: estadoBackend,
          updateData: updateData
        });
        
        return apiRequest.put(`${SERVICE_DETAILS_ENDPOINT}/${serviceId}`, updateData)
          .then(response => {
            const estadoRecibido = response.data?.estado || response.data?.data?.estado || response.estado;
            console.log(`✅ Servicio ${serviceId} actualizado exitosamente:`, {
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
            console.error(`❌ Error al actualizar servicio ${serviceId}:`, {
              serviceId: serviceId,
              serviceIdOriginal: service.id,
              serviceIdDetalleServicio: service.id_detalle_servicio,
              error: error,
              errorMessage: error.message,
              errorResponse: error.response?.data
            });
            throw error;
          });
      }
    });

    const updateResults = await Promise.all(updatePromises);
    console.log('✅ Todos los servicios actualizados:', updateResults);

    // Guardar productos si hay productos y hay una cita asociada
    if (orderData.productos && orderData.productos.length > 0 && orderData.citaId) {
      try {
        console.log('🛒 Guardando productos asociados a la cita:', {
          citaId: orderData.citaId,
          productos: orderData.productos.length
        });

        // Buscar si ya existe una venta de productos asociada a esta cita
        const ventasExistentes = await apiRequest.get(`${SALES_PRODUCTS_ENDPOINT}/cita/${orderData.citaId}`);
        
        let ventaProductoId = null;
        if (ventasExistentes.success && ventasExistentes.data && ventasExistentes.data.length > 0) {
          // Usar la primera venta encontrada
          ventaProductoId = ventasExistentes.data[0].id_venta_producto || ventasExistentes.data[0].id;
          console.log('📦 Venta de productos existente encontrada:', ventaProductoId);
          
          // Actualizar la venta existente con los nuevos productos
          const productosData = orderData.productos.map(producto => ({
            id_producto: producto.id || producto.id_producto,
            cantidad: producto.quantity || producto.cantidad,
            precio_unitario: producto.price || producto.precio || producto.precio_unitario
          }));

          await apiRequest.put(`${SALES_PRODUCTS_ENDPOINT}/${ventaProductoId}`, {
            fecha: orderData.date || new Date().toISOString().split('T')[0],
            id_usuario: orderData.id_cliente,
            productos: productosData
          });
          
          console.log('✅ Venta de productos actualizada exitosamente');
        } else {
          // Crear nueva venta de productos asociada a la cita
          const productosData = orderData.productos.map(producto => ({
            id_producto: producto.id || producto.id_producto,
            cantidad: producto.quantity || producto.cantidad,
            precio_unitario: producto.price || producto.precio || producto.precio_unitario
          }));

          const nuevaVenta = await apiRequest.post(SALES_PRODUCTS_ENDPOINT, {
            fecha: orderData.date || new Date().toISOString().split('T')[0],
            id_usuario: orderData.id_cliente,
            id_cita: orderData.citaId,
            productos: productosData
          });

          if (nuevaVenta.success) {
            console.log('✅ Venta de productos creada exitosamente:', nuevaVenta.data);
          }
        }
      } catch (error) {
        console.error('❌ Error al guardar productos:', error);
        // No lanzar error para no interrumpir el flujo, solo registrar
        // Los productos se mostrarán en la respuesta aunque no se hayan guardado en el backend
      }
    }

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
      servicios: orderData.servicios, // Incluir servicios actualizados
      productos: orderData.productos || [], // Incluir productos (importante para que se muestren en la vista)
      totalServices,
      totalProducts,
      totalGeneral,
      dineroProporcionado: dineroProporcionado, // Asegurar que el dinero proporcionado se incluya en la respuesta
      devolucion,
      status: orderData.status // Asegurar que el estado se incluya en la respuesta
    };
    }
  });
};

/**
 * Elimina una orden de servicio
 */
export const deleteServiceOrder = async (orderId, orders) => {
  return executeWithToast({
    operation: 'delete',
    entity: 'orden de servicio',
    id: orderId,
    loadingMessage: 'Eliminando orden de servicio...',
    successMessage: 'Orden eliminada exitosamente',
    promiseFn: async () => {
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
    }
  });
};

/**
 * Anula una orden de servicio (cambia estado a "Cancelada por el usuario")
 * Optimizado: usa los servicios ya cargados en lugar de hacer llamadas adicionales
 */
export const anularServiceOrder = async (orderId, order = null) => {
  return executeWithToast({
    operation: 'update',
    entity: 'orden de servicio',
    id: orderId,
    loadingMessage: 'Anulando orden de servicio...',
    successMessage: 'Orden anulada exitosamente',
    promiseFn: async () => {
      if (!orderId) {
        throw new Error("ID de orden requerido");
      }

      // Si tenemos la orden con servicios, usarla directamente
      let serviciosParaActualizar = [];
      
      if (order && order.servicios && order.servicios.length > 0) {
        // Usar los servicios de la orden ya cargada
        serviciosParaActualizar = order.servicios;
      } else {
        // Si no tenemos la orden, obtener el servicio individual y actualizarlo
        try {
          const response = await apiRequest.get(`${SERVICE_DETAILS_ENDPOINT}/${orderId}`);
          const service = response.data || response;
          serviciosParaActualizar = [service];
        } catch (error) {
          // Si falla, intentar obtener todos los servicios y filtrar
          try {
            const allServicesResponse = await apiRequest.get(SERVICE_DETAILS_ENDPOINT);
            if (allServicesResponse.success && allServicesResponse.data) {
              let allServices = [];
              if (Array.isArray(allServicesResponse.data)) {
                allServices = allServicesResponse.data;
              } else if (allServicesResponse.data.data && Array.isArray(allServicesResponse.data.data)) {
                allServices = allServicesResponse.data.data;
              }
              
              // Buscar servicios por id_cita o por id
              const citaId = order?.citaId;
              if (citaId) {
                serviciosParaActualizar = allServices.filter(s => {
                  const sCitaId = s.id_cita ? (typeof s.id_cita === 'number' ? s.id_cita : parseInt(s.id_cita)) : null;
                  return sCitaId === citaId;
                });
              } else {
                // Si no hay citaId, buscar por id_detalle_servicio
                serviciosParaActualizar = allServices.filter(s => {
                  const sId = s.id_detalle_servicio || s.id;
                  return sId === orderId || sId === parseInt(orderId);
                });
              }
            }
          } catch (altError) {
            throw new Error('No se pudieron obtener los servicios para anular');
          }
        }
      }

      if (serviciosParaActualizar.length === 0) {
        throw new Error('No se encontraron servicios para anular');
      }

      // Actualizar estado de cada servicio
      const updatePromises = serviciosParaActualizar.map(service => {
        const serviceId = service.id_detalle_servicio || service.id;
        if (!serviceId) {
          console.warn('Servicio sin ID válido:', service);
          return Promise.resolve();
        }
        return apiRequest.patch(`${SERVICE_DETAILS_ENDPOINT}/${serviceId}/status`, {
          estado: 'Cancelada por el usuario'
        });
      });

      await Promise.all(updatePromises);

      return { success: true, message: "Orden anulada exitosamente" };
    }
  });
};
