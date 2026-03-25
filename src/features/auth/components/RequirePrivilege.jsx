import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

const isDev = import.meta.env.DEV;

const RequirePrivilege = ({ module, action, children }) => {
    const { currentUser, loading, hasPrivilege, getRoleRedirect } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    const hasRequiredPrivilege = hasPrivilege(module, action);

    if (isDev && !hasRequiredPrivilege) {
        console.warn(`[RequirePrivilege] Acceso denegado: ${module} → ${action}`);
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
                    {isDev && (
                        <div className="text-xs text-gray-400 mb-4 text-left bg-gray-50 p-2 rounded">
                            <p>Usuario: {currentUser.nombre || 'N/A'}</p>
                            <p>Rol: {typeof currentUser.rol === 'string'
                                ? currentUser.rol
                                : (currentUser.rol?.nombre || 'N/A')}</p>
                            <p>Privilegios: {JSON.stringify(currentUser.privileges, null, 2)}</p>
                        </div>
                    )}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.href = getRoleRedirect(currentUser.rol)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                            Volver al inicio
                        </button>
                        <button
                            onClick={() => window.location.href = '/iniciar-sesion'}
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
