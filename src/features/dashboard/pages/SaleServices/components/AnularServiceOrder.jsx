import React, { useState } from "react";

const AnularServiceOrder = ({ isOpen, onClose, onAnular, order, loading }) => {
  const [isAnulando, setIsAnulando] = useState(false);

  if (!isOpen || !order) return null;

  const handleAnular = async () => {
    setIsAnulando(true);
    try {
      await onAnular(order.id);
    } finally {
      setIsAnulando(false);
    }
  };

  const handleClose = () => {
    if (!isAnulando) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl border-2 border-red-500 relative max-w-md w-full">
        <button
          onClick={handleClose}
          disabled={isAnulando}
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold disabled:opacity-50"
        >
          ×
        </button>
        
        <div className="p-6">
          {/* Icono de advertencia */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <i className="bi bi-exclamation-triangle text-white text-2xl"></i>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Anular Orden de Servicio
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Estás seguro de que deseas anular esta orden de servicio? Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Información de la orden */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Detalles de la orden:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">ID:</span> {order.id}</p>
              <p><span className="font-medium">Cliente:</span> {order.clientName}</p>
              <p><span className="font-medium">Estado:</span> {order.status}</p>
              <p><span className="font-medium">Total:</span> ${order.totalGeneral?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isAnulando}
              className="flex-1 px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAnular}
              disabled={isAnulando}
              className="flex-1 px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isAnulando ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                  Anulando...
                </>
              ) : (
                <>
                  <i className="bi bi-trash mr-2"></i>
                  Anular
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnularServiceOrder; 