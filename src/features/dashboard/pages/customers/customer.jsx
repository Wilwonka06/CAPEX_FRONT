import { useState, useEffect } from "react";
import CreateCustomer from "./components/CreateCustomer.jsx";
import EditCustomer from "./components/EditCustomer.jsx";
import ViewCustomer from "./components/ViewCustomer.jsx";
import DeleteCustomer from "./components/DeleteCustomer.jsx";
import customersService from "./API/customersService.js";
import Paginator from "../../../../shared/Paginator.jsx";
import Swal from "sweetalert2";
import { useOutletContext } from "react-router-dom";
import CustomerTable from "./components/CustomerTable.jsx";
import toast from "react-hot-toast";

// Datos iniciales vacíos - se cargarán desde el backend
const initialCustomers = [];

const itemsPerPage = 5;

const CustomersPage = () => {
  const { setTitle } = useOutletContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  useEffect(() => {
    setTitle("Gestión de Clientes");
    return () => setTitle("");
  }, [setTitle]);

  // Función para cargar clientes desde el backend
  const loadCustomers = async (page = 1, search = "") => {
    setIsLoadingCustomers(true);
    try {
      const response = await customersService.getAll({ page, limit: itemsPerPage, search });
      setCustomers(response.data || []);
      setTotalCustomers(response.total || response.pagination?.total || 0);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      showMessage("Error al cargar los clientes", "error");
      setCustomers([]);
      setTotalCustomers(0);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadCustomers(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  // Función para mostrar mensajes de feedback
  const showMessage = (text, type = "success") => {
    if (type === "success") {
      toast.success(text);
    } else {
      toast.error(text);
    }
  };

  // Los clientes ya vienen filtrados del backend

  // Cálculo de paginación basado en el total del backend
  const totalPages = Math.max(1, Math.ceil(totalCustomers / itemsPerPage));

  // Los clientes ya vienen paginados del backend
  const paginatedCustomers = customers;

  // Ajusta currentPage si es mayor que totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [customers, totalPages, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // handleEditClick ahora abre el modal directamente
  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  // handleDeleteClick ahora solo usa SweetAlert2
  const handleDeleteClick = (customer) => {
    Swal.fire({
      title: "¿Eliminar cliente?",
      text: "Esta acción eliminará el cliente permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Ejecutar eliminación directamente
        handleDeleteCustomer(customer.id);
      }
    });
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await customersService.delete(customerId);
      // Recargar la lista de clientes
      await loadCustomers(currentPage, searchTerm);
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      showMessage("Cliente eliminado exitosamente", "success");
    } catch (error) {
      showMessage(error.message || "Error al eliminar el cliente", "error");
    }
  };

  // handleToggleStatus ahora usa el servicio real
  const handleToggleStatus = async (customerId) => {
    try {
      // Por defecto, alternar entre 'Activo' e 'Inactivo'
      const current = customers.find(c => c.id === customerId)?.status || 'Activo';
      const next = current === 'Activo' ? 'Inactivo' : 'Activo';
      await customersService.changeStatus(customerId, next);
      // Recargar la lista de clientes
      await loadCustomers(currentPage, searchTerm);
      showMessage("Estado del cliente actualizado exitosamente", "success");
    } catch (error) {
      showMessage(
        error.message || "Error al cambiar el estado del cliente",
        "error"
      );
    }
  };

  // Crear cliente usando servicio
  const handleCreateCustomer = async (formData) => {
    setLoading(true);
    try {
      await customersService.create(formData);
      // Recargar la lista de clientes
      await loadCustomers(currentPage, searchTerm);
      setIsCreateModalOpen(false);
      showMessage("Cliente creado exitosamente", "success");
    } catch (error) {
      showMessage(error.message || "Error al crear el cliente", "error");
    } finally {
      setLoading(false);
    }
  };

  // Editar cliente usando servicio, con confirmación al guardar
  const handleEditCustomer = async (formData) => {
    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "¿Deseas guardar los cambios realizados a este cliente?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await customersService.update(selectedCustomer.id, { ...formData, status: selectedCustomer.status });
      // Recargar la lista de clientes
      await loadCustomers(currentPage, searchTerm);
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      showMessage("Cliente actualizado exitosamente", "success");
    } catch (error) {
      showMessage(error.message || "Error al actualizar el cliente", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative w-full flex-1">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <input
                  type="text"
                  placeholder="Buscar por nombre, documento, correo, teléfono o estado..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-text-main hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center text-xs whitespace-nowrap"
              >
                <i className="bi bi-plus-circle mr-2"></i> Crear Cliente
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <CustomerTable
                customers={paginatedCustomers}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
                loading={isLoadingCustomers}
              />
            </div>

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
          </div>
        </div>

        {/* Modal CreateCustomer overlay */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <CreateCustomer
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={() => {
                loadCustomers(currentPage, searchTerm);
                showMessage("Cliente creado exitosamente", "success");
              }}
              customers={customers}
            />
          </div>
        )}

        {/* Modal EditCustomer overlay */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <EditCustomer
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              customer={selectedCustomer}
              onSuccess={() => {
                loadCustomers(currentPage, searchTerm);
                setSelectedCustomer(null);
                showMessage("Cliente actualizado exitosamente", "success");
              }}
              customers={customers}
            />
          </div>
        )}

        <ViewCustomer
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          customer={selectedCustomer}
        />
        <DeleteCustomer
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteCustomer}
          customer={selectedCustomer}
        />
      </div>
    </div>
  );
};

export default CustomersPage;
