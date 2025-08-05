import { useState } from "react";
import PropTypes from "prop-types";

export default function QuickCreateSupplierModal({ isOpen, onClose, onCreate }) {
  const [nombre, setNombre] = useState("");
  const [nit, setNit] = useState("");
  const [tipo, setTipo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !nit.trim() || !tipo.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setError("");
    const nuevoProveedor = {
      id: Date.now(),
      nombre,
      nit,
      tipo,
      isActive: true
    };
    onCreate(nuevoProveedor);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative animate-fade-in">
        <h2 className="text-lg font-bold mb-4 text-primary">Nuevo Proveedor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre *</label>
            <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">NIT *</label>
            <input type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={nit} onChange={e => setNit(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Tipo *</label>
            <select className="w-full px-3 py-2 border rounded-md text-sm" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="">Seleccionar tipo</option>
              <option value="N">Natural (N)</option>
              <option value="J">Jurídico (J)</option>
            </select>
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

QuickCreateSupplierModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
}; 