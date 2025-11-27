import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import DashboardProfileMenu from './DashboardProfileMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const AdminNavbar = ({ title }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { logout, currentUser: authUser, setActiveRole } = useAuth();
  const profileRef = useRef();

  // Sincronizar con el contexto de autenticación
  useEffect(() => {
    setCurrentUser(authUser);
  }, [authUser]);

  // Cerrar el menú de perfil al hacer clic fuera
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
      {/* Título del módulo */}
      <div className="flex-1">
        {title && (
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-4" ref={profileRef}>
        {/* Selector de rol activo */}
        {currentUser?.roles?.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rol:</span>
            <select
              className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={currentUser.activeRoleId || currentUser.rol?.id_rol}
              onChange={async (e) => {
                const idRol = parseInt(e.target.value, 10);
                await setActiveRole(idRol);
              }}
              title="Seleccionar rol activo"
            >
              {/* Incluir rol directo si no está en lista */}
              {currentUser.rol && !currentUser.roles.some(r => r.id_rol === currentUser.rol.id_rol) && (
                <option value={currentUser.rol.id_rol}>{currentUser.rol.nombre}</option>
              )}
              {currentUser.roles.map(r => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
              ))}
            </select>
            {/* Indicador visual del rol seleccionado */}
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
              <i className="bi bi-shield-lock"></i>
              {(() => {
                const activeId = currentUser.activeRoleId || currentUser.rol?.id_rol;
                const activeName = (currentUser.roles || []).find(r => r.id_rol === activeId)?.nombre || currentUser.rol?.nombre;
                return activeName || '—';
              })()}
            </span>
          </div>
        )}
        {currentUser && (
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={() => setShowProfileMenu(v => !v)}
              title={currentUser.nombre}
            >
              {currentUser.foto || currentUser.avatar ? (
                <img
                  src={currentUser.foto || currentUser.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-text-main to-text-main flex items-center justify-center">
                  <i className="bi bi-person text-yellow-500 text-sm"></i>
                </div>
              )}
              <i className={`bi bi-chevron-${showProfileMenu ? 'up' : 'down'} text-gray-500 transition-transform duration-200`}></i>
            </button>
            {showProfileMenu && (
              <DashboardProfileMenu
                user={currentUser}
                onClose={() => setShowProfileMenu(false)}
                onLogout={logout}
              />
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

AdminNavbar.propTypes = {
  title: PropTypes.string
};

export default AdminNavbar;
