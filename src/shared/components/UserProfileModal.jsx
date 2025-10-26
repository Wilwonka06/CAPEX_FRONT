import PropTypes from 'prop-types';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=256';

const UserProfileModal = ({ user, onClose, onEdit, onLogout }) => {
  if (!user) return null;

  // Función segura para obtener el rol del usuario
  const getUserRole = (user) => {
    if (!user) return '';
    if (typeof user.rol === 'string') return user.rol;
    if (user.rol && typeof user.rol === 'object' && user.rol.nombre) return user.rol.nombre;
    return '';
  };

  const userRole = getUserRole(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 select-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative animate-fade-in max-h-[90vh] flex flex-col mt-5">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 rounded-t-2xl flex items-center justify-between px-8 py-5">
          <h2 className="text-2xl font-bold text-primary m-0">Mi perfil</h2>
          <button className="text-gray-400 hover:text-primary text-2xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto p-8 flex-1">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-gray-100 border-4 border-primary/10 rounded-full flex items-center justify-center mb-2 shadow-sm overflow-hidden">
              <img
                src={user.foto || user.avatar || DEFAULT_AVATAR}
                alt={user.nombre}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-xl font-bold text-text-main text-center mb-1">{user.nombre} {user.apellido}</div>
            <div className="text-gray-500 text-center text-sm mb-2">{user.correo}</div>
            <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Teléfono:</span>
                <span className="font-medium text-gray-800">{user.telefono || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tipo de documento:</span>
                <span className="font-medium text-gray-800">{user.tipoDocumento || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Documento:</span>
                <span className="font-medium text-gray-800">{user.documento || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dirección:</span>
                <span className="font-medium text-gray-800">{user.direccion || '-'}</span>
              </div>
              <div className="flex justify-between text-sm items-start">
                <span className="text-gray-500">Rol(es):</span>
                <span className="font-medium text-gray-800">
                  {userRole || '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estado:</span>
                <span className={`font-semibold text-xs px-2 py-1 rounded ${user.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.estado}</span>
              </div>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-text-main text-white rounded-lg shadow hover:bg-primary-dark transition font-semibold"
              onClick={onEdit}
            >
              Editar perfil
            </button>
            {typeof onLogout === 'function' && (
              <button
                className="mt-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition font-semibold"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

UserProfileModal.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onLogout: PropTypes.func,
};

export default UserProfileModal; 