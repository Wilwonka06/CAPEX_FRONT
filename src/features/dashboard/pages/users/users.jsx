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
import { getCitasEnEjecucion } from '../SaleServices/API/CitasService';

const USERS_PER_PAGE = 5;

// Función para ordenar usuarios con prioridad especial
const sortUsers = (usersArray) => {
  if (!Array.isArray(usersArray)) return [];
  
  // Crear una copia para no mutar el array original
  const sortedUsers = [...usersArray];
  
  // Ordenar los usuarios
  sortedUsers.sort((a, b) => {
    // 1. PRIORIDAD ESPECIAL: Ronald Erazo Valencia (documento 1033488966) siempre primero
    const ronaldDoc = '1033488966';
    const aIsRonald = a.documento === ronaldDoc;
    const bIsRonald = b.documento === ronaldDoc;
    
    if (aIsRonald && !bIsRonald) return -1;
    if (!aIsRonald && bIsRonald) return 1;
    
    // Si ambos son Ronald, mantener el orden (no debería pasar)
    if (aIsRonald && bIsRonald) return 0;
    
    // 2. PRIORIDAD ESPECIAL: Superadmin con correo heieihei183@gmail.com siempre segundo
    const superAdminEmail = 'heieihei183@gmail.com';
    const aIsSuperAdmin = a.correo && a.correo.toLowerCase() === superAdminEmail.toLowerCase();
    const bIsSuperAdmin = b.correo && b.correo.toLowerCase() === superAdminEmail.toLowerCase();
    
    if (aIsSuperAdmin && !bIsSuperAdmin) return -1;
    if (!aIsSuperAdmin && bIsSuperAdmin) return 1;
    
    // Si ambos son el Superadmin, mantener el orden (no debería pasar)
    if (aIsSuperAdmin && bIsSuperAdmin) return 0;
    
    // 3. ORDENAMIENTO ALFABÉTICO: Resto de usuarios ordenados alfabéticamente por nombre
    // Normalizar nombres: trim y lowercase para comparación consistente
    const aName = (a.nombre || '').trim().toLowerCase();
    const bName = (b.nombre || '').trim().toLowerCase();
    
    // Comparación alfabética estricta
    if (aName < bName) return -1;
    if (aName > bName) return 1;
    
    // Si los nombres son iguales, mantener orden estable (por ID si existe)
    if (aName === bName) {
      const aId = a.id_usuario || a.id || 0;
      const bId = b.id_usuario || b.id || 0;
      return aId - bId;
    }
    
    return 0;
  });
  
  return sortedUsers;
};

