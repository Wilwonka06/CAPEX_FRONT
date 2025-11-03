// src/features/dashboard/pages/roles/services/DataMapper.js

class DataMapper {
  static BACKEND_MODULE_IDS = {
    'Gestión de Compras': 1,
    'Gestión de Servicios': 2,
    'Gestión de Ventas': 3,
    'Gestión de Usuarios': 4,
    'Dashboard': 5
  };

  static BACKEND_MODULE_NAMES = {
    1: 'Gestión de Compras',
    2: 'Gestión de Servicios',
    3: 'Gestión de Ventas',
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

  static mapPermissionsFromBackend(backendPermissions, separatePrivileges = []) {
    const frontendPermissions = {};
    
    console.log('📥 Mapeando permisos del backend:', { backendPermissions, separatePrivileges });
    
    if (!backendPermissions || !Array.isArray(backendPermissions) || backendPermissions.length === 0) {
      console.warn('⚠️ No hay permisos para mapear');
      return frontendPermissions;
    }
    
    // Inicializar TODOS los módulos con privilegios en false
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
        const moduleName = permiso.nombre;
        
        if (!frontendPermissions[moduleName]) {
          console.warn(`⚠️ Módulo desconocido: "${moduleName}"`);
          frontendPermissions[moduleName] = {
            Create: false,
            Read: false,
            Edit: false,
            Delete: false
          };
        }
        
        if (Array.isArray(permiso.privilegios)) {
          permiso.privilegios.forEach(privilegio => {
            frontendPermissions[moduleName][privilegio.nombre] = true;
          });
        }
      });
    } 
    // Caso 2: Permisos y privilegios separados
    else if (Array.isArray(separatePrivileges) && separatePrivileges.length > 0) {
      console.log('📋 Formato con privilegios separados');
      
      backendPermissions.forEach(permiso => {
        const moduleName = permiso.nombre;
        
        if (!frontendPermissions[moduleName]) {
          console.warn(`⚠️ Módulo desconocido: "${moduleName}"`);
          frontendPermissions[moduleName] = {
            Create: false,
            Read: false,
            Edit: false,
            Delete: false
          };
        }
        
        separatePrivileges.forEach(privilegio => {
          if (frontendPermissions[moduleName]) {
            frontendPermissions[moduleName][privilegio.nombre] = true;
          }
        });
      });
    }
    
    console.log('✅ Permisos mapeados:', frontendPermissions);
    return frontendPermissions;
  }

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

  static mapRolesFromBackend(roles) {
    if (!Array.isArray(roles)) return [];
    return roles.map(role => this.mapRoleFromBackend(role));
  }

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

      console.log(`📋 Procesando módulo ${modulo}:`, permisos);

      // ✅ Verificar que el módulo existe en el mapeo
      if (!this.BACKEND_MODULE_IDS[modulo]) {
        console.warn(`⚠️ Módulo "${modulo}" no encontrado en mapeo`);
        return;
      }

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