class RolesCacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Generar clave de caché
  generateKey(operation, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${operation}:${paramString}`;
  }

  // Obtener datos del caché
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Verificar si el caché ha expirado
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Guardar datos en el caché
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Limpiar caché específico
  delete(key) {
    this.cache.delete(key);
  }

  // Limpiar todo el caché
  clear() {
    this.cache.clear();
  }

  // Limpiar caché relacionado con roles
  clearRolesCache() {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('getAllRoles') || key.startsWith('getRoleById')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Obtener roles del caché
  getRoles() {
    const key = this.generateKey('getAllRoles');
    return this.get(key);
  }

  // Guardar roles en el caché
  setRoles(roles) {
    const key = this.generateKey('getAllRoles');
    this.set(key, roles);
  }

  // Obtener rol específico del caché
  getRole(id) {
    const key = this.generateKey('getRoleById', { id });
    return this.get(key);
  }

  // Guardar rol específico en el caché
  setRole(id, role) {
    const key = this.generateKey('getRoleById', { id });
    this.set(key, role);
  }

  // Invalidar caché después de operaciones de escritura
  invalidateAfterWrite(operation, roleId = null) {
    // Limpiar caché de lista de roles
    this.clearRolesCache();

    // Limpiar caché del rol específico si se proporciona ID
    if (roleId) {
      this.delete(this.generateKey('getRoleById', { id: roleId }));
    }

    // Limpiar caché relacionado con la operación
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(operation)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Obtener estadísticas del caché
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }
}

export default RolesCacheService;