// Función helper para buscar recursivamente en objetos y arrays
const searchInValue = (value, searchTerm) => {
  if (value === null || value === undefined) return false;
  
  // Si es un objeto, buscar en sus valores
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.values(value).some(val => searchInValue(val, searchTerm));
  }
  
  // Si es un array, buscar en cada elemento
  if (Array.isArray(value)) {
    return value.some(item => searchInValue(item, searchTerm));
  }
  
  // Para valores primitivos, convertir a string y buscar
  return String(value).toLowerCase().includes(searchTerm);
};

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
      // Solicitar el límite máximo permitido (100) para obtener la mayor cantidad de usuarios
      const response = await usersService.getAll({ limit: 100 });
      if (response.success) {
        const usersData = response.data || [];
        console.log('🔍 [Users] Total usuarios recibidos:', usersData.length);
        
        // Buscar el usuario específico
        const targetUser = usersData.find(u => 
          u.correo && u.correo.toLowerCase().includes('heieihei183@gmail.com')
        );
        if (targetUser) {
          console.log('✅ [Users] Usuario encontrado:', targetUser);
        } else {
          console.warn('⚠️ [Users] Usuario con correo heieihei183@gmail.com NO encontrado en la respuesta del backend');
        }
        
        setUsers(usersData);
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

  // Sincronizar filteredUsers con users y aplicar ordenamiento
  useEffect(() => {
    const sortedUsers = sortUsers(users);
    console.log('🔍 [Users] Usuarios sincronizados y ordenados:', sortedUsers.length);
    
    // Verificar si el usuario objetivo está presente
    const targetInSorted = sortedUsers.find(u => 
      u.correo && u.correo.toLowerCase().includes('heieihei183@gmail.com')
    );
    if (targetInSorted) {
      console.log('✅ [Users] Usuario objetivo presente en lista ordenada:', targetInSorted);
      console.log('✅ [Users] Posición en lista:', sortedUsers.indexOf(targetInSorted));
    } else if (users.some(u => u.correo && u.correo.toLowerCase().includes('heieihei183@gmail.com'))) {
      console.error('❌ [Users] Usuario objetivo existe pero NO está en lista ordenada. Posible error en sortUsers');
    }
    
    setFilteredUsers(sortedUsers);
  }, [users]);

  // Filtrar usuarios por todos los campos cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      // Si no hay búsqueda, aplicar ordenamiento a todos los usuarios
      const sortedUsers = sortUsers(users);
      setFilteredUsers(sortedUsers);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      // Buscar recursivamente en todos los campos del usuario
      return Object.values(user).some(val => searchInValue(val, lowerTerm));
    });
    console.log('🔍 [Users] Usuarios filtrados con término:', searchTerm, '->', filtered.length);
    
    // Verificar si el usuario objetivo está en los resultados
    const targetInFiltered = filtered.find(u => 
      u.correo && u.correo.toLowerCase().includes('heieihei183@gmail.com')
    );
    if (targetInFiltered) {
      console.log('✅ [Users] Usuario objetivo encontrado en resultados filtrados');
    } else if (users.some(u => u.correo && u.correo.toLowerCase().includes('heieihei183@gmail.com'))) {
      console.warn('⚠️ [Users] Usuario objetivo existe pero fue filtrado por:', searchTerm);
    }
    
    // Aplicar ordenamiento también a los resultados filtrados
    const sortedFiltered = sortUsers(filtered);
    setFilteredUsers(sortedFiltered);
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
  };

  // Abrir modales
  const openCreate = () => setShowCreate(true);
  const openEdit = async (user) => {
    try {
      // Cargar el usuario completo con información de asociaciones
      const userId = user.id_usuario || user.id;
      const response = await usersService.getById(userId);
      if (response.success) {
        let userData = response.data;
        
        // Verificar si realmente tiene órdenes activas (no pagadas)
        // Si el backend dice que tiene asociaciones, verificar que no sean solo órdenes pagadas
        if (userData.hasClientAssociations) {
          try {
            // Obtener todas las órdenes de servicio para verificar si hay alguna activa
            const allOrders = await getCitasEnEjecucion();
            
            // Filtrar órdenes del usuario actual que NO estén pagadas
            const userActiveOrders = allOrders.filter(order => {
              const orderClientId = order.client?.id || order.id_cliente || order.cliente?.id_usuario;
              const isUserOrder = orderClientId === userId;
              const isNotPaid = order.status !== 'Pagado' && 
                                order.status !== 'Pagada' && 
                                order.status?.toLowerCase() !== 'pagado' &&
                                order.status?.toLowerCase() !== 'pagada';
              
              return isUserOrder && isNotPaid;
            });
            
            // Si no hay órdenes activas, corregir hasClientAssociations
            if (userActiveOrders.length === 0) {
              console.log('⚠️ [Users] Usuario marcado con asociaciones pero no tiene órdenes activas (solo pagadas). Corrigiendo...');
              userData = {
                ...userData,
                hasClientAssociations: false,
                clientAssociationsInfo: null
              };
            } else {
              console.log('✅ [Users] Usuario tiene', userActiveOrders.length, 'órdenes activas confirmadas');
            }
          } catch (orderError) {
            console.warn('⚠️ [Users] No se pudieron verificar las órdenes del usuario:', orderError);
            // Si hay error al verificar, mantener el valor del backend
          }
        }
        
        setSelectedUser(userData);
        setShowEdit(true);
      } else {
        // Si falla, usar el usuario de la lista como fallback
        setSelectedUser(user);
        setShowEdit(true);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      // Si falla, usar el usuario de la lista como fallback
      setSelectedUser(user);
      setShowEdit(true);
    }
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