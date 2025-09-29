import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de pedidos
 * Endpoints base: /api/pedidos
 */

const ORDERS_ENDPOINT = '/pedidos';

export const ordersService = {
  /**
   * Obtener todos los pedidos con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {string} params.estado - Estado del pedido (opcional)
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
   * @param {string} orderData.fecha - Fecha del pedido
   * @param {number} orderData.total - Total del pedido
   * @param {string} orderData.estado - Estado del pedido (opcional, default: Pendiente)
   * @returns {Promise<Object>} Pedido creado
   */
  create: async (orderData) => {
    try {
      // Validaciones básicas
      if (!orderData.fecha) {
        throw new Error('La fecha del pedido es requerida');
      }
      if (!orderData.total || orderData.total <= 0) {
        throw new Error('El total debe ser mayor a 0');
      }

      // Limpiar datos
      const cleanData = {
        fecha: orderData.fecha,
        total: parseFloat(orderData.total),
        estado: orderData.estado || 'Pendiente'
      };

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

      // Validaciones básicas
      if (orderData.total !== undefined && orderData.total <= 0) {
        throw new Error('El total debe ser mayor a 0');
      }

      const response = await apiRequest.put(`${ORDERS_ENDPOINT}/${id}`, orderData);
      return response;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
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
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} Pedido con estado actualizado
   */
  changeStatus: async (id, estado) => {
    try {
      if (!id) {
        throw new Error('ID del pedido es requerido');
      }
      if (!['Pendiente', 'En proceso', 'Enviado', 'Entregado', 'Cancelado'].includes(estado)) {
        throw new Error('Estado debe ser uno de: Pendiente, En proceso, Enviado, Entregado, Cancelado');
      }

      const response = await apiRequest.patch(`${ORDERS_ENDPOINT}/${id}/estado`, { estado });
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
   * @param {string} estado - Estado
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Pedidos del estado especificado
   */
  getByEstado: async (estado, params = {}) => {
    try {
      if (!estado || !['Pendiente', 'En proceso', 'Enviado', 'Entregado', 'Cancelado'].includes(estado)) {
        throw new Error('Estado debe ser uno de: Pendiente, En proceso, Enviado, Entregado, Cancelado');
      }

      const queryParams = {
        estado,
        ...params
      };

      return await ordersService.getAll(queryParams);
    } catch (error) {
      console.error(`Error fetching orders by estado ${estado}:`, error);
      throw error;
    }
  },

  /**
   * Obtener pedidos por rango de fechas
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Pedidos en el rango de fechas
   */
  getByDateRange: async (startDate, endDate, params = {}) => {
    try {
      if (!startDate || !endDate) {
        throw new Error('Fechas de inicio y fin son requeridas');
      }

      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        ...params
      });

      const response = await apiRequest.get(`${ORDERS_ENDPOINT}/fechas?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error(`Error fetching orders by date range ${startDate} - ${endDate}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de pedidos
   * @returns {Promise<Object>} Estadísticas de pedidos
   */
  getStats: async () => {
    try {
      const response = await apiRequest.get(`${ORDERS_ENDPOINT}/estadisticas`);
      return response;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  },
};

export default ordersService;