import { useState, useEffect } from "react";
import RolesTable from "./components/RolesTable";
import SearchRole from "./components/SearchRole";
import Paginator from "./components/Paginator";
import CreateRoles from "./components/CreateRole";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorState from "./components/ErrorState";
import { useRoles } from "./hooks/useRoles";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const RolesPage = () => {
  const { roles, loading, error, addRole, editRole, deleteRole, changeRoleStatus, loadRoles } = useRoles();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { setTitle } = useOutletContext();

  useEffect(() => {
    setTitle('Gestión de Roles');
    return () => setTitle('');
  }, [setTitle]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredRoles = roles.filter(
    (role) =>
      (role.name || role.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description || role.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.estado || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = async (newRole, privileges) => {
    try {
      const roleWithPrivileges = { ...newRole, privileges };
      await addRole(roleWithPrivileges);
      toast.success('Rol creado exitosamente', { position: 'top-right' });
    } catch (error) {
      toast.error(error.message || 'Error al crear el rol', { position: 'top-right' });
      throw error;
    }
  };

  const handleEditRole = async (updatedRole) => {
    try {
      await editRole(updatedRole);
      toast.success('Rol actualizado exitosamente', { position: 'top-right' });
    } catch (error) {
      toast.error(error.message || 'Error al actualizar el rol', { position: 'top-right' });
      throw error;
    }
  };

  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el rol "${role?.name || role?.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteRole(roleId);
        toast.success('Rol eliminado exitosamente', { position: 'top-right' });
      } catch (error) {
        toast.error(error.message || 'Error al eliminar el rol', { position: 'top-right' });
      }
    }
  };

  const handleStatusChange = async (roleId, newStatus) => {
    try {
      await changeRoleStatus(roleId, newStatus);
      toast.success(`Rol ${newStatus === 'Activo' ? 'activado' : 'desactivado'} exitosamente`, { position: 'top-right' });
    } catch (error) {
      toast.error(error.message || 'Error al cambiar el estado del rol', { position: 'top-right' });
    }
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage)
    .map(role => ({
      ...role,
      name: role.name ?? role.nombre ?? '',
    }));

  // Mostrar error si existe
  if (error && !loading) {
    return (
      <div className="min-h-screen font-inter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
            <div className="p-6">
              <ErrorState error={error} onRetry={loadRoles} />
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Roles</h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <SearchRole
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Buscar roles por nombre, descripción o estado..."
                  />
                </div>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-text-main hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center text-xs whitespace-nowrap"
                >
                  <i className="bi bi-plus-circle mr-2"></i>
                  Crear Rol
                </button>
              </div>
            </div>

            {loading && roles.length === 0 ? (
              <LoadingSpinner message="Cargando roles..." />
            ) : (
              <>
                <RolesTable 
                  roles={paginatedRoles}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                  onStatusChange={handleStatusChange}
                  loading={loading}
                />
                {totalPages > 1 && (
                  <Paginator 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredRoles.length}
                  />
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Modal de Crear Rol */}
        <CreateRoles
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateRole}
          roles={roles}
        />
      </div>
      <ToastContainer />
    </div>
  );
};

export default RolesPage;