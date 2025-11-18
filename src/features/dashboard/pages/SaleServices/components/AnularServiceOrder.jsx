import { useState } from 'react';
import { anularServiceOrder } from '../API/ServiceOrderService';
import Swal from 'sweetalert2';
import { formatNumber } from '../../../../../shared/utils/formatters';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Anular Orden de Servicio</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            ¿Estás seguro de que deseas anular la orden de servicio?
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Detalles de la orden:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">ID:</span> {order.id}</p>
              <p><span className="font-medium">Cliente:</span> {order.clientName}</p>
              <p><span className="font-medium">Estado:</span> {order.status}</p>
              <p><span className="font-medium">Total:</span> ${formatNumber(order.totalGeneral || 0)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleAnular}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Anulando...
              </>
            ) : (
              'Anular Orden'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnularServiceOrder;