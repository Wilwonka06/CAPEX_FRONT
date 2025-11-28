import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { formatNumber } from "../../../../../shared/utils/formatters";
 

export default function EditOrderModal({ order, customer, isOpen, onClose, estados, onUpdateEstado }) {
  const [estado, setEstado] = useState(order ? order.estado : "");

  // Actualizar el estado cuando cambie el pedido
  useEffect(() => {
    if (order) {
      setEstado(order.estado);
    }
  }, [order]);

  if (!isOpen || !order || !customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (estado && estado !== order.estado) {
      onUpdateEstado(order.id, estado);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-pencil-square text-lg"></i></div><h2 className="text-xl font-bold m-0">Editar Pedido</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <form onSubmit={handleSubmit} id="edit-order-form" className="space-y-4">
          <div className="text-lg font-bold text-gray-800 text-center mb-2">Editar Pedido</div>
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
            {/* Información de Pedido */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de Pedido</span>
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">N° Orden</span>
                  <span className="font-semibold text-gray-800 text-sm">{order.numeroOrden}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Fecha</span>
                  <span className="font-semibold text-gray-800 text-sm">{order.fecha}</span>
                </div>
                <div className="flex justify-between px-4 py-2 items-center">
                  <span className="text-xs text-gray-500">Estado</span>
                  <span>
                    <select className="ml-2 px-2 py-1 border rounded" value={estado} onChange={e => setEstado(e.target.value)}>
                      {estados.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Valor Total</span>
                  <span className="font-semibold text-gray-800 text-sm">${formatNumber(order.valor)}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-text-main mb-2">Productos</h3>
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Producto</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">Cantidad</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">Precio</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.productos.map((prod, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">{prod.nombre}</td>
                      <td className="py-2 px-3 text-right">{prod.cantidad}</td>
                      <td className="py-2 px-3 text-right">${formatNumber(prod.precio)}</td>
                      <td className="py-2 px-3 text-right">${formatNumber(prod.precio * prod.cantidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200"><button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-x-circle"></i>Cancelar</button><button type="submit" form="edit-order-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"><i className="bi bi-check-circle"></i>Guardar Cambios</button></div>
      </div>
    </div>
  );
}

EditOrderModal.propTypes = {
  order: PropTypes.object,
  customer: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  estados: PropTypes.array.isRequired,
  onUpdateEstado: PropTypes.func.isRequired,
};
