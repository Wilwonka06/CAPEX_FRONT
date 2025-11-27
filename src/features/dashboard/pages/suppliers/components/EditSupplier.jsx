import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import { isDuplicateSupplierEmail, isValidEmail, isValidNIT, isValidPhone, isValidSupplierType, isValidColombianNIT, isValidDocumentNumber, formatNIT } from "../../../../../shared/validations";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../users/components/phoneinput-search.css';

const EditSupplier = ({ supplier, isOpen, onClose, onSave, suppliers }) => {
  const [formData, setFormData] = useState({
    nit: "",
    numeroDocumento: "",
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
      
      // Formatear NIT si existe y el tipo es Jurídico
      let formattedNit = supplier.nit || "";
      if (formattedNit && supplier.tipo === "J") {
        formattedNit = formatNIT(formattedNit);
      }
      
      setFormData({
        nit: formattedNit,
        numeroDocumento: supplier.numeroDocumento || "",
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
        if (!isValidColombianNIT(value))
          return 'El NIT debe tener entre 9 y 14 dígitos con dígito de verificación (ej: 123456789-0)';
        // Verificar duplicados usando el valor limpio (sin formato)
        const cleanNit = value.replace(/[.-]/g, '');
        if (suppliers.some((s) => {
          const supplierNit = s.nit ? s.nit.replace(/[.-]/g, '') : '';
          return supplierNit === cleanNit && s.id !== supplier.id;
        }))
          return 'Ya existe un proveedor con ese NIT';
        return '';
      case 'numeroDocumento':
        if (!value.trim()) return 'El número de documento es requerido';
        if (!isValidDocumentNumber(value))
          return 'El número de documento debe tener entre 8 y 15 dígitos';
        // Verificar duplicados
        const cleanDoc = value.replace(/\s/g, '');
        if (suppliers.some((s) => {
          const supplierDoc = s.numeroDocumento ? s.numeroDocumento.replace(/\s/g, '') : '';
          return supplierDoc === cleanDoc && s.id !== supplier.id;
        }))
          return 'Ya existe un proveedor con ese número de documento';
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
    
    // Si cambia el tipo, limpiar el campo de identificación
    if (name === "tipo") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        nit: "",
        numeroDocumento: ""
      }));
      setErrors((prev) => ({ 
        ...prev, 
        nit: "",
        numeroDocumento: ""
      }));
    } else if (name === "nit") {
      // Formatear NIT mientras se escribe
      const formatted = formatNIT(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      const error = validateField(name, formatted);
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
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
        // Solo validar el campo de identificación correspondiente al tipo
        if (key === "nit" && formData.tipo !== "J") {
          // No validar NIT si el tipo no es Jurídico
          return;
        }
        if (key === "numeroDocumento" && formData.tipo !== "N") {
          // No validar número de documento si el tipo no es Natural
          return;
        }
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    newErrors.telefono = validateField('telefono', numero);
    
    // Validar que el campo de identificación correspondiente esté lleno
    if (formData.tipo === "J" && !formData.nit.trim()) {
      newErrors.nit = "El NIT es requerido";
    }
    if (formData.tipo === "N" && !formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = "El número de documento es requerido";
    }
    
    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }
    
    // Limpiar el formato del NIT antes de guardar (solo números y guión)
    const cleanNit = formData.nit ? formData.nit.replace(/\./g, '') : '';
    const cleanDocumento = formData.numeroDocumento ? formData.numeroDocumento.replace(/\s/g, '') : '';
    
    const updatedSupplier = {
      ...supplier,
      ...formData,
      nit: formData.tipo === "J" ? cleanNit : "",
      numeroDocumento: formData.tipo === "N" ? cleanDocumento : "",
      telefono: '+' + numero,
      tipo: formData.tipo.toUpperCase(),
    };
    if (onSave) onSave(updatedSupplier);
  };

  const handleClose = () => {
    onClose();
    setFormData({
      nit: "",
      numeroDocumento: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-pencil-square text-lg"></i></div><h2 className="text-xl font-bold m-0">Editar proveedor</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={handleClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form id="edit-supplier-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Tipo - Primero */}
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">
                Tipo de Proveedor <span className="text-red-500">*</span>
              </label>
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

            {/* Campo condicional: NIT o Número de Documento */}
            {formData.tipo === "J" && (
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  NIT (Número de Identificación Tributaria) – dígito de verificación incluido{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nit"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.nit ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: 123456789-0 o 800123456-5"
                  maxLength={17}
                  required
                />
                {errors.nit && <p className="text-red-500 text-xs mt-1">{errors.nit}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Formato: números con separadores opcionales (puntos) y dígito de verificación con guión
                </p>
              </div>
            )}

            {formData.tipo === "N" && (
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numeroDocumento"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.numeroDocumento ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.numeroDocumento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: 1234567890"
                  maxLength={15}
                  required
                />
                {errors.numeroDocumento && <p className="text-red-500 text-xs mt-1">{errors.numeroDocumento}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Debe tener entre 8 y 15 dígitos
                </p>
              </div>
            )}
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
                  inputClass={`w-full py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
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
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition" onClick={handleClose}>Cancelar</button>
          <button type="submit" form="edit-supplier-form" disabled={!isEmailValid} className={`px-4 py-2 rounded-lg ml-2 text-xs font-semibold ${isEmailValid ? 'bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 hover:from-yellow-400 hover:to-yellow-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Guardar Cambios</button>
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