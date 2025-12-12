import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HOURS_12, to24h, to12h } from '../../../../../shared/utils/timeFormat';

const diasSemanaOptions = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

const EditScheduling = ({ scheduling, onUpdate, isOpen: externalOpen = undefined, onClose: externalOnClose }) => {
  const [open, setOpen] = useState(false);
  // Calcular fecha mínima (día siguiente)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({
    id_usuario: '',
    bloques_horarios: [
      { inicio: '09:00 AM', fin: '12:00 PM' },
      { inicio: '01:00 PM', fin: '05:00 PM' }
    ],
    dias_semana: [1, 2, 3, 4, 5, 6],
    fecha_inicio: minDate,
    fecha_fin: '',
    estado: 'Activa',
    observaciones: ''
  });
  const [errors, setErrors] = useState({});

  const modalOpen = externalOpen !== undefined ? externalOpen : open;

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setErrors({});
    if (externalOnClose) externalOnClose();
  };

  useEffect(() => {
    if (scheduling && modalOpen) {
      setForm({
        id_usuario: scheduling.id_usuario || '',
        bloques_horarios: scheduling.bloques_horarios?.map(b => ({
          inicio: to12h(b.inicio),
          fin: to12h(b.fin)
        })) || [{ inicio: '09:00 AM', fin: '05:00 PM' }],
        dias_semana: scheduling.dias_semana || [],
        fecha_inicio: scheduling.fecha_inicio || minDate,
        fecha_fin: scheduling.fecha_fin || '',
        estado: scheduling.estado || 'Activa',
        observaciones: scheduling.observaciones || ''
      });
    }
  }, [scheduling, minDate, modalOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const dias = form.dias_semana;
      const diaValue = parseInt(value);
      
      if (checked) {
        setForm(prev => ({
          ...prev,
          dias_semana: [...dias, diaValue].sort()
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

  const handleBlockChange = (index, field, value) => {
    const newBlocks = [...form.bloques_horarios];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setForm(prev => ({ ...prev, bloques_horarios: newBlocks }));

    // Limpiar errores de bloques
    if (errors.bloques_horarios) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.bloques_horarios;
        return newErrors;
      });
    }
  };

  const addBlock = () => {
    setForm(prev => ({
      ...prev,
      bloques_horarios: [
        ...prev.bloques_horarios,
        { inicio: '01:00 PM', fin: '05:00 PM' }
      ]
    }));
  };

  const removeBlock = (index) => {
    if (form.bloques_horarios.length <= 1) {
      setErrors(prev => ({
        ...prev,
        bloques_horarios: 'Debe haber al menos un bloque horario'
      }));
      return;
    }
    
    setForm(prev => ({
      ...prev,
      bloques_horarios: prev.bloques_horarios.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Validar bloques
    if (!form.bloques_horarios || form.bloques_horarios.length === 0) {
      newErrors.bloques_horarios = 'Debe haber al menos un bloque horario';
    } else {
      // Validar cada bloque
      for (let i = 0; i < form.bloques_horarios.length; i++) {
        const bloque = form.bloques_horarios[i];
        if (!bloque.inicio || !bloque.fin) {
          newErrors.bloques_horarios = `El bloque ${i + 1} debe tener inicio y fin`;
          break;
        }

        // Convertir a minutos para comparar
        const inicioMin = to24h(bloque.inicio).split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
        const finMin = to24h(bloque.fin).split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));

        if (finMin <= inicioMin) {
          newErrors.bloques_horarios = `En el bloque ${i + 1}, la hora fin debe ser mayor que la hora inicio`;
          break;
        }
      }

      // Validar que no se solapen
      if (!newErrors.bloques_horarios) {
        for (let i = 0; i < form.bloques_horarios.length; i++) {
          for (let j = i + 1; j < form.bloques_horarios.length; j++) {
            const b1 = form.bloques_horarios[i];
            const b2 = form.bloques_horarios[j];

            const b1Start = to24h(b1.inicio).split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
            const b1End = to24h(b1.fin).split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
            const b2Start = to24h(b2.inicio).split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
            const b2End = to24h(b2.fin).split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));

            if (!(b1End <= b2Start || b2End <= b1Start)) {
              newErrors.bloques_horarios = `Los bloques ${i + 1} y ${j + 1} se solapan`;
              break;
            }
          }
          if (newErrors.bloques_horarios) break;
        }
      }
    }

    // Validar empleado
    if (!form.id_usuario) {
      newErrors.id_usuario = 'Debes seleccionar un empleado';
    }

    // Validar días
    if (form.dias_semana.length === 0) {
      newErrors.dias_semana = 'Debes seleccionar al menos un día de la semana';
    }

    // Validar fecha inicio
    if (!form.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(form.fecha_inicio + 'T00:00:00');
      
      if (inputDate <= today) {
        newErrors.fecha_inicio = 'La fecha debe ser al menos el día siguiente';
      }
    }

    // Validar fecha fin (si existe)
    if (form.fecha_fin && form.fecha_inicio) {
      const inicio = new Date(form.fecha_inicio + 'T00:00:00');
      const fin = new Date(form.fecha_fin + 'T00:00:00');
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

    // Convertir bloques a formato 24h para el backend
    const bloquesBackend = form.bloques_horarios.map(b => ({
      inicio: to24h(b.inicio),
      fin: to24h(b.fin)
    }));

    const data = {
      ...form,
      bloques_horarios: bloquesBackend,
      id_usuario: form.id_usuario,
      fecha_fin: form.fecha_fin || null,
      estado: form.estado
    };

    onUpdate(data);
    handleClose();
  };

  // Calcular horas totales por día
  const calcularHorasTotales = () => {
    let totalMinutos = 0;
    for (const bloque of form.bloques_horarios) {
      const inicioMin = to24h(bloque.inicio).split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
      const finMin = to24h(bloque.fin).split(':').reduce((h, m) => parseInt(h) * 60 + parseInt(m));
      totalMinutos += (finMin - inicioMin);
    }
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas}h ${minutos}m`;
  };

  if (!scheduling || !modalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-4xl mx-4">
        <div className="bg-white rounded-2xl shadow-2xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-pencil text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Editar Programación Recurrente</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bloques Horarios */}
      <div className="space-y-4 md:col-span-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-gray-700 font-lato items-center gap-2">
            <i className="bi bi-clock-history text-[#FACC15]"></i>
            Bloques Horarios *
          </label>
          <span className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg">
            Total: {calcularHorasTotales()}
          </span>
        </div>

        <div className="space-y-3">
          {form.bloques_horarios.map((bloque, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#FACC15] transition-all">
              <div className="flex items-center gap-2">
                <i className="bi bi-clock text-[#FACC15]"></i>
                <span className="text-sm font-medium text-gray-700">Bloque {index + 1}:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={bloque.inicio}
                  onChange={(e) => handleBlockChange(index, 'inicio', e.target.value)}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all"
                >
                  {HOURS_12.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                
                <i className="bi bi-arrow-right text-gray-400"></i>
                
                <select
                  value={bloque.fin}
                  onChange={(e) => handleBlockChange(index, 'fin', e.target.value)}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all"
                >
                  {HOURS_12.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="ml-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                title="Eliminar bloque"
                disabled={form.bloques_horarios.length <= 1}
              >
                <i className="bi bi-trash text-lg"></i>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addBlock}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#FACC15] hover:bg-yellow-50 transition-all text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2"
        >
          <i className="bi bi-plus-circle"></i>
          Agregar Bloque Horario
        </button>

        {errors.bloques_horarios && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <i className="bi bi-exclamation-triangle"></i>
            {errors.bloques_horarios}
          </p>
        )}
      </div>

      {/* Días de la semana */}
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 font-lato mb-3 items-center gap-2">
          <i className="bi bi-calendar-week text-[#FACC15]"></i>
          Días de la Semana *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {diasSemanaOptions.map((dia) => (
            <label key={dia.value} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-[#FACC15] hover:bg-yellow-50 transition-all cursor-pointer group">
              <input
                type="checkbox"
                value={dia.value}
                checked={form.dias_semana.includes(dia.value)}
                onChange={handleChange}
                className="w-5 h-5 text-[#FACC15] focus:ring-[#FACC15] border-2 border-gray-300 rounded focus:ring-2 transition-all"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-800">{dia.label}</span>
            </label>
          ))}
        </div>
        {errors.dias_semana && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <i className="bi bi-exclamation-triangle"></i>
            {errors.dias_semana}
          </p>
        )}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 font-lato mb-2 items-center gap-2">
            <i className="bi bi-calendar-day text-[#FACC15]"></i>
            Fecha de Inicio *
          </label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            min={minDate}
            onChange={handleChange}
            className={`w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all ${
              errors.fecha_inicio ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            required
          />
          {errors.fecha_inicio && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <i className="bi bi-exclamation-triangle"></i>
              {errors.fecha_inicio}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 font-lato mb-2 items-center gap-2">
            <i className="bi bi-calendar-check text-[#FACC15]"></i>
            Fecha de Fin (Opcional)
          </label>
          <input
            type="date"
            name="fecha_fin"
            value={form.fecha_fin}
            min={form.fecha_inicio || minDate}
            onChange={handleChange}
            className={`w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all ${
              errors.fecha_fin ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Dejar vacío para programación indefinida
          </p>
          {errors.fecha_fin && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <i className="bi bi-exclamation-triangle"></i>
              {errors.fecha_fin}
            </p>
          )}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 font-lato mb-2 items-center gap-2">
          <i className="bi bi-chat-text text-[#FACC15]"></i>
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
          rows="3"
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all resize-none hover:border-gray-300"
          placeholder="Notas adicionales sobre esta programación..."
        />
      </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 md:col-span-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold flex items-center gap-2 text-xs"
              >
                <i className="bi bi-x-lg"></i>
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl text-xs"
              >
                <i className="bi bi-check-circle"></i>
                Actualizar Programación
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

EditScheduling.propTypes = {
  scheduling: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
};

export default EditScheduling;

