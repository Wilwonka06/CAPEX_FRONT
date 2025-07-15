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
      const cleanValue = value.trim();  // ⚡️ Normaliza espacios
      const newDias = checked
        ? [...prog.dias, cleanValue]
        : prog.dias.filter((d) => d !== cleanValue);
      setProg({ ...prog, dias: newDias });
    } else {
      setProg({ ...prog, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!prog.fechaInicio) newErrors.fechaInicio = 'Fecha inicio obligatoria';
    if (!prog.fechaFin) newErrors.fechaFin = 'Fecha fin obligatoria';
    if (!prog.horaInicio) newErrors.horaInicio = 'Hora inicio obligatoria';
    if (!prog.horaFin) newErrors.horaFin = 'Hora fin obligatoria';

    // Si tiene repetición semanal o mensual, debe tener días
    if ((prog.repeticion === 'Semanal' || prog.repeticion === 'Mensual') && prog.dias.length === 0) {
      newErrors.dias = 'Selecciona al menos un día';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const diasLimpios = prog.dias.map(d => d.trim());

    const nuevaProg = {
      ...prog,
      dias: diasLimpios,               // ⚡️ Guarda días limpios
      repeticion: prog.repeticion,
      empleadoId: empleado?.id || null,
      id: editing?.id || Date.now().toString(),
    };

    console.log('✅ PROG GUARDADO:', nuevaProg); // 📌 Te muestra la base que se guarda

    onAdd(nuevaProg);
    if (!editing) {
      setProg(initialProg);
    }
    setErrors({});
  };

  return (
    <div className="border border-accent-light rounded-md p-4 mt-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Fecha inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={prog.fechaInicio}
              onChange={handleProgChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.fechaInicio && <p className="text-red-500 text-xs">{errors.fechaInicio}</p>}
          </div>

          <div>
            <label>Fecha fin</label>
            <input
              type="date"
              name="fechaFin"
              value={prog.fechaFin}
              onChange={handleProgChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.fechaFin && <p className="text-red-500 text-xs">{errors.fechaFin}</p>}
          </div>

          <div className="md:col-span-2">
            <label>Repetición</label>
            <select
              name="repeticion"
              value={prog.repeticion}
              onChange={handleProgChange}
              className="w-full border rounded px-3 py-2"
            >
              <option>No se repite</option>
              <option>Semanal</option>
              <option>Mensual</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-4 mt-2">
              {diasSemana.map(dia => (
                <label key={dia} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="dias"
                    value={dia}
                    checked={prog.dias.includes(dia)}
                    onChange={handleProgChange}
                  />
                  {dia}
                </label>
              ))}
            </div>
            {errors.dias && <p className="text-red-500 text-xs">{errors.dias}</p>}
          </div>

          <div className="flex items-center gap-2 md:col-span-2 mt-2">
            <select
              name="horaInicio"
              value={prog.horaInicio}
              onChange={handleProgChange}
              className="border rounded px-3 py-2"
            >
              {horas.map(h => <option key={h}>{h}</option>)}
            </select>
            <span>-</span>
            <select
              name="horaFin"
              value={prog.horaFin}
              onChange={handleProgChange}
              className="border rounded px-3 py-2"
            >
              {horas.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          {editing && (
            <button type="button" onClick={onCancelEdit} className="bg-gray-200 px-4 py-2 rounded">
              Cancelar edición
            </button>
          )}
          <button type="submit" className="bg-primary-dark text-white px-8 py-2 rounded">
            {editing ? 'Guardar cambios' : 'Agregar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddScheduling;
