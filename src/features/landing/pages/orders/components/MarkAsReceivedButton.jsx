import { useState } from 'react';
import ordersService from '../API/OrdersService';

const MarkAsReceivedButton = ({ orderId, onStatusChange }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMarkAsReceived = async () => {
    setLoading(true);
    try {
      const response = await ordersService.changeStatus(orderId, 'Entregado');
      
      if (response.success) {
        // Notify parent component about the status change
        if (onStatusChange) {
          onStatusChange(orderId, 'Entregado');
        }
        setShowConfirmation(false);
        
        // Show success notification (you could integrate with a toast system here)
        alert('¡Pedido marcado como recibido! 🎉');
      } else {
        throw new Error(response.message || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error marking order as received:', error);
      alert('Error al marcar el pedido como recibido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ¿Confirmar recepción?
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Has recibido tu pedido y todo está en orden? Una vez que confirmes, 
              el estado cambiará a "Entregado".
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsReceived}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Confirmando...
                  </>
                ) : (
                  'Sí, lo recibí'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirmation(true)}
      disabled={loading}
      className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
    >
      <span>✅</span>
      <span>Marcar como Recibido</span>
    </button>
  );
};

export default MarkAsReceivedButton;