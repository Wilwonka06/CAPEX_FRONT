import React from 'react';
import PropTypes from 'prop-types';

const EmptyState = ({ message = "No se encontraron roles", showCreateButton = false, onCreateClick }) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">
        <i className="bi bi-shield-check"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin roles</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {showCreateButton && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i className="bi bi-plus-circle mr-2"></i>
          Crear primer rol
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string,
  showCreateButton: PropTypes.bool,
  onCreateClick: PropTypes.func,
};

export default EmptyState;
