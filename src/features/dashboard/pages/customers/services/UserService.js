import { API_CONFIG, API_ENDPOINTS, getAuthHeaders } from '../../../../../shared/config/api.js';
import rolesService from '../../roles/services';

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
    credentials: 'include', // Importante para incluir cookies HttpOnly
    ...options,
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, config);
    
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // Si no se puede parsear como JSON, usar el texto de la respuesta
        const text = await response.text().catch(() => '');
        errorData = { message: text || `Error ${response.status}: ${response.statusText}` };
      }
      
      throw {
        response: {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        }
      };
    }
    
    // Intentar parsear la respuesta como JSON
    try {
      return await response.json();
    } catch (jsonError) {
      console.error('Error al parsear respuesta JSON:', jsonError);
      const text = await response.text().catch(() => '');
      throw {
        request: true,
        message: `Error al procesar la respuesta del servidor: ${text || 'Respuesta no válida'}`
      };
    }
  } catch (error) {
    // Si ya es un error formateado, re-lanzarlo
    if (error.response) {
      throw error;
    }
    // Si es un error de red u otro tipo
    if (error.request) {
      throw error;
    }
    // Error desconocido
    throw {
      request: true,
      message: error.message || 'Error de conexión. Verifica tu conexión a internet'
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
    // Obtener el ID del rol dinámicamente desde el backend
    let roleId = null;
    
    try {
      // Obtener todos los roles desde el backend
      const roles = await rolesService.getAllRoles();
      
      // Buscar el rol por nombre (case-insensitive)
      const role = roles.find(r => 
        r.nombre?.toLowerCase() === roleName.toLowerCase() || 
        r.name?.toLowerCase() === roleName.toLowerCase()
      );
      
      if (role) {
        roleId = role.id || role.id_rol;
      }
    } catch (rolesError) {
      console.warn('Error al obtener roles desde el backend, usando mapeo de respaldo:', rolesError);
      // Fallback a mapeo estático si falla la obtención de roles
      const roleIdMap = {
        'Cliente': 13,
        'Empleado': 2,
        'Administrador': 1
      };
      roleId = roleIdMap[roleName];
    }
    
    if (!roleId) {
      throw new Error(`Rol '${roleName}' no encontrado en el sistema. Por favor, verifique que el rol existe.`);
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
