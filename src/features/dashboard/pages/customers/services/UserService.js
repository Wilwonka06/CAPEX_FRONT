import { API_CONFIG, API_ENDPOINTS, getAuthHeaders } from '../../../../../shared/config/api.js';

// Función auxiliar para manejar errores de la API
const handleApiError = (error) => {
  console.error('Error en UserService:', error);
  
  if (error.response) {
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
        return 'Usuario no encontrado';
      case 500:
        return 'Error interno del servidor';
      default:
        return data.message || 'Error del servidor';
    }
  } else if (error.request) {
    return 'Error de conexión. Verifica tu conexión a internet';
  } else {
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

// Obtener todos los usuarios
export const getUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const response = await makeRequest(`${API_ENDPOINTS.USERS}?${params}`);
    return response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener usuarios con rol específico
export const getUsersByRole = async (roleName, page = 1, limit = 10, search = '') => {
  try {
    // Mapear nombre del rol a ID del rol
    const roleIdMap = {
      'Cliente': 3,
      'Empleado': 2,
      'Administrador': 1
    };
    
    const roleId = roleIdMap[roleName];
    if (!roleId) {
      throw new Error(`Rol '${roleName}' no encontrado`);
    }
    
    const params = new URLSearchParams({
      roleId: roleId.toString(),
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const response = await makeRequest(`${API_ENDPOINTS.USERS}?${params}`);
    return response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener un usuario por ID
export const getUserById = async (id) => {
  try {
    const response = await makeRequest(`${API_ENDPOINTS.USERS}/${id}`);
    return response.data || response; // El backend devuelve {success: true, data: {...}}
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar un usuario existente
export const updateUser = async (id, userData) => {
  try {
    // NOTA: El backend no tiene implementado el endpoint para actualizar usuarios
    // Esta funcionalidad está temporalmente deshabilitada
    throw new Error('La funcionalidad de actualizar usuarios no está disponible en el backend. Contacta al administrador para implementar el endpoint PUT /api/usuarios/:id');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar un usuario
export const deleteUser = async (id) => {
  try {
    // NOTA: El backend no tiene implementado el endpoint para eliminar usuarios
    // Esta funcionalidad está temporalmente deshabilitada
    throw new Error('La funcionalidad de eliminar usuarios no está disponible en el backend. Contacta al administrador para implementar el endpoint DELETE /api/usuarios/:id');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Cambiar estado de un usuario (activar/desactivar)
export const toggleUserStatus = async (id) => {
  try {
    // NOTA: El backend no tiene implementado el endpoint para cambiar estado
    // Esta funcionalidad está temporalmente deshabilitada
    throw new Error('La funcionalidad de cambiar estado no está disponible en el backend. Contacta al administrador para implementar el endpoint PUT /api/usuarios/:id');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
