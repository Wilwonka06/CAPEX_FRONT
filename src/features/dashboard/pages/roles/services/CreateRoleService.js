// Servicio simulado para crear un rol
export async function createRole(role, roles = []) {
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