import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [authChecked, setAuthChecked] = useState(false);
  const initialCheckDone = useRef(false);
  const location = useLocation();

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
    const isAdmin = roleName.toLowerCase() === 'administrador';

    if (isAdmin) {
      console.log('✅ Usuario es Administrador, tiene todos los privilegios');
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

  // Función para obtener la ruta de redirección basada en el rol
  const getRoleRedirect = (role) => {
    const roleName = typeof role === 'string' 
      ? role 
      : (role?.nombre || '');
    
    const normalizedRole = roleName.toLowerCase();

    console.log('🔄 Determinando redirección para rol:', { 
      original: role, 
      roleName, 
      normalizedRole 
    });

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

        setCurrentUser(response.data);
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
  const login = async (userData) => {
    try {
      console.log('=== LOGIN INICIADO ===');
      console.log('📝 Datos del usuario recibidos:', userData);
      console.log('🔑 Privilegios del usuario:', userData.privileges);

      setCurrentUser(userData);

      // Emitir evento de cambio
      window.dispatchEvent(new Event('user-auth-changed'));

      // Obtener ruta de redirección
      const redirectPath = getRoleRedirect(userData.rol);
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

      setCurrentUser(null);
      
      // Emitir evento de cambio
      window.dispatchEvent(new Event('user-auth-changed'));
      
      // Redirigir al login
      window.location.href = '/login';
    }
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

  // Verificar autenticación al cargar (solo una vez y no en rutas públicas)
  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!initialCheckDone.current && !isPublicRoute) {
      initialCheckDone.current = true;
      checkAuth();
    } else if (isPublicRoute && !authChecked) {
      // Para rutas públicas, marcar como verificado sin hacer petición
      setAuthChecked(true);
      setLoading(false);
    }
  }, [location.pathname]);


  const value = {
    currentUser,
    loading,
    authChecked,
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