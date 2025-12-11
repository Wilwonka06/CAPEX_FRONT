import { useState, useEffect } from "react";
import CustomerTable from "./components/CustomerTable";
import SearchCustomer from "../../../../shared/Search";
import CreateCustomer from "./components/CreateCustomer";
import EditCustomer from "./components/EditCustomer";
import CustomerDetail from "./components/CustomerDetail";
import ConfirmStatusChangeModal from "../../../../shared/components/ConfirmStatusChangeModal";
import ConfirmDeleteModal from "../../../../shared/components/ConfirmDeleteModal";
import customersService from "./API/customersService";
import { useOutletContext } from "react-router-dom";
import {
  executeWithToast,
  showError,
} from "../../../../shared/utils/toastHelpers";
import Paginator from "../../../../shared/Paginator";

const CustomersPage = () => {
  // Estados para clientes
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { setTitle } = useOutletContext();

  // Función para cargar clientes
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar todos los clientes (sin parámetros de paginación)
      const response = await customersService.getAll();

      if (response.success) {
        setCustomers(response.data || []);
      } else {
        throw new Error(response.message || "Error al obtener clientes");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes inicialmente
  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    setTitle("Módulo de Clientes");
    return () => setTitle("");
  }, [setTitle]);

  // Filtrar clientes localmente
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.nombre || "").toLowerCase().includes(searchLower) ||
      (customer.documentNumber || "").toLowerCase().includes(searchLower) ||
      (customer.email || "").toLowerCase().includes(searchLower) ||
      (customer.phone || "").toLowerCase().includes(searchLower)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, customers]);
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Función para crear cliente
  const createCustomer = async (customerData) => {
    setLoading(true);
    setError(null);

    try {
      await executeWithToast({
        promiseFn: async () => {
          console.log(
            "CustomersPage: Creating customer with data:",
            customerData
          );
          const response = await customersService.create(customerData);

          if (response.success) {
            await loadCustomers();
            return response.data;
          } else {
            throw new Error(response.message || "Error al crear cliente");
          }
        },
        operation: "create",
        entity: "cliente",
        loadingMessage: "Creando cliente...",
        successMessage: "Cliente creado exitosamente",
      });
    } catch (err) {
      setError(err.message || "Error al crear cliente");
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
          console.log(
            "CustomersPage: Updating customer",
            id,
            "with data:",
            customerData
          );
          const response = await customersService.update(id, customerData);

          if (response.success) {
            await loadCustomers();
            return response.data;
          } else {
            throw new Error(response.message || "Error al actualizar cliente");
          }
        },
        operation: "update",
        entity: "cliente",
        id,
        loadingMessage: "Actualizando cliente...",
        successMessage: "Cliente actualizado exitosamente",
      });
    } catch (err) {
      setError(err.message || "Error al actualizar cliente");
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
            throw new Error(response.message || "Error al eliminar cliente");
          }
        },
        operation: "delete",
        entity: "cliente",
        id,
        loadingMessage: "Eliminando cliente...",
        successMessage: "Cliente eliminado exitosamente",
      });
    } catch (err) {
      setError(err.message || "Error al eliminar cliente");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
      console.error("Error updating customer:", error);
      throw error;
    }
  };

  // Handler para eliminar cliente - muestra modal primero
  const handleDeleteCustomer = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setPendingDelete({ id: customerId, customer });
      setShowDeleteModal(true);
    }
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    try {
      await deleteCustomer(pendingDelete.id);
      setShowDeleteModal(false);
      setPendingDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Función para cambiar estado del cliente - muestra modal primero
  const handleToggleStatus = (customerId) => {
    const current = customers.find((c) => c.id === customerId);
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
    const nextStatus = current?.status === "Activo" ? "Inactivo" : "Activo";

    try {
      await executeWithToast({
        promiseFn: async () => {
          const response = await customersService.changeStatus(
            customerId,
            nextStatus
          );

          if (response.success) {
            await loadCustomers();
            return response;
          }
          throw new Error("Error al cambiar estado");
        },
        operation: "update",
        entity: "cliente",
        id: customerId,
        loadingMessage: "Cambiando estado...",
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
                      <h3 className="text-sm font-medium text-red-800">
                        Error al cargar clientes
                      </h3>
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
                <>
                  <CustomerTable
                    customers={pageCustomers}
                    onView={handleViewCustomer}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteCustomer}
                    onToggleStatus={handleToggleStatus}
                    loading={isInitialLoading}
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

      {/* Modal de Crear Cliente */}
      {isCreateModalOpen && (
        <CreateCustomer
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={async () => {
            await loadCustomers();
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
            await loadCustomers();
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
          isActivating={pendingStatusChange.current.status === "Inactivo"}
          itemName={
            pendingStatusChange.current.nombre ||
            pendingStatusChange.current.firstName ||
            "este cliente"
          }
          loading={false}
        />
      )}

      {/* Modal de confirmación de eliminación */}
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
          itemName={
            pendingDelete.customer.nombre || pendingDelete.customer.firstName
          }
          entityType="cliente"
          loading={deletingId === pendingDelete.id}
        />
      )}
    </div>
  );
};

export default CustomersPage;
