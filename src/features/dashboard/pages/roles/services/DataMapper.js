// src/features/dashboard/pages/roles/services/DataMapper.js

class DataMapper {
  // ✅ MAPEO CORRECTO: IDs del backend según initRoles.js
  static BACKEND_MODULE_IDS = {
    'Gestión de Compras': 1,
    'Gestión de Servicios': 2,
    'Ventas': 3,
    'Dashboard': 5,  // ⚠️ Nota: Dashboard es ID 5, no 4
    'Gestión de Usuarios': 4
  };

  // ✅ MAPEO INVERSO: De ID a nombre
  static BACKEND_MODULE_NAMES = {
    1: 'Gestión de Compras',
    2: 'Gestión de Servicios',
    3: 'Ventas',
    4: 'Gestión de Usuarios',
    5: 'Dashboard'
  };

  // ✅ Mapeo de IDs de privilegios (acciones)
  static PRIVILEGE_IDS = {
    'Create': 1,
    'Read': 2,
    'Edit': 3,
    'Delete': 4
  };

  // ✅ Mapeo inverso de privilegios
  static PRIVILEGE_NAMES = {
    1: 'Create',
    2: 'Read',
    3: 'Edit',
    4: 'Delete'
  };

  /**
   * ✅ MEJORADO: Mapear permisos del backend al formato del frontend
   */
  static mapPermissionsFromBackend(backendPermissions, separatePrivileges = []) {
    const frontendPermissions = {};
    
    console.log('📥 Mapeando permisos del backend:', { backendPermissions, separatePrivileges });
    
    if (!backendPermissions || !Array.isArray(backendPermissions) || backendPermissions.length === 0) {
      console.warn('⚠️ No hay permisos para mapear');
      return frontendPermissions;
    }
    
    // Caso 1: Permisos con privilegios anidados (formato anterior)
    if (backendPermissions[0] && backendPermissions[0].privilegios) {
      console.log('📋 Formato con privilegios anidados');
      
      backendPermissions.forEach(permiso => {
        const modulo = permiso.nombre;
        frontendPermissions[modulo] = {};
        
        if (Array.isArray(permiso.privilegios)) {
          permiso.privilegios.forEach(privilegio => {
            frontendPermissions[modulo][privilegio.nombre] = true;
          });
        }
      });
    } 
    // Caso 2: Permisos y privilegios separados (formato actual)
    else if (Array.isArray(separatePrivileges) && separatePrivileges.length > 0) {
      console.log('📋 Formato con privilegios separados');
      
      // Inicializar todos los módulos con privilegios en false
      Object.values(this.BACKEND_MODULE_NAMES).forEach(moduleName => {
        frontendPermissions[moduleName] = {
          Create: false,
          Read: false,
          Edit: false,
          Delete: false
        };
      });
      
      // Activar solo los módulos que tienen permisos
      backendPermissions.forEach(permiso => {
        const modulo = permiso.nombre;
        
        // Solo activar los privilegios que existen en separatePrivileges
        separatePrivileges.forEach(privilegio => {
          frontendPermissions[modulo][privilegio.nombre] = true;
        });
      });
    }
    // Caso 3: Solo permisos sin privilegios
    else {
      console.log('📋 Formato solo permisos (sin privilegios activos)');
      
      backendPermissions.forEach(permiso => {
        const modulo = permiso.nombre;
        frontendPermissions[modulo] = {
          Create: false,
          Read: false,
          Edit: false,
          Delete: false
        };
      });
    }
    
    console.log('✅ Permisos mapeados:', frontendPermissions);
    return frontendPermissions;
  }

  /**
   * ✅ MEJORADO: Mapear rol del backend al formato del frontend
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
   * ✅ MEJORADO: Mapear array de roles del backend al formato del frontend
   */
  static mapRolesFromBackend(roles) {
    if (!Array.isArray(roles)) return [];
    
    return roles.map(role => this.mapRoleFromBackend(role));
  }

  /**
   * ✅ SIMPLIFICADO: Mapear datos del frontend al formato del backend
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

      // Solo procesar módulos que existen en el mapeo
      if (!this.BACKEND_MODULE_IDS[modulo]) {
        console.warn(`⚠️ Módulo "${modulo}" no encontrado en mapeo`);
        return;
      }

      console.log(`📋 Procesando módulo ${modulo}:`, permisos);

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

      // ✅ IMPORTANTE: Solo incluir el módulo si tiene al menos un privilegio activo
      if (privilegios.length > 0) {
        backendFormat.push({
          id_permiso: this.BACKEND_MODULE_IDS[modulo],
          nombre: modulo,
          privilegios: privilegios
        });
      } else {
        console.log(`⚠️ Módulo ${modulo} no tiene privilegios activos, se omite`);
      }
    });

    console.log('✅ Formato final para backend:', JSON.stringify(backendFormat, null, 2));
    return backendFormat;
  }

  /**
   * ✅ NUEVO: Validar estructura de privilegios
   */
  static validatePrivileges(privileges) {
    const errors = [];

    if (!privileges || typeof privileges !== 'object') {
      errors.push('Los privilegios deben ser un objeto');
      return { valid: false, errors };
    }

    let hasAnyPrivilege = false;

    Object.keys(privileges).forEach(modulo => {
      if (!this.BACKEND_MODULE_IDS[modulo]) {
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