// Utilidad para restaurar datos del administrador
export const restoreAdminData = () => {
  console.log('=== RESTAURANDO DATOS DEL ADMINISTRADOR ===');
  
  // 1. Obtener datos existentes
  const existingRoles = JSON.parse(localStorage.getItem('roles')) || [];
  const existingUsers = JSON.parse(localStorage.getItem('usuarios')) || [];
  
  console.log('Datos existentes - Roles:', existingRoles.length);
  console.log('Datos existentes - Usuarios:', existingUsers.length);
  
  // 2. Crear rol de administrador si no existe
  let adminRole = existingRoles.find(r => r.name === 'Administrador');
  if (!adminRole) {
    console.log('Creando rol de administrador...');
    adminRole = {
      id: 1,
      name: 'Administrador',
      description: 'Control total del sistema',
      estado: 'Activo',
      privileges: {
        'Dashboard': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
        'Gestión de Usuarios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
        'Gestión de Compras': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
        'Gestión de Servicios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
        'Ventas': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true }
      }
    };
    
    // Agregar el rol de administrador a los roles existentes
    const updatedRoles = [...existingRoles, adminRole];
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    console.log('✅ Rol de administrador creado');
  } else {
    console.log('✅ Rol de administrador ya existe');
    // Actualizar privilegios si es necesario
    if (!adminRole.privileges || Object.keys(adminRole.privileges).length === 0) {
      adminRole.privileges = {
        'Dashboard': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
        'Gestión de Usuarios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
        'Gestión de Compras': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
        'Gestión de Servicios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
        'Ventas': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true }
      };
      
      const updatedRoles = existingRoles.map(r => 
        r.name === 'Administrador' ? adminRole : r
      );
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      console.log('✅ Privilegios del rol de administrador actualizados');
    }
  }
  
  // 3. Crear usuario administrador si no existe
  let adminUser = existingUsers.find(u => u.isAdmin || u.correo === 'admin@admin.com');
  if (!adminUser) {
    console.log('Creando usuario administrador...');
    adminUser = {
      id: Date.now(), // Usar timestamp para evitar conflictos de ID
      nombre: 'Administrador',
      correo: 'admin@admin.com',
      password: 'Admin123!', // Cambiado para cumplir validación
      rol: 'Administrador',
      estado: 'Activo',
      isAdmin: true,
      privileges: adminRole.privileges
    };
    
    // Agregar el usuario administrador a los usuarios existentes
    const updatedUsers = [...existingUsers, adminUser];
    localStorage.setItem('usuarios', JSON.stringify(updatedUsers));
    console.log('✅ Usuario administrador creado');
  } else {
    console.log('✅ Usuario administrador ya existe');
    // Actualizar privilegios del administrador existente si es necesario
    if (!adminUser.privileges || Object.keys(adminUser.privileges).length === 0) {
      adminUser.privileges = adminRole.privileges;
      const updatedUsers = existingUsers.map(u => 
        u.isAdmin || u.correo === 'admin@admin.com' ? adminUser : u
      );
      localStorage.setItem('usuarios', JSON.stringify(updatedUsers));
      console.log('✅ Privilegios del administrador actualizados');
    }
  }
  
  console.log('✅ Datos del administrador verificados/restaurados');
  console.log('📧 Email: admin@admin.com');
  console.log('🔑 Password: admin123');
  console.log('👤 Rol: Administrador');
  console.log('🔐 Privilegios: Todos los módulos con todas las acciones');
  
  // Verificar que los privilegios se crearon correctamente
  console.log('Privilegios del administrador:', adminUser.privileges);
  
  return { adminRole, adminUser };
};

// Función para verificar que los datos están correctos
export const verifyAdminData = () => {
  const roles = JSON.parse(localStorage.getItem('roles')) || [];
  const users = JSON.parse(localStorage.getItem('usuarios')) || [];
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  console.log('=== VERIFICACIÓN DE DATOS ===');
  console.log('Roles:', roles.length);
  console.log('Usuarios:', users.length);
  console.log('Usuario actual:', currentUser ? currentUser.nombre : 'No autenticado');
  
  if (roles.length > 0 && users.length > 0) {
    const adminUser = users.find(u => u.isAdmin || u.correo === 'admin@admin.com');
    if (adminUser) {
      console.log('✅ Datos del administrador verificados correctamente');
      console.log('Privilegios del admin:', adminUser.privileges);
      return true;
    }
  }
  
  console.log('❌ Datos del administrador no encontrados');
  return false;
};

// Función para verificar privilegios específicos
export const testPrivileges = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) {
    console.log('❌ No hay usuario logueado');
    return false;
  }
  
  console.log('=== VERIFICACIÓN DE PRIVILEGIOS ===');
  console.log('Usuario:', user.nombre);
  console.log('Rol:', user.rol);
  console.log('Privilegios:', user.privileges);
  
  const modules = ['Dashboard', 'Gestión de Usuarios', 'Gestión de Compras', 'Gestión de Servicios', 'Ventas'];
  const actions = ['Visualizar', 'Crear', 'Editar', 'Eliminar'];
  
  let allPrivilegesOk = true;
  
  modules.forEach(module => {
    actions.forEach(action => {
      const hasPrivilege = user.privileges?.[module]?.[action];
      console.log(`${module} - ${action}: ${hasPrivilege ? '✅' : '❌'}`);
      if (!hasPrivilege) {
        allPrivilegesOk = false;
      }
    });
  });
  
  if (allPrivilegesOk) {
    console.log('✅ Todos los privilegios están correctos');
  } else {
    console.log('❌ Algunos privilegios están faltando');
  }
  
  return allPrivilegesOk;
};

// Función para limpiar solo el usuario actual (logout)
export const clearCurrentUser = () => {
  localStorage.removeItem('currentUser');
  console.log('✅ Usuario actual limpiado (logout)');
};

// Función para mostrar todos los usuarios existentes
export const showAllUsers = () => {
  const users = JSON.parse(localStorage.getItem('usuarios')) || [];
  console.log('=== TODOS LOS USUARIOS ===');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.nombre} (${user.correo}) - Rol: ${user.rol} - Admin: ${user.isAdmin ? 'Sí' : 'No'}`);
  });
  return users;
};

// Función para forzar la actualización de privilegios del administrador
export const forceUpdateAdminPrivileges = () => {
  console.log('=== FORZANDO ACTUALIZACIÓN DE PRIVILEGIOS ===');
  
  const users = JSON.parse(localStorage.getItem('usuarios')) || [];
  const adminUser = users.find(u => u.isAdmin || u.correo === 'admin@admin.com');
  
  if (adminUser) {
    const newPrivileges = {
      'Dashboard': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
      'Gestión de Usuarios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
      'Gestión de Compras': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
      'Gestión de Servicios': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true },
      'Ventas': { 'Crear': true, 'Visualizar': true, 'Editar': true, 'Eliminar': true }
    };
    
    adminUser.privileges = newPrivileges;
    
    const updatedUsers = users.map(u => 
      u.isAdmin || u.correo === 'admin@admin.com' ? adminUser : u
    );
    
    localStorage.setItem('usuarios', JSON.stringify(updatedUsers));
    
    // Si el usuario actual es el administrador, actualizar también
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && (currentUser.isAdmin || currentUser.correo === 'admin@admin.com')) {
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
    }
    
    console.log('✅ Privilegios del administrador forzados a actualizar');
    console.log('Nuevos privilegios:', newPrivileges);
    
    return true;
  }
  
  console.log('❌ No se encontró el usuario administrador');
  return false;
}; 