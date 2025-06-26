import { useState } from "react";
import { Link } from "react-router-dom";
import CreateRole from "./components/CreateRole";
import EditRole from "./components/EditRole";
import Paginator from "./components/Paginator";



const RolesPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // Esto debería venir de tu backend

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Aquí deberías hacer la llamada a tu API para obtener los datos de la página seleccionada
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-black">Gestión de Roles</h1>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Crear Nuevo Rol
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Fila de ejemplo 1 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Administrador</td>
                <td className="px-6 py-4 text-sm text-gray-500">Control total del sistema</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button className="text-gray-600 hover:text-gray-900" title="Visualizar">
                    <span className="material-icons">visibility</span>
                  </button>
                  <button 
                    className="text-blue-600 hover:text-blue-900" 
                    title="Editar"
                    onClick={() => handleEditClick({
                      id: 1,
                      name: 'Administrador',
                      description: 'Control total del sistema'
                    })}
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button className="text-green-600 hover:text-green-900" title="Cambiar Estado">
                    <span className="material-icons">toggle_on</span>
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Eliminar">
                    <span className="material-icons">delete</span>
                  </button>
                </td>
              </tr>

              {/* Fila de ejemplo 2 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Editor</td>
                <td className="px-6 py-4 text-sm text-gray-500">Gestión de contenido</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button className="text-gray-600 hover:text-gray-900" title="Visualizar">
                    <span className="material-icons">visibility</span>
                  </button>
                  <button className="text-blue-600 hover:text-blue-900" title="Editar">
                    <span className="material-icons">edit</span>
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Cambiar Estado">
                    <span className="material-icons">toggle_off</span>
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Eliminar">
                    <span className="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-col items-center justify-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a{" "}
                <span className="font-medium">{Math.min(5, totalPages * 5)}</span>{" "}
                de <span className="font-medium">{totalPages * 5}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                      ? "bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        <CreateRole 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
        <EditRole 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          role={selectedRole}
        />
      </div>
    </div>
  );
};

export default RolesPage;
  