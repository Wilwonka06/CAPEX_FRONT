import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio de Ventas - Consumo directo de API
 * Mapea operaciones de frontend con endpoint de backend
 */

// En caso de que el backend tenga endpoint /ventas, sino usa /pedidos
const SALES_ENDPOINT = '/ventas';
const ORDERS_ENDPOINT = '/pedidos';

class SalesService {
  /**
   * Obtener todas las ventas
   * @param {Object} params - { page, limit, estado }
   * @returns {Promise<Object>} { success, data, pagination }
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.estado) queryParams.append('estado', params.estado);

      const url = queryParams.toString()
        ? `${SALES_ENDPOINT}?${queryParams.toString()}`
        : SALES_ENDPOINT;

      const response = await apiRequest.get(url);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching sales', error);
    }
  }

  /**
   * Obtener una venta por ID
   * @param {number} id - ID de la venta
   * @returns {Promise<Object>} Datos de la venta
   */
  async getById(id) {
    try {
      if (!id) throw new Error('ID de la venta es requerido');

      const response = await apiRequest.get(`${SALES_ENDPOINT}/${id}`);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(`Error fetching sale ${id}`, error);
    }
  }

  /**
   * Crear una nueva venta
   * Internamente usa el endpoint /pedidos con estado "Enviado"
   * @param {Object} saleData - { fecha, productos, clienteId, metodoPago }
   * @returns {Promise<Object>} Venta creada
   */
  async create(saleData) {
    try {
      if (!saleData.fecha) throw new Error('La fecha es requerida');
      if (!saleData.productos?.length) {
        throw new Error('La venta debe tener al menos un producto');
      }

      // Mapear estructura frontend a backend
      const orderData = {
        fecha: saleData.fecha,
        productos: saleData.productos.map(p => ({
          id_producto: p.id || p.id_producto,
          cantidad: p.cantidad,
          precio_unitario: p.precio || p.precio_unitario
        })),
        estado: 'Enviado' // Las ventas inician como "Enviado"
      };

      const response = await apiRequest.post(ORDERS_ENDPOINT, orderData);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error creating sale', error);
    }
  }

  /**
   * Actualizar una venta
   * @param {number} id - ID de la venta
   * @param {Object} saleData - Datos a actualizar
   * @returns {Promise<Object>} Venta actualizada
   */
  async update(id, saleData) {
    try {
      if (!id) throw new Error('ID de la venta es requerido');

      const updateData = {};
      if (saleData.estado) updateData.estado = saleData.estado;
      if (saleData.fecha) updateData.fecha = saleData.fecha;
      if (saleData.productos) {
        updateData.productos = saleData.productos.map(p => ({
          id_producto: p.id || p.id_producto,
          cantidad: p.cantidad,
          precio_unitario: p.precio || p.precio_unitario
        }));
      }

      const response = await apiRequest.put(
        `${SALES_ENDPOINT}/${id}`,
        updateData
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(`Error updating sale`, error);
    }
  }

  /**
   * Cambiar estado de una venta
   * @param {number} id - ID de la venta
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} Venta con estado actualizado
   */
  async changeStatus(id, estado) {
    try {
      if (!id) throw new Error('ID de la venta es requerido');
      if (!estado) throw new Error('El estado es requerido');

      const response = await apiRequest.patch(
        `${SALES_ENDPOINT}/${id}/estado`,
        { estado }
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error changing sale status', error);
    }
  }

  /**
   * Buscar ventas
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Resultados
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
        `${SALES_ENDPOINT}/search?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error searching sales', error);
    }
  }

  /**
   * Obtener ventas por estado
   * @param {string} estado - Estado de la venta
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Ventas del estado
   */
  async getByEstado(estado, params = {}) {
    try {
      if (!estado) throw new Error('El estado es requerido');

      const queryParams = new URLSearchParams(params);
      const response = await apiRequest.get(
        `${SALES_ENDPOINT}/estado/${estado}?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching sales by status', error);
    }
  }

  /**
   * Obtener ventas por rango de fechas
   * @param {string} fecha_inicio - YYYY-MM-DD
   * @param {string} fecha_fin - YYYY-MM-DD
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Ventas en el rango
   */
  async getByDateRange(fecha_inicio, fecha_fin, params = {}) {
    try {
      if (!fecha_inicio || !fecha_fin) {
        throw new Error('Fechas requeridas');
      }

      const queryParams = new URLSearchParams({
        fecha_inicio,
        fecha_fin,
        ...params
      });

      const response = await apiRequest.get(
        `${SALES_ENDPOINT}/fechas?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching sales by date', error);
    }
  }

  /**
   * Obtener estadísticas de ventas
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      const response = await apiRequest.get(`${SALES_ENDPOINT}/estadisticas`);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching stats', error);
    }
  }

  /**
   * Eliminar una venta
   * @param {number} id - ID de la venta
   * @returns {Promise<Object>} Confirmación
   */
  async delete(id) {
    try {
      if (!id) throw new Error('ID de la venta es requerido');

      const response = await apiRequest.delete(`${SALES_ENDPOINT}/${id}`);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error deleting sale', error);
    }
  }

  /**
   * Manejo de respuestas exitosas
   * @private
   */
  _handleResponse(response) {
    const data = response.data || response;

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

    console.error(`[SalesService] ${context}:`, error);

    throw {
      success: false,
      message: errorMessage,
      status: error?.response?.status || 500,
      data: null
    };
  }
}

export default new SalesService();