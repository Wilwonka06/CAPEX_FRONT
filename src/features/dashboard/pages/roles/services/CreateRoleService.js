import { validateRole } from '../../../../../shared/validations';

// Solo validación, la persistencia real debe hacerse en ModuleDataService.js
export function validateAndFormatRole(role, roles = []) {
  const formData = { nombre: role.name, descripcion: role.description };
  const validationErrors = validateRole(formData, role.privileges, roles);
  if (Object.keys(validationErrors).length > 0) {
    const firstError = Object.values(validationErrors)[0];
    throw new Error(firstError);
  }
  return role;
} 