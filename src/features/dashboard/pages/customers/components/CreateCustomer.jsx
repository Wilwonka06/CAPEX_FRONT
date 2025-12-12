"use client"
import { useState, useEffect } from "react"
import customersService from "../API/customersService"
import { validateCustomer, isNumberInputValid, validateUserDocument } from "../../../../../shared/validations.js"
import { DOC_TYPES_CODES, DOC_TYPE_LABELS } from "../../../../../shared/constants/documentTypes"
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const initialFormData = {
  documentType: "",
  documentNumber: "",
  nombre: "",
  email: "",
  phone: "",
};

export default function CreateCustomer({ isOpen, onClose, onSuccess, customers = [] }) {
  const [formData, setFormData] = useState(initialFormData)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
      setErrors({})
      setTouched({})
    }
  }, [isOpen])

  useEffect(() => {
    // Solo validar si el campo ha sido tocado
    const validation = validateCustomer(formData, customers, null, false);
    const newErrors = {};
    Object.keys(validation.errors).forEach(key => {
      if (touched[key]) {
        newErrors[key] = validation.errors[key];
      }
    });
    setErrors(newErrors);
  }, [formData, customers, touched]);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
    // Limpiar error si el campo tiene valor válido
    if (errors[name]) {
      // Validar inmediatamente si el campo es válido
      const tempFormData = { ...formData, [name]: value };
      const validation = validateCustomer(tempFormData, customers, null, false);
      if (!validation.errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
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
        await customersService.create(formData);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-person-plus text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Crear Nuevo Cliente</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg.white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200" onClick={handleClose} aria-label="Cerrar" disabled={loading}>×</button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
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
                {DOC_TYPES_CODES.map(code => (
                  <option key={code} value={code}>
                    {DOC_TYPE_LABELS[code] || code}
                  </option>
                ))}
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
                onChange={(e) => {
                  // Permitir números y letras según el tipo de documento
                  let value = e.target.value;
                  // Si es Pasaporte (PP), permitir alfanumérico
                  if (formData.documentType === 'PP') {
                    value = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                  } else {
                    // Para otros tipos, solo números
                    value = value.replace(/[^\d]/g, '');
                  }
                  handleInputChange({ target: { name: 'documentNumber', value } })
                }}
                onBlur={(e) => {
                  handleBlur(e);
                  // Validar documento cuando se pierde el foco
                  if (formData.documentType && formData.documentNumber) {
                    const docError = validateUserDocument(formData.documentType, formData.documentNumber);
                    if (docError) {
                      setErrors(prev => ({ ...prev, documentNumber: docError }));
                    }
                  }
                }}
                onKeyDown={formData.documentType === 'PP' ? undefined : isNumberInputValid}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                placeholder={formData.documentType === 'PP' ? 'Ej: AB123456' : 'Solo números'}
              />
                {touched.documentNumber && errors.documentNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.documentNumber}</p>
                )}
              </div>
            </div>

            {/* Nombre completo */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
              />
              {touched.nombre && errors.nombre && (
                <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>
              )}
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
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" disabled={loading}><i className="bi bi-x-circle"></i>Cancelar</button>
          <button type="submit" form="create-customer-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2" disabled={loading}>
            {loading ? (<><i className="bi bi-arrow-clockwise animate-spin"></i>Creando...</>) : (<><i className="bi bi-plus-circle"></i>Crear</>)}
          </button>
        </div>
      </div>
    </div>
  )
}