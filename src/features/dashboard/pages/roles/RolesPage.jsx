import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreateRole from "./components/CreateRole";
import EditRole from "./components/EditRole";
import ViewRole from "./components/ViewRole";
import ChangeRoleStatus from "./components/ChangeRoleStatus";
import DeleteRole from "./components/DeleteRole";
import Paginator from "./components/Paginator";
// Corrected imports for services from ModuleDataService
import { createRole, updateRole, deleteRole, getRoles } from '../../../../shared/services/ModuleDataService';
import SearchRole from "./components/SearchRole";
import { normalizeText } from '../../../../shared/normalizers.js'; // Ensure normalizeText is used consistently
import Swal from 'sweetalert2';


const itemsPerPage = 5;

const RolesPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '', show: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingData(true);
      try {
        const fetchedRoles = await getRoles();
        setRoles(fetchedRoles);
      } catch (error) {
        console.error("Error al cargar roles:", error);
        // Opcional: mostrar un mensaje de error al usuario
      } finally {
        setLoadingData(false);
      }
    };
    fetchRoles();
  }, []);

  // Función para mostrar mensajes de feedback
  const showMessage = (text, type = 'success') => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type === 'success' ? 'success' : 'error',
      title: text,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  // Función para normalizar texto (eliminar tildes, pasar a minúsculas, etc.)
  // Esta función ya debería estar en '../../../../shared/normalizers.js'
  // y se usa aquí. La importación ya está en el código que me diste.

  // Filtrado de roles por búsqueda
  const filteredRoles = roles.filter((role) => {
    const term = normalizeText(searchTerm);
    if (!term) return true; // Si no hay término, mostrar todos
    const idMatch = normalizeText(role.id).includes(term); // <<< ESTO ES LO QUE ESTÁ EN ROLES Y FUNCIONA
    const nameMatch = normalizeText(role.name).includes(term);
    const descMatch = normalizeText(role.description).includes(term);
    const estado = normalizeText(role.estado);

    // Si el usuario busca explícitamente 'activo' (parcial o completo), solo mostrar activos
    if (/^act/i.test(term)) {
      return estado.startsWith('activo');
    }
    // Si el usuario busca explícitamente 'inactivo' (parcial o completo), solo mostrar inactivos
    if (/^inac/i.test(term)) {
      return estado.startsWith('inactivo');
    }
    // Si el usuario busca 'no activo', mostrar inactivos
    if (term.includes('no activo')) {
      return estado === 'inactivo';
    }
    // Si el usuario busca 'no inactivo', mostrar activos
    if (term.includes('no inactivo')) {
      return estado === 'activo';
    }

    // Búsqueda general
    const estadoMatch = estado.includes(term);
    return idMatch || nameMatch || descMatch || estadoMatch;
  });

  // Cálculo de paginación basado en roles filtrados
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / itemsPerPage));

  // Para paginar los roles
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  // Ajusta currentPage si es mayor que totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) { // Añadida condición totalPages > 0
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) { // Si no hay resultados, ir a página 1
        setCurrentPage(1);
    }
  }, [roles, totalPages, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Aquí deberías hacer la llamada a tu API para obtener los datos de la página seleccionada
  };

  // handleEditClick ahora pide confirmación
  const handleEditClick = (role) => {
    Swal.fire({
      title: '¿Editar rol?',
      text: '¿Deseas editar la información de este rol?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedRole(role);
        setIsEditModalOpen(true);
      }
    });
  };

  const handleViewClick = (role) => {
    setSelectedRole(role);
    setIsViewModalOpen(true);
  };

  // handleDeleteClick ahora pide confirmación
  const handleDeleteClick = (role) => {
    Swal.fire({
      title: '¿Eliminar rol?',
      text: 'Esta acción eliminará el rol permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
      }
    });
  };

  const handleDeleteRole = async (roleId) => {
    setLoading(true); // Activar loading para la operación de eliminación
    try {
      await deleteRole(roleId, roles); // Pasa 'roles' para que el servicio simule la eliminación
      setRoles(prev => prev.filter(r => r.id !== roleId));
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      showMessage('Rol eliminado exitosamente', 'success');
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      showMessage(error.message || 'Error al eliminar el rol', 'error');
    } finally {
      setLoading(false);
    }
  };

  // handleToggleStatus ahora usa el servicio updateRole y muestra mensajes
  const handleToggleStatus = async (roleId) => {
    setLoading(true); // Activar loading
    try {
      // Encuentra el rol y cambia su estado localmente para el servicio
      const roleToUpdate = roles.find(r => r.id === roleId);
      if (!roleToUpdate) throw new Error("Rol no encontrado.");

      const newStatus = roleToUpdate.estado === 'Activo' ? 'Inactivo' : 'Activo';
      const updatedRoleData = { ...roleToUpdate, estado: newStatus };

      // Llama al servicio para actualizar el rol
      const returnedRole = await updateRole(updatedRoleData, roles); // Pasa todos los roles al servicio para simular
      
      // Actualiza el estado local de roles con el rol retornado por el servicio
      setRoles(prevRoles => prevRoles.map(role =>
        role.id === returnedRole.id
          ? returnedRole
          : role
      ));
      showMessage(`Estado del rol cambiado a ${newStatus}`, 'success');
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showMessage(error.message || 'Error al cambiar el estado del rol', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear rol usando servicio
  const handleCreateRole = async (formData, privileges) => {
    setLoading(true);
    try {
      const newRole = await createRole({
        name: formData.nombre,
        description: formData.descripcion,
        estado: formData.estado || 'Activo', // Asegura un estado por defecto si no viene del form
        privileges,
      }, roles); // Pasa todos los roles para la validación de unicidad
      setRoles(prev => [...prev, newRole]);
      setIsCreateModalOpen(false);
      showMessage('Rol creado exitosamente', 'success');
    } catch (error) {
      console.error("Error al crear rol:", error);
      showMessage(error.message || 'Error al crear el rol', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Editar rol usando servicio
  const handleEditRole = async (formDataFromModal, privilegesFromModal) => { // Renombrar para claridad
    setLoading(true);
    try {
      // Combina los datos del formulario con el ID y estado del rol seleccionado
      const updatedRoleData = {
        id: selectedRole.id, // ID del rol que estamos editando
        name: formDataFromModal.name,
        description: formDataFromModal.description,
        estado: selectedRole.estado, // Mantener el estado actual del rol
        privileges: privilegesFromModal
      };

      const returnedRole = await updateRole(updatedRoleData, roles); // Pasa todos los roles al servicio para simular
      setRoles(prev => prev.map(r => r.id === returnedRole.id ? returnedRole : r));
      setIsEditModalOpen(false);
      setSelectedRole(null);
      showMessage('Rol actualizado exitosamente', 'success');
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      showMessage(error.message || 'Error al actualizar el rol', 'error');
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
            ? 'bg-primary text-white'
            : 'bg-primary-dark text-white'
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
            <h1 className="text-2xl font-bold">Gestión de Roles</h1>
            <p className="mt-1">Administra los roles y privilegios del sistema</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchRole searchTerm={searchTerm} handleSearch={handleSearch} />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Nuevo Rol
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NOMBRE</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DESCRIPCIÓN</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ESTADO</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{role.id}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{role.name}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{role.description}</td>
                      <td className="py-4 px-4">
                        <ChangeRoleStatus status={role.estado} onToggle={() => handleToggleStatus(role.id)} />
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors"
                            title="Visualizar"
                            onClick={() => handleViewClick(role)}
                          >
                            <i className="bi bi-eye text-primary text-sm"></i>
                          </button>
                          <button
                            className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors"
                            title="Editar"
                            onClick={() => handleEditClick(role)}
                          >
                            <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                          </button>
                          <button
                            className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
                            title="Eliminar"
                            onClick={() => handleDeleteClick(role)}
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
                Mostrando <span className="font-medium">{filteredRoles.length > 0 ? startIndex + 1 : 0}</span> a {" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredRoles.length)}</span> {" "}
                de <span className="font-medium">{filteredRoles.length}</span> resultados
              </p>
            </div>
          </div>
        </div>

        <CreateRole
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateRole}
          loading={loading}
          roles={roles}
        />
        <EditRole
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          role={selectedRole}
          onEdit={handleEditRole}
          loading={loading}
          roles={roles}
        />
        <ViewRole
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          role={selectedRole}
        />
        <DeleteRole
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteRole}
          role={selectedRole}
        />
      </div>
    </div>
  );
};

export default RolesPage;