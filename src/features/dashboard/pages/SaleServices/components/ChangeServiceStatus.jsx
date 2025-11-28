import React, { useState } from "react";

// Copia del modal ConfirmStatusModal de roles
const ConfirmStatusModal = ({ isOpen, onClose, onConfirm, isActive }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative animate-fade-in">
        <button 
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold" 
          onClick={onClose} 
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-arrow-repeat text-white text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-primary">Cambiar Estado</h2>
          <p className="text-sm text-gray-600 mt-2">¿Estás seguro de que quieres cambiar el estado a <span className={isActive ? 'text-red-600' : 'text-green-600'}>{isActive ? 'Inactivo' : 'Pagado'}</span>?</p>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold transition flex items-center`} 
            onClick={onConfirm}
          >
            <i className="bi bi-check-circle mr-2"></i>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const ChangeServiceStatus = ({ status, onToggle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const isActive = status.toLowerCase() === "pagado";

  const handleToggle = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsChanging(true);
    try {
      if (onToggle) await onToggle();
    } catch (error) {
      console.error("Error al cambiar el estado de la orden de servicio:", error);
    } finally {
      setIsChanging(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggle}
        disabled={isChanging}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
      <ConfirmStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        isActive={isActive}
      />
    </div>
  );
};

export default ChangeServiceStatus; 