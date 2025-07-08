import { validateRole } from '../../../../../shared/validations';

// Servicio simulado para crear un rol
export async function createRole(role, roles = []) {
  // Validación interna usando ValidateRoleService
  const formData = { nombre: role.name, descripcion: role.description };
  const validationErrors = validateRole(formData, role.privileges, roles);
  
  if (Object.keys(validationErrors).length > 0) {
    // Lanza el primer error encontrado
    const firstError = Object.values(validationErrors)[0];
    throw new Error(firstError);
  }

  // Busca el máximo id actual y suma 1
  const maxId = roles.length ? Math.max(...roles.map(r => r.id)) : 0;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...role,
        id: maxId + 1,
      });
    }, 500);
  });
} 