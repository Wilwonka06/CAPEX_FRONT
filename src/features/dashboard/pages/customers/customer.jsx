import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateCustomer from "./components/CreateCustomer.jsx";


const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customers] = useState([
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
  ]);

  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Filtrar clientes basado en la búsqueda
  const filteredCustomers = customers.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calcular páginas
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const toggleStatus = (customerId) => {
    // Aquí iría la lógica para cambiar el estado del cliente
    console.log("Cambiar estado del cliente:", customerId);
  };

  if (showCreateForm) {
    return <CreateCustomer onBack={() => setShowCreateForm(false)} />;
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <i className="bi bi-plus-circle"></i>
          Crear Cliente
        </button>
      </div>

      <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="bi bi-search text-gray-500"></i>
            </span>
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCustomers.map((customer, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.documentType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.documentNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.status === "Activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button className="text-gray-600 hover:text-gray-900" title="Visualizar">
                    <span className="material-icons">visibility</span>
                  </button>
                  <button className="text-blue-600 hover:text-blue-900" title="Editar">
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => toggleStatus(customer.id)}
                    className={`text-${customer.status === "Activo" ? "green" : "red"}-600 hover:text-${customer.status === "Activo" ? "green" : "red"}-900`}
                    title="Cambiar Estado"
                  >
                    <span className="material-icons">{customer.status === "Activo" ? "toggle_on" : "toggle_off"}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(endIndex, filteredCustomers.length)}
            </span>{" "}
            de <span className="font-medium">{filteredCustomers.length}</span> resultados
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="material-icons">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                  ? "bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;