import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import UserProfileModal from '../../../shared/components/UserProfileModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const AdminNavbar = ({ title }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { logout, currentUser: authUser } = useAuth();

  // Sincronizar con el contexto de autenticación
  useEffect(() => {
    setCurrentUser(authUser);
  }, [authUser]);

  const handleEdit = () => {
    setShowProfileModal(false);
    navigate('/dashboard/perfil');
  };

  // handleLogout ya no es necesario, usamos logout del contexto

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
      {/* Título del módulo */}
      <div className="flex-1">
        {title && (
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">
                {currentUser.nombre} {currentUser.apellido || ''}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser.rol?.nombre || currentUser.role || 'Usuario'}
              </p>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:ring-2 hover:ring-primary focus:outline-none transition-all"
              onClick={() => setShowProfileModal(true)}
              title="Ver perfil"
            >
              {currentUser.foto || currentUser.avatar ? (
                <img src={currentUser.foto || currentUser.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <i className="bi bi-person text-2xl"></i>
              )}
            </button>
          </div>
        )}
      </div>
      {showProfileModal && (
        <UserProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onEdit={handleEdit}
          onLogout={logout}
        />
      )}
    </nav>
  );
};

AdminNavbar.propTypes = {
  title: PropTypes.string
};

export default AdminNavbar;
