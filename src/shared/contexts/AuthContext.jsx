import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiRequest } from '../config/apiConfig';

// Valor por defecto del contexto para evitar errores cuando no está disponible
const defaultContextValue = {
  currentUser: null,
  loading: true,
  login: async () => { },
  logout: () => { },
  logoutConfirmed: async () => { },
  hasPrivilege: () => false,
  getRoleRedirect: () => '/landing',
  checkAuth: async () => null,
  verifyAuth: async () => false,
  setActiveRole: async () => {},
  _isProviderActive: false, // Flag para identificar si el Provider está activo
};

const AuthContext = createContext(defaultContextValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Verificar si el Provider está activo usando el flag
  if (!context || context._isProviderActive === false) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Inicializar con usuario del localStorage si existe (sincrónico)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const initialCheckDone = useRef(false);

  // Rutas públicas donde NO se debe verificar autenticación
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

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
      return true;
    }

    // Verificar si existen privilegios
    if (!currentUser.privileges) {
      console.warn('⚠️ Usuario no tiene privilegios definidos:', currentUser);
      return false;
    }

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
      'Eliminar': 'Eliminar',
      'Crear novedades': 'Crear novedades'
    };

    // Obtener el nombre de la acción en español
    const spanishAction = actionMap[action] || action;

    // ✅ USAR EL NOMBRE DEL MÓDULO DIRECTAMENTE
    const modulePrivileges = currentUser.privileges?.[module];

    if (!modulePrivileges) {
      console.warn(`⚠️ Módulo "${module}" no encontrado en privilegios del usuario`);
      return false;
    }

    // Verificar si tiene la acción específica (probar con ambos nombres)
    const hasPrivilege = modulePrivileges[spanishAction] === true ||
      modulePrivileges[action] === true;

    return hasPrivilege;
  };

  // Función para obtener la ruta de redirección basada en el rol y permisos
  const getRoleRedirect = (role, userData = null) => {
    const roleName = typeof role === 'string'
      ? role
      : (role?.nombre || '');

    const normalizedRole = roleName.toLowerCase();

    // Obtener datos del usuario si están disponibles
    const user = userData || currentUser;

    // ⚠️ IMPORTANTE: Clientes y usuarios NUNCA deben acceder al dashboard
    // Incluso si tienen algunos privilegios, deben ir al landing
    if (normalizedRole === 'cliente' || normalizedRole === 'usuario') {
      console.log('🚫 Cliente/Usuario detectado, redirigiendo a /landing (sin acceso administrativo)');
      return '/landing';
    }

    // Para otros roles, verificar si tienen permisos administrativos
    if (user && user.privileges) {
      const administrativeModules = [
        'Dashboard',
        'Gestión de Usuarios',
        'Gestión de Compras',
        'Gestión de Servicios',
        'Empleados',
        'Programación',
        'Productos',
        'Compras',
        'Proveedores',
        'Categorías de Productos',
        'Categorías de Servicios',
        'Servicios',
        'Ventas',
        'Venta de Productos',
        'Pedidos',
        'Citas',
        'Clientes'
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

    return roleRedirects[normalizedRole] || '/landing';
  };

  // Función para verificar si el token es válido
  const verifyAuth = async () => {
    try {
      const response = await apiRequest.get('/auth/me');

      if (response.success && response.data) {
        setCurrentUser(response.data);

        // Actualizar localStorage con datos frescos del usuario
        try {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
        } catch (error) {
          console.error('⚠️ Error al actualizar usuario en localStorage:', error);
        }

        return true;
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor:', response);
        throw new Error('Token inválido');
      }
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);

      setCurrentUser(null);
      return false;
    }
  };

  // Función de login
  const login = async (userData, previousPath = null) => {
    try {
      console.log('=== LOGIN INICIADO ===');
      console.log('📝 Datos del usuario recibidos:', userData);
      console.log('🔑 Privilegios del usuario:', userData.privileges);
      console.log('📍 Página anterior:', previousPath);

      setCurrentUser(userData);

      // Guardar usuario en localStorage para persistencia
      try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('✅ Usuario guardado en localStorage');
      } catch (error) {
        console.error('⚠️ Error al guardar usuario en localStorage:', error);
      }

      // Emitir evento de cambio
      window.dispatchEvent(new Event('user-auth-changed'));

      // Obtener nombre del rol
      const roleName = typeof userData.rol === 'string'
        ? userData.rol
        : userData.rol?.nombre || '';
      const normalizedRole = roleName.toLowerCase();

      // Determinar ruta de redirección
      let redirectPath;

      // Si es cliente/usuario y hay una página anterior válida, redirigir ahí
      if ((normalizedRole === 'cliente' || normalizedRole === 'usuario') && previousPath) {
        // Verificar que la página anterior no sea el dashboard ni rutas administrativas
        const isAdminRoute = previousPath.startsWith('/dashboard') ||
          previousPath.startsWith('/admin') ||
          previousPath === '/iniciar-sesion' ||
          previousPath === '/registrarse';

        if (!isAdminRoute) {
          console.log('🔄 Cliente: Redirigiendo a página anterior:', previousPath);
          redirectPath = previousPath;
        } else {
          // Si la página anterior es administrativa, redirigir al landing
          redirectPath = getRoleRedirect(userData.rol, userData);
        }
      } else {
        // Para otros roles o si no hay página anterior, usar la lógica normal
        redirectPath = getRoleRedirect(userData.rol, userData);
      }

      console.log('🔄 Redirección sugerida:', redirectPath);
      // No realizar navegación directa aquí para evitar recargas completas.
      // Devolver la ruta sugerida y permitir que el componente de UI navegue.
      return redirectPath;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  // Función de logout (sin confirmación, para usar después del modal)
  const logoutConfirmed = async () => {
    try {
      await apiRequest.post('/auth/logout');
    } catch (error) {
      console.warn('⚠️ Error al cerrar sesión en el backend:', error);
    }

    // Limpiar datos locales
    localStorage.removeItem('currentUser');
    try { localStorage.removeItem('authToken'); } catch { }
    setCurrentUser(null);

    // Emitir evento de cambio
    window.dispatchEvent(new Event('user-auth-changed'));

    // Redirigir al login
    window.location.href = '/iniciar-sesion';
  };

  // Función de logout (mantener para compatibilidad, pero ahora solo retorna función)
  const logout = () => {
    // Esta función ahora solo retorna la función de logout confirmado
    // El modal se manejará en el componente que llama
    return logoutConfirmed;
  };

  // Función para verificar autenticación
  const checkAuth = async () => {
    try {
      const isValid = await verifyAuth();
      setLoading(false);
      setAuthChecked(true);
      return isValid ? currentUser : null;
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);
      setLoading(false);
      setAuthChecked(true);
      return null;
    }
  };

  // Cambiar rol activo del usuario
  const setActiveRole = async (idRol) => {
    try {
      const response = await apiRequest.put('/auth/active-role', { idRol });
      if (response.success && response.data) {
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        setCurrentUser(response.data);
        window.dispatchEvent(new Event('user-auth-changed'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error al cambiar rol activo:', error);
      return false;
    }
  };

  // Verificar autenticación al cargar (solo una vez y no en rutas públicas)
  useEffect(() => {
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    const initAuth = async () => {
      // Si ya hay un usuario en el estado inicial (localStorage)
      if (currentUser) {
        // ✅ OPTIMIZACIÓN: Permitir renderizado inmediato con datos cacheados
        setLoading(false);
        setAuthChecked(true);

        // Verificar token en segundo plano (non-blocking)
        verifyAuth().catch(() => {
          // Si la verificación falla, limpiar usuario
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        });
      } else {
        // Si no hay usuario, marcar como no cargando y verificado
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const value = {
    currentUser,
    loading,
    authChecked,
    login,
    logout,
    logoutConfirmed,
    hasPrivilege,
    getRoleRedirect,
    checkAuth,
    verifyAuth,
    setActiveRole,
    _isProviderActive: true, // Flag para indicar que el Provider está activo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
