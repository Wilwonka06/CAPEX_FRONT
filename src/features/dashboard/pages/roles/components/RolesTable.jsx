import PropTypes from "prop-types";
import ViewRoles from "./ViewRole";
import EditRoles from "./EditRole";
import RoleRow from "./RoleRow";
import TableHeader from "./TableHeader";
import EmptyState from "./EmptyState";
import TableSkeleton from "../../../../../shared/components/TableSkeleton";
import { useState } from "react";

export default function RolesTable({ roles, onEdit, onDelete, onStatusChange, loading = false }) {
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

  const handleSaveEdit = async (updatedRole) => {
    if (onEdit) {
      try {
        await onEdit(updatedRole);
        // Cerrar el modal solo después de que la operación sea exitosa
        setEditOpen(false);
        setSelectedRole(null);
      } catch (error) {
        // El error ya se maneja en el componente padre
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

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <TableSkeleton columns={3} rows={5} hasActions={true} hasAvatar={false} />
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <>
        <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
          <EmptyState message="No hay roles disponibles" />
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

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
        <table className="min-w-full">
          <TableHeader />
          <tbody className="divide-y divide-gray-200">
            {roles.map((role) => (
              <RoleRow
                key={role.id}
                role={role}
                onView={handleViewDetail}
                onEdit={onEdit ? handleEdit : null}
                onDelete={onDelete ? onDelete : null}
                onStatusChange={onStatusChange ? handleStatusChange : null}
              />
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