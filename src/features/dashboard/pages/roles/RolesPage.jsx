import { useState, useEffect } from "react";
import RolesTable from "./components/RolesTable";
import SearchRole from "./components/SearchRole";
import Paginator from "../../../../shared/Paginator";
import CreateRoles from "./components/CreateRole";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorState from "./components/ErrorState";
import { useRoles } from "./hooks/useRoles";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../../../shared/contexts/AuthContext';

const RolesPage = () => {
  const { roles, loading, error, addRole, editRole, deleteRole, changeRoleStatus, loadRoles } = useRoles();
  const { hasPrivilege } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { setTitle } = useOutletContext();
  
  // Verificar permisos
  const canView = hasPrivilege('Gestión de Usuarios', 'Visualizar');
  const canCreate = hasPrivilege('Gestión de Usuarios', 'Crear');
  const canEdit = hasPrivilege('Gestión de Usuarios', 'Editar');
  const canDelete = hasPrivilege('Gestión de Usuarios', 'Eliminar');
  
  // Si no tiene permiso de visualización, mostrar mensaje
  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sin acceso</h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a la gestión de roles.
            Contacta a un administrador para obtener los permisos necesarios.
          </p>
        </div>
      </div>
    );
  }

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
    const rolePromise = (async () => {
      const roleWithPrivileges = { ...newRole, privileges };
      await addRole(roleWithPrivileges);
      return true;
    })();

    toast.promise(rolePromise, {
      loading: 'Creando rol...',
      success: 'Rol creado exitosamente',
      error: (err) => err.message || 'Error al crear el rol',
    });

    try {
      await rolePromise;
    } catch (error) {
      throw error;
    }
  };

  const handleEditRole = async (updatedRole) => {
    const rolePromise = (async () => {
      await editRole(updatedRole);
      return true;
    })();

    toast.promise(rolePromise, {
      loading: 'Actualizando rol...',
      success: 'Rol actualizado exitosamente',
      error: (err) => err.message || 'Error al actualizar el rol',
    });

    try {
      await rolePromise;
    } catch (error) {
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
      const rolePromise = (async () => {
        await deleteRole(roleId);
        return true;
      })();

      toast.promise(rolePromise, {
        loading: 'Eliminando rol...',
        success: 'Rol eliminado exitosamente',
        error: (err) => err.message || 'Error al eliminar el rol',
      });

      try {
        await rolePromise;
      } catch (error) {
        // Error ya manejado por toast.promise
      }
    }
  };

  const handleStatusChange = async (roleId, newStatus) => {
    const rolePromise = (async () => {
      await changeRoleStatus(roleId, newStatus);
      return true;
    })();

    toast.promise(rolePromise, {
      loading: 'Cambiando estado del rol...',
      success: `Rol ${newStatus === 'Activo' ? 'activado' : 'desactivado'} exitosamente`,
      error: (err) => err.message || 'Error al cambiar el estado del rol',
    });

    try {
      await rolePromise;
    } catch (error) {
      // Error ya manejado por toast.promise
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
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <SearchRole
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Buscar roles por nombre, descripción o estado..."
                  />
                </div>
                {canCreate && (
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-text-main hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center text-xs whitespace-nowrap"
                  >
                    <i className="bi bi-plus-circle mr-2"></i>
                    Crear Rol
                  </button>
                )}
              </div>
            </div>

            <RolesTable 
              roles={paginatedRoles}
              onEdit={canEdit ? handleEditRole : null}
              onDelete={canDelete ? handleDeleteRole : null}
              onStatusChange={canEdit ? handleStatusChange : null}
              loading={loading}
            />
            {!loading && (
              <>
                {totalPages > 1 && (
                  <Paginator 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredRoles.length}
                    showInfo={true}
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
    </div>
  );
};

export default RolesPage;