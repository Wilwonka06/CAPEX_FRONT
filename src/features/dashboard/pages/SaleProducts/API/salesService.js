import apiRequest from '../../../../../shared/config/apiConfig';
import { executeWithToast } from '../../../../../shared/utils/toastHelpers';

/**
 * Servicio de Ventas - Consumo directo de API
 * Mapea operaciones de frontend con endpoint de backend
 */

const SALES_ENDPOINT = '/ventas-productos';

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
      const safeLimit = Math.min(Math.max(parseInt(params.limit || 50), 1), 100);
      queryParams.append('limit', safeLimit);
      if (params.estado) queryParams.append('estado', params.estado);

      const url = queryParams.toString()
        ? `${SALES_ENDPOINT}?${queryParams.toString()}`
        : SALES_ENDPOINT;

      const response = await apiRequest.get(url, { skipGlobalErrorHandling: true });
      
      // Mapear respuesta del backend al formato del frontend
      if (response.success && response.data) {
        response.data = response.data.map(venta => ({
          id: venta.id_venta_producto,
          numeroVenta: `VEN-${venta.id_venta_producto.toString().padStart(5, '0')}`,
          fecha: venta.fecha,
          clienteId: venta.id_usuario,
          valor: parseFloat(venta.total || 0),
          estado: venta.estado || 'Pendiente',
          productos: (venta.detalles || []).map(det => ({
            id: det.id_producto,
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            precio: parseFloat(det.precio_unitario || 0),
            subtotal: parseFloat(det.subtotal || ((parseFloat(det.precio_unitario||0))*(parseInt(det.cantidad||0))))
          })),
          metodoPago: venta.metodoPago || 'No especificado',
          customer: venta.usuario ? {
            nombre: venta.usuario.nombre || '',
            email: venta.usuario.correo || '',
            phone: venta.usuario.telefono || '',
            documentNumber: venta.usuario.documento || ''
          } : undefined
        }));
      }

      return this._handleResponse(response);
    } catch (error) {
      // Reintentos automáticos simples
      for (let i = 1; i <= 2; i++) {
        try {
          await new Promise(r => setTimeout(r, 500 * i));
          const retryParams = { ...params, limit: Math.min(Math.max(parseInt(params.limit || 50), 1), 50) };
          return await this.getAll(retryParams);
        } catch (_) {}
      }
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
      
      // Mapear respuesta del backend
      if (response.success && response.data) {
        const venta = response.data;
        response.data = {
          id: venta.id_venta_producto,
          numeroVenta: `VEN-${venta.id_venta_producto.toString().padStart(5, '0')}`,
          fecha: venta.fecha,
          clienteId: venta.id_usuario,
          valor: parseFloat(venta.total || 0),
          estado: venta.estado || 'Pendiente',
          productos: (venta.detalles || []).map(det => ({
            id: det.id_producto,
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            precio: parseFloat(det.precio_unitario || 0),
            subtotal: parseFloat(det.subtotal || ((parseFloat(det.precio_unitario||0))*(parseInt(det.cantidad||0))))
          })),
          metodoPago: venta.metodoPago || 'No especificado',
          customer: venta.usuario ? {
            nombre: venta.usuario.nombre || '',
            email: venta.usuario.correo || '',
            phone: venta.usuario.telefono || '',
            documentNumber: venta.usuario.documento || ''
          } : undefined
        };
      }

      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(`Error fetching sale ${id}`, error);
    }
  }

  /**
   * Crear una nueva venta
   * @param {Object} saleData - { fecha, productos, id_usuario, metodoPago }
   * @returns {Promise<Object>} Venta creada
   */
  async create(saleData) {
    return executeWithToast({
      operation: 'create',
      entity: 'venta',
      loadingMessage: 'Registrando venta...',
      successMessage: (result) => {
        const numero = result?.data?.numeroVenta || '';
        return numero ? `Venta ${numero} creada exitosamente` : 'Venta creada exitosamente';
      },
      promiseFn: async () => {
        if (!saleData.fecha) throw new Error('La fecha es requerida');
        if (!saleData.id_usuario) throw new Error('El ID del usuario es requerido');
        if (!saleData.productos?.length) {
          throw new Error('La venta debe tener al menos un producto');
        }
        const ventaData = {
          fecha: saleData.fecha,
          id_usuario: saleData.id_usuario || saleData.clienteId,
          productos: saleData.productos.map(p => ({
            id_producto: p.id || p.id_producto,
            cantidad: p.cantidad,
            precio_unitario: p.precio || p.precio_unitario
          }))
        };
        const response = await apiRequest.post(SALES_ENDPOINT, ventaData);
        if (response.success && response.data) {
          const venta = response.data;
          response.data = {
            id: venta.id_venta_producto,
            numeroVenta: `VEN-${venta.id_venta_producto.toString().padStart(5, '0')}`,
            fecha: venta.fecha,
            clienteId: venta.id_usuario,
            valor: parseFloat(venta.total || 0),
            estado: venta.estado || 'Pendiente',
            productos: (venta.detalles || []).map(det => ({
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
      }
    });
  }

  /**
   * Actualizar una venta
   * @param {number} id - ID de la venta
   * @param {Object} saleData - Datos a actualizar
   * @returns {Promise<Object>} Venta actualizada
   */
  async update(id, saleData) {
    return executeWithToast({
      operation: 'update',
      entity: 'venta',
      id,
      loadingMessage: 'Actualizando venta...',
      successMessage: 'Venta actualizada exitosamente',
      promiseFn: async () => {
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
        const response = await apiRequest.put(`${SALES_ENDPOINT}/${id}`, updateData);
        return this._handleResponse(response);
      }
    });
  }

  /**
   * Cambiar estado de una venta
   * @param {number} id - ID de la venta
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} Venta con estado actualizado
   */
  async changeStatus(id, estado) {
    return executeWithToast({
      operation: 'update',
      entity: 'venta',
      id,
      loadingMessage: 'Cambiando estado de la venta...',
      successMessage: 'Estado de la venta actualizado',
      promiseFn: async () => {
        if (!id) throw new Error('ID de la venta es requerido');
        if (!estado) throw new Error('El estado es requerido');
        const response = await apiRequest.patch(`${SALES_ENDPOINT}/${id}/estado`, { estado });
        return this._handleResponse(response);
      }
    });
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
    return executeWithToast({
      operation: 'delete',
      entity: 'venta',
      id,
      loadingMessage: 'Eliminando venta...',
      successMessage: 'Venta eliminada exitosamente',
      promiseFn: async () => {
        if (!id) throw new Error('ID de la venta es requerido');
        const response = await apiRequest.delete(`${SALES_ENDPOINT}/${id}`);
        return this._handleResponse(response);
      }
    });
  }

  /**
   * Obtener ventas por usuario
   * @param {number} id_usuario - ID del usuario
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Ventas del usuario
   */
  async getByUsuario(id_usuario, params = {}) {
    try {
      if (!id_usuario) throw new Error('ID del usuario es requerido');

      const queryParams = new URLSearchParams(params);
      const response = await apiRequest.get(
        `${SALES_ENDPOINT}/usuario/${id_usuario}?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching sales by user', error);
    }
  }

  /**
   * Obtener ventas online (sin cita)
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Ventas online
   */
  async getOnline(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await apiRequest.get(
        `${SALES_ENDPOINT}/online?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching online sales', error);
    }
  }

  /**
   * Obtener ventas en citas
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Ventas en citas
   */
  async getEnCitas(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await apiRequest.get(
        `${SALES_ENDPOINT}/en-citas?${queryParams.toString()}`
      );
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError('Error fetching sales in appointments', error);
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
