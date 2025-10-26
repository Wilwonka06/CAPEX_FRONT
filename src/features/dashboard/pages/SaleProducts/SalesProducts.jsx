// src/features/dashboard/pages/SaleProducts/SalesProducts.jsx
import { useState, useEffect } from 'react';
import productsService from '../products/API/productsService';
import salesService from './API/salesService';
import Search from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateSaleModal from './components/CreateSaleModal';
import SaleDetailModal from './components/SaleDetailModal';
import SalesTable from './components/SalesTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  // Estado para clientes (puedes reemplazar con API real más adelante)
  const [customers, setCustomers] = useState([]);

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
        // Transformar datos del backend al formato frontend
        const transformedSales = (response.data || []).map(venta => ({
          id: venta.id_venta_producto,
          numeroVenta: `VEN-${venta.id_venta_producto.toString().padStart(6, '0')}`,
          fecha: venta.fecha,
          clienteId: venta.id_usuario,
          valor: parseFloat(venta.total || 0),
          estado: venta.estado,
          metodoPago: 'No especificado', // Agregar al backend si es necesario
          productos: (venta.detalles || []).map(det => ({
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            precio: parseFloat(det.precio_unitario || 0)
          }))
        }));

        setSales(transformedSales);
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
    try {
      setLoading(true);

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
        toast.success('Venta registrada exitosamente', { position: 'top-right' });
        await loadSales(); // Recargar lista
      } else {
        throw new Error(response.message || 'Error al crear la venta');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error(error.message || 'Error al registrar la venta', { position: 'top-right' });
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
      try {
        setLoading(true);
        
        const response = await salesService.changeStatus(saleId, 'Cancelado');
        
        if (response.success) {
          toast.success('Venta cancelada exitosamente', { position: 'top-right' });
          await loadSales(); // Recargar lista
        } else {
          throw new Error(response.message || 'Error al cancelar la venta');
        }
      } catch (error) {
        console.error('Error canceling sale:', error);
        toast.error(error.message || 'Error al cancelar la venta', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedSale(null);
  };

  // ===== RENDER =====
  if (loading && sales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  if (error && sales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <i className="bi bi-exclamation-triangle text-red-500 text-4xl"></i>
            <p className="mt-4 text-red-800 font-semibold">{error}</p>
            <button
              onClick={loadSales}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            </div>

            {/* Tabla de ventas */}
            {filteredSales.length === 0 ? (
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
                  customers={customers}
                  onView={handleViewSale}
                  onAnnul={handleDeleteSale}
                  onDownload={() => {
                    toast.info('Función de descarga en desarrollo', { position: 'top-right' });
                  }}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
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

      {/* Modales */}
      {showCreateModal && (
        <CreateSaleModal
          onClose={closeModals}
          onCreate={handleCreateSale}
          customers={customers}
          products={products}
          isOpen={showCreateModal}
        />
      )}
      
      {showDetailModal && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          customer={customers.find(c => c.id === selectedSale.clienteId)}
          isOpen={showDetailModal}
          onClose={closeModals}
        />
      )}
      
      <ToastContainer />
    </div>
  );
};

export default SalesProducts;