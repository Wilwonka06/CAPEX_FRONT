import { useState, useEffect } from "react";
import ModalShell from "../../../../../shared/components/ModalShell";
import PropTypes from "prop-types";
import { isDuplicateCategoryName } from "../../../../../shared/validations";

const EditCategory = ({ category, isOpen, onClose, onSave, categories }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState("");
  const [setDescriptionError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.nombre || category.name || '');
      setDescription(category.descripcion || category.description || '');
      setOriginalName(category.nombre || category.name || '');
      setIsNameValid(true);
    }
  }, [category]);

  const handleNameBlur = () => {
    if (!name.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
    } else if (isDuplicateCategoryName(name, categories, category)) {
      setNameError("Ya existe una categoría con este nombre");
      setIsNameValid(false);
    } else {
      setNameError("");
      setIsNameValid(true);
    }
  };

  const handleDescriptionBlur = () => {
    setDescriptionError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    if (!name.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
      valid = false;
    }
    if (!isNameValid) valid = false;
    if (valid) {
      onSave({
        ...category,
        nombre: name.trim(),
        descripcion: description.trim()
      });
      handleClose();
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    // Validación en tiempo real
    if (!value.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
    } else if (isDuplicateCategoryName(value, categories, category)) {
      setNameError("Ya existe una categoría con este nombre");
      setIsNameValid(false);
    } else {
      setNameError("");
      setIsNameValid(true);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <ModalShell
        iconClass="bi bi-pencil-square"
        title="Editar Categoría"
        onClose={handleClose}
        footer={(
          <>
            <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition" onClick={handleClose}>Cancelar</button>
            <button type="submit" form="edit-category-form" disabled={!isNameValid} className={`px-4 py-2 rounded-lg ml-2 text-xs font-semibold ${isNameValid ? 'bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 hover:from-yellow-400 hover:to-yellow-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Guardar Cambios</button>
          </>
        )}
        maxWidth="max-w-md"
      >
        <form id="edit-category-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Nombre </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                  !isNameValid || nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                required
              />
              {nameError && (
                <p className="text-xs text-red-500 mt-1">{nameError}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Descripción </label>
              <textarea
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm resize-none border-gray-300`}
                value={description}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                rows={3}
              />
            </div>
        </form>
      </ModalShell>
    </div>
  );
};

EditCategory.propTypes = {
  category: PropTypes.shape({
    id_categoria_producto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
    name: PropTypes.string, // fallback for backward compatibility
    descripcion: PropTypes.string,
    description: PropTypes.string, // fallback for backward compatibility
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
};

export default EditCategory;
