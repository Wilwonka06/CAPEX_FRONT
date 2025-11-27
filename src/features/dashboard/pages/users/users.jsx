import { useState, useEffect } from 'react';
import Search from '../../../../shared/Search'
import UserTable from './components/UserTable';
import CreateUser from './components/CreateUser';
import EditUser from './components/EditUser';
import UserDetail from './components/UserDetail';
import Paginator from '../../../../shared/Paginator';
import LoadingTable from '../../../../shared/components/LoadingTable';
import usersService from './API/usersService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const USERS_PER_PAGE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, users]);

  // Acciones CRUD
  const handleCreateUser = async (newUser) => {
    const userPromise = (async () => {
      const response = await usersService.create(newUser);
      if (response.success) {
        await loadUsers(); // Recargar lista
        setShowCreate(false);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear el usuario');
      }
    })();

    toast.promise(
      userPromise,
      {
        loading: 'Creando usuario...',
        success: 'Usuario creado exitosamente',
        error: (err) => {
          console.error('Error creating user:', err);
          const backendMsg = err.response?.data?.message || err.message;
          const validationErrors = err.response?.data?.errors;
          if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
            return validationErrors[0].message || backendMsg || 'Error al crear el usuario';
          }
          return backendMsg || 'Error al crear el usuario';
        },
      },
      {
        id: 'create-user',
      }
    );

    try {
      await userPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  const handleEditUser = async (updatedUser) => {
    const userPromise = (async () => {
      const response = await usersService.update(updatedUser.id_usuario || updatedUser.id, updatedUser);
      if (response.success) {
        setShowEdit(false);
        setSelectedUser(null);
        await loadUsers(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar el usuario');
      }
    })();

    toast.promise(
      userPromise,
      {
        loading: 'Actualizando usuario...',
        success: 'Usuario actualizado exitosamente',
        error: (err) => {
          console.error('Error updating user:', err);
          return err.response?.data?.message || err.message || 'Error al actualizar el usuario';
        },
      },
      {
        id: `update-user-${updatedUser.id_usuario || updatedUser.id}`,
      }
    );

    try {
      await userPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
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
        const userPromise = (async () => {
          const response = await usersService.delete(userId);
          if (response.success) {
            await loadUsers(); // Recargar lista
            return response.data;
          } else {
            throw new Error(response.message || 'Error al eliminar el usuario');
          }
        })();

        toast.promise(
          userPromise,
          {
            loading: 'Eliminando usuario...',
            success: 'Usuario eliminado exitosamente',
            error: (err) => {
              console.error('Error deleting user:', err);
              return err.response?.data?.message || err.message || 'Error al eliminar el usuario';
            },
          },
          {
            id: `delete-user-${userId}`,
          }
        );

        try {
          await userPromise;
        } catch (error) {
          // Error ya manejado por toast.promise
        }
      }
    }
  };

  const handleStatusChange = async (userId, newStatus, conceptoEstado = null) => {
    const user = users.find(u => (u.id_usuario || u.id) === userId);
    if (user) {
      const result = await Swal.fire({
        title: '¿Confirmar cambio de estado?',
        text: `¿Estás seguro de que deseas cambiar el estado de "${user.nombre}" a ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const userPromise = (async () => {
          const response = await usersService.changeStatus(userId, newStatus, conceptoEstado);
          if (response.success) {
            await loadUsers(); // Recargar lista
            return response.data;
          } else {
            throw new Error(response.message || 'Error al cambiar el estado');
          }
        })();

        toast.promise(userPromise, {
          loading: 'Cambiando estado...',
          success: `Estado cambiado a ${newStatus}`,
          error: (err) => {
            console.error('Error changing user status:', err);
            return err.response?.data?.message || err.message || 'Error al cambiar el estado';
          },
        });

        try {
          await userPromise;
        } catch (error) {
          // Error ya manejado por toast.promise
        }
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
    setTitle('Gestión de Usuarios');
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
            {filteredUsers.length > USERS_PER_PAGE && (
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
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