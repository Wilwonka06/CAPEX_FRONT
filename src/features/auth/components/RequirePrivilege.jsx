import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

const RequirePrivilege = ({ module, action, children }) => {
    const { currentUser, loading, hasPrivilege, getRoleRedirect } = useAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        console.log('Cargando autenticación...');
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        console.log('Usuario no autenticado, redirigiendo a login');
        return <Navigate to="/login" replace />;
    }
    
    // Verificar privilegios usando la función del contexto
    console.log(`Verificando privilegios para módulo: ${module}, acción: ${action}`);
    console.log('Usuario actual:', {
      nombre: currentUser.nombre,
      rol: currentUser.rol,
      privileges: currentUser.privileges
    });

    const hasRequiredPrivilege = hasPrivilege(module, action);
    console.log(`¿Tiene privilegio?: ${hasRequiredPrivilege}`);

    if (!hasRequiredPrivilege) {
      console.log(`Acceso denegado: ${module} -> ${action}`);
      console.log('Detalles del privilegio faltante:', {
        module,
        action,
        userPrivileges: currentUser.privileges
      });
    }

    if (!hasRequiredPrivilege) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
                    <div className="mb-4">
                        <i className="bi bi-shield-exclamation text-6xl text-red-500"></i>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Acceso denegado</h2>
                    <p className="text-gray-700 mb-2">No tienes permisos para acceder a esta sección.</p>
                    <p className="text-sm text-gray-500 mb-4">Módulo: {module} | Acción: {action}</p>
                    <div className="text-xs text-gray-400 mb-4">
                        <p>Usuario: {currentUser.nombre}</p>
                        <p>Rol: {currentUser.rol}</p>
                        <p>Privilegios disponibles: {JSON.stringify(currentUser.privileges, null, 2)}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => window.location.href = getRoleRedirect(currentUser.rol)} 
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
    
    return children;
};

export default RequirePrivilege; 