import PropTypes from 'prop-types';
import { useState } from 'react';
import OrderStatusBadge from './OrderStatusBadge';
import OrderDetail from './OrderDetail';
import MarkAsReceivedButton from './MarkAsReceivedButton';

const OrderRow = ({ order, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(prev => !prev);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Check if order can be marked as received
  const canMarkAsReceived = order.estado === 'Enviado';

  return (
    <div className="flex flex-col">
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.01] hover:border-gray-200"
        onClick={handleToggle}
        onKeyPress={handleKeyPress}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-label={`Ver detalles de la orden ${order.numero}`}
      >
        {/* Información principal */}
        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 flex-1 mb-4 sm:mb-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
              #{order.numero}
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                Orden #{order.numero}
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {order.fecha}
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <OrderStatusBadge status={order.estado} />
          </div>
        </div>

        {/* Precio y controles */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="sm:hidden">
            <OrderStatusBadge status={order.estado} />
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-yellow-600">
              ${order.total}
            </span>
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 justify-end">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {order.productos.length} producto{order.productos.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xl sm:text-2xl text-gray-400 hover:text-yellow-600 transition-all duration-300 select-none transform ${
                expanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
        </div>
      </div>
       
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {expanded && (
          <div className="mt-4 space-y-4">
            
            {/* Order Details */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
              <OrderDetail order={order} />
            </div>

            {/* Mark as Received Button - only for 'Enviado' orders */}
            {canMarkAsReceived && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 text-lg">¿Ya recibiste tu pedido?</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Confirma la recepción para completar el proceso de entrega
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <MarkAsReceivedButton
                    orderId={order.id}
                    onStatusChange={onStatusChange}
                  />
                </div>
              </div>
            )}

            {/* Additional info for completed orders */}
            {order.estado === 'Entregado' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 text-lg">¡Pedido Entregado!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Gracias por confirmar la recepción. Tu pedido ha sido completado exitosamente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

OrderRow.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.any,
    numero: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fecha: PropTypes.string,
    estado: PropTypes.string,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productos: PropTypes.array.isRequired,
  }).isRequired,
  onStatusChange: PropTypes.func,
};

export default OrderRow;