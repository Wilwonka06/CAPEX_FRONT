import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  requireAuth = true, 
  requiredPrivileges = null, 
  redirectTo = '/login',
  fallbackComponent = null 
}) => {
  const { currentUser, loading, hasPrivilege } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }

  // Si no requiere autenticación, renderizar directamente
  if (!requireAuth) {
    return <Outlet />;
  }

  // Verificar si el usuario está autenticado
  if (!currentUser) {
    console.log('ProtectedRoute: usuario no autenticado, redirigiendo a login');
    return <Navigate to={redirectTo} replace />;
  }

  // Si no se requieren privilegios específicos, renderizar
  if (!requiredPrivileges) {
    return <Outlet />;
  }

  // Verificar privilegios específicos
  const { module, action } = requiredPrivileges;
  if (!hasPrivilege(module, action)) {
    console.log('ProtectedRoute: acceso denegado por falta de privilegios');
    
    // Si se proporciona un componente de fallback, usarlo
    if (fallbackComponent) {
      return fallbackComponent;
    }

    // Mostrar página de acceso denegado por defecto
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
          <div className="mb-4">
            <i className="bi bi-shield-exclamation text-6xl text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Acceso denegado</h2>
          <p className="text-gray-700 mb-2">No tienes permisos para acceder a esta sección.</p>
          <p className="text-sm text-gray-500 mb-4">Módulo: {module} | Acción: {action}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Volver al inicio
            </button>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Todo está bien, renderizar el contenido
  return <Outlet />;
};

export default ProtectedRoute; 