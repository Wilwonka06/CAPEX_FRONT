import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

/**
 * Componente que verifica si el usuario tiene acceso administrativo
 * Si no tiene acceso, redirige según su rol
 */
const RequireAdminAccess = ({ children }) => {
  const { currentUser, loading, getRoleRedirect } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }

  // Si no hay usuario, redirigir a login (esto no debería pasar si está dentro de RequireAuth)
  if (!currentUser) {
    console.log('❌ RequireAdminAccess: Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  // Obtener nombre del rol
  const roleName = typeof currentUser.rol === 'string'
    ? currentUser.rol
    : currentUser.rol?.nombre || '';
  
  const normalizedRole = roleName.toLowerCase();

  // ⚠️ REGLA PRINCIPAL: Clientes y usuarios NUNCA deben acceder al dashboard
  // Incluso si tienen algunos privilegios, deben ser redirigidos
  if (normalizedRole === 'cliente' || normalizedRole === 'usuario') {
    console.log('❌ RequireAdminAccess: Cliente/Usuario intentando acceder al dashboard, redirigiendo a /landing');
    return <Navigate to="/landing" replace />;
  }

  // Verificar si tiene permisos administrativos (solo para otros roles)
  let hasAdministrativeAccess = false;
  
  if (currentUser.privileges) {
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
    
    hasAdministrativeAccess = administrativeModules.some(module => {
      const modulePrivileges = currentUser.privileges[module];
      return modulePrivileges && (
        modulePrivileges.Visualizar === true || 
        modulePrivileges['Visualizar'] === true ||
        modulePrivileges.Read === true
      );
    });
  }

  // Si es administrador o empleado, permitir acceso
  const isAdmin = normalizedRole === 'administrador' || normalizedRole === 'admin';
  const isEmployee = normalizedRole === 'empleado';

  // Si no tiene permisos administrativos y no es admin/empleado, denegar acceso
  if (!hasAdministrativeAccess && !isAdmin && !isEmployee) {
    console.log('❌ RequireAdminAccess: Usuario sin permisos administrativos, redirigiendo');
    const redirectPath = getRoleRedirect(currentUser.rol, currentUser);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('✅ RequireAdminAccess: Usuario tiene acceso administrativo');
  return children;
};

export default RequireAdminAccess;

