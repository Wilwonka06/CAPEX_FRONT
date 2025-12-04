import { useState } from "react";
import {
  isDuplicateSupplierEmail,
  isValidEmail,
  isValidNIT,
  isValidPhone,
  isValidSupplierType,
  isValidColombianNIT,
  isValidDocumentNumber,
  formatNIT,
} from "../../../../../shared/validations";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../../users/components/phoneinput-search.css";
import PropTypes from "prop-types";

const CreateSupplier = ({
  onCreate,
  suppliers = [],
  isOpen: externalOpen = undefined,
  onClose: externalOnClose,
}) => {
  const [open, setOpen] = useState(false);
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
  const [errors, setErrors] = useState({});
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [numero, setNumero] = useState("");

  // Determinar si el modal debe estar abierto
  const modalOpen = externalOpen !== undefined ? externalOpen : open;

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    // Limpiar TODOS los estados
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
    setErrors({});
    setIsEmailValid(true);
    setNumero(""); // IMPORTANTE: Limpiar el número de teléfono
    if (externalOnClose) externalOnClose();
  };

  const validateField = (name, value) => {
    switch (name) {
      case "nit":
        if (!value.trim()) return "El NIT es requerido";
        if (!isValidColombianNIT(value))
          return "El NIT debe tener entre 9 y 14 dígitos con dígito de verificación (ej: 123456789-0)";
        // Verificar duplicados usando el valor limpio (sin formato)
        const cleanNit = value.replace(/[.-]/g, '');
        if (suppliers.some((s) => {
          const supplierNit = s.nit ? s.nit.replace(/[.-]/g, '') : '';
          return supplierNit === cleanNit;
        }))
          return "Ya existe un proveedor con ese NIT";
        return "";
      case "numeroDocumento":
        if (!value.trim()) return "El número de documento es requerido";
        if (!isValidDocumentNumber(value))
          return "El número de documento debe tener entre 8 y 15 dígitos";
        // Verificar duplicados
        const cleanDoc = value.replace(/\s/g, '');
        if (suppliers.some((s) => {
          const supplierDoc = s.numeroDocumento ? s.numeroDocumento.replace(/\s/g, '') : '';
          return supplierDoc === cleanDoc;
        }))
          return "Ya existe un proveedor con ese número de documento";
        return "";
      case "nombre":
        if (!value.trim()) return "El nombre es requerido";
        return "";
      case "contacto":
        if (!value.trim()) return "El contacto es requerido";
        return "";
      case "direccion":
        if (!value.trim()) return "La dirección es requerida";
        return "";
      case "telefono":
        if (!numero) return "El teléfono es requerido";
        if (numero.length < 7 || numero.length > 15)
          return "El teléfono debe tener entre 7 y 15 dígitos";
        return "";
      case "correo":
        if (!value.trim()) return "El correo es requerido";
        if (!isValidEmail(value))
          return "Formato de correo electrónico inválido";
        if (suppliers.some((s) => s.correo === value))
          return "Ya existe un proveedor con ese correo electrónico";
        return "";
      case "tipo":
        if (!value.trim()) return "El tipo es requerido";
        if (!isValidSupplierType(value))
          return "El tipo debe ser N (Natural) o J (Jurídico)";
        return "";
      default:
        return "";
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
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handlePhoneChange = (value) => {
    // PhoneInput ya incluye el código del país en 'value'
    setNumero(value);
    const error = validateField("telefono", value);
    setErrors((prev) => ({ ...prev, telefono: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "telefono") {
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
    newErrors.telefono = validateField("telefono", numero);
    
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

    // Crear el proveedor con el teléfono completo (PhoneInput ya incluye el +)
    // Limpiar el formato del NIT antes de guardar (solo números y guión)
    const cleanNit = formData.nit ? formData.nit.replace(/\./g, '') : '';
    const cleanDocumento = formData.numeroDocumento ? formData.numeroDocumento.replace(/\s/g, '') : '';
    
    const newSupplier = {
      ...formData,
      nit: formData.tipo === "J" ? cleanNit : "",
      numeroDocumento: formData.tipo === "N" ? cleanDocumento : "",
      telefono: "+" + numero, // PhoneInput retorna solo números, agregamos el +
      id: Date.now(),
      isActive: true,
      tipo: formData.tipo.toUpperCase(),
    };

    if (onCreate) onCreate(newSupplier);
    handleClose();
  };

  return (
    <>
      {externalOpen === undefined && (
        <button
          className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
          onClick={handleOpen}
        >
          <i className="bi bi-plus-circle mr-2"></i>
          Crear proveedor
        </button>
      )}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-truck text-lg"></i></div><h2 className="text-xl font-bold m-0">Crear nuevo proveedor</h2></div>
              <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={handleClose} aria-label="Cerrar">×</button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
              <form
                id="create-supplier-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Campo Tipo - Primero */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de Proveedor <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipo"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                      errors.tipo ? "border-red-500" : "border-gray-300"
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
                  {errors.tipo && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errors.tipo}
                    </p>
                  )}
                </div>

                {/* Campo condicional: NIT o Número de Documento */}
                {formData.tipo === "J" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      NIT (Número de Identificación Tributaria) – dígito de verificación incluido{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nit"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                        errors.nit ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.nit}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: 123456789-0 o 800123456-5"
                      maxLength={17}
                      required
                    />
                    {errors.nit && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errors.nit}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: números con separadores opcionales (puntos) y dígito de verificación con guión
                    </p>
                  </div>
                )}

                {formData.tipo === "N" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Número de Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numeroDocumento"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                        errors.numeroDocumento ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.numeroDocumento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: 1234567890"
                      maxLength={15}
                      required
                    />
                    {errors.numeroDocumento && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errors.numeroDocumento}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Debe tener entre 8 y 15 dígitos
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                        errors.nombre ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errors.nombre}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Contacto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contacto"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                        errors.contacto ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.contacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {errors.contacto && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errors.contacto}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                      errors.direccion ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.direccion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle"></i>
                      {errors.direccion}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={"co"}
                      value={numero}
                      onChange={handlePhoneChange}
                      inputClass={`w-full py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                        errors.telefono ? "border-red-500" : "border-gray-300"
                      }`}
                      containerClass="w-full"
                      inputProps={{
                        name: "telefono",
                        required: true,
                        placeholder: "Ej: 3001234567",
                      }}
                      specialLabel=""
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errors.telefono}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Correo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="correo"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800 text-sm ${
                        errors.correo || !isEmailValid
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={formData.correo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {errors.correo && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="bi bi-exclamation-triangle"></i>
                        {errors.correo}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={handleClose}><i className="bi bi-x-circle"></i>Cancelar</button>
              <button type="submit" form="create-supplier-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"><i className="bi bi-check-circle"></i>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

CreateSupplier.propTypes = {
  onCreate: PropTypes.func.isRequired,
  suppliers: PropTypes.array,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default CreateSupplier;
