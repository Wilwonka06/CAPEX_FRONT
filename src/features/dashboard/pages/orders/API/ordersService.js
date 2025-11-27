import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de pedidos
 * Maneja completamente la comunicación con el backend
 */

const ORDERS_ENDPOINT = '/pedidos-productos';

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
      const safeLimit = Math.min(Math.max(parseInt(params.limit || 50), 1), 100);
      queryParams.append('limit', safeLimit);

      const url = queryParams.toString()
        ? `${ORDERS_ENDPOINT}?${queryParams.toString()}`
        : ORDERS_ENDPOINT;

      const response = await apiRequest.get(url, { skipGlobalErrorHandling: true });
      
      // Mapear respuesta del backend al formato del frontend
      if (response.success && response.data) {
        response.data = response.data.map(pedido => ({
          id: pedido.id_pedido,
          numeroOrden: `ORD-${pedido.id_pedido.toString().padStart(5, '0')}`,
          fecha: pedido.fecha,
          clienteId: pedido.id_usuario || pedido.id_cliente || null,
          valor: parseFloat(pedido.total || 0),
          estado: pedido.estado || 'Pendiente',
          productos: (pedido.detalles || []).map(det => ({
            id: det.id_producto,
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            precio: parseFloat(det.precio_unitario || 0),
            subtotal: parseFloat(det.subtotal || 0)
          }))
        }));
      }

      return this._handleResponse(response);
    } catch (error) {
      // Reintentos con backoff
      for (let i = 1; i <= 2; i++) {
        try {
          await new Promise(r => setTimeout(r, 500 * i));
          const retryParams = { ...params, limit: Math.min(Math.max(parseInt(params.limit || 25), 1), 50) };
          return await this.getAll(retryParams);
        } catch (_) {}
      }
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
      
      // Mapear respuesta
      if (response.success && response.data) {
        const pedido = response.data;
        response.data = {
          id: pedido.id_pedido,
          numeroOrden: `ORD-${pedido.id_pedido.toString().padStart(5, '0')}`,
          fecha: pedido.fecha,
          clienteId: pedido.id_cliente || null,
          valor: parseFloat(pedido.total || 0),
          estado: pedido.estado || 'Pendiente',
          productos: (pedido.detalles || []).map(det => ({
            id: det.id_producto,
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            precio: parseFloat(det.precio_unitario || 0),
            subtotal: parseFloat(det.subtotal || 0)
          }))
        };
      }

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

      // Mapear estructura frontend a backend
      const pedidoData = {
        fecha: orderData.fecha,
        productos: orderData.productos.map(p => ({
          id_producto: p.id || p.id_producto,
          cantidad: p.cantidad,
          precio_unitario: p.precio || p.precio_unitario
        }))
      };

      const response = await apiRequest.post(ORDERS_ENDPOINT, pedidoData);
      
      // Mapear respuesta
      if (response.success && response.data) {
        const pedido = response.data;
        response.data = {
          id: pedido.id_pedido,
          numeroOrden: `ORD-${pedido.id_pedido.toString().padStart(5, '0')}`,
          fecha: pedido.fecha,
          valor: parseFloat(pedido.total || 0),
          estado: pedido.estado || 'Pendiente',
          productos: (pedido.detalles || []).map(det => ({
            id: det.id_producto,
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            precio: parseFloat(det.precio_unitario || 0),
            subtotal: parseFloat(det.subtotal || 0)
          }))
        };
      }

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

      const updateData = {};
      if (orderData.fecha) updateData.fecha = orderData.fecha;
      if (orderData.estado) updateData.estado = orderData.estado;
      if (orderData.productos) {
        updateData.productos = orderData.productos.map(p => ({
          id_producto: p.id || p.id_producto,
          cantidad: p.cantidad,
          precio_unitario: p.precio || p.precio_unitario
        }));
      }

      const response = await apiRequest.put(`${ORDERS_ENDPOINT}/${id}`, updateData);
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