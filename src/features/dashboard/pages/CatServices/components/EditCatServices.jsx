import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { isDuplicateCategoryName } from "../../../../../shared/validations";

const EditCatServices = ({ category, onClose, onEdit, existingCategories }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  useEffect(() => {
    if (category) {
      setNombre(category.nombre || '');
      setDescripcion(category.descripcion || '');
      setOriginalName(category.nombre || '');
      setIsNameValid(true);
    }
  }, [category]);

  const handleNameBlur = () => {
    if (!nombre.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
    } else if (nombre.length > 20) {
      setNameError("El nombre no puede tener más de 20 caracteres");
      setIsNameValid(false);
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
      setNameError("El nombre solo puede contener letras y espacios");
      setIsNameValid(false);
    } else if (isDuplicateCategoryName(nombre, existingCategories, category)) {
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
    
    if (!nombre.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
      valid = false;
    } else if (nombre.length > 20) {
      setNameError("El nombre no puede tener más de 20 caracteres");
      setIsNameValid(false);
      valid = false;
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
      setNameError("El nombre solo puede contener letras y espacios");
      setIsNameValid(false);
      valid = false;
    }

    if (!isNameValid) valid = false;

    if (valid) {
      onEdit({
        id_categoria_servicio: category.id_categoria_servicio,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        estado: category.estado
      });
      handleClose();
    }
  };

  const handleNameChange = (e) => {
    setNombre(e.target.value);
    setNameError("");
    setIsNameValid(true);
  };

  const handleDescriptionChange = (e) => {
    setDescripcion(e.target.value);
  };

  const handleClose = () => {
    onClose();
    setNombre("");
    setDescripcion("");
    setOriginalName("");
    setIsNameValid(true);
  };

  if (!category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
              <label className="block text-xs font-medium text-text-main mb-1">
                Nombre
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                  !isNameValid || nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                value={nombre}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                maxLength={20}
                required
              />
              {nameError && (
                <p className="text-xs text-red-500 mt-1">{nameError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-main mb-1">
                Descripción
              </label>
              <textarea
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm resize-none border-gray-300`}
                value={descripcion}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                maxLength={100}
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

EditCatServices.propTypes = {
  category: PropTypes.shape({
    id_categoria_servicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    estado: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  existingCategories: PropTypes.array.isRequired,
};

export default EditCatServices;