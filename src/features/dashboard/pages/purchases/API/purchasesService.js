import apiRequest from '../../../../../shared/config/apiConfig';

const PURCHASES_ENDPOINT = '/compras';

export const purchasesService = {
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

      // ✅ Transformar al formato del backend
      const backendData = {
        id_proveedor: purchaseData.supplierId,
        fecha_compra: purchaseData.fechaCompra,
        ivaGeneral: purchaseData.ivaGeneral || 0, // IVA general de la compra
        detalles: purchaseData.detalles.map(det => ({
          id_producto: det.productId,
          cantidad: det.cantidad,
          precio_unitario: det.precioUnitario, // Costo
          precio_venta: det.precioVenta // Precio de venta (opcional)
        }))
      };

      console.log('Enviando datos al backend:', backendData);

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

  // ... resto de métodos (getAll, getById, etc.)
};

export default purchasesService;