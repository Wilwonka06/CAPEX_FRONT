import React from "react";

const DeleteServiceOrder = ({ isOpen, onClose, onDelete, order }) => {
  if (!isOpen || !order) return null;

  const handleDelete = () => {
    onDelete(order.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Eliminar Orden de Servicio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <i className="bi bi-exclamation-triangle text-red-500 text-2xl"></i>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">¿Estás seguro de que quieres eliminar esta orden?</h3>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
            <p className="font-medium mb-2">Información de la orden:</p>
            <p><span className="font-medium">ID:</span> {order.id}</p>
            <p><span className="font-medium">Cliente:</span> {order.clientName}</p>
            <p><span className="font-medium">Fecha:</span> {order.date}</p>
            <p><span className="font-medium">Monto:</span> {order.price}</p>
          </div>
          <div className="text-sm text-gray-600 mb-6">
            <p>Esta acción no se puede deshacer. La orden será eliminada permanentemente del sistema.</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancelar</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteServiceOrder; 