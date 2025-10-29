import { useState, useEffect } from "react";
import SearchProduct from '../../../../shared/Search';
import CreatePurchaseModal from './components/CreatePurchaseModal';
import PurchaseDetailModal from './components/PurchaseDetailModal';
import PurchasesTable from './components/PurchasesTable';
import LoadingTable from '../../../../shared/components/LoadingTable';
import productsService from '../products/API/productsService';
import purchasesService from './API/purchasesService';
import suppliersService from '../suppliers/API/suppliersService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

export default function Shopping() {
  // Estados para productos
  const [products, setProducts] = useState([]);

  // Estados para compras
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Estados para UI
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailCompra, setDetailCompra] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  const { setTitle } = useOutletContext();

  // Cargar compras, proveedores y productos al montar
  useEffect(() => {
    setTitle('Gestión de Compras');
    loadPurchases();
    loadSuppliers();
    loadProducts();
    return () => setTitle('');
  }, [setTitle]);

  // Función para cargar compras
  const loadPurchases = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.getAll({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm,
        ...params,
      });

      if (response.success) {
        setPurchases(response.data || []);
        setPagination({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0,
          itemsPerPage: response.pagination?.itemsPerPage || 10,
        });
      } else {
        throw new Error(response.message || 'Error al cargar compras');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar proveedores
  const loadSuppliers = async () => {
    try {
      const response = await suppliersService.getActive();
      if (response.success) {
        setSuppliers(response.data || []);
      }
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  // Función para cargar productos
  const loadProducts = async () => {
    try {
      const response = await productsService.getAll({ limit: 100 });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  // Función para manejar búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    loadPurchases({ search: term, page: 1 });
  };

  // Función para cambiar página
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    loadPurchases({ page });
  };

  // Descargar reporte de compras
  const handleDownloadReport = async () => {
    try {
      await purchasesService.generateReport({
        format: 'excel',
        startDate: '2024-01-01',
        endDate: new Date().toISOString().split('T')[0],
      });

      // El servicio ya maneja la descarga del archivo
      console.log('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  // Función para cancelar compra con confirmación
  const handleCancelPurchase = async (id) => {
    const compra = purchases.find(c => c.id === id);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas cancelar la compra #${compra?.id}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await purchasesService.cancel(id, 'Cancelada por usuario');
        await loadPurchases(); // Recargar lista
      } catch (error) {
        console.error('Error canceling purchase:', error);
      }
    }
  };

  // Función para crear una nueva compra
  const handleCreatePurchase = async (newPurchase) => {
    try {
      await purchasesService.create(newPurchase);
      setIsCreateOpen(false);
      await loadPurchases(); // Recargar lista
    } catch (error) {
      console.error('Error creating purchase:', error);
    }
  };

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* El título ahora se muestra en el navbar */}
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct
                searchTerm={searchTerm}
                handleSearch={(e) => handleSearch(e.target.value)}
                placeholder="Buscar compras..."
              />
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center"
                onClick={() => setIsCreateOpen(true)}
              >
                <i className="bi bi-plus-circle mr-2"></i> Registrar compra
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-md flex items-center"
                onClick={handleDownloadReport}
              >
                <i className="bi bi-file-earmark-excel mr-2"></i>
                Generar Reporte
              </button>
            </div>

            {/* Tabla de compras con loading integrado */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {loading ? (
                <LoadingTable message="Cargando compras..." />
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="bi bi-exclamation-triangle text-red-400"></i>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error al cargar compras</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <button
                        onClick={() => loadPurchases()}
                        className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <PurchasesTable
                  purchases={purchases}
                  onView={setDetailCompra}
                  onAnnul={handleCancelPurchase}
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal de crear compra */}
      <CreatePurchaseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreatePurchase}
        products={products}
      />
      {/* Modal de detalle de compra */}
      <PurchaseDetailModal 
        compra={detailCompra} 
        isOpen={!!detailCompra} 
        onClose={() => setDetailCompra(null)} 
      />
      <ToastContainer />
    </div>
  );
}
