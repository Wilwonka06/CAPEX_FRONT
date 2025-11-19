import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de usuarios
 * Endpoints base: /api/usuarios
 */

const USERS_ENDPOINT = '/usuarios';

export const usersService = {
  /**
   * Obtener todos los usuarios con paginación y búsqueda avanzada
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {number} params.roleId - ID del rol (opcional)
   * @param {string} params.tipo_documento - Tipo de documento (opcional)
   * @param {string} params.nombre - Nombre (opcional)
   * @param {string} params.correo - Correo (opcional)
   * @param {string} params.documento - Documento (opcional)
   * @param {string} params.telefono - Teléfono (opcional)
   * @returns {Promise<Object>} Lista de usuarios con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.roleId) queryParams.append('roleId', params.roleId);
      if (params.tipo_documento) queryParams.append('tipo_documento', params.tipo_documento);
      if (params.nombre) queryParams.append('nombre', params.nombre);
      if (params.correo) queryParams.append('correo', params.correo);
      if (params.documento) queryParams.append('documento', params.documento);
      if (params.telefono) queryParams.append('telefono', params.telefono);

      const url = queryParams.toString()
        ? `${USERS_ENDPOINT}?${queryParams.toString()}`
        : USERS_ENDPOINT;

      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Obtener un usuario por ID
   * @param {number|string} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del usuario es requerido');
      }

      const response = await apiRequest.get(`${USERS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.nombre - Nombre del usuario
   * @param {string} userData.correo - Correo electrónico
   * @param {string} userData.contrasena - Contraseña
   * @param {string} userData.tipo_documento - Tipo de documento
   * @param {string} userData.documento - Número de documento
   * @param {string} userData.telefono - Teléfono
   * @param {number} userData.roleId - ID del rol
   * @param {string} userData.estado - Estado del usuario
   * @param {string} userData.foto - Foto (opcional)
   * @param {string} userData.direccion - Dirección (opcional)
   * @returns {Promise<Object>} Usuario creado
   */
  create: async (userData) => {
    try {
      // Validaciones básicas
      if (!userData.nombre || userData.nombre.trim() === '') {
        throw new Error('El nombre del usuario es requerido');
      }
      if (!userData.correo || userData.correo.trim() === '') {
        throw new Error('El correo electrónico es requerido');
      }
      // Contraseña opcional: si el backend tiene default/auto-generación, no exigir

      // Limpiar datos
      const normalizePhone = (t) => {
        if (!t) return t;
        const digits = String(t).replace(/[^0-9]/g, '');
        return `+${digits}`;
      };
      const cleanData = {
        nombre: userData.nombre.trim(),
        correo: userData.correo.trim(),
        tipo_documento: userData.tipo_documento,
        documento: userData.documento,
        telefono: normalizePhone(userData.telefono),
        roleId: userData.roleId,
        ...(userData.foto && { foto: userData.foto }),
        ...(userData.direccion && { direccion: userData.direccion }),
      };

      console.log('API Service: Sending data to backend:', cleanData);
      const response = await apiRequest.post(USERS_ENDPOINT, cleanData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Actualizar un usuario existente
   * @param {number|string} id - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  update: async (id, userData) => {
    try {
      if (!id) {
        throw new Error('ID del usuario es requerido');
      }

      // Validaciones básicas
      if (userData.nombre && userData.nombre.trim() === '') {
        throw new Error('El nombre del usuario no puede estar vacío');
      }
      if (userData.correo && userData.correo.trim() === '') {
        throw new Error('El correo electrónico no puede estar vacío');
      }

      // Limpiar datos - excluir contraseña para evitar actualizaciones accidentales
      const { contrasena, ...dataWithoutPassword } = userData;
      const normalizePhone = (t) => {
        if (!t) return t;
        const digits = String(t).replace(/[^0-9]/g, '');
        return `+${digits}`;
      };
      const cleanData = { ...dataWithoutPassword };
      if (cleanData.nombre) {
        cleanData.nombre = cleanData.nombre.trim();
      }
      if (cleanData.correo) {
        cleanData.correo = cleanData.correo.trim();
      }
      if (cleanData.telefono) {
        cleanData.telefono = normalizePhone(cleanData.telefono);
      }

      const response = await apiRequest.put(`${USERS_ENDPOINT}/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un usuario
   * @param {number|string} id - ID del usuario
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del usuario es requerido');
      }

      const response = await apiRequest.delete(`${USERS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de un usuario
   * @param {number|string} id - ID del usuario
   * @param {string} nuevoEstado - Nuevo estado ('Activo', 'Inactivo', etc.)
   * @param {string} conceptoEstado - Concepto del estado (requerido si estado es Inactivo)
   * @returns {Promise<Object>} Usuario con estado actualizado
   */
  changeStatus: async (id, nuevoEstado, conceptoEstado = null) => {
    try {
      console.log('Front-end: changeStatus called with id:', id, 'status:', nuevoEstado, 'concepto:', conceptoEstado);
      if (!id) {
        throw new Error('ID del usuario es requerido');
      }
      const estadosValidos = ['Activo', 'Inactivo', 'Vacaciones', 'Suspendido', 'Enfermo', 'Incapacitado', 'Luto', 'Fallecido'];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
      }

      // Validar conceptoEstado si es requerido
      if (nuevoEstado === 'Inactivo' && !conceptoEstado) {
        throw new Error('El concepto de estado es obligatorio cuando el estado es Inactivo');
      }

      const requestData = { nuevoEstado };
      if (conceptoEstado) {
        requestData.conceptoEstado = conceptoEstado;
      }

      const response = await apiRequest.patch(`${USERS_ENDPOINT}/${id}/cambiar-estado`, requestData);
      console.log('Front-end: changeStatus response:', response);
      return response;
    } catch (error) {
      console.error(`Error changing user status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar usuarios por término
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} filters - Filtros adicionales (opcional)
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  search: async (searchTerm, filters = {}) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new Error('Término de búsqueda es requerido');
      }

      const params = {
        search: searchTerm.trim(),
        ...filters
      };

      return await usersService.getAll(params);
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  /**
   * Obtener roles disponibles para asignar a usuarios
   * @returns {Promise<Array>} Lista de roles disponibles
   */
  getAvailableRoles: async () => {
    try {
      const response = await apiRequest.get(`${USERS_ENDPOINT}/available-roles`);
      return response;
    } catch (error) {
      console.error('Error fetching available roles:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas de usuarios
   */
  getStats: async () => {
    try {
      const response = await apiRequest.get(`${USERS_ENDPOINT}/stats`);
      return response;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  /**
   * Cambiar contraseña de un usuario
   * @param {number|string} id - ID del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Confirmación de cambio de contraseña
   */
  changePassword: async (id, newPassword) => {
    try {
      if (!id) {
        throw new Error('ID del usuario es requerido');
      }
      if (!newPassword || newPassword.trim() === '') {
        throw new Error('La nueva contraseña es requerida');
      }

      const response = await apiRequest.patch(`${USERS_ENDPOINT}/${id}/password`, { newPassword });
      return response;
    } catch (error) {
      console.error(`Error changing password for user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Editar perfil de usuario
   * @param {number|string} id - ID del usuario
   * @param {Object} profileData - Datos del perfil
   * @returns {Promise<Object>} Usuario actualizado
   */
  editProfile: async (id, profileData) => {
    try {
      if (!id) {
        throw new Error('ID del usuario es requerido');
      }

      const response = await apiRequest.put(`${USERS_ENDPOINT}/${id}/profile`, profileData);
      return response;
    } catch (error) {
      console.error(`Error editing profile for user ${id}:`, error);
      throw error;
    }
  },
};

export default usersService;
