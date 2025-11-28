import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de pedidos
 * Endpoints base: /api/pedidos-productos
 */

const ORDERS_ENDPOINT = '/pedidos-productos';

export const ordersService = {
  /**
   * Obtener todos los pedidos con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {string} params.estado - Estado del pedido (opcional)
   * @param {number} params.userId - ID del usuario (opcional)
   * @returns {Promise<Object>} Lista de pedidos con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.estado) queryParams.append('estado', params.estado);
      if (params.userId) queryParams.append('userId', params.userId);

      const url = queryParams.toString()
        ? `${ORDERS_ENDPOINT}?${queryParams.toString()}`
        : ORDERS_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Obtener pedidos de un usuario específico
   * @param {number} userId - ID del usuario
   * @param {Object} options - Opciones de paginación y filtros
   * @returns {Promise<Object>} Lista de pedidos del usuario
   */
  getByUsuario: async (userId, options = {}) => {
    try {
      if (!userId) {
        throw new Error('ID del usuario es requerido');
      }

      console.log('🔍 OrdersService.getByUsuario called with:', { userId, options });

      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);

      const url = queryParams.toString()
        ? `${ORDERS_ENDPOINT}/usuario/${userId}?${queryParams.toString()}`
        : `${ORDERS_ENDPOINT}/usuario/${userId}`;

      console.log('📡 Fetching orders from:', url);

      const response = await apiRequest.get(url);

      console.log('📦 Orders response:', {
        success: response.success,
        dataLength: response.data?.length,
        message: response.message,
        fullResponse: response
      });

      return response;
    } catch (error) {
      console.error(`❌ Error fetching orders for user ${userId}:`, {
        message: error.message,
        status: error?.response?.status,
        responseData: error?.response?.data,
        fullError: error
      });

      if (error?.response?.status === 404) {
        console.log('ℹ️ No orders found for user (404), returning empty array');
        return {
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          },
          message: 'No se encontraron pedidos para este usuario'
        };
      }

      if (error?.response?.status === 401) {
        console.log('🚫 Authentication error (401) - user not authenticated');
        throw new Error('Debes iniciar sesión para ver tus pedidos');
      }

      throw error;
    }
  },

  /**
   * Obtener un pedido por ID
   * @param {number|string} id - ID del pedido
   * @returns {Promise<Object>} Datos del pedido
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del pedido es requerido');
      }

      const response = await apiRequest.get(`${ORDERS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  /**
  * Crear un nuevo pedido
  * @param {Object} orderData - Datos del pedido
  * @param {number} orderData.id_usuario - ID del usuario (REQUERIDO)
  * @param {string} orderData.fecha - Fecha del pedido
  * @param {Array} orderData.productos - Array de productos
  * @returns {Promise<Object>} Pedido creado
  */
  create: async (orderData) => {
    try {
      // ✅ Validaciones mejoradas
      if (!orderData.id_usuario) {
        throw new Error('ID del usuario es requerido');
      }
      if (!orderData.productos || !Array.isArray(orderData.productos) || orderData.productos.length === 0) {
        throw new Error('El pedido debe tener al menos un producto');
      }

      // ✅ Validar que cada producto tenga los campos requeridos
      orderData.productos.forEach((prod, index) => {
        if (!prod.id_producto && !prod.id) {
          throw new Error(`Producto en posición ${index + 1} no tiene ID`);
        }
        if (!prod.cantidad || prod.cantidad <= 0) {
          throw new Error(`Producto en posición ${index + 1} no tiene cantidad válida`);
        }
        if (!prod.precio_unitario && !prod.precio) {
          throw new Error(`Producto en posición ${index + 1} no tiene precio`);
        }
      });

      // ✅ Preparar datos según lo que espera el backend
      const cleanData = {
        id_usuario: parseInt(orderData.id_usuario),
        fecha: orderData.fecha || new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        productos: orderData.productos.map(prod => ({
          id_producto: parseInt(prod.id_producto || prod.id),
          cantidad: parseInt(prod.cantidad),
          precio_unitario: parseFloat(prod.precio_unitario || prod.precio)
        }))
      };

      console.log('📤 Enviando pedido al backend:', cleanData);

      const response = await apiRequest.post(ORDERS_ENDPOINT, cleanData);

      console.log('✅ Respuesta del backend:', response);

      return response;
    } catch (error) {
      console.error('❌ Error creating order:', error);

      // Mejorar mensaje de error
      const errorMessage = error?.response?.data?.message
        || error?.message
        || 'Error desconocido al crear el pedido';

      throw new Error(errorMessage);
    }
  },

  /**
   * Actualizar un pedido existente
   * @param {number|string} id - ID del pedido
   * @param {Object} orderData - Datos actualizados del pedido
   * @returns {Promise<Object>} Pedido actualizado
   */
  update: async (id, orderData) => {
    try {
      if (!id) {
        throw new Error('ID del pedido es requerido');
      }

      // Limpiar datos
      const cleanData = { ...orderData };
      if (cleanData.total) {
        cleanData.total = parseFloat(cleanData.total);
      }

      console.log('Frontend: Sending update data for order', id, ':', cleanData);
      const response = await apiRequest.put(`${ORDERS_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualización parcial de un pedido
   * @param {number|string} id - ID del pedido
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>} Pedido actualizado
   */
  patch: async (id, partialData) => {
    try {
      if (!id) {
        throw new Error('ID del pedido es requerido');
      }

      const response = await apiRequest.patch(`${ORDERS_ENDPOINT}/${id}`, partialData);
      return response;
    } catch (error) {
      console.error(`Error patching order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un pedido
   * @param {number|string} id - ID del pedido
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del pedido es requerido');
      }

      const response = await apiRequest.delete(`${ORDERS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de un pedido
   * @param {number|string} id - ID del pedido
   * @param {string} estado - Nuevo estado del pedido
   * @returns {Promise<Object>} Pedido con estado actualizado
   */
  changeStatus: async (id, estado) => {
    try {
      console.log('Front-end: changeStatus called with id:', id, 'estado:', estado);
      if (!id) {
        throw new Error('ID del pedido es requerido');
      }
      if (!estado) {
        throw new Error('Estado del pedido es requerido');
      }

      const response = await apiRequest.patch(`${ORDERS_ENDPOINT}/${id}/estado`, { estado });
      console.log('Front-end: changeStatus response:', response);
      return response;
    } catch (error) {
      console.error(`Error changing order status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar pedidos por término
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} filters - Filtros adicionales (opcional)
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  search: async (searchTerm, filters = {}) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new Error('Término de búsqueda es requerido');
      }

      const params = {
        search: searchTerm.trim(),
        ...filters
      };

      return await ordersService.getAll(params);
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  },

  /**
   * Obtener pedidos por estado
   * @param {string} estado - Estado del pedido
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Pedidos filtrados por estado
   */
  getByStatus: async (estado, params = {}) => {
    try {
      if (!estado) {
        throw new Error('Estado del pedido es requerido');
      }

      const response = await apiRequest.get(`${ORDERS_ENDPOINT}/estado/${estado}`, {
        params
      });
      return response;
    } catch (error) {
      console.error(`Error fetching orders by status ${estado}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de pedidos
   * @param {Object} params - Parámetros de filtro (opcional)
   * @returns {Promise<Object>} Estadísticas de pedidos
   */
  getStats: async (params = {}) => {
    try {
      const response = await apiRequest.get(`${ORDERS_ENDPOINT}/estadisticas`, {
        params
      });
      return response;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  },

  /**
   * Obtener pedidos formateados para el landing
   * Transforma la respuesta del backend al formato esperado por el componente
   * @param {number} userId - ID del usuario
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de pedidos formateados
   */
  getFormattedForLanding: async (userId, options = {}) => {
    try {
      const response = await ordersService.getByUsuario(userId, {
        limit: 100,
        ...options
      });

      if (!response.success || !response.data) {
        return [];
      }

      // Transformar pedidos del backend al formato del landing
      return response.data.map(order => ordersService.formatOrderForLanding(order));
    } catch (error) {
      console.error('Error getting formatted orders for landing:', error);
      return [];
    }
  },

  /**
   * Formatear un pedido del backend al formato del landing
   * @param {Object} order - Pedido del backend
   * @returns {Object} Pedido formateado
   */
  formatOrderForLanding: (order) => {
    return {
      id: order.id_pedido,
      numero: order.id_pedido,
      fecha: ordersService.formatDate(order.fecha || order.fecha_creacion),
      estado: order.estado || 'En proceso',
      total: ordersService.formatPrice(order.total),
      subtotal: ordersService.formatPrice(ordersService.calculateSubtotal(order)),
      envio: ordersService.formatPrice(ordersService.calculateShipping(order)),
      medioPago: order.medio_pago || 'Efectivo',
      direccion: order.direccion_entrega || 'No especificada',
      productos: ordersService.formatProducts(order.detalles || [])
    };
  },

  /**
   * Formatear productos del pedido
   * @param {Array} detalles - Detalles del pedido
   * @returns {Array} Productos formateados
   */
  formatProducts: (detalles) => {
    return detalles.map(detalle => ({
      id: detalle.id_detalle_pedido,
      nombre: detalle.producto?.nombre || 'Producto sin nombre',
      imagen: detalle.producto?.url_foto || '/placeholder.png',
      foto: detalle.producto?.url_foto || '/placeholder.png',
      fotos: detalle.producto?.url_foto ? [detalle.producto.url_foto] : [],
      cantidad: detalle.cantidad,
      precioUnitario: ordersService.formatPrice(detalle.precio_unitario),
      color: detalle.producto?.color || null,
      textura: detalle.producto?.textura || null,
    }));
  },

  /**
   * Calcular subtotal (total sin envío)
   * @param {Object} order - Pedido
   * @returns {number} Subtotal
   */
  calculateSubtotal: (order) => {
    if (order.subtotal) return order.subtotal;

    // Si no hay subtotal, calcular desde detalles
    if (order.detalles && order.detalles.length > 0) {
      return order.detalles.reduce((sum, detalle) => {
        return sum + (detalle.subtotal || (detalle.cantidad * detalle.precio_unitario));
      }, 0);
    }

    return order.total || 0;
  },

  /**
   * Calcular costo de envío
   * @param {Object} order - Pedido
   * @returns {number} Costo de envío
   */
  calculateShipping: (order) => {
    // Si tu backend tiene un campo específico para envío, úsalo
    if (order.costo_envio) return order.costo_envio;

    // Si no, calcular: total - subtotal
    const subtotal = ordersService.calculateSubtotal(order);
    const total = order.total || 0;
    return Math.max(0, total - subtotal);
  },

  /**
   * Formatear fecha
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatDate: (dateString) => {
    if (!dateString) return 'Fecha no disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  },

  /**
   * Formatear precio
   * @param {number} price - Precio
   * @returns {string} Precio formateado
   */
  formatPrice: (price) => {
    if (price === null || price === undefined) return '0';

    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    // Usar el estándar del proyecto: sin decimales, separador de miles con punto
    const { formatNumber } = require('../../../../shared/utils/formatters');
    return formatNumber(numPrice);
  },

  /**
   * Obtener estadísticas de pedidos del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas
   */
  getUserStats: async (userId) => {
    try {
      const orders = await ordersService.getFormattedForLanding(userId);

      return {
        total: orders.length,
        enProceso: orders.filter(o => o.estado.toLowerCase() === 'en proceso').length,
        enviados: orders.filter(o => o.estado.toLowerCase() === 'enviado').length,
        entregados: orders.filter(o => o.estado.toLowerCase() === 'entregado').length,
        devoluciones: orders.filter(o => o.estado.toLowerCase() === 'devolución').length,
        cancelados: orders.filter(o => o.estado.toLowerCase() === 'cancelado').length
      };
    } catch (error) {
      console.error('Error getting user order stats:', error);
      return {
        total: 0,
        enProceso: 0,
        enviados: 0,
        entregados: 0,
        devoluciones: 0,
        cancelados: 0
      };
    }
  }
};

export default ordersService;
