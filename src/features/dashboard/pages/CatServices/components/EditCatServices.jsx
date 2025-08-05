import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { validateCategoryForm, validateCategory, validateCategoryDescription } from "../../../../../shared/validations";
import Swal from 'sweetalert2';

const EditCatServices = ({ onClose, category, onEdit, existingCategories = [] }) => {
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState({
    id: category?.id || null,
    Categoria: category?.Categoria || "",
    Descripcion: category?.Descripcion || "",
    estado: category?.estado || "Activo"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      id: category?.id || null,
      Categoria: category?.Categoria || "",
      Descripcion: category?.Descripcion || "",
      estado: category?.estado || "Activo"
    });
    setErrors({});
  }, [category]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";
    if (name === "Categoria") {
      const categoriaErrors = validateCategory(value, existingCategories, category);
      error = categoriaErrors.categoria || "";
    } else if (name === "Descripcion") {
      const descripcionErrors = validateCategoryDescription(value);
      error = descripcionErrors.descripcion || "";
    }
    if (error) setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateCategoryForm(form, existingCategories, category);
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      const result = await Swal.fire({
        title: '¿Guardar cambios en la categoría?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) {
        onEdit({
          id: form.id,
          name: form.Categoria,
          description: form.Descripcion,
          isActive: form.estado === "Activo"
        });
        handleClose();
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Editar Categoría</h2>
          <button
            className="text-gray-400 hover:text-primary text-xl font-bold"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1">
          <form id="edit-category-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Categoría <span className='text-red-500'>*</span></label>
              <input
                type="text"
                name="Categoria"
                value={form.Categoria}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.Categoria ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.Categoria && <p className="text-xs text-red-500 mt-1">{errors.Categoria}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Descripción</label>
              <textarea
                name="Descripcion"
                value={form.Descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm resize-none ${errors.Descripcion ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
              />
              {errors.Descripcion && <p className="text-xs text-red-500 mt-1">{errors.Descripcion}</p>}
            </div>
          </form>
        </div>
        {/* Footer fijo */}
        <div className="sticky bottom-0 bg-white rounded-b-lg flex justify-end px-8 py-4">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-category-form"
            className={`px-4 py-2 rounded-md font-semibold transition ml-2 text-sm bg-text-main text-white hover:bg-primary-dark`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

EditCatServices.propTypes = {
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  existingCategories: PropTypes.array
};

export default EditCatServices;
