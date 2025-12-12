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
        {/* Contenido */}
        <div className="p-8 text-center">
          {/* Icono de advertencia */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-orange-500 flex items-center justify-center">
              <i className="bi bi-exclamation-triangle text-orange-500 text-3xl"></i>
            </div>
          </div>
          
          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¿Estás seguro?</h2>
          
          {/* Texto explicativo */}
          <p className="text-gray-700 mb-6 text-base">
            ¿Estás seguro de que deseas anular la venta de servicio <strong>#{order.id}</strong>? 
            Esta acción no se puede deshacer.
          </p>

          {/* Botones */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all duration-200"
              onClick={handleAnular}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                  Anulando...
                </>
              ) : (
                'Sí, anular'
              )}
            </button>
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all duration-200"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
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