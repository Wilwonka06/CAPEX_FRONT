import { useState } from "react";
import PropTypes from "prop-types";
import RoleDetail from "./RoleDetail";
import EditRole from "./EditRole";
import TruncatedText from "../../../../../shared/components/TruncatedText";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";
import toast from 'react-hot-toast';

/**
 * Tabla de roles - Componente completo y autocontenido
 * Patrón: ProductsTable / CategoryTable
 */
const RolesTable = ({ roles, onEdit, onDelete, onStatusChange, loading = false }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Roles del sistema que no se pueden eliminar
  const systemRoles = ['Administrador', 'Empleado', 'Cliente'];

  const isSystemRole = (roleName) => {
    return systemRoles.some(systemRole => 
      roleName.toLowerCase() === systemRole.toLowerCase()
    );
  };

  const handleViewDetail = (role) => {
    setSelectedRole(role);
    setDetailOpen(true);
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setEditOpen(true);
  };

  const handleSaveEdit = async (updatedRole) => {
    if (onEdit) {
      try {
        await onEdit(updatedRole);
        setEditOpen(false);
        setSelectedRole(null);
      } catch (error) {
        console.error('Error al editar rol:', error);
      }
    }
  };

  const handleStatusChange = async (roleId, currentStatus) => {
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    if (onStatusChange) {
      await onStatusChange(roleId, newStatus);
    }
  };

  const handleDelete = (roleId, roleName) => {
    if (isSystemRole(roleName)) {
      toast(`No se puede eliminar el rol "${roleName}" porque es un rol del sistema.`, {
        duration: 4000,
      });
      return;
    }
    if (onDelete) {
      onDelete(roleId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <TableSkeleton columns={4} rows={5} hasActions={true} hasAvatar={false} />
      </div>
    );
  }

  // Empty state
  if (!roles || roles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <div className="py-12 text-center">
          <i className="bi bi-shield-lock text-6xl text-gray-300"></i>
          <p className="mt-4 text-gray-500 text-sm">No hay roles registrados.</p>
          <p className="text-xs text-gray-400 mt-1">Los roles aparecerán aquí cuando se registren.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-50 hover:bg-gray-100">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Nombre
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Descripción
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Estado
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.map((role) => {
              const roleName = role.name || role.nombre || '';
              const isProtected = isSystemRole(roleName);
              
              return (
                <tr key={role.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-4 px-4 text-xs font-medium text-gray-900">
                    <TruncatedText
                      text={roleName}
                      maxLength={25}
                      maxWidth="max-w-[180px]"
                    />
                  </td>
                  
                  <td className="py-4 px-4 text-xs text-gray-600">
                    <TruncatedText
                      text={role.description || role.descripcion || ''}
                      maxLength={40}
                      maxWidth="max-w-[250px]"
                    />
                  </td>
                  
                  <td className="py-4 px-4 text-xs">
                    <div className="flex items-center space-x-3">
                      {onStatusChange && (
                        <button
                          onClick={() => handleStatusChange(role.id, role.estado)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            role.estado === 'Activo' ? 'bg-text-main' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              role.estado === 'Activo' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                      <span className={`text-xs font-semibold rounded-full px-2 py-1 ${
                        role.estado === 'Activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role.estado}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 text-xs font-medium text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                        onClick={() => handleViewDetail(role)}
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye text-primary text-[18px]"></i>
                      </button>
                      
                      {onEdit && (
                        <button
                          className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center"
                          onClick={() => handleEdit(role)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil-square text-amber-500 text-[18px]"></i>
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          className={`h-8 w-8 p-0 rounded-md flex items-center justify-center transition-colors ${
                            isProtected 
                              ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                              : 'hover:bg-red-50'
                          }`}
                          onClick={() => handleDelete(role.id, roleName)}
                          title={isProtected ? `No se puede eliminar "${roleName}" (rol del sistema)` : "Eliminar"}
                          disabled={isProtected}
                        >
                          <i className={`bi bi-trash text-[18px] ${
                            isProtected ? 'text-gray-400' : 'text-red-500'
                          }`}></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      <RoleDetail
        role={selectedRole}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRole(null);
        }}
      />

      {/* Modal de Edición */}
      <EditRole
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
};

RolesTable.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      nombre: PropTypes.string,
      description: PropTypes.string,
      descripcion: PropTypes.string,
      estado: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  loading: PropTypes.bool,
};

export default RolesTable;