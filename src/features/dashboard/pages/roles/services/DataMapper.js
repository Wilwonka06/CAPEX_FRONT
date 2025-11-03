// src/features/dashboard/pages/roles/services/DataMapper.js

class DataMapper {
  // ✅ CORREGIDO: Nombres consistentes con el backend
  static BACKEND_MODULE_IDS = {
    'Gestión de Compras': 1,
    'Gestión de Servicios': 2,
    'Gestión de Ventas': 3,  // ⚠️ Ventas, no "Gestión de Ventas"
    'Gestión de Usuarios': 4,
    'Dashboard': 5
  };

  // ✅ CORREGIDO: Mapeo inverso consistente
  static BACKEND_MODULE_NAMES = {
    1: 'Gestión de Compras',
    2: 'Gestión de Servicios',
    3: 'Gestión de Ventas',  // ⚠️ Ventas, no "Gestión de Ventas"
    4: 'Gestión de Usuarios',
    5: 'Dashboard'
  };

  static PRIVILEGE_IDS = {
    'Create': 1,
    'Read': 2,
    'Edit': 3,
    'Delete': 4
  };

  static PRIVILEGE_NAMES = {
    1: 'Create',
    2: 'Read',
    3: 'Edit',
    4: 'Delete'
  };

  /**
   * ✅ CORREGIDO: Normalizar nombre de módulo para manejar inconsistencias
   */
  static normalizeModuleName(moduleName) {
    if (!moduleName) return null;
    
    // Mapeo de nombres alternativos
    const alternativeNames = {
      'Gestión de Ventas': 'Ventas',
      'ventas': 'Ventas',
      'gestion de ventas': 'Ventas'
    };
    
    // Convertir a lowercase para comparación
    const lowerName = moduleName.toLowerCase();
    
    // Si existe un mapeo alternativo, usarlo
    if (alternativeNames[lowerName]) {
      return alternativeNames[lowerName];
    }
    
    // Buscar en BACKEND_MODULE_IDS (sin importar mayúsculas)
    for (const [key] of Object.entries(this.BACKEND_MODULE_IDS)) {
      if (key.toLowerCase() === lowerName) {
        return key;
      }
    }
    
    return moduleName; // Retornar original si no hay mapeo
  }

  /**
   * ✅ CORREGIDO: Mapear permisos del backend al formato del frontend
   */
  static mapPermissionsFromBackend(backendPermissions, separatePrivileges = []) {
    const frontendPermissions = {};
    
    console.log('📥 Mapeando permisos del backend:', { backendPermissions, separatePrivileges });
    
    if (!backendPermissions || !Array.isArray(backendPermissions) || backendPermissions.length === 0) {
      console.warn('⚠️ No hay permisos para mapear');
      return frontendPermissions;
    }
    
    // Inicializar TODOS los módulos conocidos con privilegios en false
    Object.values(this.BACKEND_MODULE_NAMES).forEach(moduleName => {
      frontendPermissions[moduleName] = {
        Create: false,
        Read: false,
        Edit: false,
        Delete: false
      };
    });
    
    // Caso 1: Permisos con privilegios anidados
    if (backendPermissions[0] && backendPermissions[0].privilegios) {
      console.log('📋 Formato con privilegios anidados');
      
      backendPermissions.forEach(permiso => {
        const normalizedModulo = this.normalizeModuleName(permiso.nombre);
        
        // ✅ Validar que el módulo existe antes de acceder
        if (!frontendPermissions[normalizedModulo]) {
          console.warn(`⚠️ Módulo desconocido: "${permiso.nombre}" (normalizado: "${normalizedModulo}")`);
          // Inicializar el módulo si no existe
          frontendPermissions[normalizedModulo] = {
            Create: false,
            Read: false,
            Edit: false,
            Delete: false
          };
        }
        
        if (Array.isArray(permiso.privilegios)) {
          permiso.privilegios.forEach(privilegio => {
            frontendPermissions[normalizedModulo][privilegio.nombre] = true;
          });
        }
      });
    } 
    // Caso 2: Permisos y privilegios separados
    else if (Array.isArray(separatePrivileges) && separatePrivileges.length > 0) {
      console.log('📋 Formato con privilegios separados');
      
      backendPermissions.forEach(permiso => {
        const normalizedModulo = this.normalizeModuleName(permiso.nombre);
        
        // ✅ Validar que el módulo existe antes de acceder
        if (!frontendPermissions[normalizedModulo]) {
          console.warn(`⚠️ Módulo desconocido: "${permiso.nombre}" (normalizado: "${normalizedModulo}")`);
          // Inicializar el módulo si no existe
          frontendPermissions[normalizedModulo] = {
            Create: false,
            Read: false,
            Edit: false,
            Delete: false
          };
        }
        
        // Activar solo los privilegios que existen en separatePrivileges
        separatePrivileges.forEach(privilegio => {
          if (frontendPermissions[normalizedModulo]) {
            frontendPermissions[normalizedModulo][privilegio.nombre] = true;
          }
        });
      });
    }
    // Caso 3: Solo permisos sin privilegios
    else {
      console.log('📋 Formato solo permisos (sin privilegios activos)');
      
      backendPermissions.forEach(permiso => {
        const normalizedModulo = this.normalizeModuleName(permiso.nombre);
        
        // ✅ Validar que el módulo existe
        if (!frontendPermissions[normalizedModulo]) {
          console.warn(`⚠️ Módulo desconocido: "${permiso.nombre}" (normalizado: "${normalizedModulo}")`);
          frontendPermissions[normalizedModulo] = {
            Create: false,
            Read: false,
            Edit: false,
            Delete: false
          };
        }
      });
    }
    
    console.log('✅ Permisos mapeados:', frontendPermissions);
    return frontendPermissions;
  }

