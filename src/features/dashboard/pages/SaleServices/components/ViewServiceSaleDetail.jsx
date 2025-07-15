import React from "react";

const ViewServiceSaleDetail = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const ViewOrderCard = ({ children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-xl font-bold text-accent m-0">Detalles de la Orden de Servicio</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-xl font-bold"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Contenido */}
        <div className="p-8 bg-white overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <ViewOrderCard>
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-black mb-1">ID de Orden</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
              {order.id}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-black mb-1">Estado</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.status === "Pagado" 
                  ? "bg-green-100 text-green-800" 
                  : order.status === "Anulado"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {order.status}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-black mb-1">Cliente</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
              {order.clientName}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-black mb-1">Fecha</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
              {order.date}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-black mb-1">Hora</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
              {order.time}
            </div>
          </div>
        </div>

        {/* Servicios */}
        {order.servicios && order.servicios.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">Servicios</label>
            <div className="border border-accent rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.servicios.map((servicio, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-3 py-2 text-sm text-gray-900">{servicio.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{servicio.quantity}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">${servicio.price?.toLocaleString() || 0}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">${servicio.subtotal?.toLocaleString() || 0}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{servicio.employee?.name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-text-main mb-1">Total Servicios</label>
              <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                ${order.totalServices?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
        {order.productos && order.productos.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">Productos</label>
            <div className="border border-accent rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.productos.map((producto, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-3 py-2 text-sm text-gray-900">{producto.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{producto.quantity}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">${producto.price?.toLocaleString() || 0}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">${producto.subtotal?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Total Productos</label>
              <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                ${order.totalProducts?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Total General</label>
              <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main font-semibold">
                ${order.totalGeneral?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Dinero Proporcionado</label>
              <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                ${order.dineroProporcionado?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Devolución</label>
              <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">
                ${order.devolucion?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ViewOrderCard>
  );
};

export default ViewServiceSaleDetail;