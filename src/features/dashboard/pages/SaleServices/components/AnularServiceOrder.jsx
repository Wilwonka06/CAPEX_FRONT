import { useState } from 'react';
import { anularServiceOrder } from '../API/ServiceOrderService';
import Swal from 'sweetalert2';
import { formatNumber, formatPrice } from '../../../../../shared/utils/formatters';

const AnularServiceOrder = ({ isOpen, onClose, order, onAnularSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleAnular = async () => {
    if (!order) return;

    setLoading(true);
    try {
      await anularServiceOrder(order.id);
      showMessage('Orden anulada exitosamente', 'success');
      onAnularSuccess();
      onClose();
    } catch (error) {
      console.error('Error al anular la orden:', error);
      showMessage('Error al anular la orden', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type === 'success' ? 'success' : 'error',
      title: text,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in">
        {/* Header */}
        <div className="flex-none bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between px-6 py-4 shadow-lg rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-exclamation-triangle text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Confirmar Anulación</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas anular la orden de servicio <strong>#{order.id}</strong>? 
            Esta acción no se puede deshacer.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Detalles de la orden:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Cliente:</span> {order.clientName || order.nombre_cliente || 'N/A'}</p>
              <p><span className="font-medium">Estado:</span> {order.status}</p>
              <p><span className="font-medium">Total:</span> {formatPrice(order.totalGeneral || 0)}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            La orden será anulada permanentemente del sistema.
          </p>
        </div>

        {/* Footer */}
        <div className="flex-none bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            onClick={onClose}
            disabled={loading}
          >
            <i className="bi bi-x-circle"></i>
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAnular}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Anulando...
              </>
            ) : (
              <>
                <i className="bi bi-trash-fill"></i>
                Sí, anular
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnularServiceOrder;