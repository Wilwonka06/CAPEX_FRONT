import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import RecurringSchedulingManager from './RecurringSchedulingManager';
import NovedadManager from './NovedadManager';
import {
  validateEmployeeEditForm,
  validateEmployeeName,
  validateEmployeeDocument,
  validateEmployeeEmail,
  isNumberInputValid
} from '../../../../../shared/validations';
import { DOC_TYPES_CODES, DOC_TYPE_LABELS, codeFromLabel, toBackendDocCode } from '../../../../../shared/constants/documentTypes';

const tiposDocumento = DOC_TYPES_CODES.map(code => ({ value: code, label: `${code} - ${DOC_TYPE_LABELS[code]}` }));

const EditEmployee = ({ employee, onCancel, onSave, employees = [], mode = 'edit' }) => {
  const [form, setForm] = useState({
    nombre: '',
    tipoDocumento: 'CC',
    documento: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'Activo',
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('empleado');
  const isReadOnly = mode === 'view';

  useEffect(() => {
    if (employee) {
      // Remover el + del teléfono si viene con él para mostrarlo limpio
      let telefonoLimpio = employee.telefono || '';
      if (telefonoLimpio.startsWith('+')) {
        telefonoLimpio = telefonoLimpio.substring(1);
      }

      setForm({
        nombre: employee.nombre || '',
        tipoDocumento: codeFromLabel(employee.tipo_documento || employee.tipoDocumento || 'CC'),
        documento: employee.documento || employee.numero_documento || employee.num_documento || '',
        telefono: telefonoLimpio,
        correo: employee.correo || '',
        direccion: employee.direccion || '',
        estado: employee.estado || 'Activo',
      });
      setErrors({});
    }
  }, [employee]);

  const validate = () => {
    const newErrors = validateEmployeeEditForm(form, employees, employee);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación para campos numéricos (documento y teléfono)
    if (name === 'documento' || name === 'telefono') {
      const numericValue = value.replace(/[^\d]/g, '');
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

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
          const documentoErrors = validateEmployeeDocument(value, employees, employee);
          error = documentoErrors.documento || '';
        }
        break;
      case 'correo':
        const correoErrors = validateEmployeeEmail(value, employees, employee);
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

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Asegurar que el teléfono tenga el formato +XXXXXXXXXX
    let telefonoFormateado = form.telefono;
    if (telefonoFormateado && !telefonoFormateado.startsWith('+')) {
      telefonoFormateado = '+' + telefonoFormateado;
    }

    const updatedEmployee = {
      id: employee.id,
      nombre: form.nombre,
      tipo_documento: toBackendDocCode(form.tipoDocumento),
      documento: form.documento,
      telefono: telefonoFormateado,
      correo: form.correo,
      direccion: form.direccion,
      estado: form.estado,
    };

    console.log("📤 DATOS A ACTUALIZAR:", updatedEmployee);

    if (onSave) {
      onSave(updatedEmployee);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] rounded-2xl h-16 w-16 flex items-center justify-center shadow-lg">
          <i className="bi bi-pencil-square text-2xl text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-nunito">Editar Empleado</h2>
          <p className="text-sm text-gray-600 font-lato">Modifica la información del empleado</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-gray-200 overflow-x-auto">
        <button
          className={`flex-1 min-w-[160px] text-sm font-semibold px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'empleado'
              ? 'bg-[#FACC15] text-gray-800 shadow-md'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('empleado')}
          type="button"
        >
          <i className="bi bi-person mr-2"></i>
          Datos Personales
        </button>
        <button
          className={`flex-1 min-w-[180px] text-sm font-semibold px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'programacion-recurrente'
              ? 'bg-[#FACC15] text-gray-800 shadow-md'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('programacion-recurrente')}
          type="button"
        >
          <i className="bi bi-calendar-week mr-2"></i>
          Programaciones
        </button>
        <button
          className={`flex-1 min-w-[140px] text-sm font-semibold px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'novedades'
              ? 'bg-[#FACC15] text-gray-800 shadow-md'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('novedades')}
          type="button"
        >
          <i className="bi bi-exclamation-triangle mr-2"></i>
          Novedades
        </button>
        
      </div>

      {activeTab === 'empleado' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 font-nunito mb-2 flex items-center gap-2">
              <i className="bi bi-person text-[#FACC15]"></i>
              Información Personal
            </h3>
            <p className="text-sm text-gray-600 font-lato">Modifica los datos básicos del empleado</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
                  <i className="bi bi-person text-[#FACC15]"></i>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ingresa el nombre completo"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                    errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isReadOnly}
                  required
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.nombre}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="tipoDocumento" className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
                  <i className="bi bi-card-text text-[#FACC15]"></i>
                  Tipo de Documento *
                </label>
                <select
                  name="tipoDocumento"
                  id="tipoDocumento"
                  value={form.tipoDocumento}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all appearance-none bg-white font-lato"
                  disabled={isReadOnly}
                  required
                >
                  {DOC_TYPES_CODES.map(code => (
                    <option key={code} value={code}>{`${code} - ${DOC_TYPE_LABELS[code]}`}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="documento" className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
                  <i className="bi bi-hash text-[#FACC15]"></i>
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="documento"
                  id="documento"
                  value={form.documento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={isNumberInputValid}
                  placeholder="Ingresa el número de documento"
                  maxLength={15}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato font-mono ${
                    errors.documento ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isReadOnly}
                  required
                />
                {errors.documento && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.documento}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
                  <i className="bi bi-telephone text-[#FACC15]"></i>
                  Teléfono *
                </label>
                <input
                  type="text"
                  name="telefono"
                  id="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={isNumberInputValid}
                  placeholder="Ingresa el número de teléfono"
                  maxLength={15}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato font-mono ${
                    errors.telefono ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isReadOnly}
                  required
                />
                {errors.telefono && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.telefono}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
                  <i className="bi bi-envelope text-[#FACC15]"></i>
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  id="correo"
                  value={form.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="correo@ejemplo.com"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                    errors.correo ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isReadOnly}
                  required
                />
                {errors.correo && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.correo}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  id="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ingresa la dirección completa"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                    errors.direccion ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isReadOnly}
                  required
                />
                {errors.direccion && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.direccion}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
                  Estado del Empleado
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="estado"
                      value="Activo"
                      checked={form.estado === 'Activo'}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#FACC15] focus:ring-[#FACC15] border-gray-300"
                    disabled={isReadOnly}
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Activo
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="estado"
                      value="Inactivo"
                      checked={form.estado === 'Inactivo'}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#FACC15] focus:ring-[#FACC15] border-gray-300"
                    disabled={isReadOnly}
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Inactivo
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold font-lato flex items-center gap-2 text-xs"
              >
                <i className="bi bi-x-lg"></i>
                {isReadOnly ? 'Cerrar' : 'Cancelar'}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 font-semibold font-lato flex items-center gap-2 shadow-lg hover:shadow-xl text-xs"
                >
                  <i className="bi bi-check-circle"></i>
                  Guardar Cambios
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'programacion-recurrente' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 font-nunito mb-2 flex items-center gap-2">
              <i className="bi bi-calendar-week text-[#FACC15]"></i>
              Programaciones Recurrentes
            </h3>
            <p className="text-sm text-gray-600 font-lato">Gestiona las programaciones semanales del empleado</p>
          </div>
          <RecurringSchedulingManager empleadoId={employee?.id} />
        </div>
      )}

      {activeTab === 'novedades' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 font-nunito mb-2 flex items-center gap-2">
              <i className="bi bi-exclamation-triangle text-[#FACC15]"></i>
              Novedades y Excepciones
            </h3>
            <p className="text-sm text-gray-600 font-lato">Registra cambios temporales en la programación</p>
          </div>
          <NovedadManager empleadoId={employee?.id} />
        </div>
      )}

      
    </div>
  );
};

export default EditEmployee;
