// Servicios principales
export { default as RolesApiService } from './RolesApiService';
export { default as BaseService } from './BaseService';
export { default as DataMapper } from './DataMapper';
export { default as RolesCacheService } from './RolesCacheService';
export { default as RolesValidationService } from './RolesValidationService';

// Servicio principal (combinado)
import RolesApiService from './RolesApiService';
import RolesCacheService from './RolesCacheService';
import RolesValidationService from './RolesValidationService';

class RolesService {
  constructor() {
    this.apiService = new RolesApiService();
    this.cacheService = new RolesCacheService();
  }

  // Obtener todos los roles (con caché)
  async getAllRoles() {
    // Intentar obtener del caché primero
    const cachedRoles = this.cacheService.getRoles();
    if (cachedRoles) {
      return cachedRoles;
    }

    // Si no hay caché, obtener de la API
    const roles = await this.apiService.getAllRoles();
    
    // Guardar en caché
    this.cacheService.setRoles(roles);
    
    return roles;
  }

  // Obtener un rol por ID (con caché)
  async getRoleById(id) {
    // Intentar obtener del caché primero
    const cachedRole = this.cacheService.getRole(id);
    if (cachedRole) {
      return cachedRole;
    }

    // Si no hay caché, obtener de la API
    const role = await this.apiService.getRoleById(id);
    
    // Guardar en caché
    this.cacheService.setRole(id, role);
    
    return role;
  }

  // Crear un nuevo rol
  async createRole(roleData) {
    // Validar datos
    const validation = RolesValidationService.validateCreateRole(roleData);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
    }

    // Crear rol
    const newRole = await this.apiService.createRole(roleData);
    
    // Invalidar caché
    this.cacheService.invalidateAfterWrite('create', newRole.id);
    
    return newRole;
  }

  // Actualizar un rol existente
  async updateRole(id, roleData) {
    // Validar datos
    const validation = RolesValidationService.validateUpdateRole(roleData, [], id);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
    }

    // Actualizar rol
    const updatedRole = await this.apiService.updateRole(id, roleData);
    
    // Invalidar caché
    this.cacheService.invalidateAfterWrite('update', id);
    
    return updatedRole;
  }

  // Eliminar un rol
  async deleteRole(id) {
    // Obtener el rol para validar si se puede eliminar
    const role = await this.getRoleById(id);
    
    // Validar si el rol se puede eliminar
    const validation = RolesValidationService.validateRoleDeletion(role);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const result = await this.apiService.deleteRole(id);
    
    // Invalidar caché
    this.cacheService.invalidateAfterWrite('delete', id);
    
    return result;
  }

  // Cambiar el estado de un rol
  async changeRoleStatus(id, status) {
    // Validar estado
    const validation = RolesValidationService.validateRoleStatus(status);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const updatedRole = await this.apiService.changeRoleStatus(id, status);
    
    // Invalidar caché
    this.cacheService.invalidateAfterWrite('statusChange', id);
    
    return updatedRole;
  }

  // Limpiar caché
  clearCache() {
    this.cacheService.clear();
  }

  // Obtener estadísticas del caché
  getCacheStats() {
    return this.cacheService.getStats();
  }
}

// Instancia singleton
const rolesService = new RolesService();

export default rolesService;
