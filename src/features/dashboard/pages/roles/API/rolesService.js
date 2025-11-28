import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de roles
 * Endpoints base: /api/roles
 * Incluye DataMapper integrado para transformación de datos
 */

const ROLES_ENDPOINT = '/roles';

// ==========================================
// DATAMAPPER - Transformación de datos
// ==========================================
class DataMapper {
  static moduleMap = new Map();
  static privilegeMap = new Map();
  
  static initializeMaps(permissions = [], privileges = []) {
    this.moduleMap.clear();
    this.privilegeMap.clear();
    
    permissions.forEach(perm => {
      if (perm.id_permiso && perm.nombre) {
        this.moduleMap.set(perm.nombre, perm.id_permiso);
      }
    });
    
    privileges.forEach(priv => {
      if (priv.id_privilegio && priv.nombre) {
        this.privilegeMap.set(priv.nombre, priv.id_privilegio);
      }
    });
  }
  
  static getPermissionId(moduleName) {
    return this.moduleMap.get(moduleName);
  }
  
  static getPrivilegeId(privilegeName) {
    return this.privilegeMap.get(privilegeName);
  }

  static mapPermissionsFromBackend(backendPermissions) {
    const frontendPermissions = {};
    
    if (!backendPermissions || !Array.isArray(backendPermissions) || backendPermissions.length === 0) {
      return frontendPermissions;
    }
    
    backendPermissions.forEach(permiso => {
      const moduleName = permiso.nombre;
      
      if (!frontendPermissions[moduleName]) {
        frontendPermissions[moduleName] = {};
      }
      
      if (Array.isArray(permiso.privilegios) && permiso.privilegios.length > 0) {
        permiso.privilegios.forEach(privilegio => {
          if (privilegio.nombre) {
            frontendPermissions[moduleName][privilegio.nombre] = true;
          }
        });
      }
    });
    
    return frontendPermissions;
  }

  static mapRoleFromBackend(role) {
    if (!role) return null;

    return {
      id: role.id_rol || role.id,
      nombre: role.nombre,
      name: role.nombre,
      descripcion: role.descripcion || '',
      description: role.descripcion || '',
      estado: role.estado === true || role.estado === 'activo' ? 'Activo' : 'Inactivo',
      privileges: this.mapPermissionsFromBackend(role.permisos || []),
      permisos: role.permisos || [],
      privilegios: role.privilegios || []
    };
  }

  static mapRolesFromBackend(roles) {
    if (!Array.isArray(roles)) return [];
    return roles.map(role => this.mapRoleFromBackend(role));
  }

  static mapRoleToBackend(roleData) {
    const descripcion = (roleData.description || roleData.descripcion || '').trim();
    
    return {
      nombre: (roleData.name || roleData.nombre || '').trim(),
      descripcion: descripcion || null,
      estado: roleData.estado === 'Activo' ? true : false,
      permisos_privilegios: this.convertPrivilegesToBackendFormat(roleData.privileges || {})
    };
  }

  static convertPrivilegesToBackendFormat(frontendPrivileges) {
    const backendFormat = [];
    
    if (!frontendPrivileges || typeof frontendPrivileges !== 'object') {
      return [];
    }

    Object.keys(frontendPrivileges).forEach(modulo => {
      const permisos = frontendPrivileges[modulo];
      const privilegios = [];

      const moduleId = this.getPermissionId(modulo);
      if (!moduleId) {
        return;
      }

      if (permisos && typeof permisos === 'object') {
        Object.keys(permisos).forEach(accion => {
          const valor = permisos[accion];
          if (valor === true) {
            const privilegeId = this.getPrivilegeId(accion);
            if (privilegeId) {
              privilegios.push({
                id_privilegio: privilegeId,
                nombre: accion
              });
            }
          }
        });
      }

      if (privilegios.length > 0) {
        backendFormat.push({
          id_permiso: moduleId,
          nombre: modulo,
          privilegios: privilegios
        });
      }
    });

    return backendFormat;
  }
}

// ==========================================
// FUNCIONES HELPER
// ==========================================
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

// ==========================================
// SERVICIO PRINCIPAL
// ==========================================
export const rolesService = {
  /**
   * Obtener todos los roles
   */
  getAll: async () => {
    try {
      const [rolesPromise, mapsData] = await Promise.all([
        apiRequest.get(ROLES_ENDPOINT),
        initializeMaps()
      ]);

      const rolesData = rolesPromise?.success ? rolesPromise.data : rolesPromise;
      
      if (Array.isArray(rolesData)) {
        return DataMapper.mapRolesFromBackend(rolesData);
      }
      
      throw new Error(rolesData?.message || 'Error al obtener los roles');
    } catch (error) {
      console.error('[rolesService] getAll ERROR:', error);
      throw error;
    }
  },

  /**
   * Obtener un rol por ID
   */
  getById: async (id) => {
    try {
      const [roleData, mapsData] = await Promise.all([
        apiRequest.get(`${ROLES_ENDPOINT}/${id}`),
        initializeMaps()
      ]);

      const role = roleData?.success ? roleData.data : roleData;
      
      if (role) {
        return DataMapper.mapRoleFromBackend(role);
      }
      
      throw new Error(roleData?.message || 'Error al obtener el rol');
    } catch (error) {
      console.error('[rolesService] getById ERROR:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo rol
   */
  create: async (roleData) => {
    try {
      const mapsData = await initializeMaps();
      const formattedRole = DataMapper.mapRoleToBackend(roleData);
      
      const response = await apiRequest.post(ROLES_ENDPOINT, formattedRole);
      const data = response?.success ? response.data : response;

      if (data) {
        return DataMapper.mapRoleFromBackend(data);
      }
      
      throw new Error(response?.message || 'Error al crear el rol');
    } catch (error) {
      console.error('[rolesService] create ERROR:', error);
      throw error;
    }
  },

  /**
   * Actualizar un rol existente
   */
  update: async (id, roleData) => {
    try {
      const mapsData = await initializeMaps();
      const formattedRole = DataMapper.mapRoleToBackend(roleData);

      const response = await apiRequest.put(`${ROLES_ENDPOINT}/${id}`, formattedRole);
      const data = response?.success ? response.data : response;

      if (data) {
        return DataMapper.mapRoleFromBackend(data);
      }

      throw new Error(response?.message || 'Error al actualizar el rol');
    } catch (error) {
      console.error('[rolesService] update ERROR:', error);
      throw error;
    }
  },

  /**
   * Eliminar un rol
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
   */
  changeStatus: async (id, status) => {
    try {
      const statusData = {
        estado: status === 'Activo' ? true : false
      };
      
      const response = await apiRequest.patch(`${ROLES_ENDPOINT}/${id}/status`, statusData);
      const mapsData = await initializeMaps();
      const data = response?.success ? response.data : response;
      
      if (data) {
        return DataMapper.mapRoleFromBackend(data);
      }
      
      throw new Error(response?.message || 'Error al cambiar el estado del rol');
    } catch (error) {
      console.error('[rolesService] changeStatus ERROR:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los permisos disponibles
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

export default rolesService;