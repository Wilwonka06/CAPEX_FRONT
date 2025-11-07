import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  validateSchedulingForm,
  validateSchedulingStartDate,
  validateSchedulingEndDate,
  validateSchedulingStartTime,
  validateSchedulingEndTime,
  validateSchedulingDays
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

const EditScheduling = ({ onSave, editing, onCancelEdit }) => {
  const [prog, setProg] = useState(initialProg);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) {
      console.log('[EditScheduling] Editing data received:', editing);
      
      // Convertir formato API a formato formulario
      setProg({
        fechaInicio: editing.fechaInicio || editing.fecha_inicio || editing.fecha || '',
        fechaFin: editing.fechaFin || editing.fecha_inicio || editing.fecha || '',
        dias: editing.dias || [],
        horaInicio: editing.horaInicio || editing.hora_entrada || '08:00',
        horaFin: editing.horaFin || editing.hora_salida || '09:00',
      });
    } else {
      setProg(initialProg);
    }
    setErrors({});
  }, [editing]);

  const validateField = (field, value) => {
    let fieldErrors = {};

    switch (field) {
      case 'fechaInicio':
        fieldErrors = validateSchedulingStartDate(value);
        break;
      case 'fechaFin':
        fieldErrors = validateSchedulingEndDate(value, prog.fechaInicio);
        break;
      case 'horaInicio':
        fieldErrors = validateSchedulingStartTime(value);
        break;
      case 'horaFin':
        fieldErrors = validateSchedulingEndTime(value, prog.horaInicio);
        break;
      case 'dias':
        fieldErrors = validateSchedulingDays(prog.dias, value);
        break;
      default:
        break;
    }

    return fieldErrors;
  };

  const handleProgChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const newDias = checked
        ? [...prog.dias, value]
        : prog.dias.filter((d) => d !== value);
      
      setProg((prev) => ({ ...prev, dias: newDias }));
      
      const diasErrors = validateSchedulingDays(newDias);
      setErrors(prev => ({
        ...prev,
        dias: diasErrors.dias || null
      }));
    } else {
      setProg((prev) => ({ ...prev, [name]: value }));
      
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  };

  const handleEditEvent = (e) => {
    e.preventDefault();
    
    console.log('[EditScheduling] handleEditEvent - prog:', prog);
    console.log('[EditScheduling] handleEditEvent - editing:', editing);
    
    // Validación completa del formulario (sin validar días ya que no se usan en edición individual)
    const formErrors = {};
    
    // Validar fecha inicio
    if (!prog.fechaInicio) {
      formErrors.fechaInicio = 'La fecha de inicio es requerida';
    }
    
    // Validar horas
    if (!prog.horaInicio) {
      formErrors.horaInicio = 'La hora de inicio es requerida';
    }
    
    if (!prog.horaFin) {
      formErrors.horaFin = 'La hora de fin es requerida';
    }
    
    // Validar que hora fin sea mayor que hora inicio
    if (prog.horaInicio && prog.horaFin && prog.horaInicio >= prog.horaFin) {
      formErrors.horaFin = 'La hora de fin debe ser mayor a la hora de inicio';
    }
    
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      // Crear datos en formato API
      const schedulingData = {
        id: editing.id,
        id_usuario: editing.empleadoId || editing.id_usuario,
        fecha_inicio: prog.fechaInicio,
        hora_entrada: prog.horaInicio,
        hora_salida: prog.horaFin,
        // Campos adicionales para compatibilidad
        empleadoId: editing.empleadoId || editing.id_usuario,
        fechaInicio: prog.fechaInicio,
        horaInicio: prog.horaInicio,
        horaFin: prog.horaFin,
      };

      console.log('[EditScheduling] Sending schedulingData:', schedulingData);

      if (onSave) {
        onSave(schedulingData);
        toast.success('Programación actualizada correctamente');
      }
      setErrors({});
    } else {
      toast.error('Por favor corrige los errores en el formulario');
    }
  };

  return (
    <div>
      <form onSubmit={handleEditEvent}>
        <div className="flex flex-wrap gap-6 items-end mb-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={prog.fechaInicio}
              onChange={handleProgChange}
              className={`border rounded px-3 py-2 w-40 ${errors.fechaInicio ? 'border-red-500' : ''}`}
              required
            />
            {errors.fechaInicio && (
              <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Horario <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                name="horaInicio"
                value={prog.horaInicio}
                onChange={handleProgChange}
                className={`border rounded px-3 py-2 ${errors.horaInicio ? 'border-red-500' : ''}`}
                required
              >
                {horas.map((h) => (
                  <option key={`inicio-${h}`} value={h}>{h}</option>
                ))}
              </select>
              <span className="mx-1">-</span>
              <select
                name="horaFin"
                value={prog.horaFin}
                onChange={handleProgChange}
                className={`border rounded px-3 py-2 ${errors.horaFin ? 'border-red-500' : ''}`}
                required
              >
                {horas.map((h) => (
                  <option key={`fin-${h}`} value={h}>{h}</option>
                ))}
              </select>
            </div>
            {errors.horaInicio && (
              <p className="text-red-500 text-xs mt-1">{errors.horaInicio}</p>
            )}
            {errors.horaFin && (
              <p className="text-red-500 text-xs mt-1">{errors.horaFin}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-primary-dark text-white px-8 py-2 rounded font-semibold hover:bg-primary transition shadow"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditScheduling;