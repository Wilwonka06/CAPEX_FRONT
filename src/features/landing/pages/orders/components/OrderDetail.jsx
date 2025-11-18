import PropTypes from 'prop-types';
import OrderStatusBadge from './OrderStatusBadge';
import OrderProductItem from './OrderProductItem';
import { formatNumber } from '@/shared/utils/formatters';
import { generateProductInvoicePDF } from '@/shared/utils/invoicePdf';

const OrderDetail = ({ order }) => {
  if (!order) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mt-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-lato">No se pudo cargar el detalle del pedido</p>
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

  // Progress bar calculation based on status
  const getStatusProgress = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pendiente': return 20;
      case 'en proceso': return 50;
      case 'enviado': return 80;
      case 'entregado': return 100;
      case 'cancelado': return 0;
      default: return 10;
    }
  };

  const progressPercentage = getStatusProgress(estado);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-4 animate-fade-in">
      {/* Progress bar */}
      <div className="h-2 bg-gray-200">
        <div
          className={`h-full transition-all duration-500 ${estado.toLowerCase() === 'cancelado' ? 'bg-red-500' : 'bg-[#FACC15]'}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="p-8">
        {/* Encabezado mejorado */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FACC15] rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1E1E1E] font-nunito">Orden #{numero}</h2>
              <p className="text-gray-600 font-lato">{fecha}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={estado} />
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-poppins text-sm flex items-center gap-2"
              onClick={() => generateProductInvoicePDF({
                sale: {
                  numeroVenta: numero,
                  fecha,
                  productos,
                  valor: total,
                  metodoPago: medioPago,
                  estado
                },
                customer: {},
                theme: { primary: '#9C5B2B', accent: '#FACC15' },
                fileName: `factura_${numero}.pdf`
              })}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Factura
            </button>
          </div>
        </div>

        {/* Información del pedido en cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Estado y pago */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1E1E1E] font-nunito">Estado del Pedido</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-lato">Estado actual:</span>
                <OrderStatusBadge status={estado} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-lato">Método de pago:</span>
                <span className="font-semibold text-[#1E1E1E] font-poppins">{medioPago}</span>
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1E1E1E] font-nunito">Dirección de Entrega</h3>
            </div>
            <div className="text-sm text-gray-700 font-lato whitespace-pre-line break-words leading-relaxed">
              {direccion}
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1E1E1E] font-nunito">Productos ({productos.length})</h3>
          </div>

          {productos.length > 0 ? (
            <div className="space-y-4">
              {productos.map((prod, idx) => (
                <OrderProductItem
                  key={prod.id || idx}
                  producto={prod}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 font-lato">No hay productos en este pedido</p>
            </div>
          )}
        </div>

        {/* Resumen de precios */}
        <div className="bg-gradient-to-r from-[#FACC15]/10 to-[#FACC15]/5 rounded-2xl p-8 border border-[#FACC15]/20">
          <h3 className="text-xl font-bold text-[#1E1E1E] mb-6 font-nunito flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            Resumen del Pedido
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700 font-lato">Subtotal</span>
              <span className="font-semibold text-[#1E1E1E] font-poppins">${formatNumber(subtotalNum)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700 font-lato">Costo de envío</span>
              <span className={`font-semibold font-poppins ${envioNum === 0 ? 'text-green-600' : 'text-[#1E1E1E]'}`}>
                {envioNum === 0 ? 'GRATIS' : `$${formatNumber(envioNum)}`}
              </span>
            </div>

            <div className="border-t-2 border-[#FACC15] pt-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-[#1E1E1E] font-nunito">Total</span>
                <span className="text-3xl font-bold text-[#FACC15] font-montserrat">
                  ${formatNumber(totalNum)}
                </span>
              </div>
            </div>

            {hasDiscrepancy && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-orange-800 font-lato">
                    <span className="font-semibold">Nota:</span> Total calculado: ${formatNumber(calculatedTotal)}
                  </div>
                </div>
              </div>
            )}
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
  })
};

export default OrderDetail;