import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateCustomer from "./components/CreateCustomer.jsx";
import EditCustomer from "./components/EditCustomer.jsx";
import ViewCustomer from "./components/ViewCustomer.jsx";
import DeleteCustomer from "./components/DeleteCustomer.jsx";
import ChangeCustomerStatus from "./components/ChangeCustomerStatus.jsx";
import { createCustomer } from "./services/CreateCustomerService.js";
import { editCustomer } from "./services/EditCustomerService.js";
import SearchCustomer from "./components/SearchCustomer";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customers, setCustomers] = useState(initialCustomers);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Filtrar clientes basado en la búsqueda
  const filteredCustomers = customers.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calcular páginas
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

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

  const handleDeleteCustomer = (customerId) => {
    setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== customerId));
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  const toggleStatus = (customerId) => {
    setCustomers(prevCustomers => prevCustomers.map(customer =>
      customer.id === customerId
        ? { ...customer, status: customer.status === 'Activo' ? 'Inactivo' : 'Activo' }
        : customer
    ));
  };

  // Crear cliente usando servicio
  const handleCreateCustomer = async (formData) => {
    setLoading(true);
    try {
      const newCustomer = await createCustomer(formData, customers);
      setCustomers(prev => [...prev, newCustomer]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      // Aquí podrías mostrar un toast o notificación de error
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
      });
      setCustomers(prev => prev.map(customer => customer.id === updatedCustomer.id ? updatedCustomer : customer));
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error al editar cliente:', error);
      // Aquí podrías mostrar un toast o notificación de error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (showCreateForm) {
    return <CreateCustomer onBack={() => setShowCreateForm(false)} onCreate={handleCreateCustomer} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-text-main">Gestión de Clientes</h1>
              <p className="mt-1 text-text-main/80">Administra los clientes registrados en el sistema</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-dark hover:bg-primary text-white px-4 py-2 rounded-lg transition-colors"
            >
              Crear Cliente
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchCustomer searchTerm={searchTerm} handleSearch={handleSearch} />
            </div>
            <div className="w-full overflow-x-auto">
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
                  {currentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.documentType}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.documentNumber}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.firstName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.lastName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.email}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{customer.phone}</td>
                      <td className="py-4 px-4">
                        <ChangeCustomerStatus status={customer.status} onToggle={() => toggleStatus(customer.id)} />
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
            <div className="mt-6 flex flex-col items-center justify-center">
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-primary-dark hover:bg-accent-light focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                      ? "bg-primary-dark text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
                      : "text-text-main ring-1 ring-inset ring-primary-dark hover:bg-accent-light focus:z-20 focus:outline-offset-0"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-primary-dark hover:bg-accent-light focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </nav>
              <div className="mt-4 text-center">
                <p className="text-sm text-text-main">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a {" "}
                  <span className="font-medium">{Math.min(endIndex, filteredCustomers.length)}</span> {" "}
                  de <span className="font-medium">{filteredCustomers.length}</span> resultados
                </p>
              </div>
            </div>
          </div>
        </div>

        <EditCustomer
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customer={selectedCustomer}
          onEdit={handleEditCustomer}
          loading={loading}
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