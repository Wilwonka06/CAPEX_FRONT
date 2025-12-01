// AddEmployee.jsx - Corregido para guardar programaciones correctamente
import React, { useState, useEffect } from 'react';
import { DOC_TYPES_CODES, DOC_TYPE_LABELS, toBackendDocCode } from '../../../../../shared/constants/documentTypes';
import toast from 'react-hot-toast';
import { 
  validateEmployeeForm,
  validateEmployeeName,
  validateEmployeeDocument,
  validateEmployeeEmail,
  validateEmployeePassword,
  validatePasswordConfirmation,
  isNumberInputValid
} from '../../../../../shared/validations';

const initialForm = {
  nombre: '',
  tipoDocumento: 'CC',
  documento: '',
  telefono: '',
  correo: '',
  direccion: '',
  estado: 'Activo',
};

// Tipos de documento estandarizados por códigos

const AddEmployee = ({ onCancel, onSave, schedulings, setSchedulings, employees = [] }) => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const isFormValid = () => {
    return form.nombre.trim() &&
           form.tipoDocumento.trim() &&
           form.documento.trim() &&
           form.telefono.trim() &&
           form.correo.trim() &&
           form.direccion.trim() &&
           Object.keys(errors).length === 0;
  };

  const validate = () => {
    const newErrors = validateEmployeeForm(form, employees);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación para campos numéricos (documento y teléfono)
    if (name === 'documento' || name === 'telefono') {
      const numericValue = value.replace(/[^\d]/g, '');
      setForm(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
  
    switch (name) {
      case 'nombre':
        const nombreErrors = validateEmployeeName(value);
        error = nombreErrors.nombre || '';
        break;
      case 'documento':
        if (!value.trim()) {
          error = 'El documento es obligatorio';
        } else if (value.length < 6 || value.length > 15) {
          error = 'El documento debe tener entre 6 y 15 dígitos';
        } else {
          const documentoErrors = validateEmployeeDocument(value, employees);
          error = documentoErrors.documento || '';
        }
        break;
      case 'correo':
        const correoErrors = validateEmployeeEmail(value, employees);
        error = correoErrors.correo || '';
        break;
      case 'telefono':
        if (!value.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (value.length < 7 || value.length > 15) {
          error = 'El teléfono debe tener entre 7 y 15 dígitos';
        }
        break;
      default:
        break;
    }
  
    // Solo actualizar error si realmente hay un error o si el campo es válido (limpiar)
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      // Si no hay error, limpiar el error del campo
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formErrors = validateEmployeeForm(form, employees);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      // Asegurar que el teléfono tenga el formato +XXXXXXXXXX
      let telefonoFormateado = form.telefono;
      if (telefonoFormateado && !telefonoFormateado.startsWith('+')) {
        telefonoFormateado = '+' + telefonoFormateado;
      }

      const newEmployee = {
        nombre: form.nombre,
        tipo_documento: form.tipoDocumento,
        documento: form.documento,
        telefono: telefonoFormateado,
        correo: form.correo,
        direccion: form.direccion,
        estado: 'Activo', // Siempre se crea como Activo por defecto
        schedulings: schedulings // ✅ AHORA SÍ INCLUYE LAS PROGRAMACIONES
      };

      console.log("📤 [AddEmployee] DATOS A ENVIAR:");
      console.log("  - Empleado:", newEmployee);
      console.log("  - Programaciones:", schedulings);
      console.log("  - Total programaciones:", schedulings.length);

      onSave(newEmployee);
      setForm(initialForm);
      setErrors({});
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with icon */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#FACC15] rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] font-nunito">Registro de Nuevo Empleado</h2>
          <p className="text-sm text-gray-600 font-lato">Complete la información del empleado y configure su programación</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-[#FACC15] text-[#1E1E1E]' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className={`font-semibold ${step >= 1 ? 'text-[#1E1E1E]' : 'text-gray-500'}`}>
              Información del Empleado
            </span>
          </div>
          <div className="flex-1 mx-4">
            <div className="h-1 bg-gray-200 rounded">
              <div
                className="h-1 bg-[#FACC15] rounded transition-all duration-500"
                style={{ width: step === 1 ? '50%' : '100%' }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-semibold ${step >= 2 ? 'text-[#1E1E1E]' : 'text-gray-500'}`}>
              Programación
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-[#FACC15] text-[#1E1E1E]' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#1E1E1E] font-nunito mb-2">Información Personal</h3>
            <p className="text-sm text-gray-600 font-lato">Complete los datos básicos del nuevo empleado</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={e => e.preventDefault()}>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                <i className="bi bi-person mr-2 text-[#FACC15]"></i>Nombre Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ingrese el nombre completo"
                  className={`w-full border-2 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                    errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="bi bi-person text-lg"></i>
                </div>
              </div>
              {errors.nombre && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.nombre}</p>}
            </div>
          
            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                <i className="bi bi-card-text mr-2 text-[#FACC15]"></i>Tipo de Documento *
              </label>
              <div className="relative">
                <select
                  name="tipoDocumento"
                  value={form.tipoDocumento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all appearance-none bg-white font-lato"
                >
                  {DOC_TYPES_CODES.map(code => (
                    <option key={code} value={code}>{`${code} - ${DOC_TYPE_LABELS[code]}`}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="bi bi-card-text text-lg"></i>
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="bi bi-chevron-down text-lg"></i>
                </div>
              </div>
              {errors.tipoDocumento && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.tipoDocumento}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                <i className="bi bi-hash mr-2 text-[#FACC15]"></i>Número de Documento *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="documento"
                  value={form.documento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={isNumberInputValid}
                  placeholder="Ingrese el número de documento"
                  maxLength={15}
                  className={`w-full border-2 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                    errors.documento ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="bi bi-hash text-lg"></i>
                </div>
              </div>
              {errors.documento && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.documento}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                <i className="bi bi-telephone mr-2 text-[#FACC15]"></i>Teléfono *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={isNumberInputValid}
                  placeholder="Ingrese el número de teléfono"
                  maxLength={15}
                  className={`w-full border-2 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                    errors.telefono ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="bi bi-telephone text-lg"></i>
                </div>
              </div>
              {errors.telefono && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.telefono}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                <i className="bi bi-envelope mr-2 text-[#FACC15]"></i>Correo Electrónico *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="correo@ejemplo.com"
                  className={`w-full border-2 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                    errors.correo ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="bi bi-envelope text-lg"></i>
                </div>
              </div>
              {errors.correo && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.correo}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                <i className="bi bi-geo-alt mr-2 text-[#FACC15]"></i>Dirección *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ingrese la dirección completa"
                  className={`w-full border-2 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                    errors.direccion ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="bi bi-geo-alt text-lg"></i>
                </div>
              </div>
              {errors.direccion && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.direccion}</p>}
            </div>

            {/* Information note */}
            <div className="md:col-span-2 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="bi bi-info-circle text-white text-sm"></i>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 font-lato mb-1">Información Importante</h4>
                  <p className="text-sm text-blue-700 font-lato">
                    La programación es opcional. Puedes crear el empleado ahora y asignarle programación más tarde desde la vista de edición.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold font-lato flex items-center justify-center gap-2 text-xs"
              >
                <i className="bi bi-x-lg"></i>
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  const formErrors = validateEmployeeForm(form, employees);
                  setErrors(formErrors);

                  if (Object.keys(formErrors).length === 0) {
                    let telefonoFormateado = form.telefono;
                    if (telefonoFormateado && !telefonoFormateado.startsWith('+')) {
                      telefonoFormateado = '+' + telefonoFormateado;
                    }

                    const newEmployee = {
                      nombre: form.nombre,
                      tipo_documento: toBackendDocCode(form.tipoDocumento),
                      documento: form.documento,
                      telefono: telefonoFormateado,
                      correo: form.correo,
                      direccion: form.direccion,
                      estado: 'Activo', // Siempre se crea como Activo por defecto
                    };

                    onSave(newEmployee);
                    setForm(initialForm);
                    setErrors({});
                  }
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 font-semibold font-lato flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                disabled={!isFormValid()}
              >
                <i className="bi bi-person-check"></i>
                Guardar sin Programación
              </button>

              
            </div>
          </form>
        </div>
      )}

      
    </div>
  );
};

export default AddEmployee;
