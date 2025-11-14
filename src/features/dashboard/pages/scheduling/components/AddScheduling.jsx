import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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

const AddScheduling = ({ onAdd, editing, onCancelEdit, employees = [] }) => {
  const [prog, setProg] = useState(initialProg);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [errors, setErrors] = useState({});

  console.log("[DEBUG] AddScheduling RENDER:");
  console.log("  - employees:", employees);
  console.log("  - employees.length:", employees.length);
  console.log("  - selectedEmployee:", selectedEmployee);

  // Efecto para manejar cambios en employees
  useEffect(() => {
    console.log("[DEBUG] useEffect [employees] triggered");
    console.log("  - employees.length:", employees.length);
    console.log("  - currentSelectedEmployee:", selectedEmployee);
    
    // Solo auto-seleccionar si hay empleados Y no hay uno seleccionado
    if (employees && employees.length > 0 && !selectedEmployee) {
      const firstId = String(employees[0].id);
      console.log("  - Auto-selecting first employee ID:", firstId);
      setSelectedEmployee(firstId);
    }
  }, [employees]); // Removí selectedEmployee de las dependencias para evitar loops

  // Efecto para manejar el modo de edición
  useEffect(() => {
    console.log("[DEBUG] useEffect [editing] triggered");
    if (editing) {
      console.log("  - Editing mode:", editing);
      setProg(editing);
      if (editing.empleadoId) {
        setSelectedEmployee(String(editing.empleadoId));
      }
    } else {
      setProg(initialProg);
      // En modo agregar, auto-seleccionar si hay empleados
      if (employees && employees.length > 0) {
        setSelectedEmployee(String(employees[0].id));
      }
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
      case 'empleado':
        if (!value || value === '') {
          fieldErrors.empleado = 'Selecciona un empleado';
        }
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
      setErrors(prev => {
        const newErrors = { ...prev };
        if (diasErrors.dias) {
          newErrors.dias = diasErrors.dias;
        } else {
          delete newErrors.dias;
        }
        return newErrors;
      });
    } else {
      setProg((prev) => ({ ...prev, [name]: value }));
      
      const fieldErrors = validateField(name, value);
      setErrors(prev => {
        const newErrors = { ...prev };
        // Agregar nuevos errores o limpiar si el campo es válido
        Object.keys(fieldErrors).forEach(key => {
          if (fieldErrors[key]) {
            newErrors[key] = fieldErrors[key];
          } else {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
  };

  const handleEmployeeChange = (e) => {
    const value = e.target.value;
    console.log("[DEBUG] handleEmployeeChange:");
    console.log("  - New value:", value);
    console.log("  - Type:", typeof value);
    setSelectedEmployee(value);
    
    const empleadoErrors = validateField('empleado', value);
    setErrors(prev => {
      const newErrors = { ...prev };
      // Agregar nuevos errores o limpiar si el campo es válido
      Object.keys(empleadoErrors).forEach(key => {
        if (empleadoErrors[key]) {
          newErrors[key] = empleadoErrors[key];
        } else {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const handleAddEvent = (e) => {
    e.preventDefault();

    console.log("[DEBUG] ========== FORM SUBMIT ==========");
    console.log("  - selectedEmployee:", selectedEmployee);
    console.log("  - prog:", prog);
    console.log("  - employees:", employees);

    // Validación completa del formulario
    const formErrors = validateSchedulingForm(prog);

    // Validar empleado
    if (!selectedEmployee || selectedEmployee === '' || selectedEmployee === 'undefined') {
      formErrors.empleado = 'Debes seleccionar un empleado';
      console.error("[DEBUG] Employee validation FAILED");
    }

    // Validar días
    if (!prog.dias || prog.dias.length === 0) {
      formErrors.dias = 'Debes seleccionar al menos un día';
      console.error("[DEBUG] Days validation FAILED");
    }

    console.log("[DEBUG] Form errors:", formErrors);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Convertir a número
    const empleadoIdNumber = parseInt(selectedEmployee, 10);
    
    if (isNaN(empleadoIdNumber)) {
      toast.error('ID de empleado inválido');
      console.error("[DEBUG] parseInt FAILED - selectedEmployee:", selectedEmployee);
      return;
    }

    const schedulingData = {
      empleadoId: empleadoIdNumber,
      fechaInicio: prog.fechaInicio,
      fechaFin: prog.fechaFin,
      horaInicio: prog.horaInicio,
      horaFin: prog.horaFin,
      dias: prog.dias,
    };

    console.log("[DEBUG] Sending schedulingData:", schedulingData);

    if (onAdd) {
      onAdd(schedulingData);
      // Reset después de agregar
      setProg(initialProg);
      if (employees && employees.length > 0) {
        setSelectedEmployee(String(employees[0].id));
      } else {
        setSelectedEmployee('');
      }
      setErrors({});
    }
  };

  return (
    <div>
      <form onSubmit={handleAddEvent}>
        <div className="flex flex-wrap gap-6 items-end">
          {employees && employees.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Empleado <span className="text-red-500">*</span>
              </label>
              <select 
                name="empleadoId" 
                value={selectedEmployee} 
                onChange={handleEmployeeChange} 
                className="border rounded px-3 py-2 w-40"
                required
              >
                <option value="">Selecciona un empleado</option>
                {employees.map(emp => (
                  <option key={emp.id} value={String(emp.id)}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
              {errors.empleado && <p className="text-red-500 text-xs mt-1">{errors.empleado}</p>}
              {/* Debug info - remover después */}
              <p className="text-xs text-gray-500 mt-1">
                Seleccionado ID: {selectedEmployee || 'Ninguno'}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Empleado</label>
              <input 
                type="text" 
                value="No hay empleados disponibles" 
                disabled 
                className="border rounded px-3 py-2 w-40 bg-gray-100 text-red-500" 
              />
              <p className="text-xs text-red-500 mt-1">
                DEBUG: employees.length = {employees ? employees.length : 'undefined'}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Fecha inicio <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="fechaInicio" 
              value={prog.fechaInicio} 
              onChange={handleProgChange} 
              className="border rounded px-3 py-2 w-32"
              required
            />
            {errors.fechaInicio && <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Fecha fin <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="fechaFin" 
              value={prog.fechaFin} 
              onChange={handleProgChange} 
              className="border rounded px-3 py-2 w-32"
              required
            />
            {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-6 mb-4">
          {diasSemana.map(dia => (
            <label key={dia} className="flex items-center gap-1 text-text-main text-sm">
              <input
                type="checkbox"
                value={dia}
                checked={prog.dias.includes(dia)}
                onChange={handleProgChange}
                className="accent-primary"
              /> {dia}
            </label>
          ))}
          {errors.dias && <p className="text-red-500 text-xs w-full mt-1">{errors.dias}</p>}
        </div>
        <div className="flex flex-wrap items-end gap-4 mt-2">
          <div className="flex items-center gap-2">
            <select name="horaInicio" value={prog.horaInicio} onChange={handleProgChange} className="border rounded px-3 py-2">
              {horas.map(h => <option key={`inicio-${h}`} value={h}>{h}</option>)}
            </select>
            <span className="mx-1">-</span>
            <select name="horaFin" value={prog.horaFin} onChange={handleProgChange} className="border rounded px-3 py-2">
              {horas.map(h => <option key={`fin-${h}`} value={h}>{h}</option>)}
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
              className="bg-primary-dark text-white px-8 py-2 rounded font-semibold hover:bg-primary transition shadow disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!employees || employees.length === 0}
            >
              {editing ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddScheduling;