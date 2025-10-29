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

  /**
   * Obtener todas las compras con paginación y filtros
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const url = queryParams.toString()
        ? `${PURCHASES_ENDPOINT}?${queryParams.toString()}`
        : PURCHASES_ENDPOINT;

      const response = await apiRequest.get(url);

      if (response.success && response.data) {
        const mappedPurchases = response.data.map(purchase => ({
          id: purchase.id_compra,
          proveedor: purchase.proveedor?.nombre || 'N/A',
          nit: purchase.proveedor?.nit || 'N/A',
          fechaRegistro: purchase.fecha_registro,
          fechaCompra: purchase.fecha_compra,
          total: parseFloat(purchase.total || 0),
          estado: purchase.estado || 'Registrada',
          detalles: purchase.detalles || []
        }));

        return {
          ...response,
          data: mappedPurchases
        };
      }

      return response;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  },

  /**
   * Obtener una compra por ID
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }

      const response = await apiRequest.get(`${PURCHASES_ENDPOINT}/${id}`);

      if (response.success && response.data) {
        const purchase = response.data;
        return {
          ...response,
          data: {
            id: purchase.id_compra,
            proveedor: purchase.proveedor?.nombre || 'N/A',
            nit: purchase.proveedor?.nit || 'N/A',
            fechaRegistro: purchase.fecha_registro,
            fechaCompra: purchase.fecha_compra,
            total: parseFloat(purchase.total || 0),
            estado: purchase.estado || 'Registrada',
            detalles: purchase.detalles || []
          }
        };
      }

      return response;
    } catch (error) {
      console.error(`Error fetching purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancelar una compra
   */
  cancel: async (id, reason) => {
    try {
      if (!id) {
        throw new Error('ID de la compra es requerido');
      }

      const response = await apiRequest.patch(`${PURCHASES_ENDPOINT}/${id}/cancelar`, {
        reason: reason || 'Cancelada por usuario'
      });

      return response;
    } catch (error) {
      console.error(`Error canceling purchase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Generar reporte de compras
   */
  generateReport: async (params = {}) => {
    try {
      // Obtener los últimos 100 registros de compras
      const purchasesResponse = await apiRequest.get(`${PURCHASES_ENDPOINT}?limit=100&sort=fecha_registro:desc`);

      if (!purchasesResponse.success) {
        throw new Error('Error al obtener datos de compras');
      }

      const purchases = purchasesResponse.data || [];

      // Crear el archivo Excel con estructura específica
      const XLSX = await import('xlsx');

      // Preparar datos para el Excel - Solo nombres de campos y registros
      const worksheetData = [
        ['ID Compra', 'Fecha Registro', 'Fecha Compra', 'Proveedor', 'NIT', 'IVA General', 'Total', 'Estado']
      ];

      // Agregar datos de compras con todos los campos relevantes
      purchases.forEach(purchase => {
        worksheetData.push([
          purchase.id || '',
          purchase.fechaRegistro || purchase.fecha_registro || '',
          purchase.fechaCompra || purchase.fecha_compra || '',
          purchase.proveedor || '',
          purchase.nit || '',
          purchase.ivaGeneral || purchase.iva_general || 0,
          parseFloat(purchase.total || 0),
          purchase.estado || ''
        ]);
      });

      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Crear hoja de trabajo
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Estilos para el encabezado
      const headerStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFFF00" } }, // Amarillo
        alignment: { horizontal: "center" }
      };

      // Aplicar estilos al encabezado (primera fila)
      worksheet['A1'] = { v: worksheetData[0][0], s: headerStyle };
      worksheet['B1'] = { v: worksheetData[0][1], s: headerStyle };
      worksheet['C1'] = { v: worksheetData[0][2], s: headerStyle };
      worksheet['D1'] = { v: worksheetData[0][3], s: headerStyle };
      worksheet['E1'] = { v: worksheetData[0][4], s: headerStyle };
      worksheet['F1'] = { v: worksheetData[0][5], s: headerStyle };
      worksheet['G1'] = { v: worksheetData[0][6], s: headerStyle };
      worksheet['H1'] = { v: worksheetData[0][7], s: headerStyle };

      // Agregar imagen del logo (si está disponible)
      // Nota: XLSX no soporta imágenes fácilmente, se puede agregar manualmente

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Compras');

      // Generar archivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_compras_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Reporte generado exitosamente' };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
};

export default purchasesService;