import apiRequest from '../../../../../shared/config/apiConfig';
import DataMapper from '../services/DataMapper';

/**
 * Servicio API para gestión de roles
 * Endpoints base: /api/roles
 */

const ROLES_ENDPOINT = '/roles';

// Función helper para obtener permisos y privilegios y actualizar mapeos
const initializeMaps = async () => {
  try {
    const [permissionsData, privilegesData] = await Promise.all([
      apiRequest.get(`${ROLES_ENDPOINT}/permisos/todos`).catch(() => []),
      apiRequest.get(`${ROLES_ENDPOINT}/privilegios/todos`).catch(() => [])
    ]);

    if (permissionsData?.success && permissionsData?.data && 
        privilegesData?.success && privilegesData?.data) {
      DataMapper.initializeMaps(permissionsData.data, privilegesData.data);
    }
    
    return {
      permissions: permissionsData?.success ? permissionsData.data : [],
      privileges: privilegesData?.success ? privilegesData.data : []
    };
  } catch (error) {
    console.warn('⚠️ Error al inicializar mapeos:', error);
    return { permissions: [], privileges: [] };
  }
};

export const rolesService = {
  /**
   * Obtener todos los roles
   * @returns {Promise<Array>} Lista de roles
   */
  getAll: async () => {
    try {
      // Inicializar mapeos en paralelo con obtener roles
      const [rolesPromise, mapsData] = await Promise.all([
        apiRequest.get(ROLES_ENDPOINT),
        initializeMaps()
      ]);

      const rolesData = rolesPromise?.success ? rolesPromise.data : rolesPromise;
      
      if (Array.isArray(rolesData)) {
        return DataMapper.mapRolesFromBackend(rolesData, mapsData.permissions);
      }
      
      throw new Error(rolesData?.message || 'Error al obtener los roles');
    } catch (error) {
      console.error('[rolesService] getAll ERROR:', error);
      throw error;
    }
  },

  /**
   * Obtener un rol por ID
   * @param {number|string} id - ID del rol
   * @returns {Promise<Object>} Datos del rol
   */
  getById: async (id) => {
    try {
      const [roleData, mapsData] = await Promise.all([
        apiRequest.get(`${ROLES_ENDPOINT}/${id}`),
        initializeMaps()
      ]);

      const role = roleData?.success ? roleData.data : roleData;
      
      if (role) {
        return DataMapper.mapRoleFromBackend(role, mapsData.permissions);
      }
      
      throw new Error(roleData?.message || 'Error al obtener el rol');
    } catch (error) {
      console.error('[rolesService] getById ERROR:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo rol
   * @param {Object} roleData - Datos del rol
   * @returns {Promise<Object>} Rol creado
   */
  create: async (roleData) => {
    try {
      // Asegurar que los mapeos estén inicializados
      const mapsData = await initializeMaps();
      
      const formattedRole = DataMapper.mapRoleToBackend(roleData);
      
      const response = await apiRequest.post(ROLES_ENDPOINT, formattedRole);
      const data = response?.success ? response.data : response;

      if (data) {
        return DataMapper.mapRoleFromBackend(data, mapsData.permissions);
      }
      
      throw new Error(response?.message || 'Error al crear el rol');
    } catch (error) {
      console.error('[rolesService] create ERROR:', error);
      throw error;
    }
  },

  /**
   * Actualizar un rol existente
   * @param {number|string} id - ID del rol
   * @param {Object} roleData - Datos actualizados del rol
   * @returns {Promise<Object>} Rol actualizado
   */
  update: async (id, roleData) => {
    try {
      // Asegurar que los mapeos estén inicializados
      const mapsData = await initializeMaps();
      
      const formattedRole = DataMapper.mapRoleToBackend(roleData);

      const response = await apiRequest.put(`${ROLES_ENDPOINT}/${id}`, formattedRole);
      const data = response?.success ? response.data : response;

      if (data) {
        return DataMapper.mapRoleFromBackend(data, mapsData.permissions);
      }

      throw new Error(response?.message || 'Error al actualizar el rol');
    } catch (error) {
      console.error('[rolesService] update ERROR:', error);
      throw error;
    }
  },

  /**
   * Eliminar un rol
   * @param {number|string} id - ID del rol
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  delete: async (id) => {
    try {
      const response = await apiRequest.delete(`${ROLES_ENDPOINT}/${id}`);
      const data = response?.success ? response : response;

      if (data) {
        return { success: true, message: data.message || 'Rol eliminado exitosamente' };
      }
      
      throw new Error(data?.message || 'Error al eliminar el rol');
    } catch (error) {
      console.error('[rolesService] delete ERROR:', error);
      throw error;
    }
  },

  /**
   * Cambiar el estado de un rol
   * @param {number|string} id - ID del rol
   * @param {string} status - Nuevo estado ('Activo' o 'Inactivo')
   * @returns {Promise<Object>} Rol actualizado
   */
  changeStatus: async (id, status) => {
    try {
      const statusData = {
        estado: status === 'Activo' ? true : false
      };
      
      const response = await apiRequest.patch(`${ROLES_ENDPOINT}/${id}/status`, statusData);
      
      // Obtener permisos disponibles para mapear correctamente
      const mapsData = await initializeMaps();
      const data = response?.success ? response.data : response;
      
      if (data) {
        return DataMapper.mapRoleFromBackend(data, mapsData.permissions);
      }
      
      throw new Error(response?.message || 'Error al cambiar el estado del rol');
    } catch (error) {
      console.error('[rolesService] changeStatus ERROR:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los permisos disponibles
   * @returns {Promise<Array>} Lista de permisos
   */
  getAvailablePermissions: async () => {
    try {
      const response = await apiRequest.get(`${ROLES_ENDPOINT}/permisos/todos`);
      const data = response?.success ? response.data : response;

      if (Array.isArray(data)) {
        return data;
      }
      
      throw new Error(response?.message || 'Error al obtener los permisos');
    } catch (error) {
      console.error('[rolesService] getAvailablePermissions ERROR:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los privilegios disponibles
   * @returns {Promise<Array>} Lista de privilegios
   */
  getAvailablePrivileges: async () => {
    try {
      const response = await apiRequest.get(`${ROLES_ENDPOINT}/privilegios/todos`);
      const data = response?.success ? response.data : response;

      if (Array.isArray(data)) {
        return data;
      }
      
      throw new Error(response?.message || 'Error al obtener los privilegios');
    } catch (error) {
      console.error('[rolesService] getAvailablePrivileges ERROR:', error);
      throw error;
    }
  },
};

// Alias para compatibilidad con código existente
export const getAllRoles = rolesService.getAll;
export const getRoleById = rolesService.getById;
export const createRole = rolesService.create;
export const updateRole = rolesService.update;
export const deleteRole = rolesService.delete;
export const changeRoleStatus = rolesService.changeStatus;
export const getAvailablePermissions = rolesService.getAvailablePermissions;
export const getAvailablePrivileges = rolesService.getAvailablePrivileges;






