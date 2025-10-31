import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
    <div className="border border-gray-200 rounded-lg p-4 mt-4 bg-gray-50">
      <h3 className="text-md font-semibold text-text-main mb-3">
        {editing ? 'Editar Programación' : 'Agregar Programación'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Fecha inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={prog.fechaInicio}
              onChange={handleProgChange}
              onBlur={handleBlur}
              className={`w-full border rounded px-3 py-2 ${errors.fechaInicio ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.fechaInicio && <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Fecha fin</label>
            <input
              type="date"
              name="fechaFin"
              value={prog.fechaFin}
              onChange={handleProgChange}
              onBlur={handleBlur}
              className={`w-full border rounded px-3 py-2 ${errors.fechaFin ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-2">Días de la semana</label>
            <div className="flex flex-wrap gap-3">
              {diasSemana.map(dia => (
                <label key={dia} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="dias"
                    value={dia}
                    checked={prog.dias.includes(dia)}
                    onChange={handleProgChange}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{dia}</span>
                </label>
              ))}
            </div>
            {errors.dias && <p className="text-red-500 text-xs mt-1">{errors.dias}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-2">Horario</label>
            <div className="flex items-center gap-2">
              <select
                name="horaInicio"
                value={prog.horaInicio}
                onChange={handleProgChange}
                onBlur={handleBlur}
                className={`border rounded px-3 py-2 ${errors.horaInicio ? 'border-red-500' : 'border-gray-300'}`}
              >
                {horas.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-gray-500">-</span>
              <select
                name="horaFin"
                value={prog.horaFin}
                onChange={handleProgChange}
                onBlur={handleBlur}
                className={`border rounded px-3 py-2 ${errors.horaFin ? 'border-red-500' : 'border-gray-300'}`}
              >
                {horas.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-1">
              {errors.horaInicio && <p className="text-red-500 text-xs">{errors.horaInicio}</p>}
              {errors.horaFin && <p className="text-red-500 text-xs">{errors.horaFin}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {editing && (
            <button 
              type="button" 
              onClick={onCancelEdit} 
              className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded transition"
            >
              Cancelar edición
            </button>
          )}
          <button 
            type="submit" 
            className="bg-primary-dark hover:bg-primary text-white px-6 py-2 rounded transition"
          >
            {editing ? 'Guardar cambios' : 'Agregar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddScheduling;