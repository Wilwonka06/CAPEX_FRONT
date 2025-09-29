import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  validateServiceName,
  validateServiceDescription,
  validateServiceDuration,
  validateServicePrice,
} from "../../../../../shared/validations";
import PropTypes from "prop-types";

const AddServices = ({ onClose, onAdd, services = [], categories = [] }) => {
  const activeCategories = categories.filter((cat) => cat.estado === "Activo");
  
  const [formData, setFormData] = useState({
    nombre: "",
    id_categoria_servicio: activeCategories[0]?.id_categoria_servicio || activeCategories[0]?.id || "",
    descripcion: "",
    duracion: "",
    precio: "",
    foto: null,
  });

  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState("");

  // Actualizar categoría por defecto cuando cambien las categorías
  useEffect(() => {
    if (activeCategories.length > 0 && !formData.id_categoria_servicio) {
      setFormData((prev) => ({
        ...prev,
        id_categoria_servicio: activeCategories[0].id_categoria_servicio || activeCategories[0].id,
      }));
    }
  }, [activeCategories, formData.id_categoria_servicio]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === "duracion" || name === "precio") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, foto: file }));
        setPreviews([URL.createObjectURL(file)]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "nombre") {
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
      const servicioErrors = validateServiceName(formData.nombre, existingServices);
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
    let error = "";
    switch (name) {
      case "descripcion":
        error = validateServiceDescription(value).descripcion || "";
        break;
      case "duracion":
        error = validateServiceDuration(value).duracion || "";
        break;
      case "precio":
        error = validateServicePrice(value).precio || "";
        break;
      default:
        break;
    }
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, foto: null }));
    setPreviews([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
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

    if (!valid) return;

    try {
      // Preparar datos para envío
      const serviceData = {
        nombre: formData.nombre.trim(),
        id_categoria_servicio: Number(formData.id_categoria_servicio),
        descripcion: formData.descripcion.trim(),
        duracion: Number(formData.duracion),
        precio: Number(formData.precio),
        foto: formData.foto && !(formData.foto instanceof File) ? String(formData.foto) : '',
      };

      // Llamar la función onAdd que se encarga de la llamada a la API
      await onAdd(serviceData);

      // Limpiar formulario después del éxito
      setFormData({
        nombre: "",
        id_categoria_servicio: activeCategories[0]?.id_categoria_servicio || activeCategories[0]?.id || "",
        descripcion: "",
        duracion: "",
        precio: "",
        foto: null,
      });
      setPreviews([]);
      setErrors({});
      setNameError("");
      setIsNameValid(true);
    } catch (error) {
      console.error("Error en el formulario:", error);
      // El error ya se maneja en el componente padre
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">Crear Nuevo Servicio</h2>
          <button
            className="text-gray-400 hover:text-primary text-xl font-bold"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-8 flex-1">
          <form
            id="create-service-form"
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-8"
          >
            {/* Columna izquierda: Imagen */}
            <div className="flex flex-col items-center md:w-1/2 w-full gap-4">
              <div
                className="w-60 h-60 bg-gray-50 rounded-lg flex items-center justify-center mb-2 shadow-lg p-0 relative border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById("file-input-service").click()}
              >
                {previews.length > 0 ? (
                  <>
                    <img
                      src={previews[0]}
                      alt="Vista previa"
                      className="w-full h-full object-cover rounded-lg m-0"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <i className="bi bi-cloud-upload text-3xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-500 mb-1">
                      Arrastra y suelta una imagen aquí
                    </p>
                    <p className="text-xs text-gray-400">
                      o haz clic para seleccionar (1 máx)
                    </p>
                  </div>
                )}
                <input
                  id="file-input-service"
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

            {/* Columna derecha: Campos */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Nombre del Servicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    !isNameValid || nameError ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_categoria_servicio"
                  value={formData.id_categoria_servicio}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors.id_categoria_servicio ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  {activeCategories.length === 0 && (
                    <option value="" disabled>
                      No hay categorías activas
                    </option>
                  )}
                  {activeCategories.map((cat) => (
                    <option key={cat.id_categoria_servicio || cat.id} value={cat.id_categoria_servicio || cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.id_categoria_servicio && (
                  <p className="text-red-500 text-xs mt-1">{errors.id_categoria_servicio}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-md text-sm resize-none ${
                    errors.descripcion ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={3}
                  required
                />
                {errors.descripcion && (
                  <p className="text-xs text-red-500 mt-1">{errors.descripcion}</p>
                )}
              </div>

              {/* Duración y Precio */}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Duración (min) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.duracion ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    placeholder="Ej: 60"
                  />
                  {errors.duracion && (
                    <p className="text-xs text-red-500 mt-1">{errors.duracion}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-text-main mb-1">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.precio ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    placeholder="Ej: 50000"
                  />
                  {errors.precio && (
                    <p className="text-xs text-red-500 mt-1">{errors.precio}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
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
            form="create-service-form"
            disabled={!isNameValid}
            className={`px-4 py-2 rounded-md font-semibold transition ml-2 text-sm ${
              isNameValid
                ? "bg-text-main text-white hover:bg-primary-dark"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

AddServices.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  services: PropTypes.array,
  categories: PropTypes.array,
};

export default AddServices;