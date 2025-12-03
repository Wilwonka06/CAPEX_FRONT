import { useState, useEffect } from "react";
import CustomerTable from "./components/CustomerTable";
import SearchCustomer from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateCustomer from "./components/CreateCustomer";
import EditCustomer from "./components/EditCustomer";
import CustomerDetail from "./components/CustomerDetail";
import ConfirmStatusChangeModal from '../../../../shared/components/ConfirmStatusChangeModal';
import customersService from "./API/customersService";
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';

const CustomersPage = () => {
  // Estados para clientes
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { setTitle } = useOutletContext();

  // Función para cargar clientes
  const loadCustomers = async (params = queryParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.getAll(params);

      if (response.success) {
        setCustomers(response.data || []);
        setPagination({
          currentPage: response.page || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.total || 0,
          itemsPerPage: response.limit || 10,
        });
      } else {
        throw new Error(response.message || 'Error al obtener clientes');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes inicialmente
  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    setTitle('Módulo de Clientes');
    return () => setTitle('');
  }, [setTitle]);

  // Función para buscar clientes
  const searchCustomers = async (searchTerm, filters = {}) => {
    const searchParams = {
      ...queryParams,
      search: searchTerm,
      page: 1, // Resetear a primera página
      ...filters,
    };

    setQueryParams(searchParams);
    await loadCustomers(searchParams);
  };

  // Función para limpiar filtros
  const clearFilters = async () => {
    const newParams = { page: 1, limit: queryParams.limit };
    setQueryParams(newParams);
    await loadCustomers(newParams);
  };

  // Función para crear cliente
  const createCustomer = async (customerData) => {
    setLoading(true);
    setError(null);

    try {
      await executeWithToast({
        promiseFn: async () => {
          console.log('CustomersPage: Creating customer with data:', customerData);
          const response = await customersService.create(customerData);

          if (response.success) {
            const refreshParams = {
              page: 1,
              limit: queryParams.limit || 10,
            };
            setQueryParams(refreshParams);
            await loadCustomers(refreshParams);
            return response.data;
          } else {
            throw new Error(response.message || 'Error al crear cliente');
          }
        },
        operation: 'create',
        entity: 'cliente',
        loadingMessage: 'Creando cliente...',
        successMessage: 'Cliente creado exitosamente',
      });
    } catch (err) {
      setError(err.message || 'Error al crear cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar cliente
  const updateCustomer = async (id, customerData) => {
    setLoading(true);
    setError(null);

    try {
      await executeWithToast({
        promiseFn: async () => {
          console.log('CustomersPage: Updating customer', id, 'with data:', customerData);
          const response = await customersService.update(id, customerData);

          if (response.success) {
            await loadCustomers(queryParams);
            return response.data;
          } else {
            throw new Error(response.message || 'Error al actualizar cliente');
          }
        },
        operation: 'update',
        entity: 'cliente',
        id,
        loadingMessage: 'Actualizando cliente...',
        successMessage: 'Cliente actualizado exitosamente',
      });
    } catch (err) {
      setError(err.message || 'Error al actualizar cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar cliente
  const deleteCustomer = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await executeWithToast({
        promiseFn: async () => {
          const response = await customersService.delete(id);

          if (response.success) {
            await loadCustomers();
            return true;
          } else {
            throw new Error(response.message || 'Error al eliminar cliente');
          }
        },
        operation: 'delete',
        entity: 'cliente',
        id,
        loadingMessage: 'Eliminando cliente...',
        successMessage: 'Cliente eliminado exitosamente',
      });
    } catch (err) {
      setError(err.message || 'Error al eliminar cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar página
  const changePage = async (page) => {
    const newParams = { ...queryParams, page };
    setQueryParams(newParams);
    await loadCustomers(newParams);
  };

  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      searchCustomers(term.trim());
    } else {
      clearFilters();
    }
  };

  // Función para crear un nuevo cliente
  const handleCreateCustomer = async () => {
    setIsCreateModalOpen(false);
    // La creación se maneja desde CreateCustomer mediante onSuccess
  };

  // Función para ver detalles de un cliente
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  // Función para editar un cliente (abre el modal)
  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  // Función para editar un cliente (sin confirmación, para usar desde EditCustomer)
  const handleEditCustomer = async (id, customerData) => {
    try {
      await updateCustomer(id, customerData);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  // Función para eliminar un cliente con confirmación
  const handleDeleteCustomer = async (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar al cliente "${customer?.nombre || customer?.firstName}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteCustomer(customerId);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  // Función para cambiar estado del cliente - muestra modal primero
  const handleToggleStatus = (customerId) => {
    const current = customers.find(c => c.id === customerId);
    if (!current) {
      showError("Cliente no encontrado");
      return;
    }
    setPendingStatusChange({ customerId, current });
    setShowStatusModal(true);
  };

  // Función para confirmar cambio de estado
  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { customerId, current } = pendingStatusChange;
    const nextStatus = current?.status === 'Activo' ? 'Inactivo' : 'Activo';
    
    try {
      await executeWithToast({
        promiseFn: async () => {
          const response = await customersService.changeStatus(customerId, nextStatus);
          
          if (response.success) {
            await loadCustomers(queryParams);
            return response;
          }
          throw new Error('Error al cambiar estado');
        },
        operation: 'update',
        entity: 'cliente',
        id: customerId,
        loadingMessage: 'Cambiando estado...',
        successMessage: `Estado cambiado a ${nextStatus} exitosamente`,
        onSuccess: () => {
          setShowStatusModal(false);
          setPendingStatusChange(null);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
  };

  // Función para cambiar página
  const handlePageChange = (page) => {
    changePage(page);
  };

  // Estado de carga inicial
  const isInitialLoading = loading && customers.length === 0;
  const hasError = error && customers.length === 0;

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchCustomer 
                searchTerm={searchTerm} 
                handleSearch={handleSearch}
                placeholder="Buscar clientes..." 
              />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Crear Cliente
              </button>
            </div>

            {/* Tabla de clientes */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {hasError && !isInitialLoading ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="bi bi-exclamation-triangle text-red-400"></i>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error al cargar clientes</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <button
                        onClick={() => loadCustomers()}
                        className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <CustomerTable
                  customers={customers}
                  onView={handleViewCustomer}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteCustomer}
                  onToggleStatus={handleToggleStatus}
                  loading={isInitialLoading}
                />
              )}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <Paginator
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Crear Cliente */}
      {isCreateModalOpen && (
        <CreateCustomer
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={async () => {
            await loadCustomers({ page: 1, limit: queryParams.limit });
            setIsCreateModalOpen(false);
          }}
          customers={customers}
        />
      )}

      {/* Modal de Ver Detalles */}
      {isViewModalOpen && selectedCustomer && (
        <CustomerDetail
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
        />
      )}

      {/* Modal de Editar Cliente */}
      {isEditModalOpen && selectedCustomer && (
        <EditCustomer
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCustomer(null);
          }}
          onSuccess={async () => {
            await loadCustomers(queryParams);
            setIsEditModalOpen(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
          customers={customers}
        />
      )}

      {/* Modal de confirmación de cambio de estado */}
      {showStatusModal && pendingStatusChange && (
        <ConfirmStatusChangeModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setPendingStatusChange(null);
          }}
          onConfirm={handleConfirmStatusChange}
          isActivating={pendingStatusChange.current.status === 'Inactivo'}
          itemName={pendingStatusChange.current.nombre || pendingStatusChange.current.firstName || 'este cliente'}
          loading={false}
        />
      )}
    </div>
  );
};

export default CustomersPage;