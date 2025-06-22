import { useState } from "react";
import { Link } from "react-router-dom";
import CreateRole from "./components/CreateRole";
import Paginator from "../../components/roles/Paginator";

const RolesPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // Esto debería venir de tu backend

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Aquí deberías hacer la llamada a tu API para obtener los datos de la página seleccionada
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

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                  <button className="text-blue-600 hover:text-blue-900" title="Editar">
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
          
          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <CreateRole 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default RolesPage;
  