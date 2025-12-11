import PropTypes from 'prop-types';
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=eee&color=888&size=256";

const UserDetailModal = ({ onClose, user }) => {
  console.log('UserDetailModal: Rendering with user:', user);
  if (!user) {
    console.warn('UserDetailModal: No user provided, returning null');
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-person text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Detalle del usuario</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div
          className="overflow-y-auto p-6 flex-1 bg-gray-50"
          style={{ maxHeight: "calc(95vh - 120px)" }}
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col justify-center items-center md:w-1/2 w-full">
              <div className="w-40 h-40 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-end mb-4 shadow-sm p-0 overflow-hidden">
                <img
                  src={user.foto || DEFAULT_AVATAR}
                  alt={user.nombre}
                  className="w-full h-full object-cover rounded-lg m-0"
                />
              </div>
              <div className="text-lg font-bold text-gray-800 text-center mb-2">
                {user.nombre}
              </div>
              <div className="text-sm text-gray-500 text-center">
                {user.correo}
              </div>
            </div>
            <div className="flex flex-col gap-4 md:w-1/2 w-full mx-5">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                  Información de contacto
                </span>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <i className="bi bi-envelope text-primary mr-2"></i>
                      <span className="font-medium">Correo:</span>
                      <span className="ml-2">{user.correo}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="bi bi-telephone text-primary mr-2"></i>
                      <span className="font-medium">Teléfono:</span>
                      <span className="ml-2">{user.telefono}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                  Información técnica
                </span>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">
                      Tipo de documento
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {user.tipo_documento}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Documento</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {user.documento}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">
                      Rol
                      {Array.isArray(user?.roles) && user.roles.length > 1
                        ? "es"
                        : ""}
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {(() => {
                        // Primero intentar obtener roles múltiples (relación muchos-a-muchos)
                        if (
                          Array.isArray(user?.roles) &&
                          user.roles.length > 0
                        ) {
                          return (
                            <div className="flex flex-col gap-1">
                              {user.roles.map((rol, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-1 bg-accent-light text-primary rounded text-xs font-medium"
                                >
                                  {typeof rol === "string"
                                    ? rol
                                    : rol?.nombre || "—"}
                                </span>
                              ))}
                            </div>
                          );
                        }
                        // Si no hay roles múltiples, intentar con rol singular
                        if (user?.rol?.nombre) {
                          return (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {user.rol.nombre}
                            </span>
                          );
                        }
                        // Si el rol es un string directo
                        if (typeof user?.rol === "string" && user.rol) {
                          return (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {user.rol}
                            </span>
                          );
                        }
                        // Si hay roles como string
                        if (typeof user?.roles === "string") {
                          return (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {user.roles}
                            </span>
                          );
                        }
                        // Sin rol asignado
                        return (
                          <span className="text-gray-400 italic">
                            Sin rol asignado
                          </span>
                        );
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Estado</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {user.estado}
                    </span>
                  </div>
                  {user.concepto_estado && (
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-xs text-gray-500">
                        Concepto de estado
                      </span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {user.concepto_estado}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"
            onClick={onClose}
          >
            <i className="bi bi-check-circle"></i>Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

UserDetailModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default UserDetailModal;
