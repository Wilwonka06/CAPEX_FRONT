import React, { useState } from "react";
import PropTypes from "prop-types";
import { suppliersList, productsList } from "../Shopping";

export default function CreatePurchaseModal({ isOpen, onClose, onCreate }) {
  const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().slice(0, 10));
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().slice(0, 10));
  const [proveedorId, setProveedorId] = useState("");
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const proveedor = suppliersList.find(s => s.id === Number(proveedorId));
  const nit = proveedor ? proveedor.nit : "";

  const subtotal = productos.reduce((acc, p) => acc + p.precioBase * p.cantidad, 0);
  const totalIVA = productos.reduce((acc, p) => acc + (p.precioBase * p.cantidad * p.iva), 0);
  const total = subtotal + totalIVA;

  const handleAddProduct = () => {
    const prod = productsList.find(p => p.id === Number(productoSeleccionado));
    if (!prod) return;
    setProductos(prev => [
      ...prev,
      {
        ...prod,
        cantidad: Number(cantidad),
      },
    ]);
    setProductoSeleccionado("");
    setCantidad(1);
  };

  const handleProductChange = (idx, field, value) => {
    setProductos(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleRemoveProduct = (idx) => {
    setProductos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!proveedorId || productos.length === 0) return;
    const nuevaCompra = {
      id: Date.now(),
      fechaRegistro,
      fechaCompra,
      proveedor: proveedor.nombre,
      nit,
      productos,
      total: total.toFixed(2),
      estado: "Registrada",
    };
    onCreate(nuevaCompra);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        <h2 className="text-xl font-bold mb-4 text-primary">Registrar compra</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Registro</label>
              <input type="date" className="w-full px-3 py-2 border rounded-md" value={fechaRegistro} onChange={e => setFechaRegistro(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Compra</label>
              <input type="date" className="w-full px-3 py-2 border rounded-md" value={fechaCompra} onChange={e => setFechaCompra(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Proveedor</label>
              <select className="w-full px-3 py-2 border rounded-md" value={proveedorId} onChange={e => setProveedorId(e.target.value)} required>
                <option value="">Seleccione proveedor</option>
                {suppliersList.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIT</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md bg-gray-100" value={nit} readOnly />
            </div>
          </div>
          <div className="border rounded-md p-4 mt-2">
            <div className="flex gap-2 mb-2">
              <select className="flex-1 px-2 py-1 border rounded-md" value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)}>
                <option value="">Agregar producto...</option>
                {productsList.map(p => <option key={p.id} value={p.id}>{p.descripcion}</option>)}
              </select>
              <input type="number" min="1" className="w-24 px-2 py-1 border rounded-md" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cantidad" />
              <button type="button" className="bg-primary text-white px-3 py-1 rounded-md" onClick={handleAddProduct}>Agregar</button>
            </div>
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Descripción</th>
                  <th className="px-2 py-1">Cantidad</th>
                  <th className="px-2 py-1">IVA</th>
                  <th className="px-2 py-1">Costo</th>
                  <th className="px-2 py-1">Precio Venta</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1">{p.id}</td>
                    <td className="px-2 py-1">{p.descripcion}</td>
                    <td className="px-2 py-1">
                      <input type="number" min="1" className="w-16 px-1 py-0.5 border rounded-md" value={p.cantidad} onChange={e => handleProductChange(idx, "cantidad", Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" step="0.01" min="0" max="1" className="w-16 px-1 py-0.5 border rounded-md" value={p.iva} onChange={e => handleProductChange(idx, "iva", Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" min="0" className="w-20 px-1 py-0.5 border rounded-md" value={p.precioBase} onChange={e => handleProductChange(idx, "precioBase", Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" min="0" className="w-20 px-1 py-0.5 border rounded-md" value={p.precioVenta} onChange={e => handleProductChange(idx, "precioVenta", Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-1">
                      <button type="button" className="text-red-500" onClick={() => handleRemoveProduct(idx)} title="Eliminar"><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-end mt-4">
            <div className="flex-1"></div>
            <div className="space-y-1 text-right">
              <div>Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span></div>
              <div>IVA: <span className="font-semibold">${totalIVA.toFixed(2)}</span></div>
              <div>Total: <span className="font-bold text-primary">${total.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark">Guardar compra</button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreatePurchaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
}; 