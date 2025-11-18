import React from 'react';
import PropTypes from 'prop-types';

const StatusToggle = ({ role, onStatusChange }) => {
  const handleToggle = async () => {
    if (onStatusChange) {
      await onStatusChange(role.id, role.estado);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
          role.estado === 'Activo' ? 'bg-text-main' : 'bg-gray-300'
        }`}
        title={`Cambiar a ${role.estado === 'Activo' ? 'Inactivo' : 'Activo'}`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            role.estado === 'Activo' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-xs font-medium text-gray-700">
        {role.estado}
      </span>
    </div>
  );
};

StatusToggle.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    estado: PropTypes.string.isRequired,
  }).isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default StatusToggle;
