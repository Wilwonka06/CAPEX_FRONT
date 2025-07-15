import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

const RequireAuth = () => {
  const { currentUser, loading } = useAuth();
  
  console.log("RequireAuth montado");
  console.log('RequireAuth: usuario:', currentUser);
  console.log('RequireAuth: loading:', loading);
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!currentUser) {
    console.log('RequireAuth: redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('RequireAuth: usuario autenticado, renderizando Outlet');
  return <Outlet />;
};

export default RequireAuth; 