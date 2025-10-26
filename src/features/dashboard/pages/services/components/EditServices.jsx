import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  validateServiceName,
  validateServiceDescription,
  validateServiceDuration,
  validateServicePrice,
} from "../../../../../shared/validations";

const EditServices = ({ onClose, service, onEdit, categories = [], services = [] }) => {
  const activeCategories = categories.filter(cat => cat.estado === "Activo");
  
  const [formData, setFormData] = useState({
    id: service?.id || null,
    nombre: service?.nombre || "",
    id_categoria_servicio: "",
    descripcion: service?.descripcion || "",
    duracion: service?.duracion ? String(service.duracion) : "",
    precio: service?.precio ? String(service.precio) : "",
    foto: service?.foto || null
  });
  
  const [previews, setPreviews] = useState(service?.foto ? [service.foto] : []);
  const [errors, setErrors] = useState({});
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState("");

  // Inicializar datos del servicio SOLO cuando cambie el servicio, no las categorías
  useEffect(() => {
    if (service && service.id) {
      // Encontrar la categoría del servicio
      let categoryId = "";
      if (service.id_categoria_servicio) {
        categoryId = String(service.id_categoria_servicio);
      } else if (service.categoria?.nombre && categories.length > 0) {
        // Buscar por nombre de categoría
        const foundCategory = categories.find(cat => cat.nombre === service.categoria.nombre);
        if (foundCategory) {
          categoryId = String(foundCategory.id_categoria_servicio || foundCategory.id);
        }
      }

      setFormData({
        id: service.id,
        nombre: service.nombre || "",
        id_categoria_servicio: categoryId || (categories[0]?.id_categoria_servicio || categories[0]?.id || ""),
        descripcion: service.descripcion || "",
        duracion: service.duracion ? String(service.duracion) : "",
        precio: service.precio ? String(service.precio) : "",
        foto: service.foto || null
      });
      setPreviews(service.foto ? [service.foto] : []);
      setErrors({});
      setNameError("");
      setIsNameValid(true);
    }
  }, [service?.id]); // Solo cuando cambie el ID del servicio

  const handleKeyDown = (e) => {
    if (e.target.name === 'duracion' || e.target.name === 'precio') {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      const isNumber = /^[0-9]$/.test(e.key);
      if (!isNumber && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    }
    if (e.key === "Enter") e.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === 'duracion' || name === 'precio') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, foto: file }));
        setPreviews([URL.createObjectURL(file)]);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'nombre') {
      setNameError("");
      setIsNameValid(true);
    }
  };

  // Convertir servicios existentes para validación
  const existingServices = services.map((s) => ({ 
    id: s.id, 
    name: s.nombre ?? s.name 
  }));

  const handleNameBlur = () => {
    if (!formData.nombre.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
    } else {
      const servicioErrors = validateServiceName(formData.nombre, existingServices, service);
      if (servicioErrors.nombre) {
        setNameError(servicioErrors.nombre);
        setIsNameValid(false);
      } else {
        setNameError("");
        setIsNameValid(true);
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    switch (name) {
      case 'descripcion':
        const descripcionErrors = validateServiceDescription(value);
        error = descripcionErrors.descripcion || '';
        break;
      case 'duracion':
        const duracionErrors = validateServiceDuration(value);
        error = duracionErrors.duracion || '';
        break;
      case 'precio':
        const precioErrors = validateServicePrice(value);
        error = precioErrors.precio || '';
        break;
      default:
        break;
    }
    if (error) setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
    if (files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, foto: file }));
      setPreviews([URL.createObjectURL(file)]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, foto: null }));
    setPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    
    if (!formData.nombre.trim()) {
      setNameError("El nombre es obligatorio");
      setIsNameValid(false);
      valid = false;
    }
    if (!isNameValid) valid = false;

    // Validaciones de campos individuales
    const descErr = validateServiceDescription(formData.descripcion);
    const durErr = validateServiceDuration(formData.duracion);
    const preErr = validateServicePrice(formData.precio);
    const newErrors = {
      ...(descErr.descripcion ? { descripcion: descErr.descripcion } : {}),
      ...(durErr.duracion ? { duracion: durErr.duracion } : {}),
      ...(preErr.precio ? { precio: preErr.precio } : {}),
      ...(formData.id_categoria_servicio ? {} : { id_categoria_servicio: "La categoría es obligatoria" }),
    };
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) valid = false;

    if (valid) {
      // Preparar datos para envío
      const serviceData = {
        id: formData.id,
        nombre: formData.nombre.trim(),
        id_categoria_servicio: Number(formData.id_categoria_servicio),
        descripcion: formData.descripcion.trim(),
        duracion: Number(formData.duracion),
        precio: Number(formData.precio),
        foto: formData.foto && !(formData.foto instanceof File) ? String(formData.foto) : '',
      };

      // Llamar la función onEdit que se encarga de la confirmación y llamada a la API
      onEdit(serviceData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">Editar Servicio</h2>
          <button
            className="text-gray-400 hover:text-primary text-xl font-bold"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1">
          <form id="edit-service-form" onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
            {/* Columna Izquierda: Imagen y nombre */}
            <div className="flex flex-col items-center md:w-1/2 w-full gap-4">
              <div
                className="w-60 h-60 bg-gray-50 rounded-lg flex items-center justify-center mb-2 shadow-lg p-0 relative border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input-edit-service").click()}
              >
                {previews.length > 0 ? (
                  <>
                    <img
                      src={previews[0]}
                      alt={`Vista previa`}
                      className="w-full h-full object-cover rounded-lg m-0"
                    />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeImage(); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <i className="bi bi-cloud-upload text-3xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-500 mb-1">Arrastra y suelta una imagen aquí</p>
                    <p className="text-xs text-gray-400">o haz clic para seleccionar (1 máx)</p>
                  </div>
                )}
                <input
                  id="file-input-edit-service"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
              <div className="text-lg font-bold text-gray-800 text-center mb-2">
                {formData.nombre || "Nombre del servicio"}
              </div>
            </div>
            
            {/* Columna Derecha: Campos principales */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Nombre del Servicio <span className='text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${!isNameValid || nameError ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Categoría <span className='text-red-500'>*</span>
                </label>
                <select
                  name="id_categoria_servicio"
                  value={formData.id_categoria_servicio}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.id_categoria_servicio ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  {activeCategories.length === 0 && (
                    <option value="" disabled>No hay categorías activas</option>
                  )}
                  {activeCategories.map(cat => (
                    <option key={cat.id_categoria_servicio || cat.id} value={cat.id_categoria_servicio || cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.id_categoria_servicio && (
                  <p className="text-red-500 text-xs mt-1">{errors.id_categoria_servicio}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Descripción <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm resize-none ${errors.descripcion ? 'border-red-500' : 'border-gray-300'}`}
                  rows={3}
                  required
                />
                {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion}</p>}
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Duración (min) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type="text"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.duracion ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    placeholder="Ej: 60"
                  />
                  {errors.duracion && <p className="text-xs text-red-500 mt-1">{errors.duracion}</p>}
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Precio <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type="text"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.precio ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    placeholder="Ej: 50000"
                  />
                  {errors.precio && <p className="text-xs text-red-500 mt-1">{errors.precio}</p>}
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer fijo */}
        <div className="rounded-b-lg flex justify-end px-8 py-4">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-service-form"
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
  );
};

EditServices.propTypes = {
  onClose: PropTypes.func.isRequired,
  service: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  categories: PropTypes.array,
  services: PropTypes.array
};

export default EditServices;