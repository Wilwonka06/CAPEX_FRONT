import PropTypes from 'prop-types';
import OrderStatusBadge from './OrderStatusBadge';
import OrderProductItem from './OrderProductItem';
import { formatNumber } from '@/shared/utils/formatters';

const OrderDetail = ({ order }) => {
  if (!order) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-2">
        <p className="text-center text-gray-500">No se pudo cargar el detalle del pedido</p>
      </div>
    );
  }

  const {
    numero = 'N/A',
    fecha = 'Sin fecha',
    estado = 'Pendiente',
    medioPago = 'No especificado',
    direccion = 'No especificada',
    productos = [],
    subtotal = 0,
    envio = 0,
    total = 0
  } = order;

  const subtotalNum = parseFloat(subtotal) || 0;
  const envioNum = parseFloat(envio) || 0;
  const totalNum = parseFloat(total) || 0;

  const calculatedTotal = subtotalNum + envioNum;
  const hasDiscrepancy = Math.abs(totalNum - calculatedTotal) > 0.01;

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-2 animate-fade-in">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-text-main">Orden #{numero}</span>
        <span className="text-sm text-gray-500">{fecha}</span>
      </div>

      {/* Info general en grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Estado y pago */}
        <div>
          <div className="mb-2">
            <OrderStatusBadge status={estado} />
          </div>
          <div className="text-xs text-gray-500">Medio de pago:</div>
          <div className="font-semibold text-text-main">{medioPago}</div>
        </div>

        {/* Envío */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Domicilio de entrega:</div>
          <div className="text-sm text-text-main whitespace-pre-line break-words">
            {direccion}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 items-end justify-between">
          <button 
            className="bg-primary text-white px-4 py-2 rounded font-semibold text-xs shadow hover:bg-primary-dark transition"
            onClick={() => alert('Función de descarga de factura próximamente')}
          >
            Descargar Factura
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="mb-6">
        <div className="font-bold text-text-main mb-2">Productos</div>
        {productos.length > 0 ? (
          <div className="flex flex-col gap-3">
            {productos.map((prod, idx) => (
              <OrderProductItem 
                key={prod.id || idx} 
                producto={prod} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No hay productos en este pedido
          </div>
        )}
      </div>
      <div className="flex flex-col items-end">
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span className="font-semibold">${formatNumber(subtotalNum)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Costo envío</span>
            <span className={`font-semibold ${envioNum === 0 ? 'text-green-600' : ''}`}>
              {envioNum === 0 ? 'GRATIS' : `$${formatNumber(envioNum)}`}
            </span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">
              ${formatNumber(totalNum)}
            </span>
          </div>
          
          {hasDiscrepancy && (
            <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Total calculado: ${formatNumber(calculatedTotal)}</span>
            </div>
          )}
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
  })
};

export default OrderDetail;