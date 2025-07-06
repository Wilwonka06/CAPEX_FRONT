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

const AddScheduling = ({ onAdd, editing, onCancelEdit }) => {
  const [prog, setProg] = useState(initialProg);

  useEffect(() => {
    if (editing) {
      setProg(editing);
    } else {
      setProg(initialProg);
    }
  }, [editing]);

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
    if (!prog.fechaInicio || !prog.horaInicio || !prog.horaFin) return;
    if (onAdd) onAdd(prog);
    setProg(initialProg);
  };

  return (
    <div>
      <form onSubmit={handleAddEvent}>
        <div className="flex flex-wrap gap-6 items-end">
          {/* Fechas */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Fecha inicio</label>
            <input type="date" name="fechaInicio" value={prog.fechaInicio} onChange={handleProgChange} className="border rounded px-3 py-2 w-32" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Fecha fin</label>
            <input type="date" name="fechaFin" value={prog.fechaFin} onChange={handleProgChange} className="border rounded px-3 py-2 w-32" />
          </div>
          {/* Selector de repetición */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-text-main mb-1">Repetición</label>
            <select name="repeticion" value={prog.repeticion} onChange={handleProgChange} className="border rounded px-3 py-2 w-full">
              <option>No se repite</option>
              <option>Semanal</option>
              <option>Mensual</option>
            </select>
          </div>
        </div>
        {/* Días de la semana */}
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
        </div>
        {/* Horario y botón */}
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
            <button type="button" onClick={onCancelEdit} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition">Cancelar</button>
            <button type="submit" className="bg-primary-dark text-white px-8 py-2 rounded font-semibold hover:bg-primary transition shadow">
              {editing ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddScheduling; 