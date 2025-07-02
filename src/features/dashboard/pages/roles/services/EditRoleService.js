// Servicio simulado para editar un rol
export async function editRole(role) {
  // Simula una petición a backend y retorna el rol actualizado
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...role });
    }, 500);
  });
} 