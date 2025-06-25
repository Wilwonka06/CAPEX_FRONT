import React from "react";
import PropTypes from "prop-types";

export default function PurchaseDetailModal({ compra, isOpen, onClose }) {
  if (!isOpen || !compra) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        <h2 className="text-xl font-bold mb-4 text-primary">Detalle de compra</h2>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">ID</div>
            <div className="font-semibold">{compra.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Fecha de Registro</div>
            <div className="font-semibold">{compra.fechaRegistro}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Fecha de Compra</div>
            <div className="font-semibold">{compra.fechaCompra}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Proveedor</div>
            <div className="font-semibold">{compra.proveedor}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">NIT</div>
            <div className="font-semibold">{compra.nit}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Estado</div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${compra.estado === 'Registrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{compra.estado}</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">Productos</div>
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Descripción</th>
                <th className="px-2 py-1">Cantidad</th>
                <th className="px-2 py-1">IVA</th>
                <th className="px-2 py-1">Costo</th>
                <th className="px-2 py-1">Precio Venta</th>
              </tr>
            </thead>
            <tbody>
              {compra.productos.map((p, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-1">{p.id}</td>
                  <td className="px-2 py-1">{p.descripcion}</td>
                  <td className="px-2 py-1">{p.cantidad}</td>
                  <td className="px-2 py-1">{(p.iva * 100).toFixed(0)}%</td>
                  <td className="px-2 py-1">${p.precioBase}</td>
                  <td className="px-2 py-1">${p.precioVenta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-end mt-4">
          <div className="flex-1"></div>
          <div className="space-y-1 text-right">
            <div>Subtotal: <span className="font-semibold">${compra.productos.reduce((acc, p) => acc + p.precioBase * p.cantidad, 0).toFixed(2)}</span></div>
            <div>IVA: <span className="font-semibold">${compra.productos.reduce((acc, p) => acc + (p.precioBase * p.cantidad * p.iva), 0).toFixed(2)}</span></div>
            <div>Total: <span className="font-bold text-primary">${compra.total}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

PurchaseDetailModal.propTypes = {
  compra: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}; 