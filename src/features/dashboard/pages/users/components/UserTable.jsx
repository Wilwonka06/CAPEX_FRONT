import React from 'react';
import PropTypes from 'prop-types';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=64';

const UserTable = ({ users, onView, onEdit, onDelete }) => {
  console.log('UserTable users:', users);

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-xs text-gray-600 uppercase">
            <th className="py-3 px-4 text-left">Foto</th>
            <th className="py-3 px-4 text-left">Nombre</th>
            <th className="py-3 px-4 text-left">Correo</th>
            <th className="py-3 px-4 text-left">Rol</th>
            <th className="py-3 px-4 text-left">Estado</th>
            <th className="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-8 text-gray-400">No hay usuarios</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  <img
                    src={user.avatarCompressed || DEFAULT_AVATAR}
                    alt={user.nombre}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </td>
                <td className="py-2 px-4">{user.nombre}</td>
                <td className="py-2 px-4">{user.correo}</td>
                <td className="py-2 px-4">
                  {Array.isArray(user.roles)
                    ? user.roles.join(', ')
                    : user.roles}
                </td>
                <td className="py-2 px-4">{user.estado}</td>
                <td className="py-2 px-4 text-center flex gap-2 justify-center">
                  <button title="Ver" onClick={() => onView(user)} className="text-primary hover:text-primary-dark">
                    <i className="bi bi-eye"></i>
                  </button>
                  <button title="Editar" onClick={() => onEdit(user)} className="text-yellow-600 hover:text-yellow-800">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button title="Eliminar" onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-800">
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