import { useState } from "react";
import { 
  isDuplicateSupplierEmail, 
  isValidEmail, 
  isValidNIT, 
  isValidPhone, 
  isValidSupplierType 
} from "../../../../../shared/validations";

const CreateSupplier = ({ onCreate, suppliers = [] }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nit: "",
    nombre: "",
    contacto: "",
    direccion: "",
    telefono: "",
    correo: "",
    tipo: "",
  });
  const [errors, setErrors] = useState({});
  const [isEmailValid, setIsEmailValid] = useState(true);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ nit: "", nombre: "", contacto: "", direccion: "", telefono: "", correo: "", tipo: "" });
    setErrors({});
    setIsEmailValid(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'nit':
        if (value && !isValidNIT(value)) {
          return 'El NIT debe comenzar con una letra seguida de números';
        }
        break;
      case 'telefono':
        if (value && !isValidPhone(value)) {
          return 'El teléfono debe tener formato: +código de país + números (7-15 dígitos)';
        }
        break;
      case 'correo':
        if (value && !isValidEmail(value)) {
          return 'Formato de correo electrónico inválido';
        }
        break;
      case 'tipo':
        if (value && !isValidSupplierType(value)) {
          return 'El tipo debe ser N (Natural) o J (Jurídico)';
        }
        break;
      default:
        break;
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Validación especial para correo (duplicado)
    if (name === 'correo' && value) {
      if (isDuplicateSupplierEmail(value, suppliers)) {
        window.alert('Ya existe un proveedor con ese correo electrónico.');
        setFormData(prev => ({ ...prev, correo: '' }));
        setIsEmailValid(false);
      } else {
        setIsEmailValid(true);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Validar campos requeridos
    if (!formData.nit.trim()) newErrors.nit = 'El NIT es requerido';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.contacto.trim()) newErrors.contacto = 'El contacto es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido';
    if (!formData.tipo.trim()) newErrors.tipo = 'El tipo es requerido';

    // Validar correo duplicado
    if (formData.correo && isDuplicateSupplierEmail(formData.correo, suppliers)) {
      newErrors.correo = 'Ya existe un proveedor con ese correo electrónico';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Si todo está válido, crear el proveedor
      const newSupplier = {
        ...formData,
        id: Date.now(),
        isActive: true,
      tipo: formData.tipo.toUpperCase(),
      };
    
      if (onCreate) onCreate(newSupplier);
      handleClose();
  };

  return (
    <>
      <button
        className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
        onClick={handleOpen}
      >
        <i className="bi bi-plus-circle mr-2"></i>
        Nuevo Proveedor
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
              <h2 className="text-xl font-bold text-primary m-0">Crear nuevo proveedor</h2>
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
              <form id="create-supplier-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">NIT <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="nit" 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                        errors.nit ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.nit} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: A123456789"
                      required 
                    />
                    {errors.nit && <p className="text-red-500 text-xs mt-1">{errors.nit}</p>}
                  </div>
              <div>
                    <label className="block text-xs font-medium text-text-main mb-1">Tipo <span className="text-red-500">*</span></label>
                    <select
                      name="tipo"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                        errors.tipo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.tipo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="N">Natural (N)</option>
                      <option value="J">Jurídico (J)</option>
                    </select>
                    {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-text-main mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="nombre" 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.nombre} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required 
                    />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">Contacto <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="contacto" 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                        errors.contacto ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.contacto} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required 
                    />
                    {errors.contacto && <p className="text-red-500 text-xs mt-1">{errors.contacto}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-main mb-1">Dirección <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="direccion" 
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                      errors.direccion ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.direccion} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                  {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block text-xs font-medium text-text-main mb-1">Teléfono <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="telefono" 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                        errors.telefono ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.telefono} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: +573001234567"
                      required 
                    />
                    {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              </div>
              <div>
                    <label className="block text-xs font-medium text-text-main mb-1">Correo <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      name="correo" 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                        errors.correo || !isEmailValid ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.correo} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required 
                    />
                    {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
              </div>
              </div>
            </form>
            </div>
            {/* Footer fijo */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-lg flex justify-end px-8 py-4">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="create-supplier-form"
                className="px-4 py-2 rounded-md bg-text-main text-white font-semibold hover:bg-primary-dark transition ml-2 text-sm"
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

export default CreateSupplier; 