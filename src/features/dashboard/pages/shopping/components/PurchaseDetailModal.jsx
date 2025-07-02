import PropTypes from "prop-types";

const PurchaseDetailModal = ({ compra, isOpen, onClose }) => {
  if (!isOpen || !compra) return null;
  
  const items = compra.productos || compra.items || [];
  const subtotal = compra.subtotal || items.reduce((acc, p) => acc + (p.costo || p.precioBase) * p.cantidad, 0);
  const totalIva = compra.totalIva || items.reduce((acc, p) => acc + (p.costo || p.precioBase) * p.cantidad * (p.iva || 0), 0);
  const total = compra.total || subtotal + totalIva;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">Detalle de Compra #{compra.id}</h2>
          <button className="text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose}>×</button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1 space-y-8">
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
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 px-3">{item.codigo || item.id}</td>
                      <td className="py-2 px-3 text-sm">{item.nombre || item.descripcion}</td>
                      <td className="py-2 px-3 text-right">{item.cantidad}</td>
                      <td className="py-2 px-3 text-right">${(item.costo || item.precioBase || 0).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">{((item.iva || 0) * 100).toFixed(0)}%</td>
                      <td className="py-2 px-3 text-right">${item.precioConIva ? item.precioConIva : ((item.costo || item.precioBase || 0) * (1 + (item.iva || 0))).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-semibold">${(item.costo * item.cantidad).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sección de Totales */}
          <div className="flex justify-end mt-10">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA ({((totalIva/subtotal) * 100 || 0).toFixed(0)}%):</span>
                <span className="font-semibold text-gray-800">${totalIva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg border-t border-gray-500 pt-4 mt-4">
                <span className="font-bold text-primary">Total a Pagar:</span>
                <span className="font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer fijo */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-lg flex justify-end px-8 py-4">
          <button className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition" onClick={onClose}>
            Cerrar
          </button>
        </div>
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