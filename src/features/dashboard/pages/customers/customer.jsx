import { useState, useEffect } from "react";
import CreateCustomer from "./components/CreateCustomer.jsx";
import EditCustomer from "./components/EditCustomer.jsx";
import ViewCustomer from "./components/ViewCustomer.jsx";
import DeleteCustomer from "./components/DeleteCustomer.jsx";
import { createCustomer } from "./services/CreateCustomerService.js";
import { editCustomer } from "./services/EditCustomerService.js";
import SearchCustomer from "./components/SearchCustomer.jsx";
import Paginator from "../../../../shared/Paginator.jsx";
import { normalizeText } from '../../../../shared/normalizers.js';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import CustomerTable from "./components/CustomerTable.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialCustomers = [
  {
    id: 1,
    documentType: "CC",
    documentNumber: "1234567890",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@email.com",
    phone: "3101234567",
    status: "Activo"
  },
  {
    id: 2,
    documentType: "CE",
    documentNumber: "0987654321",
    firstName: "María",
    lastName: "González",
    email: "maria.gonzalez@email.com",
    phone: "3157894561",
    status: "Activo"
  },
  {
    id: 3,
    documentType: "CC",
    documentNumber: "5678901234",
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.rodriguez@email.com",
    phone: "3203216547",
    status: "Inactivo"
  },
  {
    id: 4,
    documentType: "TI",
    documentNumber: "4321098765",
    firstName: "Ana",
    lastName: "Martínez",
    email: "ana.martinez@email.com",
    phone: "3112345678",
    status: "Activo"
  },
  {
    id: 5,
    documentType: "CC",
    documentNumber: "9876543210",
    firstName: "Pedro",
    lastName: "Sánchez",
    email: "pedro.sanchez@email.com",
    phone: "3145678901",
    status: "Activo"
  },
  {
    id: 6,
    documentType: "CE",
    documentNumber: "2345678901",
    firstName: "Laura",
    lastName: "López",
    email: "laura.lopez@email.com",
    phone: "3167890123",
    status: "Inactivo"
  }
];

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

  useEffect(() => {
    setTitle('Gestión de Clientes');
    return () => setTitle('');
  }, [setTitle]);

  // Función para mostrar mensajes de feedback
  const showMessage = (text, type = 'success') => {
    if (type === 'success') {
      toast.success(text, { position: 'top-right' });
    } else {
      toast.error(text, { position: 'top-right' });
    }
  };

  // Filtrado de clientes por búsqueda
  const filteredCustomers = customers.filter((customer) => {
    const term = normalizeText(searchTerm); // The search term is normalized once
    if (!term) return true; // If no term, show all

    // Verificar si el término es un número entero
    const isNumericSearch = /^\d+$/.test(term);
    
    // Si es un número y coincide exactamente con el ID, solo mostrar ese cliente
    if (isNumericSearch) {
      const searchId = parseInt(term, 10);
      // Comparación estricta con el ID convertido a número
      if (searchId === customer.id) {
        return true;
      }
      
      // Si el término es un número pero no coincide exactamente con el ID,
      // no continuar con la búsqueda parcial para IDs
      if (term.length === String(customer.id).length) {
        return false;
      }
    }
    
    // --- CRITICAL FIX HERE: Apply normalizeText to ID and Document Number ---
    const idMatch = normalizeText(customer.id).includes(term); // Pass ID through normalizeText
    const docNumberMatch = normalizeText(customer.documentNumber).includes(term); // Pass Document Number through normalizeText
    // --- END OF CRITICAL FIX ---

    const docTypeMatch = normalizeText(customer.documentType).includes(term);
    const firstNameMatch = normalizeText(customer.firstName).includes(term);
    const lastNameMatch = normalizeText(customer.lastName).includes(term);
    const emailMatch = normalizeText(customer.email).includes(term);
    const phoneMatch = normalizeText(customer.phone).includes(term);
    const estado = normalizeText(customer.status);

    // Keep the strict filter logic if the term matches 'activo', 'inactivo', etc.
    if (["activo", "inactivo", "no activo", "no inactivo"].includes(term)) {
      if (term === "activo") return estado === "activo";
      if (term === "inactivo") return estado === "inactivo";
      if (term === "no activo") return estado === "inactivo";
      if (term === "no inactivo") return estado === "activo";
    }

    // General (partial) search for other text fields
    const estadoMatch = estado.includes(term);
    return idMatch || docTypeMatch || docNumberMatch || firstNameMatch || lastNameMatch || emailMatch || phoneMatch || estadoMatch;
  });

  // Cálculo de paginación basado en clientes filtrados
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  
  // Para paginar los clientes
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

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
      // Simulación de eliminación
      await new Promise(resolve => setTimeout(resolve, 500));
      setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== customerId));
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      showMessage('Cliente eliminado exitosamente', 'success');
    } catch {
      showMessage('Error al eliminar el cliente', 'error');
    }
  };

  // handleToggleStatus ahora solo cambia el estado, sin SweetAlert2
  const handleToggleStatus = async (customerId) => {
    try {
      // Simulación de cambio de estado
      await new Promise(resolve => setTimeout(resolve, 300));
      setCustomers(prevCustomers => prevCustomers.map(customer =>
        customer.id === customerId
          ? { ...customer, status: customer.status === 'Activo' ? 'Inactivo' : 'Activo' }
          : customer
      ));
      const customer = customers.find(c => c.id === customerId);
      const newStatus = customer.status === 'Activo' ? 'Inactivo' : 'Activo';
      showMessage(`Estado del cliente cambiado a ${newStatus}`, 'success');
    } catch {
      showMessage('Error al cambiar el estado del cliente', 'error');
    }
  };

  // Crear cliente usando servicio
  const handleCreateCustomer = async (formData) => {
    setLoading(true);
    try {
      const newCustomer = await createCustomer(formData, customers);
      setCustomers(prev => [...prev, newCustomer]);
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
      const updatedCustomer = await editCustomer({
        id: selectedCustomer.id,
        ...formData,
        status: selectedCustomer.status
      }, customers);
      setCustomers(prev => prev.map(customer => customer.id === updatedCustomer.id ? updatedCustomer : customer));
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
            {/* El título ahora se muestra en el navbar */}
          </div>
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
              <CustomerTable
                customers={paginatedCustomers}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
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

            {/* Mostrar información de paginación */}
            <div className="mt-4 text-center">
              {/* <p className="text-sm text-text-main">
                Mostrando <span className="font-medium">{filteredCustomers.length > 0 ? startIndex + 1 : 0}</span> a <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredCustomers.length)}</span> de <span className="font-medium">{filteredCustomers.length}</span> cliente{filteredCustomers.length !== 1 ? 's' : ''}
              </p> */}
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