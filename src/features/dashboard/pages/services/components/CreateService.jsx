import { useState, useEffect } from "react";
 
import toast from "react-hot-toast";
import {
  validateServiceName,
  validateServiceDescription,
  validateServiceDuration,
  validateServicePrice,
} from "../../../../../shared/validations";
import { 
  compressImageToBase64, 
  validateFileSize, 
  validateFileType 
} from '../../../../../shared/utils/imagesUploadHelper';
import PropTypes from "prop-types";

const AddServices = ({ onClose, onAdd, services = [], categories = [] }) => {
  const activeCategories = categories.filter((cat) => cat.estado === "Activo");
  
  const [formData, setFormData] = useState({
    nombre: "",
    id_categoria_servicio: activeCategories[0]?.id_categoria_servicio || activeCategories[0]?.id || "",
    descripcion: "",
    duracion: "",
    precio: "",
    foto: null, // Será base64 string o null
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

  // Convertir servicios existentes para validación
  const existingServices = services.map((s) => ({ 
    id: s.id, 
    name: s.nombre ?? s.name 
  }));

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    if (name === "duracion" || name === "precio") {
      const numericValue = formatNumberInput(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      // Validar y limpiar errores para campos numéricos
      if (name === "duracion") {
        const duracionErrors = validateServiceDuration(numericValue);
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (duracionErrors.duracion) {
            newErrors.duracion = duracionErrors.duracion;
          } else {
            delete newErrors.duracion;
          }
          return newErrors;
        });
      } else if (name === "precio") {
        const precioErrors = validateServicePrice(numericValue);
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (precioErrors.precio) {
            newErrors.precio = precioErrors.precio;
          } else {
            delete newErrors.precio;
          }
          return newErrors;
        });
      }
    } else if (type === "file") {
      const file = files[0];
      if (file) {
        // Validar tipo de archivo
        if (!validateFileType(file)) {
          toast.error(`${file.name}: Tipo de archivo no válido`);
          return;
        }

        // Validar tamaño (5MB máximo)
        if (!validateFileSize(file, 5)) {
          toast.error(`${file.name}: Máximo 5MB`);
          return;
        }

        try {
          // Convertir a base64 y comprimir
          const base64Image = await compressImageToBase64(file, 1000, 1000, 0.8);
          setFormData((prev) => ({ ...prev, foto: base64Image }));
          
          // Preview local
          const preview = URL.createObjectURL(file);
          setPreviews([preview]);
        } catch (error) {
          console.error('Error procesando imagen:', error);
          toast.error('Error al procesar la imagen');
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Validar y limpiar errores para otros campos
      if (name === "nombre") {
        const nombreErrors = validateServiceName(value, existingServices);
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (nombreErrors.nombre) {
            newErrors.nombre = nombreErrors.nombre;
          } else {
            delete newErrors.nombre;
          }
          return newErrors;
        });
        setNameError("");
        setIsNameValid(true);
      } else if (name === "descripcion") {
        const descripcionErrors = validateServiceDescription(value);
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (descripcionErrors.descripcion) {
            newErrors.descripcion = descripcionErrors.descripcion;
          } else {
            delete newErrors.descripcion;
          }
          return newErrors;
        });
      } else if (errors[name]) {
        // Limpiar error genérico si existe
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

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
    // Agregar error si existe, o limpiar si no hay error
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const removeImage = () => {
    // Liberar URL del preview si existe
    if (previews.length > 0 && previews[0] && previews[0].startsWith('blob:')) {
      URL.revokeObjectURL(previews[0]);
    }
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
        duracion: parseFormattedNumber(formData.duracion),
        precio: parseFormattedNumber(formData.precio),
        foto: formData.foto || null, // Enviar base64 o null
        estado: 'Activo', // Agregar estado por defecto
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-scissors text-lg"></i></div><h2 className="text-xl font-bold m-0">Crear Nuevo Servicio</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
          <form id="create-service-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Fotos del servicio */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-800 mb-3 items-center gap-2">
                <i className="bi bi-images text-[#FACC15]"></i>
                Foto del Servicio <span className="text-gray-500 text-xs font-normal">(Máximo 1)</span>
              </label>
              <div className="space-y-4">
                {!formData.foto && (
                  <div
                    className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FACC15] hover:bg-yellow-50 transition-all duration-200 group"
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
                      if (files.length > 0) {
                        const file = files[0];
                        if (!validateFileType(file)) {
                          toast.error(`${file.name}: Tipo de archivo no válido`);
                          return;
                        }
                        if (!validateFileSize(file, 5)) {
                          toast.error(`${file.name}: Máximo 5MB`);
                          return;
                        }
                        try {
                          const base64Image = await compressImageToBase64(file, 1000, 1000, 0.8);
                          setFormData((prev) => ({ ...prev, foto: base64Image }));
                          const preview = URL.createObjectURL(file);
                          setPreviews([preview]);
                        } catch (error) {
                          console.error('Error procesando imagen:', error);
                          toast.error('Error al procesar la imagen');
                        }
                      }
                    }}
                    onClick={() => document.getElementById("file-input-service").click()}
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-yellow-100 transition-colors">
                        <i className="bi bi-cloud-upload text-2xl text-gray-500 group-hover:text-[#FACC15] transition-colors"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Arrastra y suelta imagen aquí
                      </p>
                      <p className="text-xs text-gray-500">
                        o haz clic para seleccionar
                      </p>
                    </div>
                  </div>
                )}

                <input
                  id="file-input-service"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />

                {previews.length > 0 && (
                  <div className="flex gap-2">
                    <div className="relative group">
                      <img
                        src={previews[0]}
                        alt="Vista previa"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                      >
                        <i className="bi bi-x text-sm"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campos del formulario en grid */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <i className="bi bi-info-circle text-[#FACC15]"></i>
                Información del Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre del Servicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                    !isNameValid || nameError
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                  required
                />
                {nameError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle"></i>
                    {nameError}
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_categoria_servicio"
                  value={formData.id_categoria_servicio}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                    errors.id_categoria_servicio
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
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
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.id_categoria_servicio}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border-2 rounded-xl text-sm resize-none ${
                    errors.descripcion
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                  rows={3}
                  required
                />
                {errors.descripcion && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.descripcion}
                  </p>
                )}
              </div>

              {/* Duración y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Duración (min) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                      errors.duracion
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                    required
                    placeholder="Ej: 60"
                  />
                  {errors.duracion && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errors.duracion}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                      errors.precio
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
                    required
                    placeholder="Ej: 50000"
                  />
                  {errors.precio && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errors.precio}
                    </p>
                  )}
                </div>
              </div>
              </div>
            </div>
          </form>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-x-circle"></i>Cancelar</button>
          <button type="submit" form="create-service-form" disabled={!isNameValid} className={`px-4 py-2 rounded-lg ml-2 text-xs font-semibold flex items-center gap-2 ${isNameValid ? 'bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 hover:from-yellow-400 hover:to-yellow-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}><i className="bi bi-check-circle"></i>Guardar</button>
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
import { formatNumberInput, parseFormattedNumber } from '../../../../../shared/utils/formatters';