// src/features/dashboard/pages/roles/services/DataMapper.js

class DataMapper {
  // ✅ ACTUALIZADO: Mapeo dinámico basado en permisos del backend
  // Estos se actualizarán cuando se carguen los permisos desde el backend
  static moduleMap = new Map(); // Mapa de nombre de permiso -> id_permiso
  static privilegeMap = new Map(); // Mapa de nombre de privilegio -> id_privilegio
  
  // Método para inicializar los mapeos con datos del backend
  static initializeMaps(permissions = [], privileges = []) {
    // Limpiar mapeos existentes
    this.moduleMap.clear();
    this.privilegeMap.clear();
    
    // Crear mapeo de permisos
    permissions.forEach(perm => {
      if (perm.id_permiso && perm.nombre) {
        this.moduleMap.set(perm.nombre, perm.id_permiso);
      }
    });
    
    // Crear mapeo de privilegios
    privileges.forEach(priv => {
      if (priv.id_privilegio && priv.nombre) {
        this.privilegeMap.set(priv.nombre, priv.id_privilegio);
      }
    });
    
    console.log('✅ Mapeos inicializados:', {
      modules: Array.from(this.moduleMap.entries()),
      privileges: Array.from(this.privilegeMap.entries())
    });
  }
  
  // Obtener ID de permiso por nombre
  static getPermissionId(moduleName) {
    return this.moduleMap.get(moduleName);
  }
  
  // Obtener ID de privilegio por nombre
  static getPrivilegeId(privilegeName) {
    return this.privilegeMap.get(privilegeName);
  }
  
  // Obtener nombre de permiso por ID
  static getPermissionName(moduleId) {
    for (const [name, id] of this.moduleMap.entries()) {
      if (id === moduleId) return name;
    }
    return null;
  }
  
  // Obtener nombre de privilegio por ID
  static getPrivilegeName(privilegeId) {
    for (const [name, id] of this.privilegeMap.entries()) {
      if (id === privilegeId) return name;
    }
    return null;
  }
  
  // ✅ DEPRECATED: Mantener por compatibilidad, pero usar mapeos dinámicos
  static BACKEND_MODULE_IDS = {};
  static BACKEND_MODULE_NAMES = {};

  // ✅ CORREGIDO: Usar nombres en español
  static PRIVILEGE_IDS = {
    'Crear': 1,
    'Visualizar': 2,
    'Editar': 3,
    'Eliminar': 4
  };

  static PRIVILEGE_NAMES = {
    1: 'Crear',
    2: 'Visualizar',
    3: 'Editar',
    4: 'Eliminar'
  };

  static mapPermissionsFromBackend(backendPermissions, separatePrivileges = [], allAvailablePermissions = []) {
    const frontendPermissions = {};
    
    console.log('📥 Mapeando permisos del backend:', { backendPermissions, separatePrivileges, allAvailablePermissions });
    
    // NO inicializar todos los módulos automáticamente
    // Solo inicializar los módulos que realmente tienen privilegios asignados
    
    if (!backendPermissions || !Array.isArray(backendPermissions) || backendPermissions.length === 0) {
      console.warn('⚠️ No hay permisos asignados para mapear');
      return frontendPermissions;
    }
    
    // Caso 1: Permisos con privilegios anidados (formato actual del backend)
    if (backendPermissions[0] && backendPermissions[0].privilegios) {
      console.log('📋 Formato con privilegios anidados');
      
      backendPermissions.forEach(permiso => {
        const moduleName = permiso.nombre;
        
        // Inicializar el módulo como un objeto vacío
        if (!frontendPermissions[moduleName]) {
          frontendPermissions[moduleName] = {};
        }
        
        // SOLO agregar los privilegios que vienen del backend como true
        // NO inicializar los demás privilegios en false
        if (Array.isArray(permiso.privilegios) && permiso.privilegios.length > 0) {
          permiso.privilegios.forEach(privilegio => {
            if (privilegio.nombre) {
              // Solo agregar el privilegio si existe y está activo
              frontendPermissions[moduleName][privilegio.nombre] = true;
              console.log(`  ✅ Agregando privilegio activo: ${moduleName} -> ${privilegio.nombre}`);
            }
          });
        }
      });
    } 
    // Caso 2: Permisos y privilegios separados (DEPRECATED - Ya no se usa este formato)
    else if (Array.isArray(separatePrivileges) && separatePrivileges.length > 0) {
      console.warn('⚠️ Formato con privilegios separados detectado (formato antiguo)');
      // No hacer nada, este formato ya no se usa
    }
    
    console.log('✅ Permisos mapeados:', frontendPermissions);
    console.log('✅ Solo se incluyen módulos con privilegios asignados');
    return frontendPermissions;
  }

