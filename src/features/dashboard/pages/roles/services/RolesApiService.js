import { API_ENDPOINTS } from '../../../../../shared/config/apiConfig';
import BaseService from './BaseService';
import DataMapper from './DataMapper';

class RolesApiService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.ROLES);
  }

  // Obtener todos los roles
  async getAllRoles() {
    try {
      // Obtener roles y permisos/privilegios en paralelo
      const rolesPromise = this.makeRequest(this.baseURL, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      // Obtener permisos y privilegios disponibles para inicializar el DataMapper
      let permissionsData = [];
      let privilegesData = [];
      try {
        permissionsData = await this.getAvailablePermissions();
        privilegesData = await this.getAvailablePrivileges();
        
        // Inicializar mapeos del DataMapper si se obtuvieron los datos
        if (permissionsData.length > 0 && privilegesData.length > 0) {
          DataMapper.initializeMaps(permissionsData, privilegesData);
        }
      } catch (permError) {
        console.warn('⚠️ Error al obtener permisos/privilegios, continuando sin inicializar mapeos:', permError);
      }
      
      // Obtener roles
      const rolesData = await rolesPromise;
      
      if (rolesData.success && rolesData.data) {
        return DataMapper.mapRolesFromBackend(rolesData.data, permissionsData);
      }
      
      throw new Error(rolesData.message || 'Error al obtener los roles');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener un rol por ID
  async getRoleById(id) {
    try {
      // Obtener permisos disponibles para mapear correctamente
      const [roleData, permissionsData] = await Promise.all([
        this.makeRequest(`${this.baseURL}/${id}`, {
          method: 'GET',
          headers: this.getHeaders(),
        }),
        this.getAvailablePermissions().catch(() => [])
      ]);

      if (roleData.success && roleData.data) {
        const role = roleData.data;
        return DataMapper.mapRoleFromBackend(role, permissionsData);
      }
      
      throw new Error(roleData.message || 'Error al obtener el rol');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Crear un nuevo rol
  async createRole(roleData) {
    try {
      // Asegurar que los mapeos estén inicializados
      let permissionsData = [];
      try {
        permissionsData = await this.getAvailablePermissions();
        const privilegesData = await this.getAvailablePrivileges();
        if (permissionsData.length > 0 && privilegesData.length > 0) {
          DataMapper.initializeMaps(permissionsData, privilegesData);
        }
      } catch (permError) {
        console.warn('⚠️ Error al obtener permisos al crear rol:', permError);
      }
      
      const formattedRole = DataMapper.mapRoleToBackend(roleData);
      
      const data = await this.makeRequest(this.baseURL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(formattedRole),
      });

      if (data.success && data.data) {
        return DataMapper.mapRoleFromBackend(data.data, permissionsData);
      }
      
      throw new Error(data.message || 'Error al crear el rol');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar un rol existente
  async updateRole(id, roleData) {
    try {
      // Asegurar que los mapeos estén inicializados
      let permissionsData = [];
      try {
        permissionsData = await this.getAvailablePermissions();
        const privilegesData = await this.getAvailablePrivileges();
        if (permissionsData.length > 0 && privilegesData.length > 0) {
          DataMapper.initializeMaps(permissionsData, privilegesData);
        }
      } catch (permError) {
        console.warn('⚠️ Error al obtener permisos al actualizar rol:', permError);
      }
      
      console.log('🔧 Formateando rol para backend:', roleData);
      const formattedRole = DataMapper.mapRoleToBackend(roleData);
      console.log('📦 Datos formateados para API:', formattedRole);

      const url = `${this.baseURL}/${id}`;
      const data = await this.makeRequest(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(formattedRole),
      });

      console.log('📨 Respuesta cruda de API:', data);

      if (data.success && data.data) {
        const mappedRole = DataMapper.mapRoleFromBackend(data.data, permissionsData);
        console.log('✅ Rol mapeado desde backend:', mappedRole);
        return mappedRole;
      }

      throw new Error(data.message || 'Error al actualizar el rol');
    } catch (error) {
      console.error('❌ Error en updateRole:', error);
      throw this.handleError(error);
    }
  }

  // Eliminar un rol
  async deleteRole(id) {
    try {
      const url = `${this.baseURL}/${id}`;
      const data = await this.makeRequest(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (data.success) {
        return { success: true, message: data.message || 'Rol eliminado exitosamente' };
      }
      
      throw new Error(data.message || 'Error al eliminar el rol');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cambiar el estado de un rol
  async changeRoleStatus(id, status) {
    try {
      const url = `${this.baseURL}/${id}/status`;
      const statusData = {
        estado: status === 'Activo' ? true : false
      };
      
      const data = await this.makeRequest(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(statusData),
      });

      // Obtener permisos disponibles para mapear correctamente
      let permissionsData = [];
      try {
        permissionsData = await this.getAvailablePermissions();
      } catch (permError) {
        console.warn('⚠️ Error al obtener permisos al cambiar estado:', permError);
      }
      
      if (data.success && data.data) {
        return DataMapper.mapRoleFromBackend(data.data, permissionsData);
      }
      
      throw new Error(data.message || 'Error al cambiar el estado del rol');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener todos los permisos disponibles
  async getAvailablePermissions() {
    try {
      const url = `${this.baseURL}/permisos/todos`;
      const data = await this.makeRequest(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (data.success && data.data) {
        return data.data;
      }
      
      throw new Error(data.message || 'Error al obtener los permisos');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener todos los privilegios disponibles
  async getAvailablePrivileges() {
    try {
      const url = `${this.baseURL}/privilegios/todos`;
      const data = await this.makeRequest(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (data.success && data.data) {
        return data.data;
      }
      
      throw new Error(data.message || 'Error al obtener los privilegios');
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default RolesApiService;
