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

export const getRoles = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(initialRoles);
    }, 500); // Simula un retardo de red
  });
};

// Más adelante, podrías añadir funciones como:
// export const getCustomers = () => { /* ... */ };
// export const getEmployees = () => { /* ... */ }; 