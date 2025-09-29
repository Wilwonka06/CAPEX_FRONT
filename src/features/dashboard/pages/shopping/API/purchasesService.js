import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de compras
 * Endpoints base: /api/compras
 */

const PURCHASES_ENDPOINT = '/compras';

export const purchasesService = {
  /**
   * Obtener todas las compras con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {string} params.status - Estado de la compra (opcional)
   * @param {number} params.supplierId - ID del proveedor para filtrar (opcional)
   * @param {string} params.startDate - Fecha de inicio para filtrar (opcional)
   * @param {string} params.endDate - Fecha de fin para filtrar (opcional)
   * @returns {Promise<Object>} Lista de compras con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.supplierId) queryParams.append('supplierId', params.supplierId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const url = queryParams.toString() 
        ? `${PURCHASES_ENDPOINT}?${queryParams.toString()}`
        : PURCHASES_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  },

  /**
   * Obtener una compra por ID
   * @param {number|string} id - ID de la compra
   * @returns {Promise<Object>} Datos de la compra con detalles
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }

      const response = await apiRequest.get(`${PURCHASES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear una nueva compra
   * @param {Object} purchaseData - Datos de la compra
   * @param {number} purchaseData.id_proveedor - ID del proveedor
   * @param {string} purchaseData.fecha_compra - Fecha de compra
   * @param {number} purchaseData.subtotal - Subtotal (opcional)
   * @param {number} purchaseData.iva - IVA (opcional)
   * @param {number} purchaseData.total - Total (opcional)
   * @param {string} purchaseData.estado - Estado (opcional, default: Completada)
   * @returns {Promise<Object>} Compra creada
   */
  create: async (purchaseData) => {
    try {
      // Validaciones básicas
      if (!purchaseData.id_proveedor) {
        throw new Error('El proveedor es requerido');
      }
      if (!purchaseData.fecha_compra) {
        throw new Error('La fecha de compra es requerida');
      }

      // Limpiar datos
      const cleanData = {
        id_proveedor: purchaseData.id_proveedor,
        fecha_compra: purchaseData.fecha_compra,
        subtotal: purchaseData.subtotal || 0,
        iva: purchaseData.iva || 0,
        total: purchaseData.total || 0,
        estado: purchaseData.estado || 'Completada'
      };

      const response = await apiRequest.post(PURCHASES_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  /**
   * Actualizar una compra existente
   * @param {number|string} id - ID de la compra
   * @param {Object} purchaseData - Datos actualizados de la compra
   * @returns {Promise<Object>} Compra actualizada
   */
  update: async (id, purchaseData) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }

      // Validaciones básicas si se proporcionan
      if (purchaseData.detalles && Array.isArray(purchaseData.detalles)) {
        purchaseData.detalles.forEach((detalle, index) => {
          if (detalle.cantidad !== undefined && detalle.cantidad <= 0) {
            throw new Error(`La cantidad debe ser mayor a 0 en el detalle ${index + 1}`);
          }
          if (detalle.precioUnitario !== undefined && detalle.precioUnitario <= 0) {
            throw new Error(`El precio unitario debe ser mayor a 0 en el detalle ${index + 1}`);
          }
        });
      }

      const response = await apiRequest.put(`${PURCHASES_ENDPOINT}/${id}`, purchaseData);
      return response;
    } catch (error) {
      console.error(`Error updating purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualización parcial de una compra
   * @param {number|string} id - ID de la compra
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>} Compra actualizada
   */
  patch: async (id, partialData) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }

      const response = await apiRequest.patch(`${PURCHASES_ENDPOINT}/${id}`, partialData);
      return response;
    } catch (error) {
      console.error(`Error patching purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una compra
   * @param {number|string} id - ID de la compra
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }

      const response = await apiRequest.delete(`${PURCHASES_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de una compra
   * @param {number|string} id - ID de la compra
   * @param {string} status - Nuevo estado ('pendiente' | 'recibida' | 'cancelada')
   * @returns {Promise<Object>} Compra con estado actualizado
   */
  changeStatus: async (id, status) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }
      if (!['pendiente', 'recibida', 'cancelada'].includes(status)) {
        throw new Error('Estado debe ser "pendiente", "recibida" o "cancelada"');
      }

      const response = await apiRequest.patch(`${PURCHASES_ENDPOINT}/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error(`Error changing purchase status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar compras por término
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

      return await purchasesService.getAll(params);
    } catch (error) {
      console.error('Error searching purchases:', error);
      throw error;
    }
  },

  /**
   * Obtener compras por proveedor
   * @param {number|string} supplierId - ID del proveedor
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Compras del proveedor
   */
  getBySupplier: async (supplierId, params = {}) => {
    try {
      if (!supplierId) {
        throw new Error('ID del proveedor es requerido');
      }

      const queryParams = {
        supplierId,
        ...params
      };

      return await purchasesService.getAll(queryParams);
    } catch (error) {
      console.error(`Error fetching purchases by supplier ${supplierId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener compras por rango de fechas
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Compras en el rango de fechas
   */
  getByDateRange: async (startDate, endDate, params = {}) => {
    try {
      if (!startDate || !endDate) {
        throw new Error('Fechas de inicio y fin son requeridas');
      }

      const queryParams = {
        startDate,
        endDate,
        ...params
      };

      return await purchasesService.getAll(queryParams);
    } catch (error) {
      console.error(`Error fetching purchases by date range ${startDate} - ${endDate}:`, error);
      throw error;
    }
  },

  /**
   * Obtener detalles de una compra
   * @param {number|string} id - ID de la compra
   * @returns {Promise<Object>} Detalles de la compra
   */
  getDetails: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }

      const response = await apiRequest.get(`${PURCHASES_ENDPOINT}/${id}/details`);
      return response;
    } catch (error) {
      console.error(`Error fetching purchase details ${id}:`, error);
      throw error;
    }
  },

  /**
   * Agregar detalle a una compra existente
   * @param {number|string} id - ID de la compra
   * @param {Object} detailData - Datos del detalle
   * @param {number} detailData.productId - ID del producto
   * @param {number} detailData.cantidad - Cantidad del producto
   * @param {number} detailData.precioUnitario - Precio unitario
   * @param {number} detailData.descuento - Descuento aplicado (opcional)
   * @returns {Promise<Object>} Detalle agregado
   */
  addDetail: async (id, detailData) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }
      if (!detailData.productId) {
        throw new Error('El producto es requerido');
      }
      if (!detailData.cantidad || detailData.cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }
      if (!detailData.precioUnitario || detailData.precioUnitario <= 0) {
        throw new Error('El precio unitario debe ser mayor a 0');
      }

      const response = await apiRequest.post(`${PURCHASES_ENDPOINT}/${id}/details`, detailData);
      return response;
    } catch (error) {
      console.error(`Error adding detail to purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar detalle de una compra
   * @param {number|string} purchaseId - ID de la compra
   * @param {number|string} detailId - ID del detalle
   * @param {Object} detailData - Datos actualizados del detalle
   * @returns {Promise<Object>} Detalle actualizado
   */
  updateDetail: async (purchaseId, detailId, detailData) => {
    try {
      if (!purchaseId) {
        throw new Error('ID de la compra es requerido');
      }
      if (!detailId) {
        throw new Error('ID del detalle es requerido');
      }

      const response = await apiRequest.put(`${PURCHASES_ENDPOINT}/${purchaseId}/details/${detailId}`, detailData);
      return response;
    } catch (error) {
      console.error(`Error updating purchase detail ${purchaseId}/${detailId}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar detalle de una compra
   * @param {number|string} purchaseId - ID de la compra
   * @param {number|string} detailId - ID del detalle
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  deleteDetail: async (purchaseId, detailId) => {
    try {
      if (!purchaseId) {
        throw new Error('ID de la compra es requerido');
      }
      if (!detailId) {
        throw new Error('ID del detalle es requerido');
      }

      const response = await apiRequest.delete(`${PURCHASES_ENDPOINT}/${purchaseId}/details/${detailId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting purchase detail ${purchaseId}/${detailId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de compras
   * @param {Object} params - Parámetros de consulta (opcional)
   * @param {string} params.period - Período ('day' | 'week' | 'month' | 'year')
   * @param {string} params.startDate - Fecha de inicio (opcional)
   * @param {string} params.endDate - Fecha de fin (opcional)
   * @returns {Promise<Object>} Estadísticas de compras
   */
  getStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.period) queryParams.append('period', params.period);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const url = queryParams.toString() 
        ? `${PURCHASES_ENDPOINT}/stats?${queryParams.toString()}`
        : `${PURCHASES_ENDPOINT}/stats`;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching purchase stats:', error);
      throw error;
    }
  },

  /**
   * Generar reporte de compras
   * @param {Object} params - Parámetros del reporte
   * @param {string} params.format - Formato del reporte ('pdf' | 'excel')
   * @param {string} params.startDate - Fecha de inicio
   * @param {string} params.endDate - Fecha de fin
   * @param {number} params.supplierId - ID del proveedor (opcional)
   * @returns {Promise<Blob>} Archivo del reporte
   */
  generateReport: async (params) => {
    try {
      if (!params.format || !['pdf', 'excel'].includes(params.format)) {
        throw new Error('Formato debe ser "pdf" o "excel"');
      }
      if (!params.startDate || !params.endDate) {
        throw new Error('Fechas de inicio y fin son requeridas');
      }

      const queryParams = new URLSearchParams(params);
      const response = await apiRequest.get(`${PURCHASES_ENDPOINT}/report?${queryParams.toString()}`, {
        responseType: 'blob'
      });

      return response;
    } catch (error) {
      console.error('Error generating purchase report:', error);
      throw error;
    }
  },

  /**
   * Confirmar recepción de compra
   * @param {number|string} id - ID de la compra
   * @param {Object} receptionData - Datos de recepción (opcional)
   * @param {string} receptionData.fechaRecepcion - Fecha de recepción
   * @param {string} receptionData.observaciones - Observaciones de recepción
   * @returns {Promise<Object>} Compra confirmada
   */
  confirmReception: async (id, receptionData = {}) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }

      const data = {
        fechaRecepcion: receptionData.fechaRecepcion || new Date().toISOString().split('T')[0],
        observaciones: receptionData.observaciones || '',
      };

      const response = await apiRequest.patch(`${PURCHASES_ENDPOINT}/${id}/confirm-reception`, data);
      return response;
    } catch (error) {
      console.error(`Error confirming purchase reception ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancelar compra
   * @param {number|string} id - ID de la compra
   * @param {string} reason - Razón de cancelación
   * @returns {Promise<Object>} Compra cancelada
   */
  cancel: async (id, reason) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }
      if (!reason || reason.trim() === '') {
        throw new Error('La razón de cancelación es requerida');
      }

      const response = await apiRequest.patch(`${PURCHASES_ENDPOINT}/${id}/cancel`, { 
        reason: reason.trim() 
      });
      return response;
    } catch (error) {
      console.error(`Error canceling purchase ${id}:`, error);
      throw error;
    }
  },
};

export default purchasesService;