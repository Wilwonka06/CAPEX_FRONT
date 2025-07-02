import React from "react";

const ChangeServiceStatus = ({ status = 'En ejecucion', onToggle }) => {
  const isActive = status.toLowerCase() === 'en ejecucion';
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 focus:outline-none px-2 py-1 rounded-full transition-colors duration-200 ${isActive ? 'bg-yellow-50' : 'bg-green-50'}`}
      title={isActive ? 'Marcar como Pagada' : 'Marcar como En ejecución'}
      aria-pressed={isActive}
    >
      <div
        className={`relative inline-block w-10 h-6 rounded-full transition-colors duration-200 ${isActive ? 'bg-primary' : 'bg-green-400'}`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isActive ? 'translate-x-4' : ''}`}
        ></div>
      </div>
      <span className="text-base font-medium text-text-main select-none">
        {isActive ? 'En ejecución' : 'Pagada'}
      </span>
    </button>
  );
};

export default ChangeServiceStatus; 