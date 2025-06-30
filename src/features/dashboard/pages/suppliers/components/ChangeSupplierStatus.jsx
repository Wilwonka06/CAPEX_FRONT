import { useState } from "react";

const ChangeSupplierStatus = ({ supplier, onStatusChange }) => {
  const [isChanging, setIsChanging] = useState(false);

  const handleStatusChange = async () => {
    setIsChanging(true);
    try {
      if (onStatusChange) await onStatusChange(supplier.id);
    } catch (error) {
      console.error("Error al cambiar el estado del proveedor:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <button
      onClick={handleStatusChange}
      disabled={isChanging}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        supplier.isActive ? 'bg-primary' : 'bg-gray-300'
      } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          supplier.isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {isChanging && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default ChangeSupplierStatus; 