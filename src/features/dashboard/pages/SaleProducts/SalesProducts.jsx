// src/features/dashboard/pages/SaleProducts/SalesProducts.jsx
import { useState, useEffect } from 'react';
import productsService from '../products/API/productsService';
import salesService from './API/salesService';
import Search from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import LoadingTable from '../../../../shared/components/LoadingTable';
import { formatNumber } from '../../../../shared/utils/formatters';
import CreateSaleModal from './components/CreateSaleModal';
import SaleDetailModal from './components/SaleDetailModal';
import SalesTable from './components/SalesTable';
import { generateProductInvoicePDF } from '../../../../shared/utils/invoicePdf';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const SalesProducts = () => {
  // ===== ESTADOS PRINCIPALES =====
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para productos
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Los clientes ahora se buscan dinámicamente desde el backend

  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filteredSales, setFilteredSales] = useState([]);
  
  const { setTitle } = useOutletContext();
  const itemsPerPage = 5;

  // ===== CARGAR DATOS INICIALES =====
  useEffect(() => {
    setTitle('Venta de Productos');
    loadSales();
    loadProducts();
    // loadCustomers(); // Implementar cuando tengas API de clientes
    return () => setTitle('');
  }, [setTitle]);

  // Cargar ventas desde el backend
  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);

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
      setError(err.message);
      console.error('Error loading sales:', err);
      toast.error(err.message || 'Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productsService.getAll({ limit: 100 });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setProductsLoading(false);
    }
  };

  // ===== FILTRAR VENTAS =====
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSales(sales);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    setFilteredSales(
      sales.filter(sale =>
        (sale.id?.toString() || '').includes(lowerTerm) ||
        (sale.numeroVenta || '').toLowerCase().includes(lowerTerm) ||
        (sale.estado || '').toLowerCase().includes(lowerTerm) ||
        (sale.fecha || '').toLowerCase().includes(lowerTerm) ||
        (sale.valor?.toString() || '').includes(lowerTerm) ||
        (sale.metodoPago || '').toLowerCase().includes(lowerTerm)
      )
    );
  }, [searchTerm, sales]);

  // ===== PAGINACIÓN =====
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ===== MANEJADORES =====
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
        try { window.dispatchEvent(new Event('sales-updated')); } catch {}
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
    } catch (error) {
      // Error ya manejado por toast.promise
    } finally {
      setLoading(false);
    }
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleDeleteSale = async (saleId) => {
    const sale = sales.find(s => s.id === saleId);
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas cancelar la venta #${sale?.numeroVenta}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setLoading(true);
      
      const salePromise = (async () => {
        const response = await salesService.changeStatus(saleId, 'Cancelado');
        
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
      } catch (error) {
        // Error ya manejado por toast.promise
      } finally {
        setLoading(false);
      }
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

      // Preparar datos para el Excel - Solo nombres de campos y registros
      const worksheetData = [
        ['ID Venta', 'Número Venta', 'Fecha', 'Cliente', 'Método Pago', 'Estado', 'Valor Total']
      ];

      // Agregar datos de ventas con todos los campos relevantes
      sales.forEach(sale => {
        worksheetData.push([
          sale.id_venta_producto || sale.id || '',
          `VEN-${(sale.id_venta_producto || sale.id || 0).toString().padStart(6, '0')}`,
          sale.fecha || '',
          sale.usuario?.nombre || `Usuario ${sale.id_usuario}` || '',
          sale.metodoPago || 'No especificado',
          sale.estado || '',
          parseFloat(sale.total || 0)
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

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas_Productos');

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
                  currentPage={1}
                  totalPages={1}
                  onPageChange={() => {}}
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
                    sales={paginatedSales}
                    customers={[]}
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
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    loading={false}
                  />

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Paginator
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
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
          customer={null}
          isOpen={showDetailModal}
          onClose={closeModals}
        />
      )}
      
    </div>
  );
};

export default SalesProducts;
