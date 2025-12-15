import { useState } from 'react';
import { anularServiceOrder } from '../API/ServiceOrderService';
import PropTypes from 'prop-types';

const AnularServiceOrder = ({ isOpen, onClose, order, onAnularSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleAnular = async () => {
    if (!order) return;

    setLoading(true);
    try {
      const idToUse = order.citaId || order.id;
      await anularServiceOrder(idToUse, order);
      onAnularSuccess();
      onClose();
    } catch (error) {
      console.error('Error al anular la orden:', error);
      // El error ya se maneja en anularServiceOrder con toast
    } finally {
      setLoading(false);
    }
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
            ¿Estás seguro de que deseas anular la venta de servicio <strong>#{order.id}</strong>? 
            Esta acción no se puede deshacer.
          </p>
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
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm"
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

AnularServiceOrder.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAnularSuccess: PropTypes.func.isRequired,
  order: PropTypes.object,
};

export default AnularServiceOrder;