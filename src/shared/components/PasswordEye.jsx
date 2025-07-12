import React from 'react';
import PropTypes from 'prop-types';

const PasswordEye = ({ visible, onToggle }) => (
  <button
    type="button"
    tabIndex={-1}
    className="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-primary focus:outline-none h-full"
    onClick={onToggle}
    aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    style={{ top: 0, bottom: 0 }}
  >
    <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`}></i>
  </button>
);

PasswordEye.propTypes = {
  visible: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default PasswordEye; 