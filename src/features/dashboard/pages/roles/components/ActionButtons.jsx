import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const ActionButtons = ({ role, onView, onEdit, onDelete }) => {
  // Roles del sistema que no se pueden eliminar
  const systemRoles = ['Administrador', 'Empleado', 'Cliente'];
  const roleName = role.name || role.nombre || '';
  const isSystemRole = systemRoles.some(systemRole => 
    roleName.toLowerCase() === systemRole.toLowerCase()
  );

  const handleDelete = () => {
    if (isSystemRole) {
      // Mostrar mensaje explicativo con toast
      toast.warning(`No se puede eliminar el rol "${roleName}" porque es un rol del sistema.`, {
        position: 'top-right',
        autoClose: 4000,
      });
      return;
    }
    onDelete(role.id);
  };

  return (
    <div className="flex justify-end space-x-2">
      <button
        className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors"
        onClick={() => onView(role)}
        title="Ver detalles"
      >
        <i className="bi bi-eye text-primary text-lg"></i>
      </button>
      
      <button
        className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors"
        onClick={() => onEdit(role)}
        title="Editar"
      >
        <i className="bi bi-pencil-square text-amber-500 text-lg"></i>
      </button>
      
      <button
        className={`h-8 w-8 p-0 rounded-md flex items-center justify-center transition-colors ${
          isSystemRole 
            ? 'bg-gray-100 cursor-not-allowed opacity-50' 
            : 'hover:bg-red-50 hover:border-red-300'
        }`}
        onClick={handleDelete}
        title={isSystemRole ? `No se puede eliminar el rol "${roleName}" (rol del sistema)` : "Eliminar"}
        disabled={isSystemRole}
      >
        <i className={`bi bi-trash text-lg ${
          isSystemRole ? 'text-gray-400' : 'text-red-500'
        }`}></i>
      </button>
    </div>
  );
};

ActionButtons.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ActionButtons;
