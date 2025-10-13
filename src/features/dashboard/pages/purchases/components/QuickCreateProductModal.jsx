import { useState } from "react";
import PropTypes from "prop-types";

export default function QuickCreateProductModal({ isOpen, onClose, onCreate }) {
  const [nombre, setNombre] = useState("");
  const [costo, setCosto] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !costo.trim() || !cantidad.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setError("");
    const nuevoProducto = {
      id: Date.now(),
      nombre,
      precio: parseFloat(costo),
      precioVenta: precioVenta ? parseFloat(precioVenta) : parseFloat(costo),
      cantidad: parseInt(cantidad),
    };
    onCreate(nuevoProducto);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative animate-fade-in">
        <h2 className="text-lg font-bold mb-4 text-primary">Nuevo Producto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre *</label>
            <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Costo *</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md text-sm" value={costo} onChange={e => setCosto(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Precio Venta</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md text-sm" value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Cantidad *</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md text-sm" value={cantidad} onChange={e => setCantidad(e.target.value)} />
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-3 py-1 rounded border text-sm" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-3 py-1 rounded bg-primary text-white text-sm">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

QuickCreateProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
}; 