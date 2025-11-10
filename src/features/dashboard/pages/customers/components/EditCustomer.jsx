"use client"

import { useState, useEffect } from "react"
import { validateCustomer } from "../../../../../shared/validations"
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../users/components/phoneinput-search.css';

export default function EditCustomer({ isOpen, onClose, onUpdate, loading = false, setLoading, customer, customers = [] }) {
  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && customer) {
      setFormData({
        documentType: customer.documentType || "",
        documentNumber: customer.documentNumber || "",
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
      })
      setErrors({})
      setTouched({})
    } else if (!isOpen) {
      setFormData({
        documentType: "",
        documentNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      })
      setErrors({})
      setTouched({})
    }
  }, [isOpen, customer])

  useEffect(() => {
    setErrors(validateCustomer(formData, customers, customer?.id, true));
  }, [formData, customers, customer]);

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
    const validation = validateCustomer(formData, customers, customer?.id, true);
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    setErrors(validation.errors);
    if (validation.isValid) {
      try {
        setLoading(true);
        await onUpdate(formData);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
            <div>
            <h2 className="text-xl font-bold text-accent m-0">Editar Cliente</h2>
          </div>
          <button
            className="text-gray-400 hover:text-black text-xl font-bold"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ×
          </button>
          </div>

        {/* Contenido */}
        <div className="p-8 bg-white overflow-y-auto flex-1">
          <form id="edit-customer-form" onSubmit={handleSubmit} className="space-y-4">
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
                <PhoneInput
                  country={'co'}
                  value={formData.phone}
                  onChange={value => handleInputChange({ target: { name: 'phone', value } })}
                  inputClass={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  inputProps={{ name: 'phone', required: true, autoComplete: 'off' }}
                  specialLabel=""
                  placeholder="Ej: 3001234567"
                />
                {touched.phone && errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
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
              form="edit-customer-form"
              className="px-4 py-2 rounded-md font-semibold transition ml-2 text-sm bg-black text-white hover:bg-gray-800 flex items-center"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Actualizando...
                </>
              ) : (
                <>
                <i className="bi bi-save mr-2"></i>
                Actualizar Cliente
                </>
              )}
            </button>
          </div>
      </div>
    </div>
  )
}
