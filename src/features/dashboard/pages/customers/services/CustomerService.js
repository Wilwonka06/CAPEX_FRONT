import { API_CONFIG, API_ENDPOINTS, getAuthHeaders } from '../../../../../shared/config/api.js';
import * as ClientUserService from './ClientUserService.js';

/**
 * Servicio de Clientes - Basado en Usuarios con rol "Cliente"
 * 
 * Este servicio obtiene usuarios con rol "Cliente" del backend y los presenta
 * como clientes en el módulo de gestión de clientes.
 * 
 * Requiere que el backend tenga implementados los endpoints de usuarios.
 */

// Función auxiliar para manejar errores de la API
const handleApiError = (error) => {
  console.error('Error en CustomerService:', error);
  
  if (error.response) {
    // El servidor respondió con un código de error
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return data.message || 'Datos inválidos';
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente';
      case 403:
        return 'No tienes permisos para realizar esta acción';
      case 404:
        return 'Cliente no encontrado';
      case 409:
        return data.message || 'El cliente ya existe';
      case 500:
        return 'Error interno del servidor';
      default:
        return data.message || 'Error del servidor';
    }
  } else if (error.request) {
    // La petición se hizo pero no se recibió respuesta
    return 'Error de conexión. Verifica tu conexión a internet';
  } else {
    // Algo más pasó
    return error.message || 'Error inesperado';
  }
};

// Función auxiliar para hacer peticiones HTTP
const makeRequest = async (url, options = {}) => {
  const config = {
    method: 'GET',
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        response: {
          status: response.status,
          data: errorData
        }
      };
    }
    
    return await response.json();
  } catch (error) {
    if (error.response) {
      throw error;
    }
    throw {
      request: true,
      message: error.message
    };
  }
};

// Obtener todos los clientes
export const getCustomers = async (page = 1, limit = 10, search = '') => {
  return await ClientUserService.getCustomers(page, limit, search);
};

// Obtener un cliente por ID
export const getCustomerById = async (id) => {
  return await ClientUserService.getCustomerById(id);
};

// Crear un nuevo cliente
export const createCustomer = async (customerData) => {
  return await ClientUserService.createCustomer(customerData);
};

// Actualizar un cliente existente
export const updateCustomer = async (id, customerData) => {
  return await ClientUserService.updateCustomer(id, customerData);
};

// Eliminar un cliente
export const deleteCustomer = async (id) => {
  return await ClientUserService.deleteCustomer(id);
};

// Cambiar estado de un cliente (activar/desactivar)
export const toggleCustomerStatus = async (id) => {
  return await ClientUserService.toggleCustomerStatus(id);
};

// Validar si un documento ya existe
export const validateDocumentExists = async (documentNumber, documentType, excludeId = null) => {
  return await ClientUserService.validateDocumentExists(documentNumber, documentType, excludeId);
};

// Validar si un email ya existe
export const validateEmailExists = async (email, excludeId = null) => {
  return await ClientUserService.validateEmailExists(email, excludeId);
};
