import { useState, useEffect } from 'react';
import Search from '../../../../shared/Search'
import UserTable from './components/UserTable';
import CreateUser from './components/CreateUser';
import EditUser from './components/EditUser';
import UserDetail from './components/UserDetail';
import Paginator from '../../../../shared/Paginator';
import LoadingTable from '../../../../shared/components/LoadingTable';
import ConfirmDeleteModal from '../../../../shared/components/ConfirmDeleteModal';
import { filterBySearch } from '../../../../shared/utils/searchHelper';
import usersService from './API/usersService';
import { useOutletContext } from 'react-router-dom';

import { getCitasEnEjecucion } from '../SaleServices/API/CitasService';

const USERS_PER_PAGE = 10;
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';


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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
    // Usar la función helper de búsqueda universal
    const filtered = filterBySearch(users, searchTerm);
    
    // Aplicar ordenamiento también a los resultados filtrados
    const sortedFiltered = sortUsers(filtered);
    setFilteredUsers(sortedFiltered);
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

  // Handler para eliminar usuario - muestra modal primero
  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => (u.id_usuario || u.id) === userId);
    if (userToDelete) {
      setPendingDelete({ id: userId, user: userToDelete });
      setShowDeleteModal(true);
    }
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    try {
      await executeWithToast({
        promiseFn: async () => {
          const response = await usersService.delete(pendingDelete.id);
          if (response.success) {
            await loadUsers();
            return response.data;
          } else {
            throw new Error(response.message || 'Error al eliminar el usuario');
          }
        },
        operation: 'delete',
        entity: 'usuario',
        id: pendingDelete.id,
        loadingMessage: 'Eliminando usuario...',
        successMessage: 'Usuario eliminado exitosamente',
        onSuccess: () => {
          setShowDeleteModal(false);
          setPendingDelete(null);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    } finally {
      setDeletingId(null);
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && pendingDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            if (!deletingId) {
              setShowDeleteModal(false);
              setPendingDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          itemName={pendingDelete.user.nombre || pendingDelete.user.name}
          entityType="usuario"
          loading={deletingId === pendingDelete.id}
        />
      )}
    </div>
  );
};

export default Users;
