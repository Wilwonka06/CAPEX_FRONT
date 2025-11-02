import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  validateSchedulingForm,
  validateSchedulingStartDate,
  validateSchedulingEndDate,
  validateSchedulingStartTime,
  validateSchedulingEndTime,
  validateSchedulingRepetition,
} from '../../../../../shared/validations';
import { getSchedulingsByUser, updateScheduling, deleteScheduling } from '../api/schedulingApi';

const horas = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const diasSemana = [
  { key: 'Lunes', label: 'Lunes' },
  { key: 'Martes', label: 'Martes' },
  { key: 'Miercoles', label: 'Miercoles' },
  { key: 'Jueves', label: 'Jueves' },
  { key: 'Viernes', label: 'Viernes' },
  { key: 'Sabado', label: 'Sabado' },
  { key: 'Domingo', label: 'Domingo' }
];

const initialProg = {
  fechaInicio: '',
  fechaFin: '',
  repeticion: 'No se repite',
  dias: [],
  horaInicio: '08:00',
  horaFin: '09:00',
};

const EditScheduling = ({ empleadoId, onClose }) => {
  const [programaciones, setProgramaciones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [prog, setProg] = useState(initialProg);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (empleadoId) {
      cargarProgramaciones();
    }
  }, [empleadoId]);

  const cargarProgramaciones = async () => {
    try {
      setLoading(true);
      console.log('[EditScheduling] 🔍 Cargando programaciones para empleadoId:', empleadoId);
      const progs = await getSchedulingsByUser(empleadoId);
      console.log('[EditScheduling] ✅ Programaciones cargadas:', progs);
      setProgramaciones(progs);
    } catch (error) {
      console.error('[EditScheduling] ❌ Error cargando programaciones:', error);
      console.error('[EditScheduling] ❌ Error completo:', error.response || error);
      toast.error('Error al cargar programaciones del empleado');
      setProgramaciones([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const agruparProgramaciones = (progs) => {
    const grupos = {};
    
    progs.forEach(p => {
      const key = `${p.horaInicio}-${p.horaFin}`;
      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(p);
    });

    return Object.entries(grupos).map(([key, items]) => {
      items.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
      
      const fechaInicio = items[0].fechaInicio;
      const fechaFin = items[items.length - 1].fechaInicio;
      
      // Calcular qué días de la semana están incluidos
      const diasIncluidos = items.map(item => {
        const fecha = new Date(item.fechaInicio + 'T00:00:00');
        const diaSemana = fecha.getDay();
        const diasMap = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        return diasMap[diaSemana];
      });
      
      return {
        horaInicio: items[0].horaInicio,
        horaFin: items[0].horaFin,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        repeticion: items.length > 1 ? 'Mensual' : 'No se repite',
        dias: [...new Set(diasIncluidos)],
        ids: items.map(i => i.id),
        items: items,
        primerItem: items[0]
      };
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleEditarGrupo = (grupo) => {
    const editingData = {
      id: grupo.primerItem.id,
      idsGrupo: grupo.ids,
      fechaInicio: grupo.fechaInicio,
      fechaFin: grupo.fechaFin,
      horaInicio: grupo.horaInicio,
      horaFin: grupo.horaFin,
      empleadoId: grupo.primerItem.empleadoId || empleadoId,
      dias: grupo.dias,
      repeticion: grupo.repeticion
    };
    
    setEditing(editingData);
    
    setProg({
      fechaInicio: grupo.fechaInicio,
      fechaFin: grupo.fechaFin,
      horaInicio: grupo.horaInicio,
      horaFin: grupo.horaFin,
      empleadoId: grupo.primerItem.empleadoId || empleadoId,
      dias: grupo.dias,
      repeticion: grupo.repeticion
    });
    
    setMostrarFormulario(true);
    setErrors({});
  };

  const handleEliminarGrupo = async (grupo) => {
    if (window.confirm(`¿Eliminar esta programación?`)) {
      try {
        for (const id of grupo.ids) {
          await deleteScheduling(id);
        }
        toast.success('Programación eliminada correctamente');
        await cargarProgramaciones();
      } catch (error) {
        console.error('[EditScheduling] Error eliminando programación:', error);
        toast.error('Error al eliminar programación');
      }
    }
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
      case 'repeticion':
        const repeticionErrors = validateSchedulingRepetition(value);
        error = repeticionErrors.repeticion || '';
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    const formErrors = validateSchedulingForm(prog);
    setErrors(formErrors);
  
    if (Object.keys(formErrors).length === 0) {
      try {
        const progToSave = {
          id_usuario: parseInt(editing.empleadoId),
          fecha_inicio: prog.fechaInicio,
          hora_entrada: prog.horaInicio,
          hora_salida: prog.horaFin,
        };

        await updateScheduling(editing.id, progToSave);
        
        toast.success('Programación actualizada correctamente');
        setMostrarFormulario(false);
        setEditing(null);
        setProg(initialProg);
        setErrors({});
        
        await cargarProgramaciones();
      } catch (error) {
        console.error('[EditScheduling] Error actualizando programación:', error);
        toast.error('Error al actualizar programación');
      }
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setEditing(null);
    setProg(initialProg);
    setErrors({});
  };

  const handleGuardarTodo = () => {
    if (onClose) {
      onClose();
    }
  };

  const gruposProgramaciones = agruparProgramaciones(programaciones);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Cargando programaciones...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Programaciones</h3>

      {!mostrarFormulario ? (
        <div className="space-y-4">
          {gruposProgramaciones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No hay programaciones registradas</p>
            </div>
          ) : (
            gruposProgramaciones.map((grupo, index) => (
              <div 
                key={index}
                className="border-b border-gray-200 pb-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-800 mb-1">
                      <span className="font-medium">
                        {formatDate(grupo.fechaInicio)} - {formatDate(grupo.fechaFin)}
                      </span>
                      <span className="mx-2">|</span>
                      <span className="font-medium">
                        {grupo.horaInicio} - {grupo.horaFin}
                      </span>
                      <span className="mx-2">|</span>
                      <span>{grupo.repeticion}</span>
                      <span className="mx-2">|</span>
                      <span>Días: {grupo.dias.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditarGrupo(grupo)}
                      className="bg-orange-600 text-white px-4 py-1 rounded hover:bg-orange-700 transition text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarGrupo(grupo)}
                      className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleGuardarTodo}
              className="bg-amber-900 text-white px-8 py-2 rounded font-semibold hover:bg-amber-800 transition"
            >
              Guardar Todo
            </button>
          </div>
        </div>
      ) : (
        <div>
          <form onSubmit={handleEditEvent}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Fecha inicio</label>
                <input 
                  type="date" 
                  name="fechaInicio" 
                  value={prog.fechaInicio} 
                  onChange={handleProgChange} 
                  onBlur={handleBlur} 
                  className="border border-gray-300 rounded px-3 py-2 w-full" 
                />
                {errors.fechaInicio && <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Fecha fin</label>
                <input 
                  type="date" 
                  name="fechaFin" 
                  value={prog.fechaFin} 
                  onChange={handleProgChange} 
                  onBlur={handleBlur} 
                  className="border border-gray-300 rounded px-3 py-2 w-full" 
                />
                {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-2">Repetición</label>
              <select 
                name="repeticion" 
                value={prog.repeticion} 
                onChange={handleProgChange} 
                onBlur={handleBlur} 
                className="border border-gray-300 rounded px-3 py-2 w-full"
              >
                <option>No se repite</option>
                <option>Semanal</option>
                <option>Mensual</option>
              </select>
              {errors.repeticion && <p className="text-red-500 text-xs mt-1">{errors.repeticion}</p>}
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {diasSemana.map(dia => (
                <label key={dia.key} className="flex items-center gap-2 text-gray-800 text-sm">
                  <input
                    type="checkbox"
                    value={dia.key}
                    checked={prog.dias.includes(dia.key)}
                    onChange={handleProgChange}
                    className="w-4 h-4 accent-orange-600"
                  />
                  <span>{dia.label}</span>
                </label>
              ))}
            </div>
            {errors.dias && <p className="text-red-500 text-xs mb-4">{errors.dias}</p>}

            <div className="flex items-center gap-4 mb-6">
              <select 
                name="horaInicio" 
                value={prog.horaInicio} 
                onChange={handleProgChange} 
                onBlur={handleBlur} 
                className="border border-gray-300 rounded px-3 py-2"
              >
                {horas.map(h => <option key={h}>{h}</option>)}
              </select>
              <span className="text-gray-600">-</span>
              <select 
                name="horaFin" 
                value={prog.horaFin} 
                onChange={handleProgChange} 
                onBlur={handleBlur} 
                className="border border-gray-300 rounded px-3 py-2"
              >
                {horas.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={handleCancelar} 
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="bg-amber-900 text-white px-6 py-2 rounded font-semibold hover:bg-amber-800 transition"
              >
                Guardar cambios
              </button>
            </div>
          </form>

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleGuardarTodo}
              className="bg-amber-900 text-white px-8 py-2 rounded font-semibold hover:bg-amber-800 transition"
            >
              Guardar Todo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditScheduling;