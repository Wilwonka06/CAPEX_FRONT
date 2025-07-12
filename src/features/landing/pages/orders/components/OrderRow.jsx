import PropTypes from 'prop-types';
import { useState } from 'react';
import OrderStatusBadge from './OrderStatusBadge';
import OrderDetail from './OrderDetail';

const OrderRow = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center justify-between bg-white rounded-lg shadow p-4 border border-gray-100 hover:shadow-md transition cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-6 flex-1">
          <span className="text-xl font-bold text-text-main whitespace-nowrap">Orden #{order.numero}</span>
          <span className="text-sm text-gray-500 whitespace-nowrap">{order.fecha}</span>
          <OrderStatusBadge status={order.estado} />
        </div>
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-primary whitespace-nowrap">${order.total}</span>
          <span className={`text-2xl text-gray-400 hover:text-primary transition select-none transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>
      <div
        className={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {expanded && <OrderDetail order={order} />}
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
  }).isRequired,
};

export default OrderRow; 