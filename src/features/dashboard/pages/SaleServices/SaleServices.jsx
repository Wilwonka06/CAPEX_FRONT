import React, { useState } from "react";
import CreateService from "./components/CreateService";

const SaleServices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [services] = useState([
    {
      id: 1,
      clientName: "Pedro",
      serviceName: "Manicura",
      date: "14/02/2024",
      time: "4:00 PM",
      price: "$10000",
      status: "Pagado"
    },
    {
      id: 2,
      clientName: "Santiago",
      serviceName: "Barbería",
      date: "7/02/2024",
      time: "2:00 PM",
      price: "$10000",
      status: "Pagado"
    },
    {
      id: 3,
      clientName: "Edwin",
      serviceName: "Manicura",
      date: "27/01/2024",
      time: "1:00 PM",
      price: "$10000",
      status: "En ejecución"
    },
    {
      id: 4,
      clientName: "Valeria",
      serviceName: "Corte",
      date: "4/01/2024",
      time: "6:00 PM",
      price: "$10000",
      status: "Pagado"
    }
  ]);

  const itemsPerPage = 5;

  // Filtrar servicios basado en la búsqueda
  const filteredServices = services.filter((service) =>
    Object.values(service).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calcular páginas
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  if (showCreateForm) {
    return <CreateService onBack={() => setShowCreateForm(false)} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Venta de servicios</h1>
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Crear Venta de Servicio
          </button>
        </div>
      </div>

      {/* Lista de servicios */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentServices.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.serviceName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.status === "Pagado"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {service.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button className="text-gray-600 hover:text-gray-900" title="Ver">
                    <span className="material-icons">visibility</span>
                  </button>
                  <button className="text-blue-600 hover:text-blue-900" title="Editar">
                    <span className="material-icons">edit</span>
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Eliminar">
                    <span className="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginador mejorado */}
      <div className="flex flex-col items-center justify-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(endIndex, filteredServices.length)}
            </span>{" "}
            de <span className="font-medium">{filteredServices.length}</span> resultados
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

export default SaleServices;