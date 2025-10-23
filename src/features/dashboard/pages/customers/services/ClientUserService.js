import { getUsersByRole, updateUser, deleteUser, toggleUserStatus } from './UserService.js';

/**
 * Servicio de Clientes basado en Usuarios con rol "Cliente"
 * 
 * Este servicio obtiene usuarios con rol "Cliente" del backend y los presenta
 * como clientes en el módulo de gestión de clientes.
 * 
 * Para cambiar entre modos:
 * - Cambiar USE_MOCK_SERVICE a false cuando el backend esté listo
 * - Asegurarse de que el backend tenga implementados los endpoints de usuarios
 */

// Función para convertir usuario a formato de cliente
const convertUserToCustomer = (user) => {
  return {
    id: user.id_usuario,
    documentType: user.tipo_documento || "CC",
    documentNumber: user.documento || "",
    firstName: user.nombre ? user.nombre.split(' ')[0] : "",
    lastName: user.nombre ? user.nombre.split(' ').slice(1).join(' ') : "",
    email: user.correo || "",
    phone: user.telefono || "",
    status: user.estado || "Activo",
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
    // Campos adicionales del usuario
    userId: user.id_usuario,
    role: user.rol?.nombre || "Cliente",
    isUser: true // Marcar que proviene de usuarios
  };
};

// Función para convertir datos de cliente a formato de usuario
const convertCustomerToUser = (customerData) => {
  return {
    nombre: `${customerData.firstName} ${customerData.lastName}`.trim(),
    correo: customerData.email,
    telefono: customerData.phone,
    tipo_documento: customerData.documentType,
    documento: customerData.documentNumber,
    roleId: 13, // ID del rol "Cliente"
    estado: customerData.status || "Activo"
  };
};

// Obtener todos los clientes (usuarios con rol "Cliente")
export const getCustomers = async (page = 1, limit = 10, search = '') => {
  const response = await getUsersByRole("Cliente", page, limit, search);
  
  // Convertir usuarios a formato de clientes
  const customers = (response.data || response.users || []).map(convertUserToCustomer);
  
  return {
    data: customers,
    total: response.total || response.count || customers.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil((response.total || response.count || customers.length) / limit)
  };
};

// Obtener un cliente por ID
export const getCustomerById = async (id) => {
  const user = await getUserById(id);
  return convertUserToCustomer(user);
};

// Crear un nuevo cliente (usuario con rol "Cliente")
export const createCustomer = async (customerData) => {
  const userData = convertCustomerToUser(customerData);
  // Aquí necesitarías implementar createUser en UserService
  // Por ahora, lanzar error indicando que no está implementado
  throw new Error('Crear cliente no está implementado. Usa el módulo de usuarios para crear usuarios con rol "Cliente".');
};

// Actualizar un cliente existente
export const updateCustomer = async (id, customerData) => {
  const userData = convertCustomerToUser(customerData);
  const updatedUser = await updateUser(id, userData);
  return convertUserToCustomer(updatedUser);
};

// Eliminar un cliente
export const deleteCustomer = async (id) => {
  const response = await deleteUser(id);
  return {
    message: 'Cliente eliminado exitosamente',
    deletedCustomer: { id }
  };
};

// Cambiar estado de un cliente (activar/desactivar)
export const toggleCustomerStatus = async (id) => {
  const response = await toggleUserStatus(id);
  return {
    message: `Estado del cliente actualizado`,
    customer: convertUserToCustomer(response)
  };
};

// Validar si un documento ya existe
export const validateDocumentExists = async (documentNumber, documentType, excludeId = null) => {
  // Obtener todos los usuarios con rol "Cliente"
  const response = await getUsersByRole("Cliente", 1, 1000); // Obtener todos
  const customers = (response.data || response.users || []).map(convertUserToCustomer);
  
  const exists = customers.some(c => 
    c.documentNumber === documentNumber && 
    c.documentType === documentType &&
    (!excludeId || c.id !== parseInt(excludeId))
  );
  
  return { exists };
};

// Validar si un email ya existe
export const validateEmailExists = async (email, excludeId = null) => {
  // Obtener todos los usuarios con rol "Cliente"
  const response = await getUsersByRole("Cliente", 1, 1000); // Obtener todos
  const customers = (response.data || response.users || []).map(convertUserToCustomer);
  
  const exists = customers.some(c => 
    c.email.toLowerCase() === email.toLowerCase() &&
    (!excludeId || c.id !== parseInt(excludeId))
  );
  
  return { exists };
};
