import { useState, useEffect } from "react";
import SearchProduct from '../../../../shared/Search';
import CreatePurchaseModal from './components/CreatePurchase';
import PurchaseDetailModal from './components/PurchaseDetail';
import PurchasesTable from './components/PurchasesTable';
import LoadingTable from '../../../../shared/components/LoadingTable';
import { formatNumber } from '../../../../shared/utils/formatters';
import productsService from '../products/API/productsService';
import purchasesService from './API/purchasesService';
import suppliersService from '../suppliers/API/suppliersService';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

export default function Shopping() {
  // Estados para productos
  const [products, setProducts] = useState([]);

  // Estados para compras
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para UI
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailCompra, setDetailCompra] = useState(null);
  const [suppliers] = useState([]);

  const { setTitle } = useOutletContext();

  // Cargar compras, proveedores y productos al montar
  useEffect(() => {
    setTitle('Módulo de Compras');
    loadPurchases();
    loadSuppliers();
    loadProducts();
    return () => setTitle('');
  }, [setTitle]);

  // Función para cargar compras
  const loadPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar todas las compras (sin parámetros de paginación)
      const response = await purchasesService.getAll();

      if (response.success) {
        setPurchases(response.data || []);
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
        // suppliers se mantiene como estado local si es necesario
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
  };

  // Filtrar compras localmente
  const filteredPurchases = purchases.filter(purchase => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (purchase.numero_compra || '').toLowerCase().includes(searchLower) ||
      (purchase.proveedor?.nombre || '').toLowerCase().includes(searchLower) ||
      (purchase.estado || '').toLowerCase().includes(searchLower)
    );
  });

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
                <i className="bi bi-plus-circle mr-2"></i> Crear compra
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-700 text-sm px-4 py-2 rounded-lg shadow-md flex items-center"
                onClick={handleDownloadReport}
              >
                <i className="bi bi-file-earmark-excel mr-2"></i>
              </button>
            </div>

            {/* Tabla de compras con loading integrado */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {error && !loading ? (
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
                  purchases={filteredPurchases}
                  onView={setDetailCompra}
                  onAnnul={handleCancelPurchase}
                  loading={loading}
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
    </div>
  );
}
