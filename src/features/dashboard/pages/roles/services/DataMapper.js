class DataMapper {
  // Mapear permisos del backend al formato del frontend
  static mapPermissionsFromBackend(backendPermissions, separatePrivileges = []) {
    const frontendPermissions = {};
    
    // Si no hay permisos, retornar objeto vacío
    if (!backendPermissions || !Array.isArray(backendPermissions) || backendPermissions.length === 0) {
      return frontendPermissions;
    }
    
    // Si los permisos tienen privilegios anidados (formato anterior)
    if (backendPermissions[0] && backendPermissions[0].privilegios) {
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
    // Si los permisos y privilegios están separados (formato actual del backend)
    else if (Array.isArray(separatePrivileges) && separatePrivileges.length > 0) {
      // Si hay menos permisos que privilegios, significa que solo algunos módulos están activos
      // En este caso, aplicar solo los privilegios a los módulos que están en permisos
      if (backendPermissions.length < 5) { // 5 es el número total de módulos
        backendPermissions.forEach(permiso => {
          const modulo = permiso.nombre;
          frontendPermissions[modulo] = {};
          
          // Aplicar todos los privilegios separados a este módulo
          separatePrivileges.forEach(privilegio => {
            frontendPermissions[modulo][privilegio.nombre] = true;
          });
        });
        
        // Agregar módulos no activos con privilegios en false
        const allModules = ['Compras', 'Servicios', 'Venta', 'Configuración', 'Usuarios'];
        allModules.forEach(modulo => {
          if (!frontendPermissions[modulo]) {
            frontendPermissions[modulo] = {
              Create: false,
              Read: false,
              Edit: false,
              Delete: false
            };
          }
        });
      } else {
        // Si hay todos los módulos, aplicar todos los privilegios a todos los módulos
        backendPermissions.forEach(permiso => {
          const modulo = permiso.nombre;
          frontendPermissions[modulo] = {};
          
          // Aplicar todos los privilegios separados a este módulo
          separatePrivileges.forEach(privilegio => {
            frontendPermissions[modulo][privilegio.nombre] = true;
          });
        });
      }
    }
    // Si solo hay permisos sin privilegios, crear estructura básica
    else {
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
    
    return frontendPermissions;
  }

  // Mapear rol del backend al formato del frontend
  static mapRoleFromBackend(role) {
    if (!role) return null;

    return {
      id: role.id_rol || role.id,
      nombre: role.nombre,
      name: role.nombre,
      descripcion: role.descripcion,
      description: role.descripcion,
      estado: role.estado === true || role.estado === 'activo' ? 'Activo' : 'Inactivo',
      privileges: this.mapPermissionsFromBackend(role.permisos || [], role.privilegios || []),
      permisos: role.permisos || [],
      privilegios: role.privilegios || []
    };
  }

  // Mapear array de roles del backend al formato del frontend
  static mapRolesFromBackend(roles) {
    if (!Array.isArray(roles)) return [];
    
    return roles.map(role => this.mapRoleFromBackend(role));
  }

  // Mapear datos del frontend al formato del backend para crear/actualizar
  static mapRoleToBackend(roleData) {
    return {
      nombre: (roleData.name || roleData.nombre || '').trim(),
      descripcion: (roleData.description || roleData.descripcion || '').trim(),
      estado: roleData.estado === 'Activo' ? true : false,
      permisos_privilegios: this.convertPrivilegesToBackendFormat(roleData.privileges || {})
    };
  }

  // Convertir privilegios del frontend al formato del backend
  static convertPrivilegesToBackendFormat(frontendPrivileges) {
    const backendFormat = [];
    
    if (!frontendPrivileges || typeof frontendPrivileges !== 'object') {
      return [];
    }
    
    Object.keys(frontendPrivileges).forEach(modulo => {
      const permisos = frontendPrivileges[modulo];
      const privilegios = [];
      
      if (permisos && typeof permisos === 'object') {
        Object.keys(permisos).forEach(accion => {
          if (permisos[accion]) {
            // Mapear nombres de acciones del frontend al backend (IDs correctos del backend)
            const actionMap = {
              'Create': 1,
              'Read': 2,
              'Edit': 3,
              'Delete': 4
            };
            
            if (actionMap[accion]) {
              privilegios.push({
                id_privilegio: actionMap[accion],
                nombre: accion
              });
            }
          }
        });
      }
      
      if (privilegios.length > 0) {
        // Mapear nombres de módulos del frontend al backend (IDs correctos del backend)
        const moduleMap = {
          'Compras': 1,
          'Servicios': 2,
          'Venta': 3,
          'Configuración': 4,
          'Usuarios': 5
        };
        
        if (moduleMap[modulo]) {
          backendFormat.push({
            id_permiso: moduleMap[modulo],
            nombre: modulo,
            privilegios: privilegios
          });
        }
      }
    });
    
    return backendFormat;
  }
}

export default DataMapper;
