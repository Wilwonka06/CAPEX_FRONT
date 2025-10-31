import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import UserProfileModal from '../../../shared/components/UserProfileModal';

const ProfileMenu = ({ user, onClose, onLogout, showOrdersOption }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Función segura para obtener el rol del usuario
  const getUserRole = (user) => {
    if (!user) return '';
    if (typeof user.rol === 'string') return user.rol;
    if (user.rol && typeof user.rol === 'object' && user.rol.nombre) return user.rol.nombre;
    return '';
  };

  const userRole = getUserRole(user);
  const isClient = userRole.toLowerCase() === 'cliente' || userRole.toLowerCase() === 'usuario';
  const navigate = useNavigate();

  const handleGoToOrders = () => {
    setShowProfileModal(false);
    onClose();
    navigate('/landing/mis-pedidos');
  };

  return (
    <>
      <div className="absolute right-0 top-1 mt-8 w-72 z-50">
        {/* Flecha arriba */}
        <div className="flex justify-end pr-6">
          <div className="w-4 h-4 bg-white rotate-45 -mb-2 shadow-lg"></div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <button
            className="absolute top-3 right-3 text-xl text-gray-400 hover:text-primary-dark"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mb-2 overflow-hidden">
              {user?.foto || user?.avatar ? (
                <img src={user.foto || user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <i className="bi bi-person text-3xl text-gray-500"></i>
              )}
            </div>
            <div className="text-lg font-semibold text-text-main text-center">{user?.nombre} {user?.apellido}</div>
            <div className="text-gray-500 text-center text-sm mb-2">{user?.correo}</div>
          </div>
          <hr className="my-3" />
          <div className="flex flex-col gap-2 mb-4">
            <button className="text-left text-primary hover:underline px-2 py-1 rounded transition" onClick={() => { onClose(); navigate('/perfil'); }}>Mi perfil</button>
            {showOrdersOption && (
              <button className="text-left text-primary hover:underline px-2 py-1 rounded transition" onClick={handleGoToOrders}>Mis pedidos</button>
            )}
          </div>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition font-semibold"
              onClick={onLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onGoToPurchases={isClient ? handleGoToOrders : undefined}
          onLogout={onLogout}
        />
      )}
    </>
  );
};

ProfileMenu.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  showOrdersOption: PropTypes.bool,
};

export default ProfileMenu; 