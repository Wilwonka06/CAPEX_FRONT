import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  validateSchedulingForm,
  validateSchedulingStartDate,
  validateSchedulingEndDate,
  validateSchedulingStartTime,
  validateSchedulingEndTime,
} from '../../../../../shared/validations';

const horas = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const diasSemana = [
  'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'
];

const initialProg = {
  fechaInicio: '',
  fechaFin: '',
  dias: [],
  horaInicio: '08:00',
  horaFin: '09:00',
};

const AddScheduling = ({ onAdd, editing, onCancelEdit, empleado }) => {
  const [prog, setProg] = useState(initialProg);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) {
      setProg(editing);
    } else {
      setProg(initialProg);
    }
  }, [editing]);

  const handleProgChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'dias') {
      const cleanValue = value.trim();
      const newDias = checked
        ? [...prog.dias, cleanValue]
        : prog.dias.filter((d) => d !== cleanValue);
      setProg({ ...prog, dias: newDias });
    } else {
      setProg({ ...prog, [name]: value });
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
      case 'fechaInicio':
        const fechaInicioErrors = validateSchedulingStartDate(value);
        error = fechaInicioErrors.fechaInicio || '';
        break;
      case 'fechaFin':
        const fechaFinErrors = validateSchedulingEndDate(value, prog.fechaInicio);
        error = fechaFinErrors.fechaFin || '';
        break;
      case 'horaInicio':
        const horaInicioErrors = validateSchedulingStartTime(value);
        error = horaInicioErrors.horaInicio || '';
        break;
      case 'horaFin':
        const horaFinErrors = validateSchedulingEndTime(value, prog.horaInicio);
        error = horaFinErrors.horaFin || '';
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

  const validate = () => {
    const newErrors = validateSchedulingForm(prog);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const diasLimpios = prog.dias.map(d => d.trim());

    const nuevaProg = {
      ...prog,
      dias: diasLimpios,
      empleadoId: empleado?.id || null,
      id: editing?.id || Date.now().toString(),
    };

    console.log('✅ PROG GUARDADO:', nuevaProg);

    onAdd(nuevaProg);
    if (!editing) {
      setProg(initialProg);
    }
    setErrors({});
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-nunito mb-2 flex items-center gap-2">
          <i className={`bi ${editing ? 'bi-pencil-square text-[#FACC15]' : 'bi-plus-circle text-[#FACC15]'}`}></i>
          {editing ? 'Editar Programación' : 'Agregar Nueva Programación'}
        </h3>
        <p className="text-gray-600 font-lato">Configura el horario de trabajo del empleado</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
              <i className="bi bi-calendar-event text-[#FACC15]"></i>
              Fecha de Inicio *
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={prog.fechaInicio}
              onChange={handleProgChange}
              onBlur={handleBlur}
              className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                errors.fechaInicio ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.fechaInicio && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.fechaInicio}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
              <i className="bi bi-calendar-check text-[#FACC15]"></i>
              Fecha de Fin *
            </label>
            <input
              type="date"
              name="fechaFin"
              value={prog.fechaFin}
              onChange={handleProgChange}
              onBlur={handleBlur}
              className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all font-lato ${
                errors.fechaFin ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.fechaFin && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.fechaFin}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
            <i className="bi bi-calendar-week text-[#FACC15]"></i>
            Días de la Semana *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {diasSemana.map(dia => (
              <label key={dia} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-[#FACC15] hover:bg-yellow-50 transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  name="dias"
                  value={dia}
                  checked={prog.dias.includes(dia)}
                  onChange={handleProgChange}
                  className="w-5 h-5 text-[#FACC15] focus:ring-[#FACC15] border-2 border-gray-300 rounded focus:ring-2 transition-all"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">{dia}</span>
              </label>
            ))}
          </div>
          {errors.dias && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.dias}</p>}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
            <i className="bi bi-clock text-[#FACC15]"></i>
            Horario de Trabajo *
          </label>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Desde:</span>
              <select
                name="horaInicio"
                value={prog.horaInicio}
                onChange={handleProgChange}
                onBlur={handleBlur}
                className={`border-2 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all ${
                  errors.horaInicio ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {horas.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <i className="bi bi-arrow-right text-gray-400"></i>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Hasta:</span>
              <select
                name="horaFin"
                value={prog.horaFin}
                onChange={handleProgChange}
                onBlur={handleBlur}
                className={`border-2 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all ${
                  errors.horaFin ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {horas.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            {errors.horaInicio && <p className="text-red-500 text-sm flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.horaInicio}</p>}
            {errors.horaFin && <p className="text-red-500 text-sm flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i>{errors.horaFin}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {editing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold font-lato flex items-center gap-2"
            >
              <i className="bi bi-x-lg"></i>
              Cancelar Edición
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 font-semibold font-lato flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <i className={`bi ${editing ? 'bi-check-circle' : 'bi-plus-circle'}`}></i>
            {editing ? 'Guardar Cambios' : 'Agregar Programación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddScheduling;