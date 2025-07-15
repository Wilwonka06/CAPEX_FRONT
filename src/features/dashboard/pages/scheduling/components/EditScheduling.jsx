import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  validateSchedulingForm,
  validateSchedulingStartDate,
  validateSchedulingEndDate,
  validateSchedulingStartTime,
  validateSchedulingEndTime,
  validateSchedulingRepetition,
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
  repeticion: 'No se repite',
  dias: [],
  horaInicio: '08:00',
  horaFin: '09:00',
};

const EditScheduling = ({ onSave, editing, onCancelEdit }) => {
  const [prog, setProg] = useState(initialProg);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) {
      setProg(editing);
    } else {
      setProg(initialProg);
    }
    setErrors({});
  }, [editing]);

  // Validación en tiempo real
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
      case 'repeticion':
        fieldErrors = validateSchedulingRepetition(value);
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
      
      // Validar días cuando cambian
      const diasErrors = validateSchedulingDays(newDias, prog.repeticion);
      setErrors(prev => ({
        ...prev,
        dias: diasErrors.dias || null
      }));
    } else {
      setProg((prev) => ({ ...prev, [name]: value }));
      
      // Validar campo específico en tiempo real
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  };

  const handleEditEvent = (e) => {
    e.preventDefault();
    
    // Validación completa del formulario
    const formErrors = validateSchedulingForm(prog);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      let progToSave = { ...prog };

      if (editing && editing.id) progToSave.id = editing.id;
      if (editing && editing.idBase) progToSave.idBase = editing.idBase;

      // ✅ CLAVE: Conserva el empleadoId original
      progToSave.empleadoId = editing.empleadoId;

      if (onSave) onSave(progToSave);
      setErrors({});
      toast.success('Programación actualizada exitosamente!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleEditEvent}>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Fecha inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={prog.fechaInicio}
              onChange={handleProgChange}
              className="border rounded px-3 py-2 w-32"
            />
            {errors.fechaInicio && (
              <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Fecha fin</label>
            <input
              type="date"
              name="fechaFin"
              value={prog.fechaFin}
              onChange={handleProgChange}
              className="border rounded px-3 py-2 w-32"
            />
            {errors.fechaFin && (
              <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>
            )}
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-text-main mb-1">Repetición</label>
            <select
              name="repeticion"
              value={prog.repeticion}
              onChange={handleProgChange}
              className="border rounded px-3 py-2 w-full"
            >
              <option>No se repite</option>
              <option>Semanal</option>
              <option>Mensual</option>
            </select>
            {errors.repeticion && (
              <p className="text-red-500 text-xs mt-1">{errors.repeticion}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-6 mb-4">
          {diasSemana.map((dia) => (
            <label
              key={dia}
              className="flex items-center gap-1 text-text-main text-sm"
            >
              <input
                type="checkbox"
                value={dia}
                checked={prog.dias.includes(dia)}
                onChange={handleProgChange}
                className="accent-primary"
              />{' '}
              {dia}
            </label>
          ))}
          {errors.dias && (
            <p className="text-red-500 text-xs w-full mt-1">{errors.dias}</p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4 mt-2">
          <div className="flex items-center gap-2">
            <select
              name="horaInicio"
              value={prog.horaInicio}
              onChange={handleProgChange}
              className="border rounded px-3 py-2"
            >
              {horas.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
            <span className="mx-1">-</span>
            <select
              name="horaFin"
              value={prog.horaFin}
              onChange={handleProgChange}
              className="border rounded px-3 py-2"
            >
              {horas.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex justify-end gap-2">
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
        </div>
      </form>
    </div>
  );
};

export default EditScheduling;
