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

export const AuthProvider = ({ children }) => { // eslint-disable-line react/prop-types
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

  // Función para verificar si el usuario tiene privilegios específicos
  const hasPrivilege = (module, action) => {
    if (!currentUser) {
      console.warn('No hay usuario autenticado');
      return false;
    }

    // Obtener nombre del rol (puede venir como string o objeto)
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

    // Mapeo directo: módulo del frontend -> permiso del backend
    const moduleToPermissionMap = {
      'Dashboard': 'Dashboard',
      'Gestión de Usuarios': 'Gestión de Usuarios',
      'Gestión de Compras': 'Gestión de Compras',
      'Gestión de Servicios': 'Gestión de Servicios',
      'Ventas': 'Ventas'
    };

    // Obtener el permiso correspondiente al módulo solicitado
    const backendPermission = moduleToPermissionMap[module] || module;

    // DEBUG: Log detallado para troubleshooting (comentado para producción)
    // console.log('🔍 DEBUG hasPrivilege:', {
    //   module,
    //   action,
    //   backendPermission,
    //   userRole: roleName,
    //   isAdmin,
    //   userPrivileges: currentUser.privileges,
    //   availablePermissions: Object.keys(currentUser.privileges || {}),
    //   privilegeExists: currentUser.privileges?.[backendPermission]?.[action]
    // });

    // Verificar si el módulo existe en los privilegios del usuario
    const modulePrivileges = currentUser.privileges?.[backendPermission];
    if (!modulePrivileges) {
      console.warn(`⚠️ Módulo "${backendPermission}" (mapeado desde "${module}") no encontrado en privilegios del usuario`);
      return false;
    }

    // Verificar si tiene la acción específica
    const hasPrivilege = modulePrivileges[action] === true;
    console.log(`🔍 Verificando privilegio: ${module} -> ${backendPermission} -> ${action} = ${hasPrivilege}`);
    return hasPrivilege;
  };

  // Función para obtener la ruta de redirección basada en el rol
  const getRoleRedirect = (role) => {
    // Normalizar el nombre del rol
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
      
      // Llamar al endpoint /auth/me para verificar el token en cookies
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

      // Guardar usuario en localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);

      // Emitir evento de cambio
      window.dispatchEvent(new Event('user-auth-changed'));

      // Obtener ruta de redirección
      const redirectPath = getRoleRedirect(userData.rol);
      console.log('🔄 Redirigiendo a:', redirectPath);

      // Pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
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
        // Llamar al endpoint de logout para limpiar la cookie HttpOnly
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
      window.location.href = '/login';
    }
  };

  // Función para verificar autenticación
  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticación...');
      
      // Primero verificar si hay usuario en localStorage
      const storedUser = getUserFromStorage();
      
      if (!storedUser) {
        console.log('❌ No hay usuario en localStorage');
        setLoading(false);
        return null;
      }

      console.log('📝 Usuario en localStorage:', storedUser);
      
      // Verificar token con el backend
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