  /**
   * ✅ Mapear rol del backend al formato del frontend
   */
  static mapRoleFromBackend(role) {
    if (!role) return null;

    const mappedRole = {
      id: role.id_rol || role.id,
      nombre: role.nombre,
      name: role.nombre,
      descripcion: role.descripcion || '',
      description: role.descripcion || '',
      estado: role.estado === true || role.estado === 'activo' ? 'Activo' : 'Inactivo',
      privileges: this.mapPermissionsFromBackend(role.permisos || [], role.privilegios || []),
      permisos: role.permisos || [],
      privilegios: role.privilegios || []
    };

    console.log('🔄 Rol mapeado desde backend:', mappedRole);
    return mappedRole;
  }

  /**
   * ✅ Mapear array de roles del backend al formato del frontend
   */
  static mapRolesFromBackend(roles) {
    if (!Array.isArray(roles)) return [];
    
    return roles.map(role => this.mapRoleFromBackend(role));
  }

  /**
   * ✅ Mapear datos del frontend al formato del backend
   */
  static mapRoleToBackend(roleData) {
    const descripcion = (roleData.description || roleData.descripcion || '').trim();
    
    const backendRole = {
      nombre: (roleData.name || roleData.nombre || '').trim(),
      descripcion: descripcion || null,
      estado: roleData.estado === 'Activo' ? true : false,
      permisos_privilegios: this.convertPrivilegesToBackendFormat(roleData.privileges || {})
    };

    console.log('📤 Rol mapeado para backend:', backendRole);
    return backendRole;
  }

  /**
   * ✅ CORREGIDO: Convertir privilegios del frontend al formato del backend
   */
  static convertPrivilegesToBackendFormat(frontendPrivileges) {
    const backendFormat = [];
    
    console.log('🔄 Convirtiendo privilegios para backend:', frontendPrivileges);

    if (!frontendPrivileges || typeof frontendPrivileges !== 'object') {
      console.warn('⚠️ No hay privilegios o formato inválido');
      return [];
    }

    // Procesar cada módulo
    Object.keys(frontendPrivileges).forEach(modulo => {
      const permisos = frontendPrivileges[modulo];
      const privilegios = [];

      // Normalizar nombre del módulo
      const normalizedModulo = this.normalizeModuleName(modulo);

      // ✅ Solo procesar módulos que existen en el mapeo
      if (!this.BACKEND_MODULE_IDS[normalizedModulo]) {
        console.warn(`⚠️ Módulo "${modulo}" (normalizado: "${normalizedModulo}") no encontrado en mapeo`);
        return;
      }

      console.log(`📋 Procesando módulo ${normalizedModulo}:`, permisos);

      // Recolectar privilegios activos
      if (permisos && typeof permisos === 'object') {
        Object.keys(permisos).forEach(accion => {
          // ✅ SOLO incluir privilegios que están ACTIVOS (true)
          if (permisos[accion] === true && this.PRIVILEGE_IDS[accion]) {
            privilegios.push({
              id_privilegio: this.PRIVILEGE_IDS[accion],
              nombre: accion
            });
          }
        });
      }

      // ✅ Solo incluir el módulo si tiene al menos un privilegio activo
      if (privilegios.length > 0) {
        backendFormat.push({
          id_permiso: this.BACKEND_MODULE_IDS[normalizedModulo],
          nombre: normalizedModulo,
          privilegios: privilegios
        });
      } else {
        console.log(`⚠️ Módulo ${normalizedModulo} no tiene privilegios activos, se omite`);
      }
    });

    console.log('✅ Formato final para backend:', JSON.stringify(backendFormat, null, 2));
    return backendFormat;
  }

  /**
   * ✅ Validar estructura de privilegios
   */
  static validatePrivileges(privileges) {
    const errors = [];

    if (!privileges || typeof privileges !== 'object') {
      errors.push('Los privilegios deben ser un objeto');
      return { valid: false, errors };
    }

    let hasAnyPrivilege = false;

    Object.keys(privileges).forEach(modulo => {
      const normalizedModulo = this.normalizeModuleName(modulo);
      
      if (!this.BACKEND_MODULE_IDS[normalizedModulo]) {
        errors.push(`Módulo "${modulo}" no es válido`);
        return;
      }

      const modulePrivileges = privileges[modulo];
      if (!modulePrivileges || typeof modulePrivileges !== 'object') {
        errors.push(`Privilegios del módulo "${modulo}" deben ser un objeto`);
        return;
      }

      // Verificar si tiene al menos un privilegio activo
      const hasActivePrivilege = Object.values(modulePrivileges).some(val => val === true);
      if (hasActivePrivilege) {
        hasAnyPrivilege = true;
      }
    });

    if (!hasAnyPrivilege) {
      errors.push('Debe seleccionar al menos un privilegio para algún módulo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default DataMapper;