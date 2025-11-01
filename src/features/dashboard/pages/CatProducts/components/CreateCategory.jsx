import { useState } from "react";
import PropTypes from "prop-types";
import { isDuplicateCategoryName } from "../../../../../shared/validations";

const CreateCategory = ({ onCreate, categories }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState("");
  const [setDescriptionError] = useState("");

  const handleOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setIsNameValid(true);
    setNameError("");
    setDescriptionError("");
  };

  const handleNameBlur = () => {
    if (!name.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
    } else if (name.trim().length < 5) {
      setNameError("El nombre debe tener al menos 5 caracteres");
      setIsNameValid(false);
    } else if (isDuplicateCategoryName(name, categories)) {
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
    } else if (name.trim().length < 5) {
      setNameError("El nombre debe tener al menos 5 caracteres");
      setIsNameValid(false);
      valid = false;
    }
    if (!isNameValid) valid = false;
    if (valid) {
      const dataToSend = { nombre: name.trim(), descripcion: description.trim() };
      console.log('Front-end: Sending data to API:', dataToSend);
      if (onCreate) onCreate(dataToSend);
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
    } else if (value.trim().length < 5) {
      setNameError("El nombre debe tener al menos 5 caracteres");
      setIsNameValid(false);
    } else if (isDuplicateCategoryName(value, categories)) {
      setNameError("Ya existe una categoría con este nombre");
      setIsNameValid(false);
    } else {
      setNameError("");
      setIsNameValid(true);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setDescriptionError("");
  };

  return (
    <>
      <button
        className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
        onClick={handleOpen}
      >
        <i className="bi bi-plus-circle mr-2"></i>
        Nueva Categoría
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
              <h2 className="text-xl font-bold text-primary m-0">Crear Nueva Categoría</h2>
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
              <form id="create-category-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">Nombre <span className='text-red-500'>*</span></label>
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
                  <label className="block text-xs font-medium text-text-main mb-1">Descripción</label>
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
            {/* Footer fijo */}
            <div className="sticky bottom-0  bg-white rounded-b-lg flex justify-end px-8 py-4">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="create-category-form"
                disabled={!isNameValid}
                className={`px-4 py-2 rounded-md font-semibold transition ml-2 text-sm ${
                  isNameValid 
                    ? 'bg-text-main text-white hover:bg-primary-dark' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

CreateCategory.propTypes = {
  onCreate: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
};

export default CreateCategory;