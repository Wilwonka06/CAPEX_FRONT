import React from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const ActionButtons = ({ role, onView, onEdit, onDelete }) => {
  // Roles del sistema que no se pueden eliminar
  const systemRoles = ['Administrador', 'Empleado', 'Cliente'];
  const roleName = role.name || role.nombre || '';
  const isSystemRole = systemRoles.some(systemRole => 
    roleName.toLowerCase() === systemRole.toLowerCase()
  );

  const handleDelete = () => {
    if (!onDelete) return;
    
    if (isSystemRole) {
      // Mostrar mensaje explicativo con toast
      toast(`No se puede eliminar el rol "${roleName}" porque es un rol del sistema.`, {
        duration: 4000,
      });
      return;
    }
    onDelete(role.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(role);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(role);
    }
  };

  return (
    <div className="flex justify-end space-x-2">
      <button
        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
        onClick={handleView}
        title="Ver detalles"
      >
        <i className="bi bi-eye text-primary text-[18px]"></i>
      </button>
      
      {onEdit && (
        <button
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
          onClick={handleEdit}
          title="Editar"
        >
          <i className="bi bi-pencil-square text-amber-500 text-[18px]"></i>
        </button>
      )}
      
      {onDelete && (
        <button
          className={`h-8 w-8 p-0 rounded-md flex items-center justify-center transition-colors ${
            isSystemRole 
              ? 'bg-gray-100 cursor-not-allowed opacity-50' 
              : 'hover:bg-red-50'
          }`}
          onClick={handleDelete}
          title={isSystemRole ? `No se puede eliminar el rol "${roleName}" (rol del sistema)` : "Eliminar"}
          disabled={isSystemRole}
        >
          <i className={`bi bi-trash text-[18px] ${
            isSystemRole ? 'text-gray-400' : 'text-red-500'
          }`}></i>
        </button>
      )}
    </div>
  );
};

ActionButtons.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    nombre: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ActionButtons;
