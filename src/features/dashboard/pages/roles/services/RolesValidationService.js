import { validateRole } from '../../../../../shared/validations';

class RolesValidationService {
  // Validar datos de un rol
  static validateRoleData(roleData, existingRoles = []) {
    return validateRole(roleData, roleData.privileges || {}, existingRoles);
  }

  // Validar nombre de rol
  static validateRoleName(name, existingRoles = [], excludeId = null) {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'El nombre es requerido' };
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return { isValid: false, error: 'El nombre no puede estar vacío' };
    }

    if (trimmedName.length < 3) {
      return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
    }

    if (trimmedName.length > 16) {
      return { isValid: false, error: 'El nombre no puede exceder 16 caracteres' };
    }

    // Verificar duplicados
    const isDuplicate = existingRoles.some(role => {
      if (excludeId && role.id === excludeId) return false;
      const existingName = role.name || role.nombre || '';
      return existingName.toLowerCase() === trimmedName.toLowerCase();
    });

    if (isDuplicate) {
      return { isValid: false, error: 'Ya existe un rol con este nombre' };
    }

    return { isValid: true };
  }

  // Validar descripción de rol (opcional)
  static validateRoleDescription(description) {
    // Si no hay descripción, es válido (opcional)
    if (!description || typeof description !== 'string') {
      return { isValid: true };
    }

    const trimmedDescription = description.trim();
    
    // Si está vacía después de trim, es válido (opcional)
    if (trimmedDescription.length === 0) {
      return { isValid: true };
    }

    // Si tiene contenido, validar longitud máxima (sin mínimo)
    if (trimmedDescription.length > 100) {
      return { isValid: false, error: 'La descripción no puede exceder 100 caracteres' };
    }

    return { isValid: true };
  }

  // Validar privilegios
  static validatePrivileges(privileges) {
    if (!privileges || typeof privileges !== 'object') {
      return { isValid: false, error: 'Los privilegios son requeridos' };
    }

    const modules = Object.keys(privileges);
    if (modules.length === 0) {
      return { isValid: false, error: 'Debe seleccionar al menos un módulo' };
    }

    let hasAnyPrivilege = false;
    modules.forEach(module => {
      const modulePrivileges = privileges[module];
      if (modulePrivileges && typeof modulePrivileges === 'object') {
        const actions = Object.values(modulePrivileges);
        if (actions.some(action => action === true)) {
          hasAnyPrivilege = true;
        }
      }
    });

    if (!hasAnyPrivilege) {
      return { isValid: false, error: 'Debe seleccionar al menos un privilegio' };
    }

    return { isValid: true };
  }

  // Validar estado de rol
  static validateRoleStatus(status) {
    const validStatuses = ['Activo', 'Inactivo'];
    if (!validStatuses.includes(status)) {
      return { isValid: false, error: 'Estado inválido' };
    }
    return { isValid: true };
  }

  // Validar si un rol se puede eliminar
  static validateRoleDeletion(role) {
    const systemRoles = ['Administrador', 'Empleado', 'Cliente'];
    const roleName = role.name || role.nombre || '';
    
    const isSystemRole = systemRoles.some(systemRole => 
      roleName.toLowerCase() === systemRole.toLowerCase()
    );

    if (isSystemRole) {
      return { 
        isValid: false, 
        error: `No se puede eliminar el rol "${roleName}" porque es un rol del sistema.` 
      };
    }

    return { isValid: true };
  }

  // Validación completa para crear rol
  static validateCreateRole(roleData, existingRoles = []) {
    const errors = {};

    // Validar nombre
    const nameValidation = this.validateRoleName(roleData.name || roleData.nombre, existingRoles);
    if (!nameValidation.isValid) {
      errors.nombre = nameValidation.error;
    }

    // Validar descripción
    const descriptionValidation = this.validateRoleDescription(roleData.description || roleData.descripcion);
    if (!descriptionValidation.isValid) {
      errors.descripcion = descriptionValidation.error;
    }

    // Validar privilegios
    const privilegesValidation = this.validatePrivileges(roleData.privileges);
    if (!privilegesValidation.isValid) {
      errors.privilegios = privilegesValidation.error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validación completa para actualizar rol
  static validateUpdateRole(roleData, existingRoles = [], roleId) {
    const errors = {};

    // Validar nombre
    const nameValidation = this.validateRoleName(roleData.name || roleData.nombre, existingRoles, roleId);
    if (!nameValidation.isValid) {
      errors.nombre = nameValidation.error;
    }

    // Validar descripción
    const descriptionValidation = this.validateRoleDescription(roleData.description || roleData.descripcion);
    if (!descriptionValidation.isValid) {
      errors.descripcion = descriptionValidation.error;
    }

    // Validar privilegios
    const privilegesValidation = this.validatePrivileges(roleData.privileges);
    if (!privilegesValidation.isValid) {
      errors.privilegios = privilegesValidation.error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default RolesValidationService;
