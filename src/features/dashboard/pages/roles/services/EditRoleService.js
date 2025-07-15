import { validateRole } from '../../../../../shared/validations';

// Servicio simulado para editar un rol
export async function editRole(role, allRoles = []) {
  // Validación interna usando ValidateRoleService
  const formData = { nombre: role.name, descripcion: role.description };
  
  // Filtra el rol actual para validar unicidad
  const otherRoles = allRoles.filter(r => r.id !== role.id);
  const validationErrors = validateRole(formData, role.privileges, otherRoles);
  
  if (Object.keys(validationErrors).length > 0) {
    // Lanza el primer error encontrado
    const firstError = Object.values(validationErrors)[0];
    throw new Error(firstError);
  }

  // Simula una petición a backend y retorna el rol actualizado
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...role });
    }, 500);
  });
} 