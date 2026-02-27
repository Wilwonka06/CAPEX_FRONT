import { API_CONFIG, API_ENDPOINTS, getAuthHeaders } from '../../../../../shared/config/api.js';
import rolesService from '../../roles/services';

// ─────────────────────────────────────────────
// UTILIDADES INTERNAS
// ─────────────────────────────────────────────

/**
 * Convierte un error de API en un mensaje legible
 */
const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400: return data?.message || 'Datos inválidos';
      case 401: return 'No autorizado. Por favor, inicia sesión nuevamente';
      case 403: return 'No tienes permisos para realizar esta acción';
      case 404: return 'Usuario no encontrado';
      case 409: return data?.message || 'Ya existe un usuario con esos datos';
      case 500: return 'Error interno del servidor';
      default:  return data?.message || 'Error del servidor';
    }
  }
  if (error.request) return 'Error de conexión. Verifica tu conexión a internet';
  return error.message || 'Error inesperado';
};

/**
 * Realiza peticiones HTTP al backend
 * Lanza errores estructurados para que handleApiError los interprete
 */
const makeRequest = async (url, options = {}) => {
  const config = {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, config);

    let responseData = {};
    try {
      responseData = await response.json();
    } catch {
      const text = await response.text().catch(() => '');
      responseData = { message: text || `Error ${response.status}` };
    }

    if (!response.ok) {
      throw { response: { status: response.status, data: responseData } };
    }

    return responseData;
  } catch (error) {
    if (error.response) throw error;
    throw { request: true, message: error.message || 'Error de conexión' };
  }
};

// ─────────────────────────────────────────────
// FUNCIONES EXPORTADAS
// ─────────────────────────────────────────────

/**
 * Obtener todos los usuarios con paginación y búsqueda
 */
export const getUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    return await makeRequest(`${API_ENDPOINTS.USERS}?${params}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener usuarios filtrados por nombre de rol
 * Resuelve el ID del rol dinámicamente antes de consultar
 */
export const getUsersByRole = async (roleName, page = 1, limit = 10, search = '') => {
  try {
    let roleId = null;

    try {
      const roles = await rolesService.getAllRoles();
      const role = roles.find(r =>
        r.nombre?.toLowerCase() === roleName.toLowerCase() ||
        r.name?.toLowerCase() === roleName.toLowerCase()
      );
      if (role) roleId = role.id || role.id_rol;
    } catch {
      // Fallback estático si el endpoint de roles falla
      const fallback = { Cliente: 13, Empleado: 2, Administrador: 1 };
      roleId = fallback[roleName];
    }

    if (!roleId) {
      throw new Error(`Rol '${roleName}' no encontrado en el sistema`);
    }

    const params = new URLSearchParams({
      roleId: roleId.toString(),
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    return await makeRequest(`${API_ENDPOINTS.USERS}?${params}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (id) => {
  try {
    const response = await makeRequest(`${API_ENDPOINTS.USERS}/${id}`);
    return response.data || response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Actualizar un usuario existente
 * FIX: Antes lanzaba Error directamente sin llamar al backend
 */
export const updateUser = async (id, userData) => {
  try {
    if (!id) throw new Error('ID de usuario requerido');

    const response = await makeRequest(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    return response.data || response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Eliminar un usuario
 * FIX: Antes lanzaba Error directamente sin llamar al backend.
 * El backend SÍ tiene DELETE /api/usuarios/:id
 */
export const deleteUser = async (id) => {
  try {
    if (!id) throw new Error('ID de usuario requerido');

    const response = await makeRequest(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
export const toggleUserStatus = async (id, nuevoEstado = 'Inactivo', conceptoEstado = null) => {
  try {
    if (!id) throw new Error('ID de usuario requerido');

    const estadosValidos = ['Activo', 'Inactivo', 'Vacaciones', 'Suspendido', 'Enfermo', 'Incapacitado', 'Luto', 'Fallecido'];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error(`Estado no válido. Debe ser uno de: ${estadosValidos.join(', ')}`);
    }

    if (nuevoEstado === 'Inactivo' && !conceptoEstado) {
      throw new Error('El concepto de estado es obligatorio cuando el estado es Inactivo');
    }

    const body = { nuevoEstado };
    if (conceptoEstado) body.conceptoEstado = conceptoEstado;

    const response = await makeRequest(`${API_ENDPOINTS.USERS}/${id}/cambiar-estado`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return response.data || response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
