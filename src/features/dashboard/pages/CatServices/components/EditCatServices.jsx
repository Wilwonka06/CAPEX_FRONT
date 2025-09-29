import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const EditCatServices = ({ onClose, onEdit, category, existingCategories }) => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    estado: "Activo",
  });

  useEffect(() => {
    if (category) {
      setForm({
        nombre: category.nombre || "",
        descripcion: category.descripcion || "",
        estado: category.estado || "Activo",
      });
    }
  }, [category]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.nombre.trim()) {
      Swal.fire("Error", "El nombre es obligatorio", "error");
      return false;
    }
    if (form.nombre.length > 20) {
      Swal.fire("Error", "El nombre no puede tener más de 20 caracteres", "error");
      return false;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(form.nombre)) {
      Swal.fire("Error", "El nombre solo puede contener letras y espacios", "error");
      return false;
    }
    if (
      existingCategories.some(
        (cat) =>
          cat.id_categoria_servicio !== category.id_categoria_servicio &&
          cat.nombre?.toLowerCase() === form.nombre.toLowerCase()
      )
    ) {
      Swal.fire("Error", "Ya existe una categoría con ese nombre", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onEdit({
        id_categoria_servicio: category.id_categoria_servicio,
        ...form,
      });
      onClose();
    } catch (error) {
      console.error("Error al actualizar categoría:", error.response?.data || error);
      Swal.fire(
        "Error",
        error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          "Error al actualizar categoría",
        "error"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Categoría</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCatServices;
