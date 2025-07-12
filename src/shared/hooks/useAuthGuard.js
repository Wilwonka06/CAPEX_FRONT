import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAuthGuard = (requiredPrivileges = null) => {
  const { currentUser, loading, hasPrivilege } = useAuth();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!loading && !currentUser) {
      window.location.href = '/login';
      return;
    }

    // Verificar privilegios si se especifican
    if (requiredPrivileges && currentUser) {
      const { module, action } = requiredPrivileges;
      if (!hasPrivilege(module, action)) {
        // Redirigir a la página de acceso denegado o al inicio
        const redirectPath = currentUser.rol?.toLowerCase() === 'administrador' ? '/dashboard' : '/landing';
        window.location.href = redirectPath;
      }
    }
  }, [currentUser, loading, requiredPrivileges, hasPrivilege]);

  return {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    hasRequiredPrivileges: requiredPrivileges ? hasPrivilege(requiredPrivileges.module, requiredPrivileges.action) : true
  };
}; 