import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { isDuplicateCategoryName } from "../../../../../shared/validations";

const EditCategory = ({ category, isOpen, onClose, onSave, categories }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setOriginalName(category.name);
      setIsNameValid(true);
    }
  }, [category]);

  const handleNameBlur = () => {
    if (name.trim() && isDuplicateCategoryName(name, categories, category)) {
      alert("Ya existe una categoría con este nombre");
      setName(originalName);
      setIsNameValid(false);
    } else {
      setIsNameValid(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && description.trim() && isNameValid) {
      onSave({
        ...category,
        name: name.trim(),
        description: description.trim()
      });
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    setName("");
    setDescription("");
    setOriginalName("");
    setIsNameValid(true);
  };

  if (!isOpen || !category) return null;

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
              <label className="block text-xs font-medium text-text-main mb-1">Nombre </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                  !isNameValid ? 'border-red-500' : 'border-gray-300'
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Descripción </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </div>
          </form>
        </div>
        {/* Footer fijo */}
        <div className="sticky bottom-0 rounded-b-lg flex justify-end px-8 py-4">
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
            disabled={!isNameValid}
            className={`px-4 py-2 rounded-md font-semibold transition ml-2 text-sm ${
              isNameValid 
                ? 'bg-text-main text-white hover:bg-primary-dark' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

EditCategory.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
};

export default EditCategory;
