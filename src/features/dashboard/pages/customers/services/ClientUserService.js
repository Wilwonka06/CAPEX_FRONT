import { getUsersByRole, getUserById, updateUser, deleteUser, toggleUserStatus } from './UserService.js';
import rolesService from '../../roles/services';

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

// Función auxiliar para obtener el ID del rol "Cliente"
const getClienteRoleId = async () => {
  try {
    const roles = await rolesService.getAllRoles();
    const clienteRole = roles.find(r => 
      r.nombre?.toLowerCase() === 'cliente' || 
      r.name?.toLowerCase() === 'cliente'
    );
    if (clienteRole) {
      return clienteRole.id || clienteRole.id_rol;
    }
    // Fallback si no se encuentra
    console.warn('Rol "Cliente" no encontrado, usando ID por defecto 13');
    return 13;
  } catch (error) {
    console.warn('Error al obtener roles, usando ID por defecto 13:', error);
    return 13;
  }
};

// Función para convertir datos de cliente a formato de usuario
const convertCustomerToUser = (customerData, roleId = null) => {
  return {
    nombre: `${customerData.firstName} ${customerData.lastName}`.trim(),
    correo: customerData.email,
    telefono: customerData.phone,
    tipo_documento: customerData.documentType,
    documento: customerData.documentNumber,
    roleId: roleId || 13, // ID del rol "Cliente" (se obtendrá dinámicamente)
    estado: customerData.status || "Activo"
  };
};

// Obtener todos los clientes (usuarios con rol "Cliente")
export const getCustomers = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await getUsersByRole("Cliente", page, limit, search);
    
    // Validar que la respuesta tenga el formato esperado
    if (!response) {
      console.error('Error: La respuesta de getUsersByRole está vacía', response);
      throw new Error('La respuesta del servidor está vacía');
    }
    
    // Convertir usuarios a formato de clientes
    const usersArray = response.data || response.users || [];
    
    if (!Array.isArray(usersArray)) {
      console.error('Error: La respuesta no contiene un array de usuarios', response);
      throw new Error('Formato de respuesta inválido: se esperaba un array de usuarios');
    }
    
    const customers = usersArray.map(convertUserToCustomer);
    
    return {
      data: customers,
      total: response.total || response.count || customers.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil((response.total || response.count || customers.length) / limit)
    };
  } catch (error) {
    console.error('Error en getCustomers:', error);
    // Re-lanzar el error con más contexto
    throw new Error(error.message || 'Error al obtener los clientes desde el servidor');
  }
};

// Obtener un cliente por ID
export const getCustomerById = async (id) => {
  try {
    if (!id) {
      throw new Error('ID de cliente no proporcionado');
    }
    const user = await getUserById(id);
    if (!user) {
      throw new Error('Cliente no encontrado');
    }
    return convertUserToCustomer(user);
  } catch (error) {
    console.error('Error en getCustomerById:', error);
    throw new Error(error.message || 'Error al obtener el cliente');
  }
};

// Crear un nuevo cliente (usuario con rol "Cliente")
export const createCustomer = async (customerData) => {
  // Obtener el ID del rol "Cliente" dinámicamente
  const clienteRoleId = await getClienteRoleId();
  const userData = convertCustomerToUser(customerData, clienteRoleId);
  // Aquí necesitarías implementar createUser en UserService
  // Por ahora, lanzar error indicando que no está implementado
  throw new Error('Crear cliente no está implementado. Usa el módulo de usuarios para crear usuarios con rol "Cliente".');
};

// Actualizar un cliente existente
export const updateCustomer = async (id, customerData) => {
  // Obtener el ID del rol "Cliente" dinámicamente
  const clienteRoleId = await getClienteRoleId();
  const userData = convertCustomerToUser(customerData, clienteRoleId);
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
  try {
    // Obtener todos los usuarios con rol "Cliente"
    const response = await getUsersByRole("Cliente", 1, 1000); // Obtener todos
    const usersArray = response.data || response.users || [];
    
    if (!Array.isArray(usersArray)) {
      console.error('Error: La respuesta no contiene un array de usuarios', response);
      return { exists: false };
    }
    
    const customers = usersArray.map(convertUserToCustomer);
    
    const exists = customers.some(c => 
      c.documentNumber === documentNumber && 
      c.documentType === documentType &&
      (!excludeId || c.id !== parseInt(excludeId))
    );
    
    return { exists };
  } catch (error) {
    console.error('Error en validateDocumentExists:', error);
    // En caso de error, retornar false para no bloquear la creación
    return { exists: false };
  }
};

// Validar si un email ya existe
export const validateEmailExists = async (email, excludeId = null) => {
  try {
    // Obtener todos los usuarios con rol "Cliente"
    const response = await getUsersByRole("Cliente", 1, 1000); // Obtener todos
    const usersArray = response.data || response.users || [];
    
    if (!Array.isArray(usersArray)) {
      console.error('Error: La respuesta no contiene un array de usuarios', response);
      return { exists: false };
    }
    
    const customers = usersArray.map(convertUserToCustomer);
    
    const exists = customers.some(c => 
      c.email.toLowerCase() === email.toLowerCase() &&
      (!excludeId || c.id !== parseInt(excludeId))
    );
    
    return { exists };
  } catch (error) {
    console.error('Error en validateEmailExists:', error);
    // En caso de error, retornar false para no bloquear la creación
    return { exists: false };
  }
};
