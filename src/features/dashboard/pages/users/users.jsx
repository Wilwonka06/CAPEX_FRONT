import { useState, useEffect } from 'react';
import Search from '../../../../shared/Search'
import UserTable from './components/UserTable';
import CreateUser from './components/CreateUser';
import EditUser from './components/EditUser';
import UserDetail from './components/UserDetail';
import Paginator from '../../../../shared/Paginator';
import LoadingTable from '../../../../shared/components/LoadingTable';
import usersService from './API/usersService';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';

const Users = () => {
  const { setTitle } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default a 10 items

  // Cargar usuarios desde la API al iniciar
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getAll();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        console.error('API returned error:', response.message);
        setUsers([]);
        setError(response.message || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error loading users from API:', err);
      setUsers([]);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  // Sincronizar filteredUsers con users
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Filtrar usuarios por todos los campos cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(user =>
        Object.values(user).some(val =>
          String(val).toLowerCase().includes(lowerTerm)
        )
      )
    );
  }, [searchTerm, users]);

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]); // Resetear también si cambia itemsPerPage

  const handleItemsPerPageChange = (newVal) => {
    setItemsPerPage(newVal);
    setCurrentPage(1);
  };

  // Acciones CRUD
  const handleCreateUser = async (newUser) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          const response = await usersService.create(newUser);
          if (response.success) {
            await loadUsers();
            return response.data;
          } else {
            throw new Error(response.message || 'Error al crear el usuario');
          }
        },
        operation: 'create',
        entity: 'usuario',
        loadingMessage: 'Creando usuario...',
        successMessage: 'Usuario creado exitosamente',
        onSuccess: () => {
          setShowCreate(false);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
  };

  const handleEditUser = async (updatedUser) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          const response = await usersService.update(updatedUser.id_usuario || updatedUser.id, updatedUser);
          if (response.success) {
            await loadUsers();
            return response.data;
          } else {
            throw new Error(response.message || 'Error al actualizar el usuario');
          }
        },
        operation: 'update',
        entity: 'usuario',
        id: updatedUser.id_usuario || updatedUser.id,
        loadingMessage: 'Actualizando usuario...',
        successMessage: 'Usuario actualizado exitosamente',
        onSuccess: () => {
          setShowEdit(false);
          setSelectedUser(null);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => (u.id_usuario || u.id) === userId);
    if (userToDelete) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Estás seguro de que deseas eliminar al usuario "${userToDelete.nombre || userToDelete.name}"? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          await executeWithToast({
            promiseFn: async () => {
              const response = await usersService.delete(userId);
              if (response.success) {
                await loadUsers();
                return response.data;
              } else {
                throw new Error(response.message || 'Error al eliminar el usuario');
              }
            },
            operation: 'delete',
            entity: 'usuario',
            id: userId,
            loadingMessage: 'Eliminando usuario...',
            successMessage: 'Usuario eliminado exitosamente',
          });
        } catch {
          // Error ya manejado por executeWithToast
        }
      }
    }
  };

  const handleStatusChange = async (userId, newStatus, conceptoEstado = null) => {
    const user = users.find(u => (u.id_usuario || u.id) === userId);
    if (user) {
      try {
        await executeWithToast({
          promiseFn: async () => {
            const response = await usersService.changeStatus(userId, newStatus, conceptoEstado);
            if (response.success) {
              await loadUsers();
              return response.data;
            } else {
              throw new Error(response.message || 'Error al cambiar el estado');
            }
          },
          operation: 'update',
          entity: 'usuario',
          id: userId,
          loadingMessage: 'Cambiando estado...',
          successMessage: `Estado cambiado a ${newStatus} exitosamente`,
        });
      } catch {
        // Error ya manejado por executeWithToast
      }
    }
  };

  // Abrir modales
  const openCreate = () => setShowCreate(true);
  const openEdit = (user) => {
    setSelectedUser(user);
    setShowEdit(true);
  };
  const openDetail = (user) => {
    setSelectedUser(user);
    setShowDetail(true);
  };
  // Cerrar modales
  const closes = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowDetail(false);
    setSelectedUser(null);
  };

  // handleSearch solo actualiza searchTerm
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  useEffect(() => {
    setTitle('Módulo de Usuarios');
    return () => setTitle('');
  }, [setTitle]);

  // Estado de carga inicial
  const isInitialLoading = loading && !isLoaded;
  const hasError = error && !isLoaded;

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Search searchTerm={searchTerm} handleSearch={e => handleSearch(e.target.value)} placeholder="Buscar usuario..." />
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center"
                onClick={openCreate}
                disabled={loading}
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Crear usuario
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {isInitialLoading ? (
                <LoadingTable message="Cargando usuarios..." />
              ) : hasError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="bi bi-exclamation-triangle text-red-400"></i>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error al cargar usuarios</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <button
                        onClick={loadUsers}
                        className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <UserTable
                  users={paginatedUsers}
                  onView={openDetail}
                  onEdit={openEdit}
                  onDelete={handleDeleteUser}
                  onStatusChange={handleStatusChange}
                  loading={loading}
                />
              )}
            </div>
            {filteredUsers.length > 0 && (
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredUsers.length}
                onItemsPerPageChange={handleItemsPerPageChange}
                pageSizeOptions={[5, 10, 20, 50, 100]}
              />
            )}
          </div>
        </div>
      </div>
      {showCreate && (
        <CreateUser
          onClose={closes}
          onCreate={handleCreateUser}
          users={users}
        />
      )}
      {showEdit && selectedUser && (
        <EditUser
          onClose={closes}
          onEdit={handleEditUser}
          user={selectedUser}
          users={users}
        />
      )}
      {showDetail && selectedUser && (
        <UserDetail
          onClose={closes}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default Users;
