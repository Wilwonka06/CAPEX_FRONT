import { useState } from "react";
import {
  isDuplicateSupplierEmail,
  isValidEmail,
  isValidNIT,
  isValidPhone,
  isValidSupplierType,
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
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    newErrors.telefono = validateField("telefono", numero);

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    // Crear el proveedor con el teléfono completo (PhoneInput ya incluye el +)
    const newSupplier = {
      ...formData,
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
              <h2 className="text-xl font-bold text-primary m-0">
                Crear nuevo proveedor
              </h2>
              <button
                className="text-gray-400 hover:text-primary text-xl font-bold"
                onClick={handleClose}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-8 flex-1">
              <form
                id="create-supplier-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.nombre}
                      </p>
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.contacto}
                      </p>
                    )}
                  </div>
                </div>

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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.direccion}
                    </p>
                  )}
                </div>

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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.telefono}
                      </p>
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.correo}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="rounded-b-lg flex justify-end px-8 py-4">
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

CreateSupplier.propTypes = {
  onCreate: PropTypes.func.isRequired,
  suppliers: PropTypes.array,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default CreateSupplier;
