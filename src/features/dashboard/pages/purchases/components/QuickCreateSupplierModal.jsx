import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  isValidEmail,
  isValidNIT,
  isValidSupplierType,
} from "../../../../../shared/validations";

export default function QuickCreateSupplierModal({ isOpen, onClose, onCreate, suppliers = [] }) {
  const [formData, setFormData] = useState({
    nit: "",
    nombre: "",
    contacto: "",
    direccion: "",
    telefono: "",
    correo: "",
    tipo: "",
  });
  const [numero, setNumero] = useState("");
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "nit":
        if (!value.trim()) return "El NIT es requerido";
        if (!isValidNIT(value))
          return "El NIT debe comenzar con una letra seguida de números";
        if (suppliers.some((s) => s.nit === value))
          return "Ya existe un proveedor con ese NIT";
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handlePhoneChange = (value) => {
    setNumero(value);
    const error = validateField("telefono", value);
    setErrors((prev) => ({ ...prev, telefono: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "telefono") {
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    newErrors.telefono = validateField("telefono", numero);

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    try {
      // Crear el proveedor con el mismo formato que CreateSupplier
      const newSupplier = {
        ...formData,
        telefono: "+" + numero,
        id: Date.now(),
        isActive: true,
        estado: 'Activo',
        tipo: formData.tipo.toUpperCase(),
      };

      await onCreate(newSupplier);
      
      // Limpiar formulario
      setFormData({
        nit: "",
        nombre: "",
        contacto: "",
        direccion: "",
        telefono: "",
        correo: "",
        tipo: "",
      });
      setNumero("");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      setErrors({ submit: error.message || "Error al crear el proveedor" });
    }
  };

  const handleClose = () => {
    setFormData({
      nit: "",
      nombre: "",
      contacto: "",
      direccion: "",
      telefono: "",
      correo: "",
      tipo: "",
    });
    setNumero("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-truck text-lg"></i></div><h2 className="text-xl font-bold m-0">Crear nuevo proveedor</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={handleClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form id="quick-supplier-form" onSubmit={handleSubmit} className="space-y-4">
            {/* NIT y Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  NIT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nit"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                    errors.nit ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: A123456789"
                  required
                />
                {errors.nit && (
                  <p className="text-red-500 text-xs mt-1">{errors.nit}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
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
                  <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>
                )}
              </div>
            </div>

            {/* Nombre y Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                    errors.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contacto"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                    errors.contacto ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.contacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.contacto && (
                  <p className="text-red-500 text-xs mt-1">{errors.contacto}</p>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="direccion"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                  errors.direccion ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.direccion}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {errors.direccion && (
                <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>
              )}
            </div>

            {/* Teléfono y Correo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={"co"}
                  value={numero}
                  onChange={handlePhoneChange}
                  inputClass={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
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
                  <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Correo <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${
                    errors.correo ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.correo && (
                  <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
                )}
              </div>
            </div>

            {/* Error general */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="text-xs text-red-700">{errors.submit}</span>
              </div>
            )}
          </form>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={handleClose}><i className="bi bi-x-circle"></i>Cancelar</button>
          <button type="submit" form="quick-supplier-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"><i className="bi bi-check-circle"></i>Guardar</button>
        </div>
      </div>
    </div>
  );
}

QuickCreateSupplierModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  suppliers: PropTypes.array,
};