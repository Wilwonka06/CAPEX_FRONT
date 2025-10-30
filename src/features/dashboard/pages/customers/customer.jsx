import { useState, useEffect } from "react";
import CreateCustomer from "./components/CreateCustomer.jsx";
import EditCustomer from "./components/EditCustomer.jsx";
import ViewCustomer from "./components/ViewCustomer.jsx";
import DeleteCustomer from "./components/DeleteCustomer.jsx";
import { createCustomer } from "./services/CreateCustomerService.js";
import { editCustomer } from "./services/EditCustomerService.js";
import { deleteCustomer } from "./services/DeleteCustomerService.js";
import { toggleCustomerStatus } from "./services/ToggleCustomerStatusService.js";
import { getCustomers } from "./services/CustomerService.js";
import SearchCustomer from "./components/SearchCustomer.jsx";
import Paginator from "../../../../shared/Paginator.jsx";
import { normalizeText } from '../../../../shared/normalizers.js';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import CustomerTable from "./components/CustomerTable.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    setTitle('Gestión de Clientes');
    return () => setTitle('');
  }, [setTitle]);

  // Función para cargar clientes desde el backend
  const loadCustomers = async (page = 1, search = '') => {
    setIsLoadingCustomers(true);
    try {
      const response = await getCustomers(page, itemsPerPage, search);
      setCustomers(response.data || response.customers || []);
      setTotalCustomers(response.total || response.count || 0);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      showMessage('Error al cargar los clientes', 'error');
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
  const showMessage = (text, type = 'success') => {
    if (type === 'success') {
      toast.success(text, { position: 'top-right' });
    } else {
      toast.error(text, { position: 'top-right' });
    }
  };

  // Los clientes ya vienen filtrados del backend, no necesitamos filtrar localmente
  const filteredCustomers = customers;
  
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
      title: '¿Eliminar cliente?',
      text: 'Esta acción eliminará el cliente permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Ejecutar eliminación directamente
        handleDeleteCustomer(customer.id);
      }
    });
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await deleteCustomer(customerId);
      // Recargar la lista de clientes
      await loadCustomers(currentPage, searchTerm);
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      showMessage('Cliente eliminado exitosamente', 'success');
    } catch (error) {
      showMessage(error.message || 'Error al eliminar el cliente', 'error');
    }
  };

  // handleToggleStatus ahora usa el servicio real
  const handleToggleStatus = async (customerId) => {
    try {
      await toggleCustomerStatus(customerId);
      // Recargar la lista de clientes
      await loadCustomers(currentPage, searchTerm);
      showMessage('Estado del cliente actualizado exitosamente', 'success');
    } catch (error) {
      showMessage(error.message || 'Error al cambiar el estado del cliente', 'error');
    }
  };

  // Crear cliente usando servicio
  const handleCreateCustomer = async (formData) => {
    setLoading(true);
    try {
      await createCustomer(formData, customers);
      // Recargar la lista de clientes
      await loadCustomers(currentPage, searchTerm);
      setIsCreateModalOpen(false);
      showMessage('Cliente creado exitosamente', 'success');
    } catch (error) {
      showMessage(error.message || 'Error al crear el cliente', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Editar cliente usando servicio, con confirmación al guardar
  const handleEditCustomer = async (formData) => {
    const result = await Swal.fire({
      title: '¿Guardar cambios?',
      text: '¿Deseas guardar los cambios realizados a este cliente?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await editCustomer({
        id: selectedCustomer.id,
        ...formData,
        status: selectedCustomer.status
      }, customers);
      // Recargar la lista de clientes
      await loadCustomers(currentPage, searchTerm);
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      showMessage('Cliente actualizado exitosamente', 'success');
    } catch (error) {
      showMessage(error.message || 'Error al actualizar el cliente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen p-6 font-inter">
      <ToastContainer />
      {/* Mensaje de feedback */}

      {/* Modal CreateCustomer overlay */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <CreateCustomer
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateCustomer}
            loading={loading}
            setLoading={setLoading}
            customers={customers}
          />
        </div>
      )}

      {/* Modal EditCustomer overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <EditCustomer
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            customer={selectedCustomer}
            onUpdate={handleEditCustomer}
            loading={loading}
            setLoading={setLoading}
            customers={customers}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchCustomer searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar cliente..." />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-text-main hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center text-xs"
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Nuevo Cliente
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {isLoadingCustomers ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando clientes...</span>
                </div>
              ) : (
                <CustomerTable
                  customers={paginatedCustomers}
                  onView={handleViewClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onToggleStatus={handleToggleStatus}
                />
              )}
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

            {/* Mostrar información de paginación */}
            <div className="mt-4 text-center">
              <p className="text-sm text-text-main">
                Mostrando <span className="font-medium">{customers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> a <span className="font-medium">{(currentPage - 1) * itemsPerPage + customers.length}</span> de <span className="font-medium">{totalCustomers}</span> cliente{totalCustomers !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

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