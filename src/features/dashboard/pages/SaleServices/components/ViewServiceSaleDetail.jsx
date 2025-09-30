import React from "react";
import PropTypes from "prop-types";

const ViewServiceSaleDetail = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const formatNumber = (num) => new Intl.NumberFormat('es-MX').format(num);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Detalle de la Cita en Ejecución</h2>
          <button className="text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose}>×</button>
        </div>
        
        {/* Contenido */}
        <div className="overflow-y-auto p-8 flex-1">
          <div className="text-lg font-bold text-gray-800 text-center mb-2">Detalle de Cita #{order.id}</div>
          
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Información de Cliente */}
            <div className="flex-1">
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de Cliente</span>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="bi bi-person text-primary mr-2"></i>
                    <span className="font-medium">Nombre:</span>
                    <span className="ml-2">{order.clientName}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="bi bi-calendar text-primary mr-2"></i>
                    <span className="font-medium">Fecha:</span>
                    <span className="ml-2">{order.date}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="bi bi-clock text-primary mr-2"></i>
                    <span className="font-medium">Hora:</span>
                    <span className="ml-2">{order.time}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Información de Orden */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de Orden</span>
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">N° Orden</span>
                  <span className="font-semibold text-gray-800 text-sm">{order.id}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Estado</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "Pagado" 
                      ? "bg-green-100 text-green-800" 
                      : order.status === "Anulado"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>{order.status}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Dinero Proporcionado</span>
                  <span className="font-semibold text-gray-800 text-sm">${formatNumber(order.dineroProporcionado || 0)}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Devolución</span>
                  <span className="font-semibold text-gray-800 text-sm">${formatNumber(order.devolucion || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios */}
          {order.servicios && order.servicios.length > 0 && (
            <div className="mt-8">
              <h3 className="text-md font-semibold text-text-main mb-4 flex items-center">
                <i className="bi bi-scissors text-primary mr-2"></i>
                Servicios
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-md">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Servicio</th>
                      <th className="py-2 px-3 text-center font-semibold text-gray-700">Cantidad</th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">Precio</th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">Subtotal</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Empleado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.servicios.map((servicio, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{servicio.name}</td>
                        <td className="py-2 px-3 text-center">{servicio.quantity}</td>
                        <td className="py-2 px-3 text-right">${formatNumber(servicio.price || 0)}</td>
                        <td className="py-2 px-3 text-right font-semibold">${formatNumber(servicio.subtotal || 0)}</td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <i className="bi bi-person-badge mr-1"></i>
                            {servicio.employee?.name || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Productos */}
          {order.productos && order.productos.length > 0 && (
            <div className="mt-8">
              <h3 className="text-md font-semibold text-text-main mb-4 flex items-center">
                <i className="bi bi-box text-primary mr-2"></i>
                Productos
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-md">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Producto</th>
                      <th className="py-2 px-3 text-center font-semibold text-gray-700">Cantidad</th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">Precio</th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.productos.map((producto, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{producto.name}</td>
                        <td className="py-2 px-3 text-center">{producto.quantity}</td>
                        <td className="py-2 px-3 text-right">${formatNumber(producto.price || 0)}</td>
                        <td className="py-2 px-3 text-right font-semibold">${formatNumber(producto.subtotal || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resumen de Totales */}
          <div className="flex justify-end mt-10">
            <div className="w-full max-w-xs space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Servicios:</span>
                <span className="font-semibold text-gray-800">${formatNumber(order.totalServices || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Productos:</span>
                <span className="font-semibold text-gray-800">${formatNumber(order.totalProducts || 0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-base font-bold">
                <span className="text-gray-800">Total General:</span>
                <span className="text-primary">${formatNumber(order.totalGeneral || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white rounded-b-lg flex justify-end px-8 py-4">
          <button 
            className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition flex items-center" 
            onClick={onClose}
          >
            <i className="bi bi-x-circle mr-2"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

ViewServiceSaleDetail.propTypes = {
  order: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewServiceSaleDetail;