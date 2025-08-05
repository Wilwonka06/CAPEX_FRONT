import React, { useState, useEffect } from 'react';
import Search from '../../../../shared/Search'
import UserTable from './components/UserTable';
import CreateUserModal from './components/CreateUserModal';
import EditUserModal from './components/EditUserModal';
import UserDetailModal from './components/UserDetailModal';
import Paginator from '../../../../shared/Paginator';
import { getRoles } from '../../../../shared/services/ModuleDataService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'usuarios';
const USERS_PER_PAGE = 5;

// Obtener privilegios del rol Administrador
let ADMIN_PRIVILEGES = {};
try {
  const roles = JSON.parse(localStorage.getItem('roles'));
  const adminRole = roles?.find(r => r.name === 'Administrador');
  if (adminRole && adminRole.privileges) {
    ADMIN_PRIVILEGES = adminRole.privileges;
  }
} catch {}

// Usuario admin por defecto
const DEFAULT_ADMIN = {
  id: 1,
  nombre: 'Administrador',
  correo: 'admin@admin.com',
  password: 'admin123',
  rol: 'Administrador',
  estado: 'Activo',
  isAdmin: true,
  privileges: ADMIN_PRIVILEGES
};

const DEFAULT_USERS = [
  {
    id: 2,
    nombre: 'María López',
    correo: 'maria@example.com',
    password: 'test1234',
    rol: 'Empleado',
    estado: 'Activo',
    isAdmin: false,
    roles: ['Empleado']
  },
  {
    id: 3,
    nombre: 'Carlos Pérez',
    correo: 'carlos@example.com',
    password: 'test1234',
    rol: 'Cliente',
    estado: 'Activo',
    isAdmin: false,
    roles: ['Cliente']
  },
  {
    id: 4,
    nombre: 'Ana Torres',
    correo: 'ana@example.com',
    password: 'test1234',
    rol: 'Empleado',
    estado: 'Inactivo',
    isAdmin: false,
    roles: ['Empleado']
  },
  {
    id: 5,
    nombre: 'Luis Gómez',
    correo: 'luis@example.com',
    password: 'test1234',
    rol: 'Cliente',
    estado: 'Activo',
    isAdmin: false,
    roles: ['Cliente']
  }
];

const Users = () => {
  const { setTitle } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar usuarios de localStorage al iniciar
  useEffect(() => {
    let storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    
    // Asegurar que los roles existan
    let storedRoles = JSON.parse(localStorage.getItem('roles')) || [];
    if (storedRoles.length === 0) {
      // Crear roles por defecto
      const defaultRoles = [
        {
          id: 1,
          name: 'Administrador',
          description: 'Control total del sistema',
          estado: 'Activo',
          privileges: {
            'Dashboard': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
            'Gestión de Usuarios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
            'Gestión de Compras': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
            'Gestión de Servicios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
            'Ventas': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
            'configuración': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true }
          }
        }
      ];
      localStorage.setItem('roles', JSON.stringify(defaultRoles));
      storedRoles = defaultRoles;
    }
    
    // Actualizar ADMIN_PRIVILEGES con los roles actuales
    const adminRole = storedRoles.find(r => r.name === 'Administrador');
    if (adminRole && adminRole.privileges) {
      ADMIN_PRIVILEGES = adminRole.privileges;
    }
    
    // Si no existe el admin, agregarlo
    if (!storedUsers.some(u => u.isAdmin)) {
      const newAdmin = {
        ...DEFAULT_ADMIN,
        privileges: ADMIN_PRIVILEGES
      };
      storedUsers = [newAdmin, ...storedUsers];
    }
    // Agregar usuarios de prueba si no existen
    DEFAULT_USERS.forEach(user => {
      if (!storedUsers.some(u => u.correo === user.correo)) {
        storedUsers.push(user);
      }
    });
    // Eliminar duplicados por correo
    const uniqueUsers = storedUsers.filter((user, index, self) =>
      index === self.findIndex(u => u.correo === user.correo)
    );
    setUsers(uniqueUsers);
    setIsLoaded(true);
  }, []);

  // Guardar usuarios en localStorage cuando cambian, solo si ya se cargaron
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users, isLoaded]);

  // Sincronizar filteredUsers con users (para el primer render y cambios en users)
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

  // Filtrar admin para la tabla y paginador
  const usersWithoutAdmin = filteredUsers.filter(u => !u.isAdmin);
  const totalPages = Math.ceil(usersWithoutAdmin.length / USERS_PER_PAGE);
  const paginatedUsers = usersWithoutAdmin.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, users]);

  // Acciones CRUD
  const handleCreateUser = (newUser) => {
    setUsers(prev => {
      const updated = [...prev, newUser];
      toast.success('Usuario creado correctamente', { position: 'top-right' });
      return updated;
    });
    setShowCreateModal(false);
  };
  const handleEditUser = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowEditModal(false);
    toast.success('Usuario editado correctamente', { position: 'top-right' });
  };
  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      const result = await Swal.fire({
        title: `¿Estás seguro de que quieres eliminar al usuario "${userToDelete.nombre}"?`,
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('Usuario eliminado correctamente', { position: 'top-right' });
      }
    }
  };

  // Abrir modales
  const openCreateModal = () => setShowCreateModal(true);
  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };
  // Cerrar modales
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
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

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
    <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Search searchTerm={searchTerm} handleSearch={e => handleSearch(e.target.value)} placeholder="Buscar usuario..." />
        <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center"
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-circle mr-2"></i>
          Crear usuario
        </button>
      </div>
      <UserTable
        users={paginatedUsers}
        onView={openDetailModal}
        onEdit={openEditModal}
        onDelete={handleDeleteUser}
      />
      {usersWithoutAdmin.length > USERS_PER_PAGE && (
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
          </div>
        </div>
      </div>
      {showCreateModal && (
        <CreateUserModal
          onClose={closeModals}
          onCreate={handleCreateUser}
          users={users}
        />
      )}
      {showEditModal && selectedUser && (
        <EditUserModal
          onClose={closeModals}
          onEdit={handleEditUser}
          user={selectedUser}
          users={users}
        />
      )}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          onClose={closeModals}
          user={selectedUser}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Users;