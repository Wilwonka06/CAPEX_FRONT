import { useState, useEffect } from "react";
import RolesTable from "./components/RolesTable";
import Paginator from "../../../../shared/Paginator";
import CreateRole from "./components/CreateRole";
import rolesService from "./API/rolesService";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../../../shared/contexts/AuthContext';

const ROLES_PER_PAGE = 10;

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setTitle('Módulo de Roles');
    return () => setTitle('');
  }, [setTitle]);

  // Cargar roles al montar
  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const rolesData = await rolesService.getAll();
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      setError(err.message || 'Error al cargar roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Filtrar roles
  const filteredRoles = roles.filter(
    (role) =>
      (role.name || role.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description || role.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.estado || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredRoles.length / ROLES_PER_PAGE);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * ROLES_PER_PAGE,
    currentPage * ROLES_PER_PAGE
  ).map(role => ({
    ...role,
    name: role.name ?? role.nombre ?? '',
  }));

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roles]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Crear rol
  const handleCreateRole = async (newRole, privileges) => {
    const rolePromise = (async () => {
      const roleWithPrivileges = { ...newRole, privileges };
      await rolesService.create(roleWithPrivileges);
      await loadRoles();
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

  // Editar rol
  const handleEditRole = async (updatedRole) => {
    const rolePromise = (async () => {
      await rolesService.update(updatedRole.id, updatedRole);
      await loadRoles();
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

  // Eliminar rol
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
        await rolesService.delete(roleId);
        await loadRoles();
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

  // Cambiar estado
  const handleStatusChange = async (roleId, newStatus) => {
    const rolePromise = (async () => {
      await rolesService.changeStatus(roleId, newStatus);
      await loadRoles();
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

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search Component Inline */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Buscar roles por nombre, descripción o estado..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
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

            {/* Tabla de roles */}
            <RolesTable 
              roles={paginatedRoles}
              onEdit={canEdit ? handleEditRole : null}
              onDelete={canDelete ? handleDeleteRole : null}
              onStatusChange={canEdit ? handleStatusChange : null}
              loading={loading}
            />

            {/* Paginación */}
            {!loading && totalPages > 1 && (
              <Paginator 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange}
                itemsPerPage={ROLES_PER_PAGE}
                totalItems={filteredRoles.length}
                showInfo={true}
              />
            )}
          </div>
        </div>
        
        {/* Modal de Crear Rol */}
        <CreateRole
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