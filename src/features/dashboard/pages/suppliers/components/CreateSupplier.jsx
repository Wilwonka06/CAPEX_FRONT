import { useState } from "react";

const CreateSupplier = ({ onCreate }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nit: "",
    nombre: "",
    contacto: "",
    direccion: "",
    telefono: "",
    correo: "",

  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ nit: "", nombre: "", contacto: "", direccion: "", telefono: "", correo: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nit && formData.nombre && formData.contacto && formData.direccion && formData.telefono && formData.correo) {
      const newSupplier = {
        ...formData,
        id: Date.now(),
        isActive: true,
      };
      if (onCreate) onCreate(newSupplier);
      handleClose();
    }
  };

  return (
    <>
      <button
        className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
        onClick={handleOpen}
      >
        <i className="bi bi-plus-circle mr-2"></i>
        Nuevo Proveedor
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-primary">Registrar proveedor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">NIT</label>
                <input type="text" name="nit" className="w-full px-3 py-2 border rounded-md" value={formData.nit} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input type="text" name="nombre" className="w-full px-3 py-2 border rounded-md" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contacto</label>
                  <input type="text" name="contacto" className="w-full px-3 py-2 border rounded-md" value={formData.contacto} onChange={handleChange} required />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input type="text" name="direccion" className="w-full px-3 py-2 border rounded-md" value={formData.direccion} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input type="text" name="telefono" className="w-full px-3 py-2 border rounded-md" value={formData.telefono} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input type="email" name="correo" className="w-full px-3 py-2 border rounded-md" value={formData.correo} onChange={handleChange} required />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={handleClose}>Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateSupplier; 