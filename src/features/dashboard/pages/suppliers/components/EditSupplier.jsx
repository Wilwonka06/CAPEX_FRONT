import { useState, useEffect } from "react";

const EditSupplier = ({ supplier, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    direccion: "",
    telefono: "",
    correo: "",
    nit: "",
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        nombre: supplier.nombre || "",
        contacto: supplier.contacto || "",
        direccion: supplier.direccion || "",
        telefono: supplier.telefono || "",
        correo: supplier.correo || "",
        nit: supplier.nit || "",
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.nombre &&
      formData.contacto &&
      formData.direccion &&
      formData.telefono &&
      formData.correo &&
      formData.nit
    ) {
      const updatedSupplier = {
        ...supplier,
        ...formData,
      };
      onSave(updatedSupplier);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      nombre: "",
      contacto: "",
      direccion: "",
      telefono: "",
      correo: "",
      nit: "",
    });
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl border-2 w-full max-w-md p-8 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
          onClick={handleClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-primary">
          Editar proveedor
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">NIT</label>
            <input
              type="text"
              name="nit"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.nit}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contacto</label>
            <input
              type="text"
              name="contacto"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.contacto}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input
              type="text"
              name="direccion"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="text"
              name="telefono"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo</label>
            <input
              type="email"
              name="correo"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplier;
