import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

const RequireAuth = () => {
  const { currentUser, loading, authChecked } = useAuth();
  const location = useLocation();

  console.log('RequireAuth - Estado:', {
    currentUser: !!currentUser,
    loading,
    authChecked,
    location: location.pathname
  });

  // Mostrar loading mientras se verifica la autenticación
  if (loading || !authChecked) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    console.log('❌ RequireAuth: Usuario no autenticado, redirigiendo a login');
    // No redirigir si ya estamos en login
    if (location.pathname === '/login') {
      return null; // O un componente vacío
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ RequireAuth: Usuario autenticado, renderizando contenido');
  return <Outlet />;
};

export default RequireAuth;