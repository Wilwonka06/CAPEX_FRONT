// AddEmployee.jsx actualizado para NO expandir programaciones, solo guardar los datos seleccionados
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AddScheduling from './AddScheduling';
import { 
  validateEmployeeForm,
  validateEmployeeName,
  validateEmployeeLastName,
  validateEmployeeDocument,
  validateEmployeeEmail,
  validateEmployeePassword,
  validatePasswordConfirmation
} from '../../../../../shared/validations';

const initialForm = {
  nombre: '',
  tipoDocumento: 'Cedula de ciudadania',
  documento: '',
  telefono: '',
  correo: '',
  direccion: '',
  estado: 'Activo',
};

const tiposDocumento = [
  { value: 'Cedula de ciudadania', label: 'Cédula de Ciudadanía' },
  { value: 'Tarjeta de identidad', label: 'Tarjeta de Identidad' },
  { value: 'Cedula de extranjeria', label: 'Cédula de Extranjería' },
  { value: 'Pasaporte', label: 'Pasaporte' },
];

const AddEmployee = ({ onCancel, onSave, schedulings, setSchedulings, employees = [] }) => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [editingScheduling, setEditingScheduling] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(schedulings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageSchedulings = schedulings.slice(startIndex, startIndex + itemsPerPage);

  const isFormValid = () => {
    return form.nombre.trim() &&
           form.tipoDocumento.trim() &&
           form.documento.trim() &&
           form.telefono.trim() &&
           form.correo.trim() &&
           form.direccion.trim() &&
           form.estado.trim() &&
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
      // Solo permitir números, eliminar letras, espacios, signos (incluyendo 'e', '+', '-')
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
  
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      // Limpiar el error si no hay problema
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddScheduling = (prog) => {
    const idBase = Date.now().toString();
    const nuevaProg = { ...prog, idBase };
    setSchedulings([...schedulings, nuevaProg]);
    setEditingScheduling(null);
  };

  const handleEditScheduling = (prog) => {
    setEditingScheduling(prog);
  };

  const handleSaveEditScheduling = (updatedProg) => {
    const newProg = { ...updatedProg };
    setSchedulings(schedulings.map(s => s.id === newProg.id ? newProg : s));
    setEditingScheduling(null);
  };

  const handleDeleteScheduling = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta programación?')) {
      setSchedulings(schedulings.filter(s => s.id !== id));
    }
  };

  const handleCancelEditScheduling = () => {
    setEditingScheduling(null);
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
        estado: form.estado
      };

      console.log("📤 DATOS A ENVIAR:", newEmployee);
      onSave(newEmployee);
      setForm(initialForm);
      setErrors({});
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-main mb-4">Registro de Nuevo Empleado</h2>

      <div className="flex gap-2 mb-4">
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t ${step === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'}`}
          type="button"
          disabled
        >
          Nuevo Empleado
        </button>
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t ${step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'} ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => isFormValid() && setStep(2)}
          disabled={!isFormValid()}
        >
          Programación
        </button>
      </div>

      {step === 1 && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Nombre</label>
            <input 
              type="text" 
              name="nombre" 
              value={form.nombre} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`w-full border rounded px-3 py-2 ${errors.nombre ? 'border-red-500' : ''}`}
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Tipo de Documento</label>
            <select 
              name="tipoDocumento" 
              value={form.tipoDocumento} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className="w-full border rounded px-3 py-2"
            >
              {tiposDocumento.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
            {errors.tipoDocumento && <p className="text-red-500 text-xs mt-1">{errors.tipoDocumento}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Documento</label>
            <input 
              type="text" 
              name="documento" 
              value={form.documento} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              placeholder="Solo números"
              maxLength={15}
              className={`w-full border rounded px-3 py-2 ${errors.documento ? 'border-red-500' : ''}`}
            />
            {errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Solo números"
              maxLength={15}
              className={`w-full border rounded px-3 py-2 ${errors.telefono ? 'border-red-500' : ''}`}
            />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Correo</label>
            <input 
              type="email" 
              name="correo" 
              value={form.correo} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`w-full border rounded px-3 py-2 ${errors.correo ? 'border-red-500' : ''}`}
            />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Dirección</label>
            <input 
              type="text" 
              name="direccion" 
              value={form.direccion} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`w-full border rounded px-3 py-2 ${errors.direccion ? 'border-red-500' : ''}`}
            />
            {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Estado</label>
            <select 
              name="estado" 
              value={form.estado} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className="w-full border rounded px-3 py-2"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          
          <div className="col-span-2 flex justify-end mt-6 gap-2">
            <button 
              type="button" 
              onClick={onCancel} 
              className="border border-gray-300 hover:bg-gray-100 px-6 py-2 rounded transition"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={() => { if (validate()) setStep(2); }} 
              className="bg-primary-dark hover:bg-primary text-white px-6 py-2 rounded transition"
              disabled={!isFormValid()}
            >
              Continuar
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="mt-4">
          {editingScheduling ? (
            <AddScheduling editing={editingScheduling} onAdd={handleSaveEditScheduling} onCancelEdit={handleCancelEditScheduling} />
          ) : (
            <AddScheduling onAdd={handleAddScheduling} />
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={onCancel} 
              className="border border-gray-300 hover:bg-gray-100 px-6 py-2 rounded transition"
            >
              Cancelar
            </button>
            <button 
              onClick={() => setStep(1)} 
              className="border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 rounded transition"
            >
              Atrás
            </button>
            <button 
              onClick={() => handleSubmit(new Event('submit'))} 
              className="bg-primary-dark hover:bg-primary text-white px-6 py-2 rounded transition"
            >
              Guardar todo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployee;