import React, { useState, useEffect } from 'react';

const AddNovedadModal = ({ programaciones, onSave, onCancel, editing = null }) => {
  const [form, setForm] = useState({
    id_programacion_recurrente: '',
    fecha: '',
    tipo: 'Ausencia',
    motivo: '',
    hora_entrada_nueva: '',
    hora_salida_nueva: ''
  });
  const [errors, setErrors] = useState({});
  const [programacionSeleccionada, setProgramacionSeleccionada] = useState(null);

  useEffect(() => {
    if (editing) {
      setForm({
        id_programacion_recurrente: editing.id_programacion_recurrente,
        fecha: editing.fecha,
        tipo: editing.tipo,
        motivo: editing.motivo || '',
        hora_entrada_nueva: editing.hora_entrada_nueva || '',
        hora_salida_nueva: editing.hora_salida_nueva || ''
      });
      const prog = programaciones.find(p => p.id === editing.id_programacion_recurrente);
      setProgramacionSeleccionada(prog);
    }
  }, [editing, programaciones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambia la programación, actualizar la referencia
    if (name === 'id_programacion_recurrente') {
      const prog = programaciones.find(p => p.id === parseInt(value));
      setProgramacionSeleccionada(prog);
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

    if (!form.id_programacion_recurrente) {
      newErrors.id_programacion_recurrente = 'Debes seleccionar una programación';
    }

    if (!form.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!form.tipo) {
      newErrors.tipo = 'El tipo es requerido';
    }

    // Validaciones específicas para Cambio_Horario
    if (form.tipo === 'Cambio_Horario') {
      if (!form.hora_entrada_nueva && !form.hora_salida_nueva) {
        newErrors.hora_entrada_nueva = 'Debes especificar al menos una hora nueva (entrada o salida)';
      }

      if (form.hora_entrada_nueva && form.hora_salida_nueva) {
        const entrada = new Date(`2000-01-01T${form.hora_entrada_nueva}`);
        const salida = new Date(`2000-01-01T${form.hora_salida_nueva}`);
        if (salida <= entrada) {
          newErrors.hora_salida_nueva = 'La hora de salida debe ser mayor que la de entrada';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      id_programacion_recurrente: parseInt(form.id_programacion_recurrente),
      fecha: form.fecha,
      tipo: form.tipo,
      motivo: form.motivo || null,
      hora_entrada_nueva: form.tipo === 'Cambio_Horario' ? (form.hora_entrada_nueva || null) : null,
      hora_salida_nueva: form.tipo === 'Cambio_Horario' ? (form.hora_salida_nueva || null) : null
    };

    onSave(data);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold text-lg mb-4">
        {editing ? 'Editar Novedad' : 'Nueva Novedad'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Programación Recurrente <span className="text-red-500">*</span>
          </label>
          <select
            name="id_programacion_recurrente"
            value={form.id_programacion_recurrente}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${errors.id_programacion_recurrente ? 'border-red-500' : ''}`}
            required
            disabled={!!editing}
          >
            <option value="">Selecciona una programación</option>
            {programaciones.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.hora_entrada} - {prog.hora_salida} | 
                Días: {prog.dias_semana.map(d => {
                  const diasMap = {0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb'};
                  return diasMap[d] || d;
                }).join(', ')}
              </option>
            ))}
          </select>
          {errors.id_programacion_recurrente && (
            <p className="text-red-500 text-xs mt-1">{errors.id_programacion_recurrente}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${errors.fecha ? 'border-red-500' : ''}`}
            required
          />
          {errors.fecha && (
            <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo <span className="text-red-500">*</span>
          </label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="Ausencia">Ausencia</option>
            <option value="Cambio_Horario">Cambio de Horario</option>
            <option value="Suspension">Suspensión</option>
          </select>
        </div>

        {form.tipo === 'Cambio_Horario' && programacionSeleccionada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium mb-2">Horario Original:</p>
            <p className="text-sm">
              Entrada: {programacionSeleccionada.hora_entrada} | 
              Salida: {programacionSeleccionada.hora_salida}
            </p>
          </div>
        )}

        {form.tipo === 'Cambio_Horario' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nueva Hora de Entrada
              </label>
              <input
                type="time"
                name="hora_entrada_nueva"
                value={form.hora_entrada_nueva}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.hora_entrada_nueva ? 'border-red-500' : ''}`}
                placeholder={programacionSeleccionada?.hora_entrada}
              />
              {errors.hora_entrada_nueva && (
                <p className="text-red-500 text-xs mt-1">{errors.hora_entrada_nueva}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Dejar vacío para mantener la original
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nueva Hora de Salida
              </label>
              <input
                type="time"
                name="hora_salida_nueva"
                value={form.hora_salida_nueva}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.hora_salida_nueva ? 'border-red-500' : ''}`}
                placeholder={programacionSeleccionada?.hora_salida}
              />
              {errors.hora_salida_nueva && (
                <p className="text-red-500 text-xs mt-1">{errors.hora_salida_nueva}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Dejar vacío para mantener la original
              </p>
            </div>
          </div>
        )}

        {form.tipo === 'Cambio_Horario' && (form.hora_entrada_nueva || form.hora_salida_nueva) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">Horario Resultante:</p>
            <p className="text-sm">
              Entrada: {form.hora_entrada_nueva || programacionSeleccionada?.hora_entrada || 'N/A'} | 
              Salida: {form.hora_salida_nueva || programacionSeleccionada?.hora_salida || 'N/A'}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Motivo</label>
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded px-3 py-2"
            placeholder="Describe el motivo de la novedad..."
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
            {editing ? 'Actualizar' : 'Crear'} Novedad
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNovedadModal;






