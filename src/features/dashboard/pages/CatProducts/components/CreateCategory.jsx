import { useState } from "react";

const CreateCategory = ({ onCreate }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      if (onCreate) onCreate({ name, description });
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
        Nueva Categoría
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl border-2  w-full max-w-md p-8 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-primary">Crear nueva categoría</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-main resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCategory;