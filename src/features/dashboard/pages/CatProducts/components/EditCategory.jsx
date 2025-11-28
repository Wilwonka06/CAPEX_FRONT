import { useState, useEffect } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-pencil-square text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Editar Categoría</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={handleClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
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
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <>
            <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition" onClick={handleClose}>Cancelar</button>
            <button type="submit" form="edit-category-form" disabled={!isNameValid} className={`px-4 py-2 rounded-lg ml-2 text-xs font-semibold ${isNameValid ? 'bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 hover:from-yellow-400 hover:to-yellow-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Guardar Cambios</button>
          </>
        </div>
      </div>
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