import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { formatNumber, formatPrice } from "../../../../../shared/utils/formatters";

const ViewServiceSaleDetail = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  // Función para convertir hora del backend (HH:MM:SS) a formato corto (HH:MM)
  const formatTimeFromBackend = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  // Normalizar servicios para mostrar correctamente
  const serviciosNormalizados = useMemo(() => {
    return (order.servicios || []).map(servicio => ({
      ...servicio,
      startTime: servicio.startTime || formatTimeFromBackend(servicio.hora_inicio),
      endTime: servicio.endTime || formatTimeFromBackend(servicio.hora_finalizacion),
      duration: servicio.duration || servicio.duracion
    }));
  }, [order.servicios]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-eye text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Detalle de Venta de Servicio</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        {/* Contenido */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <div className="text-lg font-bold text-gray-800 text-center mb-4">Detalle de Orden #{order.id}</div>
          
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Información de Cliente */}
            <div className="flex-1">
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de Cliente</span>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="bi bi-person text-primary mr-2"></i>
                    <span className="font-medium">Nombre:</span>
                    <span className="ml-2">{order.customer?.nombre || order.clientName}</span>
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
                  <span className="font-semibold text-gray-800 text-sm">{formatPrice(order.dineroProporcionado || 0)}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Devolución</span>
                  <span className="font-semibold text-gray-800 text-sm">{formatPrice(order.devolucion || 0)}</span>
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
                      <th className="py-2 px-3 text-center font-semibold text-gray-700">Duración</th>
                      <th className="py-2 px-3 text-center font-semibold text-gray-700">Horario</th>
                      <th className="py-2 px-3 text-center font-semibold text-gray-700">Cantidad</th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">Precio</th>
                      <th className="py-2 px-3 text-right font-semibold text-gray-700">Subtotal</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Empleado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {serviciosNormalizados.map((servicio, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{servicio.name}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            <i className="bi bi-clock mr-1"></i>
                            {servicio.duration || servicio.duracion || 'N/A'} min
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {servicio.startTime && servicio.endTime ? (
                            <div className="text-xs">
                              <div className="font-medium text-green-700">{servicio.startTime}</div>
                              <div className="text-gray-500">a</div>
                              <div className="font-medium text-red-700">{servicio.endTime}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">{servicio.quantity}</td>
                        <td className="py-2 px-3 text-right">{formatPrice(servicio.price || 0)}</td>
                        <td className="py-2 px-3 text-right font-semibold">{formatPrice(servicio.subtotal || 0)}</td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <i className="bi bi-person-badge mr-1"></i>
                            {servicio.employee?.name || servicio.employee?.nombre || 'N/A'}
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
                        <td className="py-2 px-3 text-right">{formatPrice(producto.price || 0)}</td>
                        <td className="py-2 px-3 text-right font-semibold">{formatPrice(producto.subtotal || 0)}</td>
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
                <span className="font-semibold text-gray-800">{formatPrice(order.totalServices || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Productos:</span>
                <span className="font-semibold text-gray-800">{formatPrice(order.totalProducts || 0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-base font-bold">
                <span className="text-gray-800">Total General:</span>
                <span className="text-primary">{formatPrice(order.totalGeneral || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-2xl flex justify-end px-6 py-3 shadow-lg">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2"
            onClick={onClose}
          >
            <i className="bi bi-check-circle"></i>
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