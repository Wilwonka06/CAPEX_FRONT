import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

const RequireAuth = () => {
  const { currentUser, loading, verifyAuth } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    const verify = async () => {
      console.log('🔍 RequireAuth: Verificando autenticación...');
      
      if (!currentUser && !loading) {
        console.log('⚠️ RequireAuth: No hay usuario, verificando con backend...');
        
        try {
          const isValid = await verifyAuth();
          if (!isValid) {
            console.log('❌ RequireAuth: Token inválido');
          }
        } catch (error) {
          console.error('❌ RequireAuth: Error al verificar:', error);
        }
      }
      
      setIsVerifying(false);
    };
    
    verify();
  }, [currentUser, loading, verifyAuth]);
  
  console.log('RequireAuth - Estado:', { 
    currentUser: !!currentUser, 
    loading, 
    isVerifying,
    location: location.pathname 
  });
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading || isVerifying) {
    return <LoadingSpinner />;
  }
  
  if (!currentUser) {
    console.log('❌ RequireAuth: Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log('✅ RequireAuth: Usuario autenticado, renderizando contenido');
  return <Outlet />;
};

export default RequireAuth;