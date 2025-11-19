// src/features/dashboard/pages/roles/services/DataMapper.js

class DataMapper {
  // ✅ CORREGIDO: IDs y nombres actualizados para coincidir con el backend
  static BACKEND_MODULE_IDS = {
    'Gestión de Compras': 1,
    'Gestión de Servicios': 2,
    'Ventas': 3,                    // ⚠️ CAMBIO: Era "Gestión de Ventas"
    'Gestión de Usuarios': 4,
    'Dashboard': 5
  };

  static BACKEND_MODULE_NAMES = {
    1: 'Gestión de Compras',
    2: 'Gestión de Servicios',
    3: 'Ventas',                     // ⚠️ CAMBIO: Era "Gestión de Ventas"
    4: 'Gestión de Usuarios',
    5: 'Dashboard'
  };

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
        Crear: false,
        Visualizar: false,
        Editar: false,
        Eliminar: false
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
            Crear: false,
            Visualizar: false,
            Editar: false,
            Eliminar: false
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
            Crear: false,
            Visualizar: false,
            Editar: false,
            Eliminar: false
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
    console.log('🔄 CONVERTIR A BACKEND FORMAT');
    console.log('Input:', JSON.stringify(frontendPrivileges, null, 2));
    
    const backendFormat = [];

    if (!frontendPrivileges || typeof frontendPrivileges !== 'object') {
      console.warn('⚠️ No hay privilegios o formato inválido');
      return [];
    }

    // Procesar cada módulo
    Object.keys(frontendPrivileges).forEach(modulo => {
      const permisos = frontendPrivileges[modulo];
      const privilegios = [];

      console.log(`\n📋 Procesando módulo: ${modulo}`);
      console.log(`   Permisos del módulo:`, permisos);
      console.log(`   Tipo de permisos:`, typeof permisos);
      console.log(`   Es array?:`, Array.isArray(permisos));

      // ✅ Verificar que el módulo existe en el mapeo
      if (!this.BACKEND_MODULE_IDS[modulo]) {
        console.warn(`⚠️ Módulo "${modulo}" no encontrado en mapeo`);
        console.warn(`   Módulos disponibles:`, Object.keys(this.BACKEND_MODULE_IDS));
        return;
      }

      const moduleId = this.BACKEND_MODULE_IDS[modulo];
      console.log(`   ID del módulo: ${moduleId}`);

      // Recolectar privilegios activos
      if (permisos && typeof permisos === 'object' && !Array.isArray(permisos)) {
        Object.keys(permisos).forEach(accion => {
          const isActive = permisos[accion] === true;
          const privilegeId = this.PRIVILEGE_IDS[accion];
          
          console.log(`   - ${accion}: ${isActive ? '✅ ACTIVO' : '❌ INACTIVO'} (id=${privilegeId || 'NO ENCONTRADO'})`);
          
          // ✅ SOLO incluir privilegios que están ACTIVOS (true)
          if (isActive && privilegeId) {
            privilegios.push({
              id_privilegio: privilegeId,
              nombre: accion
            });
            console.log(`     → Agregado a array de privilegios`);
          } else if (isActive && !privilegeId) {
            console.warn(`     ⚠️ Privilegio "${accion}" activo pero no tiene ID mapeado`);
          }
        });
      } else {
        console.warn(`   ⚠️ Permisos no es un objeto válido o es un array`);
      }

      console.log(`   Total privilegios para ${modulo}: ${privilegios.length}`);
      console.log(`   Array de privilegios:`, JSON.stringify(privilegios, null, 2));

      // ✅ SOLO agregar el módulo si tiene privilegios activos
      if (privilegios.length > 0) {
        backendFormat.push({
          id_permiso: moduleId,
          nombre: modulo,
          privilegios: privilegios
        });
        console.log(`   ✅ Módulo ${modulo} agregado con ${privilegios.length} privilegios`);
      } else {
        console.log(`   ⚠️ Módulo ${modulo} no tiene privilegios activos, se omite`);
      }
    });

    console.log('\n✅ OUTPUT FINAL:');
    console.log(JSON.stringify(backendFormat, null, 2));
    console.log(`Total módulos con privilegios: ${backendFormat.length}`);
    backendFormat.forEach((p, i) => {
      console.log(`  Módulo ${i + 1}: ${p.nombre} con ${p.privilegios.length} privilegios`);
    });
    
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