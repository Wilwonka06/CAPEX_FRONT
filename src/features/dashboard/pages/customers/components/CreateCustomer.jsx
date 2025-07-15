"use client"

import { useState, useEffect } from "react"
import { validateCustomer } from "../../../../../shared/validations.js"

const initialFormData = {
  documentType: "",
  documentNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function CreateCustomer({ isOpen, onClose, onCreate, loading = false, customers = [] }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
      setErrors({})
      setTouched({})
    }
  }, [isOpen])

  useEffect(() => {
    setErrors(validateCustomer(formData, customers, null, false));
  }, [formData, customers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleClose = () => {
    if (!loading && onClose) onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateCustomer(formData, customers, null, true);
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    setErrors(validation.errors);
    if (validation.isValid) {
      try {
        setLoading(true);
        await onCreate(formData);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
            <div>
            <h2 className="text-xl font-bold text-accent m-0">Registrar Nuevo Cliente</h2>
            </div>
          <button
            className="text-gray-400 hover:text-black text-xl font-bold"
            onClick={handleClose}
            aria-label="Cerrar"
            disabled={loading}
          >
            ×
          </button>
          </div>

        {/* Contenido */}
        <div className="p-8 bg-white overflow-y-auto flex-1">
          <form id="create-customer-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
              >
                <option value="">Seleccione...</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
              </select>
                {touched.documentType && errors.documentType && (
                  <p className="text-red-600 text-xs mt-1">{errors.documentType}</p>
                )}
            </div>
            <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
              />
                {touched.documentNumber && errors.documentNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.documentNumber}</p>
                )}
              </div>
            </div>

            {/* Nombres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
              />
                {touched.firstName && errors.firstName && (
                  <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                />
                {touched.lastName && errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

            {/* Email y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
              />
                {touched.email && errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                />
                {touched.phone && errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black text-sm"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black text-sm"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </form>
          </div>

        {/* Footer */}
        <div className="bg-white rounded-b-lg flex justify-end px-8 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-black text-sm hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-customer-form"
              className="px-4 py-2 rounded-md font-semibold transition ml-2 text-sm bg-black text-white hover:bg-gray-800 flex items-center"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle mr-2"></i>
                Registrar Cliente
                </>
              )}
            </button>
          </div>
      </div>
    </div>
  )
}
