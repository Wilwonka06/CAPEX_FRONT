import React from 'react';
import PropTypes from 'prop-types';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=64';

const UserTable = ({ users, onView, onEdit, onDelete }) => {
  console.log('UserTable users:', users);

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
              <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-2 px-3">
                  <img
                    src={user.avatarCompressed || DEFAULT_AVATAR}
                    alt={user.nombre}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </td>
                <td className="py-2 px-3">{user.nombre}</td>
                <td className="py-2 px-3">{user.correo}</td>
                <td className="py-2 px-3">
                  {Array.isArray(user.roles)
                    ? user.roles.join(', ')
                    : user.roles}
                </td>
                <td className="py-2 px-3">
                  <span className={`text-xs font-semibold rounded-full px-2 py-1
                    ${user.estado === 'Activo' ? 'text-green-800' : ''}
                    ${user.estado === 'Inactivo' ? 'text-red-800' : ''}
                    ${user.estado === 'Pendiente' ? 'text-blue-800' : ''}
                    ${user.estado === 'Verificado' ? 'text-yellow-7 00' : ''}
                  `}>{user.estado}</span>
                </td>
                <td className="py-2 px-3 text-center flex gap-2 justify-center">
                  <button title="Ver" onClick={() => onView(user)} className="text-primary hover:text-primary-dark text-lg">
                    <i className="bi bi-eye"></i>
                  </button>
                  <button title="Editar" onClick={() => onEdit(user)} className="text-yellow-600 hover:text-yellow-800 text-lg">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button title="Eliminar" onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-800 text-lg">
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
};

export default UserTable; 