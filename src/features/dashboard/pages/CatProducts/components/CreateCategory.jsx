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
        Crear Categoría
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="bi bi-tag text-lg"></i>
                </div>
                <h2 className="text-xl font-bold m-0">Crear Nueva Categoría</h2>
              </div>
              <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={handleClose} aria-label="Cerrar">×</button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
              <form id="create-category-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre <span className='text-red-500'>*</span></label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                        !isNameValid || nameError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={name}
                      onChange={handleNameChange}
                      onBlur={handleNameBlur}
                      required
                    />
                    {nameError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {nameError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm resize-none border-gray-300`}
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
                <button type="submit" form="create-category-form" disabled={!isNameValid} className={`px-4 py-2 rounded-lg ml-2 text-xs font-semibold ${isNameValid ? 'bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 hover:from-yellow-400 hover:to-yellow-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Guardar</button>
              </>
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