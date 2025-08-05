import PropTypes from "prop-types";
import ViewRoles from "./ViewRole";
import EditRoles from "./EditRole";
import { useState } from "react";
import TruncatedText from "../../../../../shared/components/TruncatedText";

export default function RolesTable({ roles, onEdit, onDelete }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleViewDetail = (role) => {
    setSelectedRole(role);
    setDetailOpen(true);
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setEditOpen(true);
  };

  const handleSaveEdit = (updatedRole) => {
    if (onEdit) {
      onEdit(updatedRole);
    }
    setEditOpen(false);
    setSelectedRole(null);
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 hover:bg-gray-100 ">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                NOMBRE
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                DESCRIPCIÓN
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ESTADO
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-4 px-4 text-xs font-medium text-gray-900">
                  <TruncatedText
                    text={role.name ?? role.nombre ?? ''}
                    maxLength={25}
                    maxWidth="max-w-[180px]"
                  />
                </td>
                <td className="py-4 px-4 text-xs text-gray-600">
                  <TruncatedText
                    text={role.description ?? role.descripcion ?? ''}
                    maxLength={40}
                    maxWidth="max-w-[250px]"
                  />
                </td>
                <td className="py-4 px-4 text-xs">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.estado === 'Activo' ? 'text-green-800' : 'text-red-800'}`}>{role.estado}</span>
                </td>
                <td className="py-4 px-4 text-xs font-medium text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleViewDetail(role)}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye text-primary text-lg"></i>
                    </button>
                    <button
                      className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => handleEdit(role)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square text-amber-500 text-lg"></i>
                    </button>
                    <button
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => onDelete(role.id)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash text-red-500 text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      <ViewRoles
        role={selectedRole}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRole(null);
        }}
      />

      {/* Modal de Edición */}
      <EditRoles
        role={selectedRole}
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedRole(null);
        }}
        onEdit={handleSaveEdit}
        roles={roles}
      />
    </>
  );
}

RolesTable.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      estado: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
}; 