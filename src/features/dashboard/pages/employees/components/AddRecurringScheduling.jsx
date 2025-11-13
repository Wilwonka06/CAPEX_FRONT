import React, { useState, useEffect } from 'react';

const diasSemanaOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

const AddRecurringScheduling = ({ onSave, onCancel, empleadoId, editing = null }) => {
  const [form, setForm] = useState({
    hora_entrada: '08:00',
    hora_salida: '18:00',
    dias_semana: [],
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    estado: 'Activa',
    observaciones: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) {
      setForm({
        hora_entrada: editing.hora_entrada || '08:00',
        hora_salida: editing.hora_salida || '18:00',
        dias_semana: editing.dias_semana || [],
        fecha_inicio: editing.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_fin: editing.fecha_fin || '',
        estado: editing.estado || 'Activa',
        observaciones: editing.observaciones || ''
      });
    }
  }, [editing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const dias = form.dias_semana;
      const diaValue = parseInt(value);
      
      if (checked) {
        setForm(prev => ({
          ...prev,
          dias_semana: [...dias, diaValue]
        }));
      } else {
        setForm(prev => ({
          ...prev,
          dias_semana: dias.filter(d => d !== diaValue)
        }));
      }
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.hora_entrada) {
      newErrors.hora_entrada = 'La hora de entrada es requerida';
    }

    if (!form.hora_salida) {
      newErrors.hora_salida = 'La hora de salida es requerida';
    }

    if (form.hora_entrada && form.hora_salida) {
      const entrada = new Date(`2000-01-01T${form.hora_entrada}`);
      const salida = new Date(`2000-01-01T${form.hora_salida}`);
      if (salida <= entrada) {
        newErrors.hora_salida = 'La hora de salida debe ser mayor que la de entrada';
      }
    }

    if (form.dias_semana.length === 0) {
      newErrors.dias_semana = 'Debes seleccionar al menos un día de la semana';
    }

    if (!form.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (form.fecha_fin && form.fecha_inicio) {
      const inicio = new Date(form.fecha_inicio);
      const fin = new Date(form.fecha_fin);
      if (fin < inicio) {
        newErrors.fecha_fin = 'La fecha de fin debe ser mayor o igual a la de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...form,
      id_usuario: empleadoId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-semibold text-lg mb-4">
        {editing ? 'Editar Programación Recurrente' : 'Nueva Programación Recurrente'}
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Hora de Entrada <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="hora_entrada"
            value={form.hora_entrada}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${errors.hora_entrada ? 'border-red-500' : ''}`}
            required
          />
          {errors.hora_entrada && (
            <p className="text-red-500 text-xs mt-1">{errors.hora_entrada}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Hora de Salida <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="hora_salida"
            value={form.hora_salida}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${errors.hora_salida ? 'border-red-500' : ''}`}
            required
          />
          {errors.hora_salida && (
            <p className="text-red-500 text-xs mt-1">{errors.hora_salida}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Días de la Semana <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {diasSemanaOptions.map((dia) => (
            <label key={dia.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                value={dia.value}
                checked={form.dias_semana.includes(dia.value)}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-sm">{dia.label}</span>
            </label>
          ))}
        </div>
        {errors.dias_semana && (
          <p className="text-red-500 text-xs mt-1">{errors.dias_semana}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha de Inicio <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${errors.fecha_inicio ? 'border-red-500' : ''}`}
            required
          />
          {errors.fecha_inicio && (
            <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha de Fin (Opcional)
          </label>
          <input
            type="date"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${errors.fecha_fin ? 'border-red-500' : ''}`}
          />
          {errors.fecha_fin && (
            <p className="text-red-500 text-xs mt-1">{errors.fecha_fin}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Dejar vacío para programación indefinida
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estado</label>
        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="Activa">Activa</option>
          <option value="Inactiva">Inactiva</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Observaciones</label>
        <textarea
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
          rows="3"
          className="w-full border rounded px-3 py-2"
          placeholder="Notas adicionales sobre esta programación..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-primary-dark hover:bg-primary text-white px-4 py-2 rounded transition"
        >
          {editing ? 'Actualizar' : 'Crear'} Programación
        </button>
      </div>
    </form>
  );
};

export default AddRecurringScheduling;






