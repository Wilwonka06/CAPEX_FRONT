// src/pages/private/dashboard/shopping/API/purchasesService.js
import apiRequest from '../../../../../shared/config/apiConfig';

const PURCHASES_ENDPOINT = '/compras';

export const purchasesService = {
  /**
   * Obtener todas las compras
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.includeDetalles !== undefined) {
        queryParams.append('includeDetalles', params.includeDetalles);
      }

      const url = queryParams.toString() 
        ? `${PURCHASES_ENDPOINT}?${queryParams.toString()}`
        : PURCHASES_ENDPOINT;

      const response = await apiRequest.get(url);
      
      // Transformar respuesta del backend al formato frontend
      if (response.success && response.data) {
        response.data = response.data.map(compra => ({
          id: compra.id_compra,
          proveedor: compra.proveedor?.nombre || 'N/A',
          nit: compra.proveedor?.nit || 'N/A',
          fechaRegistro: compra.fecha_registro,
          fechaCompra: compra.fecha_compra,
          subtotal: parseFloat(compra.subtotal || 0),
          iva: parseFloat(compra.iva || 0),
          total: parseFloat(compra.total || 0),
          estado: compra.estado === 'Completada' ? 'Registrada' : compra.estado === 'Cancelada' ? 'Anulada' : compra.estado,
          productos: compra.detalles?.map(det => ({
            id: det.id_producto,
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            costo: parseFloat(det.precio_unitario || 0),
            precioBase: parseFloat(det.precio_unitario || 0),
            iva: det.producto?.iva ? parseFloat(det.producto.iva) / 100 : 0,
            precioConIva: parseFloat(det.precio_unitario || 0) * (1 + (det.producto?.iva ? parseFloat(det.producto.iva) / 100 : 0))
          })) || []
        }));

        // Transformar paginación
        if (response.pagination) {
          response.pagination = {
            currentPage: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.total,
            itemsPerPage: response.pagination.limit
          };
        }
      }

      return response;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  },

  /**
   * Obtener compra por ID
   */
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de la compra es requerido');

      const response = await apiRequest.get(`${PURCHASES_ENDPOINT}/${id}`);
      
      // Transformar respuesta
      if (response.success && response.data) {
        const compra = response.data;
        response.data = {
          id: compra.id_compra,
          proveedor: compra.proveedor?.nombre || 'N/A',
          nit: compra.proveedor?.nit || 'N/A',
          fechaRegistro: compra.fecha_registro,
          fechaCompra: compra.fecha_compra,
          subtotal: parseFloat(compra.subtotal || 0),
          totalIva: parseFloat(compra.iva || 0),
          total: parseFloat(compra.total || 0),
          estado: compra.estado === 'Completada' ? 'Registrada' : compra.estado === 'Cancelada' ? 'Anulada' : compra.estado,
          items: compra.detalles?.map(det => ({
            id: det.id_producto,
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            costo: parseFloat(det.precio_unitario || 0),
            precioBase: parseFloat(det.precio_unitario || 0),
            iva: det.producto?.iva ? parseFloat(det.producto.iva) / 100 : 0,
            precioConIva: parseFloat(det.precio_unitario || 0) * (1 + (det.producto?.iva ? parseFloat(det.producto.iva) / 100 : 0))
          })) || []
        };
      }

      return response;
    } catch (error) {
      console.error(`Error fetching purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear compra
   */
  create: async (purchaseData) => {
    try {
      // Validaciones
      if (!purchaseData.supplierId) {
        throw new Error('El proveedor es requerido');
      }
      if (!purchaseData.fechaCompra) {
        throw new Error('La fecha de compra es requerida');
      }
      if (!purchaseData.detalles || purchaseData.detalles.length === 0) {
        throw new Error('Debe agregar al menos un producto');
      }

      // Transformar al formato del backend
      const backendData = {
        id_proveedor: purchaseData.supplierId,
        fecha_compra: purchaseData.fechaCompra,
        detalles: purchaseData.detalles.map(det => ({
          id_producto: det.productId,
          cantidad: det.cantidad,
          precio_unitario: det.precioUnitario
        }))
      };

      const response = await apiRequest.post(PURCHASES_ENDPOINT, backendData);
      
      // Transformar respuesta
      if (response.success && response.data) {
        const compra = response.data;
        response.data = {
          id: compra.id_compra,
          proveedor: compra.proveedor?.nombre || 'N/A',
          nit: compra.proveedor?.nit || 'N/A',
          fechaRegistro: compra.fecha_registro,
          fechaCompra: compra.fecha_compra,
          total: parseFloat(compra.total || 0),
          estado: 'Registrada'
        };
      }

      return response;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  /**
   * Cancelar compra
   */
  cancel: async (id)=> {
    try {
      if (!id) throw new Error('ID de la compra es requerido');
      
      const response = await apiRequest.patch(`${PURCHASES_ENDPOINT}/${id}/cancel`);
      
      return response;
    } catch (error) {
      console.error(`Error canceling purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener compras por proveedor
   */
  getBySupplier: async (supplierId, params = {}) => {
    try {
      if (!supplierId) throw new Error('ID del proveedor es requerido');

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `${PURCHASES_ENDPOINT}/proveedor/${supplierId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      return await apiRequest.get(url);
    } catch (error) {
      console.error(`Error fetching purchases by supplier ${supplierId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener compras por rango de fechas
   */
  getByDateRange: async (startDate, endDate, params = {}) => {
    try {
      if (!startDate || !endDate) {
        throw new Error('Fechas de inicio y fin son requeridas');
      }

      const queryParams = new URLSearchParams({
        fecha_inicio: startDate,
        fecha_fin: endDate,
        ...params
      });

      return await apiRequest.get(`${PURCHASES_ENDPOINT}/fecha?${queryParams.toString()}`);
    } catch (error) {
      console.error(`Error fetching purchases by date range:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas
   */
  getStats: async () => {
    try {
      return await apiRequest.get(`${PURCHASES_ENDPOINT}/stats`);
    } catch (error) {
      console.error('Error fetching purchase stats:', error);
      throw error;
    }
  }
};

export default purchasesService;