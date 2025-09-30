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

    if (trimmedName.length < 2) {
      return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }

    if (trimmedName.length > 50) {
      return { isValid: false, error: 'El nombre no puede exceder 50 caracteres' };
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

  // Validar descripción de rol
  static validateRoleDescription(description) {
    if (!description || typeof description !== 'string') {
      return { isValid: false, error: 'La descripción es requerida' };
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length === 0) {
      return { isValid: false, error: 'La descripción no puede estar vacía' };
    }

    if (trimmedDescription.length < 5) {
      return { isValid: false, error: 'La descripción debe tener al menos 5 caracteres' };
    }

    if (trimmedDescription.length > 200) {
      return { isValid: false, error: 'La descripción no puede exceder 200 caracteres' };
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
