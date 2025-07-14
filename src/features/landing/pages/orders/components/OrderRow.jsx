import PropTypes from 'prop-types';
import { useState } from 'react';
import OrderStatusBadge from './OrderStatusBadge';
import OrderDetail from './OrderDetail';

const OrderRow = ({ order }) => {
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

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center justify-between bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
        onClick={handleToggle}
        onKeyPress={handleKeyPress}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-label={`Ver detalles de la orden ${order.numero}`}
      >
        <div className="flex items-center gap-6 flex-1">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-text-main whitespace-nowrap">
              Orden #{order.numero}
            </span>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {order.fecha}
            </span>
          </div>
          <OrderStatusBadge status={order.estado} />
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-lg font-bold text-primary whitespace-nowrap">
              ${order.total}
            </span>
            <div className="text-xs text-gray-500">
              {order.productos.length} producto{order.productos.length !== 1 ? 's' : ''}
            </div>
          </div>
          <span 
            className={`text-2xl text-gray-400 hover:text-primary transition-all duration-300 select-none transform ${
              expanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          >
            ▼
          </span>
        </div>
      </div>
      
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {expanded && (
          <div className="mt-2">
            <OrderDetail order={order} />
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
};

export default OrderRow; 