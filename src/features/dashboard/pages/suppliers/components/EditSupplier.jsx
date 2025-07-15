import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import { isDuplicateSupplierEmail, isValidEmail, isValidNIT, isValidPhone, isValidSupplierType } from "../../../../../shared/validations";

const EditSupplier = ({ supplier, isOpen, onClose, onSave, suppliers }) => {
  const [formData, setFormData] = useState({
    nit: "",
    nombre: "",
    contacto: "",
    direccion: "",
    telefono: "",
    correo: "",
    tipo: "",
  });
  const [originalCorreo, setOriginalCorreo] = useState("");
  const [errors, setErrors] = useState({});
  const [isEmailValid, setIsEmailValid] = useState(true);

  useEffect(() => {
    if (supplier) {
      setFormData({
        nit: supplier.nit || "",
        nombre: supplier.nombre || "",
        contacto: supplier.contacto || "",
        direccion: supplier.direccion || "",
        telefono: supplier.telefono || "",
        correo: supplier.correo || "",
        tipo: supplier.tipo || "",
      });
      setOriginalCorreo(supplier.correo || "");
      setErrors({});
      setIsEmailValid(true);
    }
  }, [supplier]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    if (name === 'correo' && value) {
      if (isDuplicateSupplierEmail(value, suppliers, supplier)) {
        alert('Ya existe un proveedor con ese correo electrónico.');
        setFormData(prev => ({ ...prev, correo: originalCorreo }));
        setIsEmailValid(false);
      } else {
        setIsEmailValid(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    if (!formData.nit.trim()) newErrors.nit = 'El NIT es requerido';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.contacto.trim()) newErrors.contacto = 'El contacto es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido';
    if (!formData.tipo.trim()) newErrors.tipo = 'El tipo es requerido';
    if (formData.correo && isDuplicateSupplierEmail(formData.correo, suppliers, supplier)) {
      newErrors.correo = 'Ya existe un proveedor con ese correo electrónico';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Confirmación SweetAlert
    const result = await Swal.fire({
      title: '¿Confirmar edición?',
      text: `¿Estás seguro de que deseas editar el proveedor "${formData.nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const updatedSupplier = {
        ...supplier,
        ...formData,
        tipo: formData.tipo.toUpperCase(),
      };
      if (onSave) onSave(updatedSupplier);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      nit: "",
      nombre: "",
      contacto: "",
      direccion: "",
      telefono: "",
      correo: "",
      tipo: "",
    });
    setOriginalCorreo("");
    setErrors({});
    setIsEmailValid(true);
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Editar proveedor</h2>
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
          <form id="edit-supplier-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">NIT <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="nit"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.nit ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.nit && <p className="text-red-500 text-xs mt-1">{errors.nit}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Tipo <span className="text-red-500">*</span></label>
                <select
                  name="tipo"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.tipo ? 'border-red-500' : 'border-gray-300'}`}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.contacto ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.direccion ? 'border-red-500' : 'border-gray-300'}`}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${(errors.correo || !isEmailValid) ? 'border-red-500' : 'border-gray-300'}`}
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
            form="edit-supplier-form"
            disabled={!isEmailValid}
            className={`px-4 py-2 rounded-md font-semibold transition ml-2 text-sm ${
              isEmailValid 
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

EditSupplier.propTypes = {
  supplier: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nit: PropTypes.string,
    nombre: PropTypes.string,
    contacto: PropTypes.string,
    direccion: PropTypes.string,
    telefono: PropTypes.string,
    correo: PropTypes.string,
    tipo: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  suppliers: PropTypes.array.isRequired,
};

export default EditSupplier; 