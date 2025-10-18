import { useState, useEffect } from 'react';
import productsService from '../products/API/productsService';
import Search from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateSaleModal from './components/CreateSaleModal';
import SaleDetailModal from './components/SaleDetailModal';
import SalesTable from './components/SalesTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

// Mock de clientes (idéntico a customers)
const customersMock = [
  { id: 1, documentType: "CC", documentNumber: "1234567890", firstName: "Juan", lastName: "Pérez", email: "juan.perez@email.com", phone: "3101234567", address: "Calle 1 #2-3", status: "Activo" },
  { id: 2, documentType: "CE", documentNumber: "0987654321", firstName: "María", lastName: "González", email: "maria.gonzalez@email.com", phone: "3157894561", address: "Carrera 4 #5-6", status: "Activo" },
  { id: 3, documentType: "CC", documentNumber: "5678901234", firstName: "Carlos", lastName: "Rodríguez", email: "carlos.rodriguez@email.com", phone: "3203216547", address: "Av. 7 #8-9", status: "Inactivo" },
  { id: 4, documentType: "TI", documentNumber: "4321098765", firstName: "Ana", lastName: "Martínez", email: "ana.martinez@email.com", phone: "3112345678", address: "Calle 10 #11-12", status: "Activo" },
  { id: 5, documentType: "CC", documentNumber: "9876543210", firstName: "Pedro", lastName: "Sánchez", email: "pedro.sanchez@email.com", phone: "3145678901", address: "Carrera 13 #14-15", status: "Activo" },
  { id: 6, documentType: "CE", documentNumber: "2345678901", firstName: "Laura", lastName: "López", email: "laura.lopez@email.com", phone: "3167890123", address: "Av. 16 #17-18", status: "Inactivo" },
];

const SalesProducts = () => {
  const { sales, createSale, updateSale, deleteSale, loading } = useSales();

  // Estado para productos
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filteredSales, setFilteredSales] = useState([]);
  const { setTitle } = useOutletContext();

  // Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await productsService.getAll({ limit: 100 });
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const itemsPerPage = 5;

  // Filtrar ventas por término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSales(sales);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    setFilteredSales(
      sales.filter(sale => {
        const cliente = customersMock.find(c => c.id === sale.clienteId);
        const clienteNombre = cliente ? `${cliente.firstName} ${cliente.lastName}`.toLowerCase() : '';
        return (
          (sale.id?.toString() || '').includes(lowerTerm) ||
          ((sale.numeroVenta || '').toLowerCase().includes(lowerTerm)) ||
          clienteNombre.includes(lowerTerm) ||
          ((sale.status || sale.estado || '').toLowerCase().includes(lowerTerm)) ||
          ((sale.date || sale.fecha || '').toLowerCase().includes(lowerTerm)) ||
          (sale.total?.toString() || sale.valor?.toString() || '').includes(lowerTerm) ||
          ((sale.metodoPago || '').toLowerCase().includes(lowerTerm))
        );
      })
    );
  }, [searchTerm, sales]);

  // Paginación
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateSale = (saleData) => {
    try {
      createSale(saleData);
      setShowCreateModal(false);
      toast.success('Venta registrada exitosamente', { position: 'top-right' });
    } catch {
      toast.error('Error al registrar la venta', { position: 'top-right' });
    }
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleEditSale = async (saleId, saleData) => {
    const result = await Swal.fire({
      title: '¿Confirmar edición?',
      text: `¿Estás seguro de que deseas editar la venta #${saleId}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        updateSale(saleId, saleData);
        setShowDetailModal(false);
        setSelectedSale(null);
        toast.success('Venta actualizada exitosamente', { position: 'top-right' });
      } catch {
        toast.error('Error al actualizar la venta', { position: 'top-right' });
      }
    }
  };

  const handleDeleteSale = async (saleId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas anular la venta #${saleId}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        updateSale(saleId, { estado: 'Cancelada' });
        toast.success('Venta cancelada exitosamente', { position: 'top-right' });
      } catch {
        toast.error('Error al cancelar la venta', { position: 'top-right' });
      }
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedSale(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    setTitle('Venta de Productos');
    return () => setTitle('');
  }, [setTitle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* El título ahora se muestra en el navbar */}
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Search searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar ventas de productos" />
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-plus-circle mr-2"></i> Nueva venta
              </button>
            </div>

            {/* Tabla de ventas */}
            <SalesTable
              sales={paginatedSales}
              customers={customersMock}
              onView={handleViewSale}
              onAnnul={handleDeleteSale}
              onDownload={() => {
                // Función para descargar factura
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

            {/* Información de paginación */}
            <div className="mt-4 text-center text-sm text-gray-600">
{/*               Mostrando {Math.min(filteredSales.length, startIndex + 1)} a {Math.min(filteredSales.length, startIndex + itemsPerPage)} de {filteredSales.length} ventas.
 */}            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateSaleModal
          onClose={closeModals}
          onCreate={handleCreateSale}
          customers={customersMock}
          products={products}
          isOpen={showCreateModal}
        />
      )}
      {showDetailModal && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          customer={customersMock.find(c => c.id === selectedSale.clienteId)}
          isOpen={showDetailModal}
          onClose={closeModals}
          onEdit={handleEditSale}
          onDelete={handleDeleteSale}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default SalesProducts;

export { customersMock };