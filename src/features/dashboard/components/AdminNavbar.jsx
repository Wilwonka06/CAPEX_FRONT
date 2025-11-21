import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import DashboardProfileMenu from './DashboardProfileMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const AdminNavbar = ({ title }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { logout, currentUser: authUser } = useAuth();
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                  <i className="bi bi-person text-white text-sm"></i>
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
