import PropTypes from "prop-types";

export default function SaleDetailModal({ sale, customer, isOpen, onClose }) {
  if (!isOpen || !sale || !customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Detalle de la Venta</h2>
          <button className="text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose}>×</button>
        </div>
        {/* Contenido */}
        <div className="overflow-y-auto p-8 flex-1">
          <div className="text-lg font-bold text-gray-800 text-center mb-2">Detalle de Venta</div>
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Información de Cliente */}
            <div className="flex-1">
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de Cliente</span>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                <div className="space-y-2">
                  <div className="flex items-center"><i className="bi bi-person text-primary mr-2"></i><span className="font-medium">Nombre:</span><span className="ml-2">{customer.firstName} {customer.lastName}</span></div>
                  <div className="flex items-center"><i className="bi bi-card-text text-primary mr-2"></i><span className="font-medium">Tipo Doc:</span><span className="ml-2">{customer.documentType}</span></div>
                  <div className="flex items-center"><i className="bi bi-hash text-primary mr-2"></i><span className="font-medium">Documento:</span><span className="ml-2">{customer.documentNumber}</span></div>
                  <div className="flex items-center"><i className="bi bi-envelope text-primary mr-2"></i><span className="font-medium">Correo:</span><span className="ml-2">{customer.email}</span></div>
                  <div className="flex items-center"><i className="bi bi-telephone text-primary mr-2"></i><span className="font-medium">Teléfono:</span><span className="ml-2">{customer.phone}</span></div>
                  <div className="flex items-center"><i className="bi bi-geo-alt text-primary mr-2"></i><span className="font-medium">Dirección:</span><span className="ml-2">{customer.address || '-'}</span></div>
                </div>
              </div>
            </div>
            {/* Información de Venta */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de Venta</span>
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">N° Venta</span>
                  <span className="font-semibold text-gray-800 text-sm">{sale.numeroVenta}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Fecha</span>
                  <span className="font-semibold text-gray-800 text-sm">{sale.fecha}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Método de Pago</span>
                  <span className="font-semibold text-gray-800 text-sm">{sale.metodoPago}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Estado</span>
                  <span className="font-semibold text-gray-800 text-sm">{sale.estado}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-md font-semibold text-text-main mb-4">Productos</h3>
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-md">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Código</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Nombre</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">Cantidad</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">Precio</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.productos.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">{item.codigo}</td>
                      <td className="py-2 px-3">{item.nombre}</td>
                      <td className="py-2 px-3 text-right">{item.cantidad}</td>
                      <td className="py-2 px-3 text-right">${item.precio.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">${(item.precio * item.cantidad).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end mt-10">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-800">${sale.valor.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-lg flex justify-end px-8 py-4">
          <button className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

SaleDetailModal.propTypes = {
  sale: PropTypes.object,
  customer: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}; 