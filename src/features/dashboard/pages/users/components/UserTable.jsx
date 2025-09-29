import React from 'react';
import PropTypes from 'prop-types';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=64';

const UserTable = ({ users, onView, onEdit, onDelete, loading }) => {
  console.log('UserTable users:', users);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-main"></div>
        <span className="ml-2 text-gray-600">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Foto</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Nombre</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Correo</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Rol</th>
            <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado</th>
            <th className="py-2 px-3 text-center font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-8 text-gray-400">No hay usuarios</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.id_usuario || user.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-2 px-3">
                  <img
                    src={user.foto || user.avatarCompressed || DEFAULT_AVATAR}
                    alt={user.nombre}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </td>
                <td className="py-2 px-3">{user.nombre}</td>
                <td className="py-2 px-3">{user.correo}</td>
                <td className="py-2 px-3">
                  {user.rol ? user.rol.nombre : 'Sin rol asignado'}
                </td>
                <td className="py-2 px-3">
                  <span className={`text-xs font-semibold rounded-full px-2 py-1
                    ${user.estado === 'Activo' ? 'bg-green-100 text-green-800' : ''}
                    ${user.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : ''}
                    ${user.estado === 'Suspendido' ? 'bg-orange-100 text-orange-800' : ''}
                    ${user.estado === 'Vacaciones' ? 'bg-blue-100 text-blue-800' : ''}
                    ${user.estado === 'Enfermo' ? 'bg-purple-100 text-purple-800' : ''}
                    ${user.estado === 'Incapacitado' ? 'bg-gray-100 text-gray-800' : ''}
                    ${user.estado === 'Luto' ? 'bg-indigo-100 text-indigo-800' : ''}
                    ${user.estado === 'Fallecido' ? 'bg-black text-white' : ''}
                  `}>{user.estado}</span>
                </td>
                <td className="py-2 px-3 text-center flex gap-2 justify-center">
                  <button title="Ver" onClick={() => onView(user)} className="text-primary hover:text-primary-dark text-lg">
                    <i className="bi bi-eye"></i>
                  </button>
                  <button title="Editar" onClick={() => onEdit(user)} className="text-yellow-600 hover:text-yellow-800 text-lg">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button title="Eliminar" onClick={() => onDelete(user.id_usuario || user.id)} className="text-red-600 hover:text-red-800 text-lg">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default UserTable; 