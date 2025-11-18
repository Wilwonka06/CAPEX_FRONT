import PropTypes from "prop-types";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=eee&color=888&size=64";

const UserTable = ({
  users,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  loading,
}) => {
  console.log("UserTable users:", users);

  if (loading) {
    return <TableSkeleton columns={6} rows={5} hasAvatar={true} hasActions={true} />;
  }

  if (!loading && (!users || users.length === 0)) {
    return (
      <div className="overflow-x-auto rounded-lg shadow font-inter">
        <div className="py-12 text-center">
          <i className="bi bi-people text-6xl text-gray-300"></i>
          <p className="mt-4 text-gray-500 text-sm">No hay usuarios registrados.</p>
          <p className="text-xs text-gray-400 mt-1">Los usuarios aparecerán aquí cuando se registren.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow font-inter">
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
          {users.map((user) => (
            <tr
              key={user.id_usuario || user.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
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
                {user.rol ? user.rol.nombre : "Sin rol asignado"}
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-semibold rounded-full px-2 py-1
                      ${
                        user.estado === "Activo"
                          ? "bg-green-100 text-green-800"
                          : user.estado === "Inactivo"
                          ? "bg-red-100 text-red-800"
                          : user.estado === "Suspendido"
                          ? "bg-orange-100 text-orange-800"
                          : user.estado === "Vacaciones"
                          ? "bg-blue-100 text-blue-800"
                          : user.estado === "Enfermo"
                          ? "bg-purple-100 text-purple-800"
                          : user.estado === "Incapacitado"
                          ? "bg-gray-100 text-gray-800"
                          : user.estado === "Luto"
                          ? "bg-indigo-100 text-indigo-800"
                          : user.estado === "Fallecido"
                          ? "bg-black text-white"
                          : ""
                      }
                    `}
                  >
                    {user.estado}
                  </span>
                </div>
              </td>

              <td className="py-4 px-4 text-xs font-medium text-right">
                <div className="flex justify-end space-x-2">
                  <button
                    title="Ver"
                    onClick={() => onView(user)}
                    className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                  >
                    <i className="bi bi-eye text-primary text-[18px]"></i>
                  </button>

                  <button
                    title="Editar"
                    onClick={() => onEdit(user)}
                    className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                  >
                    <i className="bi bi-pencil-square text-amber-500 text-[18px]"></i>
                  </button>

                  <button
                    title="Eliminar"
                    onClick={() =>
                      onDelete(user.id_usuario || user.id)
                    }
                    className="h-8 w-8 p-0 rounded-md hover:bg-red-50 flex items-center justify-center"
                  >
                    <i className="bi bi-trash text-red-500 text-[18px]"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
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
  onStatusChange: PropTypes.func,
  loading: PropTypes.bool,
};

export default UserTable;
