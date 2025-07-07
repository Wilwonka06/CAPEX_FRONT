import React, { useState } from "react";

const ChangeServiceStatus = ({ status, onToggle }) => {
  const [isChanging, setIsChanging] = useState(false);

  const handleToggle = async () => {
    if (isChanging) return;
    
    setIsChanging(true);
    try {
      await onToggle();
    } finally {
      setIsChanging(false);
    }
  };

  const isActive = status.toLowerCase() === "pagado";

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggle}
        disabled={isChanging}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isActive ? 'bg-primary' : 'bg-gray-300'
        } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        {isChanging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="bi bi-arrow-clockwise animate-spin text-white text-xs"></i>
          </div>
        )}
      </button>
      <span className="text-sm text-text-main">
        {isChanging ? (
          <i className="bi bi-arrow-clockwise animate-spin mr-1"></i>
        ) : null}
        {status}
      </span>
    </div>
  );
};

export default ChangeServiceStatus; 