// src/shared/services/ModuleDataService.js

// Define los initialRoles aquí para que sean la fuente de verdad para este servicio.
const initialRoles = [
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
  },
  {
    id: 2,
    name: 'Editor',
    description: 'Gestión de contenido',
    estado: 'Inactivo',
    privileges: {
      'Dashboard': { 'Crear': false, 'Visualizar': true, 'Editar': false, 'Eliminar': false },
      'Gestión de Usuarios': { 'Crear': false, 'Visualizar': true, 'Editar': false, 'Eliminar': false },
      'Gestión de Compras': { 'Crear': false, 'Visualizar': true, 'Editar': false, 'Eliminar': false },
      'Gestión de Servicios': { 'Crear': false, 'Visualizar': true, 'Editar': false, 'Eliminar': false },
      'Ventas': { 'Crear': false, 'Visualizar': true, 'Editar': false, 'Eliminar': false },
      'configuración': { 'Crear': false, 'Visualizar': true, 'Editar': false, 'Eliminar': false }
    }
  }
];

const ROLES_KEY = 'roles';

function saveRolesToStorage(roles) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

function loadRolesFromStorage() {
  const data = localStorage.getItem(ROLES_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export const getRoles = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let roles = loadRolesFromStorage();
      if (!roles) {
        saveRolesToStorage(initialRoles);
        roles = initialRoles;
      }
      resolve(roles);
    }, 500);
  });
};

export const createRole = (role) => {
  return new Promise((resolve) => {
    getRoles().then((roles) => {
      const newRole = { ...role, id: Date.now() };
      const updatedRoles = [...roles, newRole];
      saveRolesToStorage(updatedRoles);
      resolve(newRole);
    });
  });
};

export const updateRole = (updatedRole) => {
  return new Promise((resolve) => {
    getRoles().then((roles) => {
      const updatedRoles = roles.map(r => r.id === updatedRole.id ? updatedRole : r);
      saveRolesToStorage(updatedRoles);
      resolve(updatedRole);
    });
  });
};

export const deleteRole = (roleId) => {
  return new Promise((resolve) => {
    getRoles().then((roles) => {
      const updatedRoles = roles.filter(r => r.id !== roleId);
      saveRolesToStorage(updatedRoles);
      resolve(roleId);
    });
  });
};

const USERS_KEY = 'usuarios';

function saveUsersToStorage(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadUsersFromStorage() {
  // Migración automática de 'users' a 'usuarios'
  const oldData = localStorage.getItem('users');
  const newData = localStorage.getItem(USERS_KEY);
  if (!newData && oldData) {
    try {
      const oldUsers = JSON.parse(oldData);
      if (Array.isArray(oldUsers)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(oldUsers));
        localStorage.removeItem('users');
        return oldUsers;
      }
    } catch {}
  }
  const data = localStorage.getItem(USERS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export const getUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let users = loadUsersFromStorage();
      if (!users) {
        users = [];
        saveUsersToStorage(users);
      }
      resolve(users);
    }, 200);
  });
};

export const addUser = (user) => {
  return new Promise((resolve) => {
    getUsers().then((users) => {
      const newUser = { ...user, id: Date.now() };
      const updatedUsers = [...users, newUser];
      saveUsersToStorage(updatedUsers);
      resolve(newUser);
    });
  });
};

// Más adelante, podrías añadir funciones como:
// export const getCustomers = () => { /* ... */ };
// export const getEmployees = () => { /* ... */ }; 