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
  getByUser: async (userId, options = {}) => {
    try {
      if (!userId) {
        throw new Error('ID del usuario es requerido');
      }

      const params = {
        userId,
        ...options
      };

      return await ordersService.getAll(params);
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
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
   * @param {number} orderData.id_usuario - ID del usuario
   * @param {string} orderData.fecha - Fecha del pedido
   * @param {number} orderData.total - Total del pedido
   * @param {string} orderData.estado - Estado del pedido
   * @param {Array} orderData.detalles - Detalles del pedido
   * @returns {Promise<Object>} Pedido creado
   */
  create: async (orderData) => {
    try {
      // Validaciones básicas
      if (!orderData.id_usuario) {
        throw new Error('ID del usuario es requerido');
      }
      if (!orderData.fecha) {
        throw new Error('Fecha del pedido es requerida');
      }
      if (!orderData.total || orderData.total <= 0) {
        throw new Error('Total del pedido debe ser mayor a 0');
      }

      // Limpiar datos
      const cleanData = {
        id_usuario: parseInt(orderData.id_usuario),
        fecha: orderData.fecha,
        total: parseFloat(orderData.total),
        estado: orderData.estado || 'Pendiente',
        detalles: orderData.detalles || []
      };

      console.log('API Service: Sending order data to backend:', cleanData);
      const response = await apiRequest.post(ORDERS_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
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
      const response = await ordersService.getByUser(userId, { 
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
      estado: order.estado || 'Pendiente',
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
    return numPrice.toFixed(2);
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
        pendientes: orders.filter(o => o.estado.toLowerCase() === 'pendiente').length,
        enProceso: orders.filter(o => o.estado.toLowerCase() === 'en proceso').length,
        entregados: orders.filter(o => o.estado.toLowerCase() === 'entregado').length,
        cancelados: orders.filter(o => o.estado.toLowerCase() === 'cancelado').length
      };
    } catch (error) {
      console.error('Error getting user order stats:', error);
      return {
        total: 0,
        pendientes: 0,
        enProceso: 0,
        entregados: 0,
        cancelados: 0
      };
    }
  }
};

export default ordersService;