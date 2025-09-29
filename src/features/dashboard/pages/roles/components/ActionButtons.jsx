import React from 'react';
import PropTypes from 'prop-types';

const ActionButtons = ({ role, onView, onEdit, onDelete }) => {
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
        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
        onClick={() => onDelete(role.id)}
        title="Eliminar"
      >
        <i className="bi bi-trash text-red-500 text-lg"></i>
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
