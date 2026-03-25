import { createContext, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { apiRequest } from '../config/apiConfig';

const isDev = import.meta.env.DEV;

const defaultContextValue = {
    currentUser: null,
    loading: true,
    login: async () => { },
    logout: () => { },
    logoutConfirmed: async () => { },
    hasPrivilege: () => false,
    getRoleRedirect: () => '/landing',
    checkAuth: async () => null,
    verifyAuth: async () => false,
    setActiveRole: async () => { },
    _isProviderActive: false,
};

const AuthContext = createContext(defaultContextValue);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context || context._isProviderActive === false) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const initialCheckDone = useRef(false);

    // ─── hasPrivilege ────────────────────────────────────────────────────────
    const hasPrivilege = (module, action) => {
        if (!currentUser) return false;

        const roleName = typeof currentUser.rol === 'string'
            ? currentUser.rol
            : currentUser.rol?.nombre || '';
        const rolesList = Array.isArray(currentUser.roles)
            ? currentUser.roles.map(r => (typeof r === 'string' ? r : r?.nombre || ''))
            : [];

        const normalizedRole = roleName.toLowerCase();
        const isAdmin = normalizedRole === 'administrador' || normalizedRole === 'admin'
            || rolesList.some(r => r.toLowerCase() === 'administrador');

        if (isAdmin) return true;

        const privileges = currentUser.privileges || {};

        // Mapeo de acciones en inglés → español (retrocompatibilidad)
        const ACTION_MAP = { Read: 'Visualizar', Create: 'Crear', Edit: 'Editar', Delete: 'Eliminar' };
        const normalizedAction = ACTION_MAP[action] || action;

        const modulePrivileges = privileges[module];
        if (!modulePrivileges) return false;

        return modulePrivileges[normalizedAction] === true || modulePrivileges[action] === true;
    };

    // ─── getRoleRedirect ─────────────────────────────────────────────────────
    const getRoleRedirect = (role, userData) => {
        const roleName = typeof role === 'string' ? role : role?.nombre || '';
        const normalizedRole = roleName.toLowerCase();

        if (normalizedRole === 'cliente' || normalizedRole === 'usuario') return '/landing';

        const user = userData || currentUser;
        if (user?.privileges) {
            const adminModules = [
                'Dashboard', 'Gestión de Usuarios', 'Gestión de Compras', 'Gestión de Servicios',
                'Empleados', 'Programación', 'Productos', 'Compras', 'Proveedores',
                'Categorías de Productos', 'Categorías de Servicios', 'Servicios',
                'Ventas', 'Venta de Productos', 'Pedidos', 'Citas', 'Clientes',
            ];
            const hasAdmin = adminModules.some(m => user.privileges[m]?.Visualizar === true);
            if (hasAdmin) return '/dashboard';
        }

        const redirects = { administrador: '/dashboard', empleado: '/dashboard/citas', cliente: '/landing', usuario: '/landing' };
        return redirects[normalizedRole] || '/landing';
    };

    // ─── verifyAuth ──────────────────────────────────────────────────────────
    const verifyAuth = async () => {
        try {
            const response = await apiRequest.get('/auth/me');
            if (response.success && response.data) {
                setCurrentUser(response.data);
                try { localStorage.setItem('currentUser', JSON.stringify(response.data)); } catch { /* ignorar */ }
                return true;
            }
            throw new Error('Token inválido');
        } catch (error) {
            if (isDev) console.error('❌ Error al verificar autenticación:', error);
            setCurrentUser(null);
            return false;
        }
    };

    // ─── checkAuth ───────────────────────────────────────────────────────────
    const checkAuth = async () => {
        try {
            setLoading(true);
            const response = await apiRequest.get('/auth/me');
            if (response.success && response.data) {
                setCurrentUser(response.data);
                try { localStorage.setItem('currentUser', JSON.stringify(response.data)); } catch { /* ignorar */ }
                setLoading(false);
                setAuthChecked(true);
                return response.data;
            }
            setLoading(false);
            setAuthChecked(true);
            return null;
        } catch {
            setLoading(false);
            setAuthChecked(true);
            return null;
        }
    };

    // ─── login ───────────────────────────────────────────────────────────────
    const login = async (userData, previousPath = null) => {
        setCurrentUser(userData);
        try { localStorage.setItem('currentUser', JSON.stringify(userData)); } catch { /* ignorar */ }
        window.dispatchEvent(new Event('user-auth-changed'));

        const roleName = typeof userData.rol === 'string' ? userData.rol : userData.rol?.nombre || '';
        const normalizedRole = roleName.toLowerCase();

        let redirectPath;
        if ((normalizedRole === 'cliente' || normalizedRole === 'usuario') && previousPath) {
            const isAdminRoute = previousPath.startsWith('/dashboard') || previousPath.startsWith('/admin')
                || previousPath === '/iniciar-sesion' || previousPath === '/registrarse';
            redirectPath = isAdminRoute ? getRoleRedirect(userData.rol, userData) : previousPath;
        } else {
            redirectPath = getRoleRedirect(userData.rol, userData);
        }

        return redirectPath;
    };

    // ─── logout ──────────────────────────────────────────────────────────────
    const logout = () => {
        setCurrentUser(null);
        try { localStorage.removeItem('currentUser'); } catch { /* ignorar */ }
        window.dispatchEvent(new Event('user-auth-changed'));
    };

    const logoutConfirmed = async () => {
        try { await apiRequest.post('/auth/logout'); } catch { /* ignorar */ }
        logout();
    };

    // ─── setActiveRole ───────────────────────────────────────────────────────
    const setActiveRole = async (idRol) => {
        try {
            const response = await apiRequest.put('/auth/active-role', { idRol });
            if (response.success && response.data) {
                try { localStorage.setItem('currentUser', JSON.stringify(response.data)); } catch { /* ignorar */ }
                setCurrentUser(response.data);
                window.dispatchEvent(new Event('user-auth-changed'));
                return true;
            }
            return false;
        } catch (error) {
            if (isDev) console.error('❌ Error al cambiar rol activo:', error);
            return false;
        }
    };

    // ─── init ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (initialCheckDone.current) return;
        initialCheckDone.current = true;

        if (currentUser) {
            setLoading(false);
            setAuthChecked(true);
            verifyAuth().catch(() => {
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
            });
        } else {
            setLoading(false);
            setAuthChecked(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const value = {
        currentUser, loading, authChecked,
        login, logout, logoutConfirmed,
        hasPrivilege, getRoleRedirect,
        checkAuth, verifyAuth, setActiveRole,
        _isProviderActive: true,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = { children: PropTypes.node };
