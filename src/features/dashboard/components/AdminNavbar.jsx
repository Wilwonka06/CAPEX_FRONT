import React, { useState } from 'react';
import UserProfileModal from '../../../shared/components/UserProfileModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const AdminNavbar = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleEdit = () => {
    setShowProfileModal(false);
    navigate('/dashboard/perfil');
  };

  // handleLogout ya no es necesario, usamos logout del contexto

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-end">
      <div className="flex items-center gap-4">
        {currentUser && (
          <button
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:ring-2 hover:ring-primary focus:outline-none"
            onClick={() => setShowProfileModal(true)}
            title={currentUser.nombre + ' ' + (currentUser.apellido || '')}
          >
            {currentUser.foto || currentUser.avatar ? (
              <img src={currentUser.foto || currentUser.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <i className="bi bi-person text-2xl"></i>
            )}
          </button>
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

export default AdminNavbar; 