import { API_ENDPOINTS } from '../../../../../shared/config/api';
import BaseService from './BaseService';
import DataMapper from './DataMapper';

class RolesApiService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.ROLES);
  }

  // Obtener todos los roles
  async getAllRoles() {
    try {
      const data = await this.makeRequest(this.baseURL, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (data.success && data.data) {
        return DataMapper.mapRolesFromBackend(data.data);
      }
      
      throw new Error(data.message || 'Error al obtener los roles');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener un rol por ID
  async getRoleById(id) {
    try {
      const url = `${this.baseURL}/${id}`;
      const data = await this.makeRequest(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (data.success && data.data) {
        const role = data.data;
        return DataMapper.mapRoleFromBackend(role);
      }
      
      throw new Error(data.message || 'Error al obtener el rol');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Crear un nuevo rol
  async createRole(roleData) {
    try {
      console.log('🚀 CREATE ROLE - Input roleData:', roleData);
      console.log('🚀 CREATE ROLE - roleData.privileges:', roleData.privileges);
      
      const formattedRole = DataMapper.mapRoleToBackend(roleData);
      
      console.log('🚀 REQUEST BODY (formattedRole):', JSON.stringify(formattedRole, null, 2));
      console.log('🚀 REQUEST BODY - permisos_privilegios:', formattedRole.permisos_privilegios);
      
      if (formattedRole.permisos_privilegios) {
        formattedRole.permisos_privilegios.forEach((p, i) => {
          console.log(`   Permiso ${i + 1}: ${p.nombre} con ${p.privilegios?.length || 0} privilegios`);
          if (p.privilegios) {
            p.privilegios.forEach((priv, j) => {
              console.log(`     Privilegio ${j + 1}: ${priv.nombre} (id=${priv.id_privilegio})`);
            });
          }
        });
      }
      
      const data = await this.makeRequest(this.baseURL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(formattedRole),
      });

      if (data.success && data.data) {
        return DataMapper.mapRoleFromBackend(data.data);
      }
      
      throw new Error(data.message || 'Error al crear el rol');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar un rol existente
  async updateRole(id, roleData) {
    try {
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
        const mappedRole = DataMapper.mapRoleFromBackend(data.data);
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

      if (data.success && data.data) {
        return DataMapper.mapRoleFromBackend(data.data);
      }
      
      throw new Error(data.message || 'Error al cambiar el estado del rol');
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default RolesApiService;
