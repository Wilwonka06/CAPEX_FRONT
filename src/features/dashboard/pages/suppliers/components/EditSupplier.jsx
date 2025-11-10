import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import { isDuplicateSupplierEmail, isValidEmail, isValidNIT, isValidPhone, isValidSupplierType } from "../../../../../shared/validations";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../users/components/phoneinput-search.css';

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
  const [numero, setNumero] = useState('');

  // Función para limpiar y parsear el teléfono desde el backend
  const parsePhoneFromBackend = (telefono) => {
    if (!telefono) return '';
    
    // Remover el símbolo + si existe y retornar solo números
    // El componente PhoneInput manejará el formato
    return telefono.replace(/[^0-9]/g, '');
  };

  useEffect(() => {
    if (supplier) {
      // Parsear el teléfono correctamente
      const phoneNumber = parsePhoneFromBackend(supplier.telefono);
      
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
      setNumero(phoneNumber); // Establecer el número limpio
    }
  }, [supplier]);

  const validateField = (name, value) => {
    switch (name) {
      case 'nit':
        if (!value.trim()) return 'El NIT es requerido';
        if (!isValidNIT(value)) return 'El NIT debe comenzar con una letra seguida de números';
        return '';
      case 'nombre':
        if (!value.trim()) return 'El nombre es requerido';
        return '';
      case 'contacto':
        if (!value.trim()) return 'El contacto es requerido';
        return '';
      case 'direccion':
        if (!value.trim()) return 'La dirección es requerida';
        return '';
      case 'telefono':
        if (!numero) return 'El teléfono es requerido';
        if (numero.length < 7 || numero.length > 15) return 'El teléfono debe tener entre 7 y 15 dígitos';
        return '';
      case 'correo':
        if (!value.trim()) return 'El correo es requerido';
        if (!isValidEmail(value)) return 'Formato de correo electrónico inválido';
        if (suppliers.some(s => s.correo === value && s.id !== supplier.id)) return 'Ya existe un proveedor con ese correo electrónico';
        return '';
      case 'tipo':
        if (!value.trim()) return 'El tipo es requerido';
        if (!isValidSupplierType(value)) return 'El tipo debe ser N (Natural) o J (Jurídico)';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePhoneChange = (value) => {
    // PhoneInput ya incluye el código del país en 'value'
    setNumero(value);
    const error = validateField('telefono', value);
    setErrors(prev => ({ ...prev, telefono: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Detener la propagación del evento
    
    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'telefono') {
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    newErrors.telefono = validateField('telefono', numero);
    
    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }
    
    const updatedSupplier = {
      ...supplier,
      ...formData,
      telefono: '+' + numero,
      tipo: formData.tipo.toUpperCase(),
    };
    if (onSave) onSave(updatedSupplier);
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
    setNumero(''); // Limpiar el número
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
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
                  disabled
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
                <PhoneInput
                  country={'co'}
                  value={numero}
                  onChange={handlePhoneChange}
                  inputClass={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                  containerClass="w-full"
                  inputProps={{ 
                    name: 'telefono', 
                    required: true,
                    placeholder: 'Ej: 3001234567'
                  }}
                  specialLabel=""
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