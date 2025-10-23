import { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

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

  // Función para verificar si el usuario tiene privilegios específicos
  const hasPrivilege = (module, action) => {
    if (!currentUser) {
      return false;
    }

    // Si el usuario es administrador, tiene todos los privilegios
    if (currentUser.rol?.toLowerCase() === 'administrador') {
      return true;
    }

    if (!currentUser.privileges) {
      return false;
    }

    const hasPrivilege = currentUser.privileges[module]?.[action] === true;
    return hasPrivilege;
  };

  // Función para obtener la ruta de redirección basada en el rol
  const getRoleRedirect = (role) => {
    const roleRedirects = {
      'administrador': '/dashboard',
      'empleado': '/dashboard/citas',
      'cliente': '/landing',
    };
    return roleRedirects[role?.toLowerCase()] || '/landing';
  };

  // Función de login
  const login = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    const redirectPath = getRoleRedirect(user.rol);
    window.location.href = redirectPath;
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
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      window.location.href = '/login';
    }
  };

  // Función para verificar autenticación
  const checkAuth = () => {
    const user = getUserFromStorage();
    setCurrentUser(user);
    setLoading(false);
    return user;
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 