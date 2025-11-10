import { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiRequest } from '../config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el usuario del localStorage
  const getUserFromStorage = () => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return null;
    }
  };

  /**
   * ✅ CORREGIDO: Verificar privilegios con nombres correctos
   * Ahora maneja tanto nombres en inglés como español para retrocompatibilidad
   */
  const hasPrivilege = (module, action) => {
    if (!currentUser) {
      console.warn('⚠️ No hay usuario autenticado');
      return false;
    }

    // Obtener nombre del rol
    const roleName = typeof currentUser.rol === 'string'
      ? currentUser.rol
      : currentUser.rol?.nombre || '';

    // Si el usuario es Administrador, tiene todos los privilegios
    const isAdmin = roleName.toLowerCase() === 'administrador' || roleName.toLowerCase() === 'admin';

    if (isAdmin) {
      console.log(`✅ Usuario es Administrador (${roleName}), tiene todos los privilegios para ${module} -> ${action}`);
      return true;
    }

    // Verificar si existen privilegios
    if (!currentUser.privileges) {
      console.warn('⚠️ Usuario no tiene privilegios definidos:', currentUser);
      return false;
    }

    console.log('🔍 Verificando privilegio:', { module, action });
    console.log('📋 Privilegios del usuario:', currentUser.privileges);

    // ✅ MAPEO DE COMPATIBILIDAD para acciones
    const actionMap = {
      // Inglés -> Español
      'Create': 'Crear',
      'Read': 'Visualizar',
      'Edit': 'Editar',
      'Delete': 'Eliminar',
      // Español (mantener)
      'Crear': 'Crear',
      'Visualizar': 'Visualizar',
      'Editar': 'Editar',
      'Eliminar': 'Eliminar'
    };

    // Obtener el nombre de la acción en español
    const spanishAction = actionMap[action] || action;

    // ✅ USAR EL NOMBRE DEL MÓDULO DIRECTAMENTE
    const modulePrivileges = currentUser.privileges?.[module];
    
    if (!modulePrivileges) {
      console.warn(`⚠️ Módulo "${module}" no encontrado en privilegios del usuario`);
      console.log('📋 Módulos disponibles:', Object.keys(currentUser.privileges || {}));
      return false;
    }

    // Verificar si tiene la acción específica (probar con ambos nombres)
    const hasPrivilege = modulePrivileges[spanishAction] === true || 
                        modulePrivileges[action] === true;
    
    console.log(`🔍 Resultado: ${module} -> ${spanishAction} = ${hasPrivilege}`);
    return hasPrivilege;
  };

  // Función para obtener la ruta de redirección basada en el rol y permisos
  const getRoleRedirect = (role, userData = null) => {
    const roleName = typeof role === 'string' 
      ? role 
      : (role?.nombre || '');
    
    const normalizedRole = roleName.toLowerCase();

    console.log('🔄 Determinando redirección para rol:', { 
      original: role, 
      roleName, 
      normalizedRole 
    });

    // Obtener datos del usuario si están disponibles
    const user = userData || currentUser;
    
    // Verificar si el usuario tiene permisos administrativos
    // Módulos administrativos: Dashboard, Gestión de Usuarios, Gestión de Compras, Gestión de Servicios
    if (user && user.privileges) {
      const administrativeModules = [
        'Dashboard',
        'Gestión de Usuarios',
        'Gestión de Compras',
        'Gestión de Servicios'
      ];
      
      // Verificar si tiene acceso a algún módulo administrativo
      const hasAdministrativeAccess = administrativeModules.some(module => {
        const modulePrivileges = user.privileges[module];
        return modulePrivileges && (
          modulePrivileges.Visualizar === true || 
          modulePrivileges['Visualizar'] === true ||
          modulePrivileges.Read === true
        );
      });
      
      if (hasAdministrativeAccess) {
        console.log('✅ Usuario tiene permisos administrativos, redirigiendo a /dashboard');
        return '/dashboard';
      }
    }

    // Fallback: redirección basada en rol
    const roleRedirects = {
      'administrador': '/dashboard',
      'empleado': '/dashboard/citas',
      'cliente': '/landing',
      'usuario': '/landing'
    };

    const redirect = roleRedirects[normalizedRole] || '/landing';
    console.log(`✅ Redirigiendo rol "${normalizedRole}" a: ${redirect}`);
    return redirect;
  };

  // Función para verificar si el token es válido
  const verifyAuth = async () => {
    try {
      console.log('🔍 Verificando autenticación con el backend...');
      
      const response = await apiRequest.get('/auth/me');
      
      if (response.success && response.data) {
        console.log('✅ Token válido, usuario autenticado:', response.data);
        
        // Actualizar usuario en localStorage y estado
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        setCurrentUser(response.data);
        return true;
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor:', response);
        throw new Error('Token inválido');
      }
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);
      
      // Limpiar datos de usuario
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      return false;
    }
  };

  // Función de login
  const login = async (userData) => {
    try {
      console.log('=== LOGIN INICIADO ===');
      console.log('📝 Datos del usuario recibidos:', userData);
      console.log('🔑 Privilegios del usuario:', userData.privileges);

      // Guardar usuario en localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);

      // Emitir evento de cambio
      window.dispatchEvent(new Event('user-auth-changed'));

      // Obtener ruta de redirección (pasar userData para verificar permisos)
      const redirectPath = getRoleRedirect(userData.rol, userData);
      console.log('🔄 Redirigiendo a:', redirectPath);

      // Redirigir con un pequeño delay para mejor UX
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  // Función de logout
  const logout = async () => {
    const result = await Swal.fire({
      title: '¿Deseas cerrar sesión?',
      text: 'Tendrás que volver a iniciar sesión para acceder nuevamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await apiRequest.post('/auth/logout');
      } catch (error) {
        console.warn('⚠️ Error al cerrar sesión en el backend:', error);
      }

      // Limpiar datos locales
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      
      // Emitir evento de cambio
      window.dispatchEvent(new Event('user-auth-changed'));
      
      // Redirigir al login
      window.location.href = '/iniciar-sesion';
    }
  };

  // Función para verificar autenticación
  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticación...');
      
      const storedUser = getUserFromStorage();
      
      if (!storedUser) {
        console.log('❌ No hay usuario en localStorage');
        setLoading(false);
        return null;
      }

      console.log('📝 Usuario en localStorage:', storedUser);
      console.log('🔑 Privilegios almacenados:', storedUser.privileges);
      
      const isValid = await verifyAuth();
      
      if (!isValid) {
        console.log('❌ Token inválido o expirado');
        setLoading(false);
        return null;
      }

      console.log('✅ Autenticación verificada exitosamente');
      setLoading(false);
      return currentUser;
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);
      setLoading(false);
      return null;
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    console.log('🚀 AuthProvider montado, iniciando verificación...');
    checkAuth();
  }, []);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Cambio detectado en localStorage');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-auth-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-auth-changed', handleStorageChange);
    };
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    hasPrivilege,
    getRoleRedirect,
    checkAuth,
    verifyAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};