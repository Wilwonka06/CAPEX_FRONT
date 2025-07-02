import React from "react";

const ChangeRoleStatus = ({ status = 'Activo', onToggle }) => {
  const isActive = status === 'Activo';
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 focus:outline-none px-2 py-1 rounded-full transition-colors duration-200 ${isActive ? 'bg-green-50' : 'bg-red-50'}`}
      title={isActive ? 'Desactivar rol' : 'Activar rol'}
      aria-pressed={isActive}
    >
      <div
        className={`relative inline-block w-10 h-6 rounded-full transition-colors duration-200 ${isActive ? 'bg-primary' : 'bg-gray-300'}`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isActive ? 'translate-x-4' : ''}`}
        ></div>
      </div>
      <span className="text-base font-medium text-text-main select-none">
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    </button>
  );
};

export default ChangeRoleStatus; 