import customersService from '../API/customersService';

/**
 * Servicio de Clientes - Wrapper para customersService
 * 
 * Este servicio proporciona una interfaz simple para el módulo de clientes,
 * usando el servicio estándar customersService que sigue la estructura
 * de conexión de los demás módulos.
 */

// Obtener todos los clientes
export const getCustomers = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await customersService.getAll({ page, limit, search });
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || page,
      limit: response.limit || limit,
      totalPages: response.totalPages || 0,
    };
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error;
  }
};

// Obtener un cliente por ID
export const getCustomerById = async (id) => {
  try {
    const response = await customersService.getById(id);
    return response.data || response;
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    throw error;
  }
};

// Crear un nuevo cliente
export const createCustomer = async (customerData) => {
  try {
    const response = await customersService.create(customerData);
    return response.data || response;
  } catch (error) {
    console.error('Error in createCustomer:', error);
    throw error;
  }
};

// Actualizar un cliente existente
export const updateCustomer = async (id, customerData) => {
  try {
    const response = await customersService.update(id, customerData);
    return response.data || response;
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error;
  }
};

// Eliminar un cliente
export const deleteCustomer = async (id) => {
  try {
    const response = await customersService.delete(id);
    return response;
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error;
  }
};

// Cambiar estado de un cliente (activar/desactivar)
export const toggleCustomerStatus = async (id) => {
  try {
    // Primero obtener el cliente para saber su estado actual
    const customer = await customersService.getById(id);
    const currentStatus = customer.data?.status || customer.data?.estado || 'Activo';
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    
    // Cambiar estado (sin conceptoEstado por ahora, se puede mejorar después)
    const response = await customersService.changeStatus(id, newStatus, newStatus === 'Inactivo' ? 'Cambio de estado' : null);
    return response.data || response;
  } catch (error) {
    console.error('Error in toggleCustomerStatus:', error);
    throw error;
  }
};

// Validar si un documento ya existe
export const validateDocumentExists = async (documentNumber, documentType, excludeId = null) => {
  try {
    return await customersService.validateDocument(documentNumber, documentType, excludeId);
  } catch (error) {
    console.error('Error in validateDocumentExists:', error);
    throw error;
  }
};

// Validar si un email ya existe
export const validateEmailExists = async (email, excludeId = null) => {
  try {
    return await customersService.validateEmail(email, excludeId);
  } catch (error) {
    console.error('Error in validateEmailExists:', error);
    throw error;
  }
};
