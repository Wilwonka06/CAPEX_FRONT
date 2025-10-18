import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de pedidos
 * Maneja completamente la comunicación con el backend
 * El frontend consume directamente estos métodos
 */

const ORDERS_ENDPOINT = '/pedidos';

class OrdersService {
  /**
   * Obtener todos los pedidos con paginación
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} { data: [], pagination: {...} }
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = queryParams.toString()
        ? `${ORDERS_ENDPOINT}?${queryParams.toString()}`
        : ORDERS_ENDPOINT;

      const response = await apiRequest.get(url);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching orders', error);
    }
  }

  /**
   * Obtener un pedido por ID
   * @param {number} id - ID del pedido
   * @returns {Promise<Object>} Datos del pedido con detalles
   */
  async getById(id) {
    try {
      if (!id) throw new Error('ID del pedido es requerido');

      const response = await apiRequest.get(`${ORDERS_ENDPOINT}/${id}`);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(`Error fetching order ${id}`, error);
    }
  }

  /**
   * Crear un nuevo pedido
   * @param {Object} orderData - { fecha, productos: [{id_producto, cantidad, precio_unitario}] }
   * @returns {Promise<Object>} Pedido creado con detalles
   */
  async create(orderData) {
    try {
      if (!orderData.fecha) throw new Error('La fecha del pedido es requerida');
      if (!orderData.productos?.length) {
        throw new Error('El pedido debe tener al menos un producto');
      }

      const response = await apiRequest.post(ORDERS_ENDPOINT, orderData);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error creating order', error);
    }
  }

  /**
   * Actualizar un pedido existente
   * @param {number} id - ID del pedido
   * @param {Object} orderData - Datos a actualizar
   * @returns {Promise<Object>} Pedido actualizado
   */
  async update(id, orderData) {
    try {
      if (!id) throw new Error('ID del pedido es requerido');

      const response = await apiRequest.put(`${ORDERS_ENDPOINT}/${id}`, orderData);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(`Error updating order ${id}`, error);
    }
  }

  /**
   * Cambiar estado de un pedido
   * @param {number} id - ID del pedido
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} Pedido con estado actualizado
   */
  async changeStatus(id, estado) {
    try {
      if (!id) throw new Error('ID del pedido es requerido');
      if (!estado) throw new Error('El estado es requerido');

      const response = await apiRequest.patch(
        `${ORDERS_ENDPOINT}/${id}/estado`,
        { estado }
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(`Error changing order status`, error);
    }
  }

  /**
   * Buscar pedidos
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async search(searchTerm, params = {}) {
    try {
      if (!searchTerm?.trim()) {
        throw new Error('Término de búsqueda es requerido');
      }

      const queryParams = new URLSearchParams({
        q: searchTerm.trim(),
        ...params
      });

      const response = await apiRequest.get(
        `${ORDERS_ENDPOINT}/search?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error searching orders', error);
    }
  }

  /**
   * Obtener pedidos por estado
   * @param {string} estado - Estado del pedido
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Pedidos del estado especificado
   */
  async getByEstado(estado, params = {}) {
    try {
      if (!estado) throw new Error('El estado es requerido');

      const queryParams = new URLSearchParams(params);
      const response = await apiRequest.get(
        `${ORDERS_ENDPOINT}/estado/${estado}?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(`Error fetching orders by status`, error);
    }
  }

  /**
   * Obtener pedidos por rango de fechas
   * @param {string} fecha_inicio - YYYY-MM-DD
   * @param {string} fecha_fin - YYYY-MM-DD
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Pedidos en el rango
   */
  async getByDateRange(fecha_inicio, fecha_fin, params = {}) {
    try {
      if (!fecha_inicio || !fecha_fin) {
        throw new Error('Fechas de inicio y fin son requeridas');
      }

      const queryParams = new URLSearchParams({
        fecha_inicio,
        fecha_fin,
        ...params
      });

      const response = await apiRequest.get(
        `${ORDERS_ENDPOINT}/fechas?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching orders by date range', error);
    }
  }

  /**
   * Obtener estadísticas de pedidos
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      const response = await apiRequest.get(`${ORDERS_ENDPOINT}/estadisticas`);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching stats', error);
    }
  }

  /**
   * Eliminar un pedido
   * @param {number} id - ID del pedido
   * @returns {Promise<Object>} Confirmación
   */
  async delete(id) {
    try {
      if (!id) throw new Error('ID del pedido es requerido');

      const response = await apiRequest.delete(`${ORDERS_ENDPOINT}/${id}`);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(`Error deleting order`, error);
    }
  }

  /**
   * Manejo de respuestas exitosas
   * @private
   */
  _handleResponse(response) {
    const data = response.data || response;
    
    // Retornar estructura consistente
    return {
      success: data.success !== false,
      data: data.data || data,
      pagination: data.pagination || null,
      message: data.message || null
    };
  }

  /**
   * Manejo de errores
   * @private
   */
  _handleError(context, error) {
    const errorMessage = error?.response?.data?.message 
      || error?.message 
      || 'Error desconocido';
    
    console.error(`[OrdersService] ${context}:`, error);
    
    throw {
      success: false,
      message: errorMessage,
      status: error?.response?.status || 500,
      data: null
    };
  }
}

export default new OrdersService();