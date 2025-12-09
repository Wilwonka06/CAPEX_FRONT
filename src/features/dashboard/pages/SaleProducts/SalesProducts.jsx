// src/features/dashboard/pages/SaleProducts/SalesProducts.jsx
import { useState, useEffect } from 'react';
import productsService from '../products/API/productsService';
import salesService from './API/salesService';
import usersService from '../users/API/usersService';
import Search from '../../../../shared/Search';
// import LoadingTable from '../../../../shared/components/LoadingTable';
import ConfirmDeleteModal from '../../../../shared/components/ConfirmDeleteModal';
// import { formatNumber } from '../../../../shared/utils/formatters';
import { filterBySearch } from '../../../../shared/utils/searchHelper';
import CreateSaleModal from './components/CreateSaleModal';
import SaleDetailModal from './components/SaleDetailModal';
import SalesTable from './components/SalesTable';
import { generateProductInvoicePDF } from '../../../../shared/utils/invoicePdf';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import Paginator from '../../../../shared/Paginator';

const SalesProducts = () => {
  // ===== ESTADOS PRINCIPALES =====
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para productos
  const [products, setProducts] = useState([]);
  // const [productsLoading, setProductsLoading] = useState(true);
  const [customers, setCustomers] = useState([]);

  // Los clientes ahora se buscan dinámicamente desde el backend

  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filteredSales, setFilteredSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  const { setTitle } = useOutletContext();

  // ===== CARGAR DATOS INICIALES =====
  useEffect(() => {
    setTitle('Módulo de Venta de Productos');
    loadSales();
    loadProducts();
    loadCustomers();
    return () => setTitle('');
  }, [setTitle]);

  // Cargar ventas desde el backend
  const loadSales = async () => {
    try {
      setLoading(true);
      // reset error state

      const response = await salesService.getAll({
        page: 1,
        limit: 100 // Cargar todas para filtrado local
      });

      if (response.success) {
        setSales(response.data || []);
      } else {
        throw new Error(response.message || 'Error al cargar ventas');
      }
    } catch (err) {
      // error state unused
      console.error('Error loading sales:', err);
      toast.error(err.message || 'Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos
  const loadProducts = async () => {
    try {
      // setProductsLoading(true);
      const response = await productsService.getAll({ limit: 100 });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      // setProductsLoading(false);
    }
  };

  // Cargar clientes
  const loadCustomers = async () => {
    try {
      const response = await usersService.getAll({ limit: 100, roleId: 2 });
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : [];
        const mapped = list.map(u => ({
          id: u.id_usuario || u.id,
          nombre: u.nombre || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          documentNumber: u.documento || '',
          email: u.correo || '',
          phone: u.telefono || ''
        }));
        setCustomers(mapped);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  // ===== FILTRAR VENTAS =====
  useEffect(() => {
    // Usar la función helper de búsqueda universal
    setFilteredSales(filterBySearch(sales, searchTerm));
  }, [searchTerm, sales]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sales]);

  const totalItems = filteredSales.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  // ===== MANEJADORES =====

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateSale = async (saleData) => {
    setLoading(true);

    const salePromise = (async () => {
      // Transformar datos frontend al formato backend
      const backendData = {
        fecha: saleData.fecha,
        id_usuario: saleData.clienteId,
        productos: saleData.productos.map(p => ({
          id_producto: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precio
        }))
      };

      const response = await salesService.create(backendData);

      if (response.success) {
        setShowCreateModal(false);
        await loadSales(); // Recargar lista
      try { window.dispatchEvent(new Event('sales-updated')); } catch { void 0 }
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear la venta');
      }
    })();

    toast.promise(salePromise, {
      loading: 'Registrando venta...',
      success: 'Venta registrada exitosamente',
      error: (err) => {
        console.error('Error creating sale:', err);
        return err.response?.data?.message || err.message || 'Error al crear la venta';
      },
    });

    try {
      await salePromise;
    } catch {
      void 0
    } finally {
      setLoading(false);
    }
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  // Handler para cancelar venta - muestra modal primero
  const handleDeleteSale = (saleId) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      setPendingDelete({ id: saleId, sale });
      setShowDeleteModal(true);
    }
  };

  // Handler para confirmar cancelación
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
      setLoading(true);
      
      const salePromise = (async () => {
      const response = await salesService.changeStatus(pendingDelete.id, 'Cancelado');
        
        if (response.success) {
          await loadSales(); // Recargar lista
          return response.data;
        } else {
          throw new Error(response.message || 'Error al cancelar la venta');
        }
      })();

      toast.promise(salePromise, {
        loading: 'Cancelando venta...',
        success: 'Venta cancelada exitosamente',
        error: (err) => {
          console.error('Error canceling sale:', err);
          return err.response?.data?.message || err.message || 'Error al cancelar la venta';
        },
      });

      try {
        await salePromise;
      setShowDeleteModal(false);
      setPendingDelete(null);
      } catch {
        void 0
      } finally {
        setLoading(false);
      setDeletingId(null);
    }
  };

  const handleDownloadReport = async () => {
    try {
      // Obtener los últimos 100 registros de ventas de productos
      const response = await salesService.getAll({
        page: 1,
        limit: 100
      });

      if (!response.success) {
        throw new Error('Error al obtener datos de ventas');
      }

      const sales = response.data || [];

      // Crear el archivo Excel con estructura específica
      const XLSX = await import('xlsx');

      // Hoja 1: Ventas generales con validación
      const ventasHeaders = ['ID Venta', 'Número Venta', 'Fecha', 'Cliente', 'Método Pago', 'Estado', 'Valor Total', 'Validación'];
      const ventasRows = [ventasHeaders];
      sales.forEach(sale => {
        const id = sale.id || sale.id_venta_producto || '';
        const numero = sale.numeroVenta || `VEN-${(id || 0).toString().padStart(6, '0')}`;
        const fecha = sale.fecha || '';
        const cliente = sale.customer?.nombre || sale.usuario?.nombre || (sale.id_usuario ? `Usuario ${sale.id_usuario}` : '');
        const metodo = sale.metodoPago || 'No especificado';
        const estado = sale.estado || '';
        const total = parseFloat(sale.valor ?? sale.total ?? 0);
        const valid = (id && numero && fecha && estado && Number.isFinite(total)) ? 'OK' : 'FALTAN CAMPOS';
        ventasRows.push([id, numero, fecha, cliente, metodo, estado, total, valid]);
      });

      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Crear hoja Ventas_Productos
      const wsVentas = XLSX.utils.aoa_to_sheet(ventasRows);
      wsVentas['!cols'] = [
        { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }
      ];
      // Formato numérico para Valor Total
      for (let r = 1; r < ventasRows.length; r++) {
        const addr = `G${r + 0}`; // Columna G
        if (wsVentas[addr] && typeof wsVentas[addr].v === 'number') {
          wsVentas[addr].t = 'n';
          wsVentas[addr].z = '#,##0.00';
        }
      }

      // Aplicar encabezados (amarillo) - compatibilidad básica
      wsVentas['A1'] = { v: ventasHeaders[0] };
      wsVentas['B1'] = { v: ventasHeaders[1] };
      wsVentas['C1'] = { v: ventasHeaders[2] };
      wsVentas['D1'] = { v: ventasHeaders[3] };
      wsVentas['E1'] = { v: ventasHeaders[4] };
      wsVentas['F1'] = { v: ventasHeaders[5] };
      wsVentas['G1'] = { v: ventasHeaders[6] };
      wsVentas['H1'] = { v: ventasHeaders[7] };

      XLSX.utils.book_append_sheet(workbook, wsVentas, 'Ventas_Productos');

      // Hoja 2: Detalle de productos por venta
      const detalleHeaders = ['ID Venta', 'Fecha', 'Producto ID', 'Código', 'Nombre', 'Cantidad', 'Precio Unitario', 'Subtotal'];
      const detalleRows = [detalleHeaders];
      sales.forEach(sale => {
        const id = sale.id || sale.id_venta_producto || '';
        const fecha = sale.fecha || '';
        const productos = Array.isArray(sale.productos) ? sale.productos : (sale.detalles || []);
        productos.forEach(p => {
          const pid = p.id || p.id_producto || '';
          const codigo = p.codigo || (pid ? `P${pid.toString().padStart(3, '0')}` : '');
          const nombre = p.nombre || p.producto?.nombre || 'N/A';
          const cantidad = parseInt(p.cantidad || 0);
          const precio = parseFloat(p.precio ?? p.precio_unitario ?? 0);
          const subtotal = parseFloat(p.subtotal ?? (precio * cantidad));
          detalleRows.push([id, fecha, pid, codigo, nombre, cantidad, precio, subtotal]);
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
      XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle_Ventas');

      // Hoja 3: Resumen por producto
      const resumenMap = new Map();
      detalleRows.slice(1).forEach(row => {
        const codigo = row[3];
        const nombre = row[4];
        const cantidad = Number(row[5]) || 0;
        const subtotal = Number(row[7]) || 0;
        const key = codigo || nombre;
        const cur = resumenMap.get(key) || { codigo, nombre, cantidad: 0, ingresos: 0, ventas: 0 };
        cur.cantidad += cantidad;
        cur.ingresos += subtotal;
        cur.ventas += 1;
        resumenMap.set(key, cur);
      });
      const resumenHeaders = ['Código', 'Nombre', 'Cantidad Vendida', 'Ingresos', 'Nº Ventas'];
      const resumenRows = [resumenHeaders, ...Array.from(resumenMap.values()).map(r => [r.codigo, r.nombre, r.cantidad, r.ingresos, r.ventas])];
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
      wsResumen['!cols'] = [
        { wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 12 }
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
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen_por_Producto');

      // Generar archivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_ventas_productos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Reporte de ventas de productos generado exitosamente');
    } catch (error) {
      console.error('Error generating sales report:', error);
      toast.error('Error al generar el reporte de ventas de productos');
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedSale(null);
  };

  // ===== RENDER =====

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Search
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                placeholder="Buscar ventas de productos"
              />
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-plus-circle mr-2"></i> Nueva venta
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-md flex items-center"
                onClick={handleDownloadReport}
              >
                <i className="bi bi-file-earmark-excel mr-2"></i>
              </button>
            </div>

            {/* Tabla de ventas */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {loading ? (
                <SalesTable
                  sales={[]}
                  customers={[]}
                  onView={() => {}}
                  onAnnul={() => {}}
                  onDownload={() => {}}
                  loading={true}
                />
              ) : filteredSales.length === 0 ? (
                <div className="text-center py-12">
                  <i className="bi bi-inbox text-6xl text-gray-300"></i>
                  <p className="mt-4 text-gray-500">
                    {searchTerm
                      ? 'No se encontraron ventas que coincidan con tu búsqueda'
                      : 'No hay ventas registradas'}
                  </p>
                </div>
              ) : (
                <>
                  <SalesTable
                    sales={pageSales}
                    customers={customers}
                    onView={handleViewSale}
                    onAnnul={handleDeleteSale}
                    onDownload={async (sale) => {
                      try {
                        const res = await salesService.getById(sale.id);
                        if (!res.success || !res.data) throw new Error(res.message || 'No se pudo obtener la venta');
                        const venta = res.data;
                        await generateProductInvoicePDF({
                          sale: venta,
                          customer: {
                            nombre: venta.customer?.nombre || 'Cliente',
                            documentNumber: venta.customer?.documentNumber || '',
                            email: venta.customer?.email || '',
                            phone: venta.customer?.phone || ''
                          },
                          company: {
                            name: 'CAPEX',
                            email: 'info@capex.local',
                            phone: '+57',
                            address: 'Colombia'
                          },
                          theme: { primary: '#9C5B2B', accent: '#FACC15' },
                          fileName: `factura_${venta.numeroVenta}.pdf`
                        })
                        toast.success('Factura PDF descargada')
                      } catch (e) {
                        console.error('Error al descargar factura:', e);
                        toast.error(e.message || 'Error al descargar factura');
                      }
                    }}
                    loading={false}
                  />
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateSaleModal
          onClose={closeModals}
          onCreate={handleCreateSale}
          products={products}
          isOpen={showCreateModal}
        />
      )}
      
      {showDetailModal && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          customer={customers.find(c => c.id === selectedSale?.clienteId) || selectedSale?.customer || null}
          isOpen={showDetailModal}
          onClose={closeModals}
        />
      )}

      {/* Modal de confirmación de cancelación */}
      {showDeleteModal && pendingDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            if (!deletingId) {
              setShowDeleteModal(false);
              setPendingDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          itemName={`venta #${pendingDelete.sale.numeroVenta}`}
          entityType="venta"
          loading={deletingId === pendingDelete.id}
        />
      )}
      
    </div>
  );
};

export default SalesProducts;