  static mapRoleFromBackend(role, allAvailablePermissions = []) {
    if (!role) return null;

    const mappedRole = {
      id: role.id_rol || role.id,
      nombre: role.nombre,
      name: role.nombre,
      descripcion: role.descripcion || '',
      description: role.descripcion || '',
      estado: role.estado === true || role.estado === 'activo' ? 'Activo' : 'Inactivo',
      privileges: this.mapPermissionsFromBackend(role.permisos || [], role.privilegios || [], allAvailablePermissions),
      permisos: role.permisos || [],
      privilegios: role.privilegios || []
    };

    console.log('🔄 Rol mapeado desde backend:', mappedRole);
    return mappedRole;
  }

  static mapRolesFromBackend(roles, allAvailablePermissions = []) {
    if (!Array.isArray(roles)) return [];
    return roles.map(role => this.mapRoleFromBackend(role, allAvailablePermissions));
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
    
    console.log('🔄 Convirtiendo privilegios para backend (INPUT):', JSON.stringify(frontendPrivileges, null, 2));

    if (!frontendPrivileges || typeof frontendPrivileges !== 'object') {
      console.warn('⚠️ No hay privilegios o formato inválido');
      return [];
    }

    // Procesar cada módulo
    Object.keys(frontendPrivileges).forEach(modulo => {
      const permisos = frontendPrivileges[modulo];
      const privilegios = [];

      console.log(`📋 Procesando módulo "${modulo}":`, permisos);

      // ✅ Obtener ID del módulo desde el mapeo dinámico
      const moduleId = this.getPermissionId(modulo);
      if (!moduleId) {
        console.warn(`⚠️ Módulo "${modulo}" no encontrado en mapeo. Verifica que los permisos se hayan cargado correctamente.`);
        return;
      }

      // Recolectar SOLO privilegios activos (true)
      if (permisos && typeof permisos === 'object') {
        Object.keys(permisos).forEach(accion => {
          const valor = permisos[accion];
          // ✅ SOLO incluir privilegios que están EXPLÍCITAMENTE en true
          // Ignorar false, undefined, null, o cualquier otro valor
          if (valor === true) {
            const privilegeId = this.getPrivilegeId(accion);
            if (privilegeId) {
              privilegios.push({
                id_privilegio: privilegeId,
                nombre: accion
              });
              console.log(`  ✅ Agregando privilegio: ${accion} (ID: ${privilegeId})`);
            } else {
              console.warn(`  ⚠️ Privilegio "${accion}" no encontrado en mapeo`);
            }
          } else {
            console.log(`  ❌ Omitting privilegio "${accion}" porque su valor es: ${valor} (tipo: ${typeof valor})`);
          }
        });
      }

      // ✅ SOLO agregar el módulo si tiene privilegios activos
      if (privilegios.length > 0) {
        backendFormat.push({
          id_permiso: moduleId,
          nombre: modulo,
          privilegios: privilegios
        });
        console.log(`  ✅ Módulo "${modulo}" agregado con ${privilegios.length} privilegio(s)`);
      } else {
        console.log(`  ⚠️ Módulo "${modulo}" NO tiene privilegios activos, se omite`);
      }
    });

    console.log('✅ Formato final para backend (OUTPUT):', JSON.stringify(backendFormat, null, 2));
    console.log(`✅ Total de módulos con privilegios: ${backendFormat.length}`);
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
      const moduleId = this.getPermissionId(modulo);
      if (!moduleId) {
        // Solo mostrar error si el mapeo está inicializado (tiene datos)
        if (this.moduleMap.size > 0) {
          errors.push(`Módulo "${modulo}" no es válido`);
        }
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