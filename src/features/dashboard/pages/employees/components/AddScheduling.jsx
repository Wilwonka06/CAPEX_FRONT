import React, { useState, useEffect } from 'react';

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

const EMPLOYEES_KEY = 'capex_employees';

const AddScheduling = ({ onAdd, editing, onCancelEdit, empleado }) => {
  const [prog, setProg] = useState(initialProg);
  const [errors, setErrors] = useState({});

  // ✅ MIGRACIÓN OPCIONAL: para datos viejos
  useEffect(() => {
    const empleados = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
    let cambios = false;
    const empleadosMigrados = empleados.map(emp => {
      if (!Array.isArray(emp.schedulings)) return emp;
      const nuevasSchedulings = emp.schedulings.map(ev => {
        let newEv = { ...ev };
        if (!newEv.id) {
          newEv.id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
          cambios = true;
        }
        if (!newEv.idBase) {
          newEv.idBase = newEv.id;
          cambios = true;
        }
        return newEv;
      });
      return { ...emp, schedulings: nuevasSchedulings };
    });
    if (cambios) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(empleadosMigrados));
    }
  }, []);

  useEffect(() => {
    if (editing) {
      setProg(editing);
    } else {
      setProg(initialProg);
    }
  }, [editing]);

  const validate = () => {
    const newErrors = {};
    if (!prog.fechaInicio) newErrors.fechaInicio = 'Selecciona la fecha de inicio';
    if (!prog.fechaFin) newErrors.fechaFin = 'Selecciona la fecha de fin';
    if (!prog.horaInicio) newErrors.horaInicio = 'Selecciona la hora de inicio';
    if (!prog.horaFin) newErrors.horaFin = 'Selecciona la hora de fin';
    if (!prog.repeticion) newErrors.repeticion = 'Selecciona la frecuencia';
    if ((prog.repeticion === 'Semanal' || prog.repeticion === 'Mensual') && (!prog.dias || prog.dias.length === 0)) {
      newErrors.dias = 'Selecciona al menos un día';
    }
    if (prog.fechaInicio && prog.fechaFin && prog.fechaFin < prog.fechaInicio) {
      newErrors.fechaFin = 'La fecha fin no puede ser menor que la fecha inicio';
    }
    if (prog.horaInicio && prog.horaFin && prog.horaFin <= prog.horaInicio) {
      newErrors.horaFin = 'La hora fin debe ser mayor que la hora inicio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProgChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setProg((prev) => ({
        ...prev,
        dias: checked
          ? [...prev.dias, value]
          : prev.dias.filter((d) => d !== value),
      }));
    } else {
      setProg((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!validate()) return;

    let progWithIds = { ...prog };

    if (!progWithIds.id) {
      progWithIds.id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    }
    if (!progWithIds.idBase) {
      progWithIds.idBase = progWithIds.id;
    }

    // ✅ CLAVE: Guarda siempre el empleadoId correcto
    progWithIds.empleadoId = empleado.id;

    if (onAdd) onAdd(progWithIds);

    setProg(initialProg);
    setErrors({});
  };

  return (
    <div>
      <div className="mt-8 p-6 bg-gray-50 border border-accent-light rounded-lg">
        <form onSubmit={handleAddEvent}>
          <div className="flex flex-wrap gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Fecha inicio</label>
              <div className="flex items-center gap-2">
                <input type="date" name="fechaInicio" value={prog.fechaInicio} onChange={handleProgChange} className="border rounded px-3 py-2 w-32" />
                <i className="bi bi-calendar text-xl text-primary-dark"></i>
              </div>
              {errors.fechaInicio && <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Fecha fin</label>
              <div className="flex items-center gap-2">
                <input type="date" name="fechaFin" value={prog.fechaFin} onChange={handleProgChange} className="border rounded px-3 py-2 w-32" />
                <i className="bi bi-calendar text-xl text-primary-dark"></i>
              </div>
              {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>}
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-text-main mb-1">Repetición</label>
              <select name="repeticion" value={prog.repeticion} onChange={handleProgChange} className="border rounded px-3 py-2 w-full">
                <option>No se repite</option>
                <option>Semanal</option>
                <option>Mensual</option>
              </select>
              {errors.repeticion && <p className="text-red-500 text-xs mt-1">{errors.repeticion}</p>}
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
                {horas.map(h => <option key={h}>{h}</option>)}
              </select>
              <span className="mx-1">-</span>
              <select name="horaFin" value={prog.horaFin} onChange={handleProgChange} className="border rounded px-3 py-2">
                {horas.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex-1 flex justify-end gap-2">
              {editing && (
                <button type="button" onClick={onCancelEdit} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition">Cancelar edición</button>
              )}
              <button type="submit" className="bg-primary-dark text-white px-8 py-2 rounded font-semibold hover:bg-primary transition shadow">
                {editing ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduling;
