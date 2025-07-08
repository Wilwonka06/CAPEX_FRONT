import PropTypes from 'prop-types';
import OrderStatusBadge from './OrderStatusBadge';
import OrderProductItem from './OrderProductItem';

const OrderDetail = ({ order }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-2 animate-fade-in">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-text-main">Orden #{order.numero}</span>
        <span className="text-sm text-gray-500">{order.fecha}</span>
      </div>
      {/* Info general en grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Estado y pago */}
        <div>
          <div className="mb-2"><OrderStatusBadge status={order.estado} /></div>
          <div className="text-xs text-gray-500">Medio de pago:</div>
          <div className="font-semibold text-text-main">{order.medioPago}</div>
        </div>
        {/* Envío */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Domicilio de entrega:</div>
          <div className="text-sm text-text-main whitespace-pre-line break-words">{order.direccion}</div>
        </div>
        {/* Acciones */}
        <div className="flex flex-col gap-2 items-end justify-between">
          <button className="bg-primary text-white px-4 py-2 rounded font-semibold text-xs shadow hover:bg-primary-dark transition">Descargar Factura</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold text-xs shadow hover:bg-gray-300 transition">Contactar Soporte</button>
        </div>
      </div>
      {/* Lista de productos */}
      <div className="mb-6">
        <div className="font-bold text-text-main mb-2">Productos</div>
        <div className="flex flex-col gap-3">
          {order.productos.map(prod => (
            <OrderProductItem key={prod.id} producto={prod} />
          ))}
        </div>
      </div>
      {/* Resumen de costos */}
      <div className="flex flex-col items-end">
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span>${order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Costo envío</span>
            <span>${order.envio}</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderDetail.propTypes = {
  order: PropTypes.shape({
    numero: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fecha: PropTypes.string,
    estado: PropTypes.string,
    medioPago: PropTypes.string,
    direccion: PropTypes.string,
    productos: PropTypes.array,
    subtotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    envio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default OrderDetail; 