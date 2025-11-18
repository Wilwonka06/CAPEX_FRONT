import { useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-plus-circle text-lg"></i></div><h2 className="text-xl font-bold m-0">Nuevo Producto</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form onSubmit={handleSubmit} id="quick-product-form" className="space-y-4">
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
          </form>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" className="px-3 py-1.5 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-x-circle"></i>Cancelar</button>
          <button type="submit" form="quick-product-form" className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"><i className="bi bi-check-circle"></i>Guardar</button>
        </div>
      </div>
    </div>
  );
}

QuickCreateProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};