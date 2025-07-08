import { useState } from "react";

const ChangeRoleStatus = ({ status = 'Activo', onToggle }) => {
  const [isChanging, setIsChanging] = useState(false);
  const isActive = status === 'Activo';

  const handleToggle = async () => {
    setIsChanging(true);
    try {
      if (onToggle) await onToggle();
    } catch (error) {
      console.error("Error al cambiar el estado del rol:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggle}
        disabled={isChanging}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isActive ? 'bg-text-main' : 'bg-gray-300'
        } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        {isChanging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </button>
      <span className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>{isActive ? 'Activo' : 'Inactivo'}</span>
    </div>
  );
};

export default ChangeRoleStatus; 