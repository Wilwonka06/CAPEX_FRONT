import React from 'react';
import PropTypes from 'prop-types';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=256';

const UserDetailModal = ({ onClose, user }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Detalle del usuario</h2>
          <button className="text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-8 flex-1">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col justify-center items-center md:w-1/2 w-full">
              <div className="w-40 h-40 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-end mb-4 shadow-sm p-0 overflow-hidden">
                <img
                  src={user.avatar || DEFAULT_AVATAR}
                  alt={user.nombre}
                  className="w-full h-full object-cover rounded-lg m-0"
                />
              </div>
              <div className="text-lg font-bold text-gray-800 text-center mb-2">{user.nombre}</div>
              <div className="text-sm text-gray-500 text-center">{user.correo}</div>
            </div>
            <div className="flex flex-col gap-4 md:w-1/2 w-full mx-5">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de contacto</span>
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
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información técnica</span>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Tipo de documento</span>
                    <span className="font-semibold text-gray-800 text-sm">{user.tipo_documento}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Documento</span>
                    <span className="font-semibold text-gray-800 text-sm">{user.documento}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Rol</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {user?.rol?.nombre
                        ? user.rol.nombre
                        : Array.isArray(user?.roles)
                          ? (
                            <ul className="list-disc list-inside">
                              {user.roles.map((rol, idx) => (
                                <li key={idx}>{typeof rol === 'string' ? rol : rol?.nombre || '—'}</li>
                              ))}
                            </ul>
                          )
                          : (user?.roles || 'Sin rol asignado')}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Estado</span>
                    <span className="font-semibold text-gray-800 text-sm">{user.estado}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-lg flex justify-end px-8 py-4">
          <button className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition" onClick={onClose}>Cerrar</button>
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