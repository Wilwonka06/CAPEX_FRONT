import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const DashboardProfileMenu = ({ user, onClose, onLogout }) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    onClose();
    navigate('/dashboard/perfil');
  };

  const handleGoToLanding = () => {
    onClose();
    navigate('/landing');
  };

  return (
    <div className="absolute right-0 top-1 mt-8 w-72 z-50">
      {/* Flecha arriba */}
      <div className="flex justify-end pr-6">
        <div className="w-4 h-4 bg-white rotate-45 -mb-2 shadow-lg border-l border-t border-gray-200"></div>
      </div>
      <div className="bg-white rounded-xl shadow-xl p-6 relative border border-gray-100">
        <button
          className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-600 transition-colors duration-200"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          ×
        </button>

        {/* Información del usuario */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-3 overflow-hidden ring-4 ring-gray-50">
            {user?.foto || user?.avatar ? (
              <img src={user.foto || user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">{user?.nombre}</div>
            <div className="text-sm text-gray-500">{user?.correo}</div>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Opciones del menú */}
        <div className="space-y-1 mb-4">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-all duration-200 group"
            onClick={handleGoToProfile}
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Mi perfil</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-all duration-200 group"
            onClick={handleGoToLanding}
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Ir al landing</span>
          </button>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Botón de cerrar sesión */}
        <div className="flex justify-end">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            onClick={onLogout}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

DashboardProfileMenu.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default DashboardProfileMenu;