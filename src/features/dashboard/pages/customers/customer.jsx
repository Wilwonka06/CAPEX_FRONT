import { useState, useEffect } from "react";
import CreateCustomer from "./components/CreateCustomer.jsx";
import EditCustomer from "./components/EditCustomer.jsx";
import ViewCustomer from "./components/ViewCustomer.jsx";
import DeleteCustomer from "./components/DeleteCustomer.jsx";
import ChangeCustomerStatus from "./components/ChangeCustomerStatus.jsx";
import { createCustomer } from "./services/CreateCustomerService.js";
import { editCustomer } from "./services/EditCustomerService.js";
import SearchCustomer from "./components/SearchCustomer.jsx";
import Paginator from "./components/Paginator.jsx";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '', show: false });
  const [searchTerm, setSearchTerm] = useState("");

  // Función para mostrar mensajes de feedback
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type, show: true });
    setTimeout(() => {
      setMessage({ text: '', type: '', show: false });
    }, 3000);
  };

  // Filtrado de clientes por búsqueda
  const filteredCustomers = customers.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      // Simulación de eliminación
      await new Promise(resolve => setTimeout(resolve, 500));
      setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== customerId));
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      showMessage('Cliente eliminado exitosamente', 'success');
    } catch (error) {
      showMessage('Error al eliminar el cliente', 'error');
    }
  };

  const handleToggleStatus = async (customerId) => {
    try {
      // Simulación de cambio de estado
      await new Promise(resolve => setTimeout(resolve, 300));
      setCustomers(prevCustomers => prevCustomers.map(customer =>
        customer.id === customerId
          ? { ...customer, status: customer.status === 'Activo' ? 'Inactivo' : 'Activo' }
          : customer
      ));
      const updatedCustomer = customers.find(c => c.id === customerId);
      const newStatus = updatedCustomer.status === 'Activo' ? 'Inactivo' : 'Activo';
      showMessage(`Estado del cliente cambiado a ${newStatus}`, 'success');
    } catch (error) {
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

  // Editar cliente usando servicio
  const handleEditCustomer = async (formData) => {
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Mensaje de feedback */}
      {message.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
            <p className="mt-1">Administra los clientes registrados en el sistema</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchCustomer searchTerm={searchTerm} handleSearch={handleSearch} />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Nuevo Cliente
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tipo Documento</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Número Documento</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Apellido</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Correo Electrónico</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Teléfono</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.documentType}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.documentNumber}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.firstName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.lastName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.email}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.phone}</td>
                      <td className="py-4 px-4">
                        <ChangeCustomerStatus status={customer.status} onToggle={() => handleToggleStatus(customer.id)} />
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors" 
                            title="Ver"
                            onClick={() => handleViewClick(customer)}
                          >
                            <i className="bi bi-eye text-primary text-sm"></i>
                          </button>
                          <button 
                            className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors" 
                            title="Editar"
                            onClick={() => handleEditClick(customer)}
                          >
                            <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                          </button>
                          <button
                            className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
                            title="Eliminar"
                            onClick={() => handleDeleteClick(customer)}
                          >
                            <i className="bi bi-trash text-red-500 text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="mt-6">
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>

            {/* Mostrar información de paginación */}
            <div className="mt-4 text-center">
              <p className="text-sm text-text-main">
                Mostrando <span className="font-medium">{filteredCustomers.length > 0 ? startIndex + 1 : 0}</span> a {" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredCustomers.length)}</span> {" "}
                de <span className="font-medium">{filteredCustomers.length}</span> resultados
              </p>
            </div>
          </div>
        </div>

        <CreateCustomer
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCustomer}
          loading={loading}
          customers={customers}
        />
        <EditCustomer
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customer={selectedCustomer}
          onEdit={handleEditCustomer}
          loading={loading}
          customers={customers}
        />
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