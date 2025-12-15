import apiRequest from '../../../../../shared/config/apiConfig';
import { executeWithToast } from '../../../../../shared/utils/toastHelpers';

const PURCHASES_ENDPOINT = '/compras';

export const purchasesService = {
  /**
   * Crear compra
   */
  create: async (purchaseData) => {
    return executeWithToast({
      operation: 'create',
      entity: 'compra',
      loadingMessage: 'Registrando compra...',
      successMessage: (result) => {
        const id = result?.data?.id || result?.data?.id_compra || '';
        return id ? `Compra ${id} creada exitosamente` : 'Compra creada exitosamente';
      },
      promiseFn: async () => {
        if (!purchaseData.supplierId) {
          throw new Error('El proveedor es requerido');
        }
        if (!purchaseData.fechaCompra) {
          throw new Error('La fecha de compra es requerida');
        }
        if (!purchaseData.detalles || purchaseData.detalles.length === 0) {
          throw new Error('Debe agregar al menos un producto');
        }

        const backendData = {
          id_proveedor: purchaseData.supplierId,
          fecha_compra: purchaseData.fechaCompra,
          ivaGeneral: purchaseData.ivaGeneral || 0,
          detalles: purchaseData.detalles.map(det => ({
            id_producto: det.productId,
            cantidad: det.cantidad,
            precio_unitario: det.precioUnitario,
            precio_venta: det.precioVenta
          }))
        };

        const response = await apiRequest.post(PURCHASES_ENDPOINT, backendData);
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
      }
    });
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
    return executeWithToast({
      operation: 'update',
      entity: 'compra',
      id,
      loadingMessage: 'Anulando compra...',
      successMessage: 'Compra anulada correctamente',
      promiseFn: async () => {
        if (!id) {
          throw new Error('ID de la compra es requerido');
        }
        const response = await apiRequest.patch(`${PURCHASES_ENDPOINT}/${id}/cancelar`, {
          reason: reason || 'Cancelada por usuario'
        });
        return response;
      }
    });
  },

  /**
   * Generar reporte de compras
   */
  generateReport: async (params = {}) => {
    return executeWithToast({
      operation: 'process',
      entity: 'reporte de compras',
      loadingMessage: 'Generando reporte...',
      successMessage: 'Reporte generado exitosamente',
      promiseFn: async () => {
        const qs = [];
        if (params.startDate) qs.push(`fecha_inicio=${encodeURIComponent(params.startDate)}`);
        if (params.endDate) qs.push(`fecha_fin=${encodeURIComponent(params.endDate)}`);
        qs.push('limit=100');
        qs.push('sort=fecha_registro:desc');
        const url = `${PURCHASES_ENDPOINT}?${qs.join('&')}`;
        const purchasesResponse = await apiRequest.get(url);
        if (!purchasesResponse.success) {
          throw new Error('Error al obtener datos de compras');
        }
        const purchases = purchasesResponse.data || [];
        const XLSX = await import('xlsx');
        const comprasHeaders = ['ID Compra', 'Fecha Registro', 'Fecha Compra', 'Proveedor', 'NIT', 'IVA General', 'Total', 'Estado', 'Validación'];
        const comprasRows = [comprasHeaders];
        purchases.forEach(purchase => {
          const id = purchase.id || purchase.id_compra || '';
          const fechaRegistro = purchase.fechaRegistro || purchase.fecha_registro || '';
          const fechaCompra = purchase.fechaCompra || purchase.fecha_compra || '';
          const proveedorNombre = (purchase.proveedor && (purchase.proveedor.nombre || purchase.proveedor)) || '';
          const proveedorNit = (purchase.proveedor && purchase.proveedor.nit) || purchase.nit || '';
          const ivaMonto = (purchase.iva !== undefined && purchase.iva !== null) ? purchase.iva : (purchase.ivaGeneral || purchase.iva_general || 0);
          const total = parseFloat(purchase.total || 0);
          const estado = purchase.estado || 'Registrada';
          const valid = (id && fechaCompra && proveedorNombre && Number.isFinite(total)) ? 'OK' : 'FALTAN CAMPOS';
          comprasRows.push([id, fechaRegistro, fechaCompra, proveedorNombre, proveedorNit, ivaMonto, total, estado, valid]);
        });
        const workbook = XLSX.utils.book_new();
        const wsCompras = XLSX.utils.aoa_to_sheet(comprasRows);
        wsCompras['!cols'] = [
          { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 24 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }
        ];
        for (let r = 1; r < comprasRows.length; r++) {
          const g = `G${r + 0}`;
          const f = `F${r + 0}`;
          if (wsCompras[g] && typeof wsCompras[g].v === 'number') { wsCompras[g].t = 'n'; wsCompras[g].z = '#,##0.00'; }
          if (wsCompras[f] && typeof wsCompras[f].v === 'number') { wsCompras[f].t = 'n'; wsCompras[f].z = '#,##0.00'; }
        }
        XLSX.utils.book_append_sheet(workbook, wsCompras, 'Compras');
        const detalleHeaders = ['ID Compra', 'Fecha Compra', 'Producto ID', 'Código', 'Nombre', 'Cantidad', 'Costo Unitario', 'Subtotal'];
        const detalleRows = [detalleHeaders];
        purchases.forEach(purchase => {
          const id = purchase.id || purchase.id_compra || '';
          const fechaCompra = purchase.fechaCompra || purchase.fecha_compra || '';
          const detalles = Array.isArray(purchase.detalles) ? purchase.detalles : [];
          detalles.forEach(d => {
            const pid = d.id_producto || d.producto?.id || '';
            const codigo = pid ? `P${pid.toString().padStart(3, '0')}` : '';
            const nombre = d.producto?.nombre || d.nombre || 'N/A';
            const cantidad = parseInt(d.cantidad || 0);
            const costo = parseFloat(d.precio_unitario || 0);
            const subtotal = parseFloat(d.subtotal || (costo * cantidad));
            detalleRows.push([id, fechaCompra, pid, codigo, nombre, cantidad, costo, subtotal]);
          });
        });
        const wsDetalle = XLSX.utils.aoa_to_sheet(detalleRows);
        wsDetalle['!cols'] = [
          { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 10 }, { wch: 14 }, { wch: 14 }
        ];
        for (let r = 1; r < detalleRows.length; r++) {
          ['F', 'G', 'H'].forEach(col => {
            const addr = `${col}${r + 0}`;
            if (wsDetalle[addr] && typeof wsDetalle[addr].v === 'number') {
              wsDetalle[addr].t = 'n';
              wsDetalle[addr].z = col === 'F' ? '#,##0' : '#,##0.00';
            }
          });
        }
        XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle_Compras');
        const resumenMap = new Map();
        detalleRows.slice(1).forEach(row => {
          const codigo = row[3];
          const nombre = row[4];
          const cantidad = Number(row[5]) || 0;
          const subtotal = Number(row[7]) || 0;
          const key = codigo || nombre;
          const cur = resumenMap.get(key) || { codigo, nombre, cantidad: 0, monto: 0, compras: 0 };
          cur.cantidad += cantidad;
          cur.monto += subtotal;
          cur.compras += 1;
          resumenMap.set(key, cur);
        });
        const resumenHeaders = ['Código', 'Nombre', 'Cantidad Comprada', 'Monto', 'Nº Compras'];
        const resumenRows = [resumenHeaders, ...Array.from(resumenMap.values()).map(r => [r.codigo, r.nombre, r.cantidad, r.monto, r.compras])];
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
        wsResumen['!cols'] = [
          { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 12 }
        ];
        for (let r = 1; r < resumenRows.length; r++) {
          ['C', 'D', 'E'].forEach(col => {
            const addr = `${col}${r + 0}`;
            if (wsResumen[addr] && typeof wsResumen[addr].v === 'number') {
              wsResumen[addr].t = 'n';
              wsResumen[addr].z = col === 'D' ? '#,##0.00' : '#,##0';
            }
          });
        }
        XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen_Compras');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const fileUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `reporte_compras_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(fileUrl);
        return { success: true, message: 'Reporte generado exitosamente' };
      }
    });
  }
};

export default purchasesService;
