import PropTypes from 'prop-types';
import { formatNumber, formatPercentage } from "../../../../../shared/utils/formatters";

const PurchaseDetailModal = ({ compra, isOpen, onClose }) => {
  if (!isOpen || !compra) return null;
  
  const items = compra.detalles || compra.productos || compra.items || [];
  const subtotal = items.reduce((acc, p) => {
    const precio = parseFloat(p.precio_unitario || p.costo || p.precioBase || 0);
    const cantidad = parseInt(p.cantidad || 1);
    return acc + (precio * cantidad);
  }, 0);
  const totalIva = items.reduce((acc, p) => {
    const precio = parseFloat(p.precio_unitario || p.costo || p.precioBase || 0);
    const cantidad = parseInt(p.cantidad || 1);
    const ivaRate = parseFloat(p.iva || 0);
    return acc + (precio * cantidad * ivaRate);
  }, 0);
  const total = parseFloat(compra.total || 0) || subtotal + totalIva;

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Registrada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Anulada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-receipt text-lg"></i></div><h2 className="text-xl font-bold m-0">Detalle de Compra #{compra.id}</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          {/* Sección de Resumen */}
          <div className="p-6 border rounded-lg bg-gray-50 mb-8 shadow-md space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase">Proveedor</span>
                <span className="text-sm font-medium text-gray-800">{compra.proveedor}</span>
          </div>
          <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase">NIT</span>
                <span className="text-sm font-medium text-gray-800">{compra.nit}</span>
          </div>
          <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase">Fecha Compra</span>
                <span className="text-sm font-medium text-gray-800">{compra.fechaCompra}</span>
          </div>
          <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase">Estado</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoClass(compra.estado)}`}>{compra.estado}</span>
              </div>
          </div>
          </div>
          {/* Tabla de productos en la compra */}
          <div className="mt-8">
            <h3 className="text-md font-semibold text-text-main mb-4">Lista de Productos</h3>
            <div className="rounded-lg border border-gray-300 overflow-hidden bg-gray-50 shadow-md">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">CÓDIGO</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">NOMBRE</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">CANT.</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">COSTO</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">IVA</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">PRECIO C/IVA</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length > 0 ? items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 px-3">{item.producto?.id_producto || item.id_producto || item.id || index + 1}</td>
                      <td className="py-2 px-3 text-sm">{item.producto?.nombre || item.nombre || item.descripcion || 'Producto sin nombre'}</td>
                      <td className="py-2 px-3 text-right">{item.cantidad || 1}</td>
                      <td className="py-2 px-3 text-right">${formatNumber(item.precio_unitario || item.costo || item.precioBase || 0)}</td>
                      <td className="py-2 px-3 text-right">{formatPercentage(parseFloat(item.iva || 0) * 100)}</td>
                      <td className="py-2 px-3 text-right">${formatNumber((parseFloat(item.precio_unitario || item.costo || item.precioBase || 0) * (1 + parseFloat(item.iva || 0))))}</td>
                      <td className="py-2 px-3 text-right font-semibold">${formatNumber((parseFloat(item.precio_unitario || item.costo || item.precioBase || 0) * parseInt(item.cantidad || 1)))}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="py-4 px-3 text-center text-gray-500">
                        No hay productos en esta compra
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Sección de Totales */}
          <div className="flex justify-end mt-10">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-800">${formatNumber(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA:</span>
                <span className="font-semibold text-gray-800">${formatNumber(totalIva)}</span>
              </div>
              <div className="flex justify-between text-lg border-t border-gray-500 pt-4 mt-4">
                <span className="font-bold text-primary">Total:</span>
                <span className="font-bold text-primary">${formatNumber(total)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200"><button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-check-circle"></i>Cerrar</button></div>
      </div>
    </div>
  );
};

PurchaseDetailModal.propTypes = {
  compra: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}; 

export default PurchaseDetailModal;