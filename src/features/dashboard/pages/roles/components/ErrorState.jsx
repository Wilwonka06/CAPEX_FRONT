import React from 'react';
import PropTypes from 'prop-types';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="text-center py-12">
      <div className="text-red-500 text-6xl mb-4">
        <i className="bi bi-exclamation-triangle"></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar roles</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <i className="bi bi-arrow-clockwise mr-2"></i>
          Reintentar
        </button>
      )}
    </div>
  );
};

ErrorState.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

export default ErrorState;
