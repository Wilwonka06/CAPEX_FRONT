import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

const RequireAuth = () => {
  const { currentUser, loading, authChecked } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  // Solo si NO hemos verificado y está cargando
  if (!authChecked && loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;