export function validateRole(formData, privileges, roles = []) {
  const errors = {};
  // Nombre: requerido, min 3, único
  if (!formData.nombre || formData.nombre.trim().length < 3) {
    errors.nombre = 'El nombre es requerido y debe tener al menos 3 caracteres.';
  } else if (roles.some(r => r.name?.toLowerCase() === formData.nombre.trim().toLowerCase())) {
    errors.nombre = 'Ya existe un rol con ese nombre.';
  }
  // Privilegios: al menos uno seleccionado
  const hasAnyPrivilege = privileges && Object.values(privileges).some(
    mod => mod && Object.values(mod).some(Boolean)
  );
  if (!hasAnyPrivilege) {
    errors.privilegios = 'Debes seleccionar al menos un privilegio.';
  }
  return errors;
} 