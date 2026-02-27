import { API_ENDPOINTS } from '../../../../../shared/config/api';
import BaseService from './BaseService';
import DataMapper from './DataMapper';

const isDev = import.meta.env.DEV;

class RolesApiService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.ROLES);
  }

  // ─────────────────────────────────────────────
  // OBTENER TODOS LOS ROLES
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // OBTENER ROL POR ID
  // ─────────────────────────────────────────────
  async getRoleById(id) {
    try {
      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (data.success && data.data) {
        return DataMapper.mapRoleFromBackend(data.data);
      }

      throw new Error(data.message || 'Error al obtener el rol');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ─────────────────────────────────────────────
  // CREAR ROL
  // ─────────────────────────────────────────────
  async createRole(roleData) {
    try {
      const formattedRole = DataMapper.mapRoleToBackend(roleData);

      if (isDev) {
        console.log('[RolesApiService] createRole payload:', formattedRole);
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

  // ─────────────────────────────────────────────
  // ACTUALIZAR ROL
  // ─────────────────────────────────────────────
  async updateRole(id, roleData) {
    try {
      const formattedRole = DataMapper.mapRoleToBackend(roleData);

      if (isDev) {
        console.log('[RolesApiService] updateRole payload:', formattedRole);
      }

      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(formattedRole),
      });

      if (isDev) {
        console.log('[RolesApiService] updateRole response:', data);
      }

      if (data.success && data.data) {
        return DataMapper.mapRoleFromBackend(data.data);
      }

      throw new Error(data.message || 'Error al actualizar el rol');
    } catch (error) {
      if (isDev) console.error('[RolesApiService] updateRole error:', error);
      throw this.handleError(error);
    }
  }

  // ─────────────────────────────────────────────
  // ELIMINAR ROL
  // ─────────────────────────────────────────────
  async deleteRole(id) {
    try {
      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
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

  // ─────────────────────────────────────────────
  // CAMBIAR ESTADO DEL ROL
  // ─────────────────────────────────────────────
  async changeRoleStatus(id, status) {
    try {
      const statusData = {
        estado: status === 'Activo',
      };

      const data = await this.makeRequest(`${this.baseURL}/${id}/status`, {
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
