import { useState, useEffect } from "react";
import CustomerTable from "./components/CustomerTable";
import SearchCustomer from '../../../../shared/Search';
import Paginator from '../../../../shared/Paginator';
import CreateCustomer from "./components/CreateCustomer";
import EditCustomer from "./components/EditCustomer";
import CustomerDetail from "./components/CustomerDetail";
import customersService from "./API/customersService";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

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

  // Función para crear cliente - NUEVA IMPLEMENTACIÓN
  const createCustomer = async (customerData) => {
    setLoading(true);
    setError(null);

    const customerPromise = (async () => {
      console.log('CustomersPage: Creating customer with data:', customerData);
      const response = await customersService.create(customerData);

      if (response.success) {
        // Resetear a primera página para que el nuevo cliente sea visible
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
    })();

    // Descartar toasts duplicados
    toast.dismiss('create-customer');
    
    const loadingToastId = toast.loading('Creando cliente...', { id: 'create-customer' });
    
    customerPromise
      .then(() => {
        toast.dismiss(loadingToastId);
        toast.success('Cliente creado exitosamente', { id: 'create-customer' });
      })
      .catch((err) => {
        toast.dismiss(loadingToastId);
        const errorMessage = err.response?.data?.message || err.message || 'Error al crear el cliente';
        const validationErrors = err.response?.data?.errors;

        setError(errorMessage);
        console.error('Error creating customer:', err);
        console.error('Validation errors:', validationErrors);

        let finalErrorMessage = errorMessage;
        if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
          finalErrorMessage = validationErrors[0].message || validationErrors[0] || errorMessage;
        }
        toast.error(finalErrorMessage, { id: 'create-customer' });
      });

    try {
      return await customerPromise;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar cliente - NUEVA IMPLEMENTACIÓN
  const updateCustomer = async (id, customerData) => {
    setLoading(true);
    setError(null);

    const customerPromise = (async () => {
      console.log('CustomersPage: Updating customer', id, 'with data:', customerData);
      const response = await customersService.update(id, customerData);

      if (response.success) {
        await loadCustomers(queryParams);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar cliente');
      }
    })();

    const updateToastId = `update-customer-${id}`;
    toast.dismiss(updateToastId);
    
    const loadingToastId = toast.loading('Actualizando cliente...', { id: updateToastId });
    
    customerPromise
      .then(() => {
        toast.dismiss(loadingToastId);
        toast.success('Cliente actualizado exitosamente', { id: updateToastId });
      })
      .catch((err) => {
        toast.dismiss(loadingToastId);
        const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar el cliente';
        const validationErrors = err.response?.data?.errors;

        setError(errorMessage);
        console.error('Error updating customer:', err);
        console.error('Validation errors:', validationErrors);

        let finalErrorMessage = errorMessage;
        if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
          finalErrorMessage = validationErrors[0].message || validationErrors[0] || errorMessage;
        }
        toast.error(finalErrorMessage, { id: updateToastId });
      });

    try {
      return await customerPromise;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar cliente - NUEVA IMPLEMENTACIÓN (sin modal separado)
  const deleteCustomer = async (id) => {
    setLoading(true);
    setError(null);

    const customerPromise = (async () => {
      const response = await customersService.delete(id);

      if (response.success) {
        await loadCustomers(); // Recargar lista
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar cliente');
      }
    })();

    const deleteToastId = `delete-customer-${id}`;
    toast.dismiss(deleteToastId);
    
    const loadingToastId = toast.loading('Eliminando cliente...', { id: deleteToastId });
    
    customerPromise
      .then(() => {
        toast.dismiss(loadingToastId);
        toast.success('Cliente eliminado exitosamente', { id: deleteToastId });
      })
      .catch((err) => {
        toast.dismiss(loadingToastId);
        const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar cliente';
        setError(errorMessage);
        toast.error(errorMessage, { id: deleteToastId });
      });

    try {
      return await customerPromise;
    } catch (err) {
      setLoading(false);
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

  // Función para cambiar estado del cliente
  const handleToggleStatus = async (customerId) => {
    try {
      const current = customers.find(c => c.id === customerId);
      const nextStatus = current?.status === 'Activo' ? 'Inactivo' : 'Activo';
      
      const response = await customersService.changeStatus(customerId, nextStatus);
      
      if (response.success) {
        await loadCustomers(queryParams);
        toast.success(`Estado cambiado a ${nextStatus}`);
      }
    } catch (error) {
      console.error('Error changing customer status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al cambiar el estado';
      toast.error(errorMessage);
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
    </div>
  );
};

export default CustomersPage;