import React from "react";

const ViewServiceOrder = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  // Totales
  const totalServices = (order.servicios || []).reduce((total, s) => total + (s.subtotal || 0), 0);
  const totalProducts = (order.productos || []).reduce((total, p) => total + (p.subtotal || 0), 0);
  const totalGeneral = totalServices + totalProducts;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Detalle de Orden de Servicio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Cliente</label>
              <p className="text-sm text-gray-900">{order.clientName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Fecha</label>
              <p className="text-sm text-gray-900">{order.date}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Hora</label>
              <p className="text-sm text-gray-900">{order.time}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Monto Total</label>
              <p className="text-sm text-gray-900">{order.price}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.status?.toLowerCase() === "en ejecucion" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{order.status}</span>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-base font-semibold mb-2">Servicios</h3>
            <div className="border rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left border-r">Servicio</th>
                    <th className="px-2 py-2 text-left border-r">Empleado</th>
                    <th className="px-2 py-2 text-left border-r">Cantidad</th>
                    <th className="px-2 py-2 text-left border-r">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.servicios && order.servicios.length > 0) ? order.servicios.map((s, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-2 border-r">{s.name}</td>
                      <td className="px-2 py-2 border-r">{s.employee?.name || "-"}</td>
                      <td className="px-2 py-2 border-r text-center">{s.quantity}</td>
                      <td className="px-2 py-2 border-r">${s.subtotal?.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="px-2 py-4 text-center text-gray-500">No hay servicios</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-base font-semibold mb-2">Productos</h3>
            <div className="border rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left border-r">Producto</th>
                    <th className="px-2 py-2 text-left border-r">Cantidad</th>
                    <th className="px-2 py-2 text-left border-r">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.productos && order.productos.length > 0) ? order.productos.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-2 border-r">{p.name}</td>
                      <td className="px-2 py-2 border-r text-center">{p.quantity}</td>
                      <td className="px-2 py-2 border-r">${p.subtotal?.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="px-2 py-4 text-center text-gray-500">No hay productos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de totales */}
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Resumen de Venta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total Servicios:</span>
                  <span className="text-blue-600 font-bold">${totalServices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Productos:</span>
                  <span className="text-green-600 font-bold">${totalProducts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">TOTAL GENERAL:</span>
                  <span className="text-purple-600 font-bold text-lg">${totalGeneral.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Dinero proporcionado por el cliente:</label>
                  <div className="w-full border rounded px-3 py-2 text-sm bg-gray-100 font-bold">
                    ${order.dineroProporcionado?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Devolución:</label>
                  <div className="w-full border rounded px-3 py-2 text-sm bg-gray-100 font-bold">
                    ${order.devolucion?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end p-6 pt-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ViewServiceOrder; 