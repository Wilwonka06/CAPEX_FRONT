import { useState } from "react";
import Swal from "sweetalert2";

const AddCatServices = ({ onClose, onAdd, existingCategories }) => {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [errors, setErrors] = useState({});
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "nombre") {
      setNameError("");
      setIsNameValid(true);
    }
  };

  const handleNameBlur = () => {
    if (!form.nombre.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
      return;
    }
    if (form.nombre.length > 20) {
      setNameError("El nombre no puede tener más de 20 caracteres");
      setIsNameValid(false);
      return;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(form.nombre)) {
      setNameError("El nombre solo puede contener letras y espacios");
      setIsNameValid(false);
      return;
    }
    if (
      existingCategories.some(
        (cat) => cat.nombre?.toLowerCase() === form.nombre.toLowerCase()
      )
    ) {
      setNameError("Ya existe una categoría con ese nombre");
      setIsNameValid(false);
      return;
    }
    setNameError("");
    setIsNameValid(true);
  };

  const handleDescriptionBlur = () => {
    if (form.descripcion && form.descripcion.length > 100) {
      setErrors((prev) => ({
        ...prev,
        descripcion: "La descripción no puede tener más de 100 caracteres",
      }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar antes de enviar
    let valid = true;
    
    if (!form.nombre.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
      valid = false;
    }
    
    if (!isNameValid) {
      valid = false;
    }

    const newErrors = {};
    if (form.descripcion && form.descripcion.length > 100) {
      newErrors.descripcion = "La descripción no puede tener más de 100 caracteres";
      valid = false;
    }
    setErrors(newErrors);

    if (!valid) return;

    try {
      console.log("[FRONT] Enviando formulario:", form);
      await onAdd(form);
      onClose();
    } catch (error) {
      console.error(
        "Error al crear categoría (front):",
        error.response?.status,
        error.response?.data
      );
      Swal.fire(
        "Error",
        error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          "Error al agregar categoría",
        "error"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-tags text-lg"></i></div><h2 className="text-xl font-bold m-0">Crear Nueva Categoría</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form id="create-category-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={handleNameBlur}
                onKeyDown={handleKeyDown}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isNameValid || nameError ? "border-red-500" : "border-gray-300"
                }`}
                required
                maxLength={20}
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                onBlur={handleDescriptionBlur}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.descripcion ? "border-red-500" : "border-gray-300"
                }`}
                maxLength={100}
                rows={4}
              />
              {errors.descripcion && (
                <p className="text-xs text-red-500 mt-1">{errors.descripcion}</p>
              )}
            </div>
          </form>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition">Cancelar</button>
          <button type="submit" form="create-category-form" disabled={!isNameValid} className={`px-4 py-2 rounded-lg ml-2 text-xs font-semibold ${isNameValid ? 'bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 hover:from-yellow-400 hover:to-yellow-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default AddCatServices;