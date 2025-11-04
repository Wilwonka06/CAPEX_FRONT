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
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (empleadoId) {
      cargarProgramaciones();
    } else {
      setLoading(false);
      setLoadError('No se proporcionó ID de empleado');
    }
  }, [empleadoId]);

  const cargarProgramaciones = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      console.log('[EditScheduling] 🔍 Cargando programaciones para empleadoId:', empleadoId);
      
      const progs = await getSchedulingsByUser(empleadoId);
      console.log('[EditScheduling] ✅ Programaciones cargadas:', progs);
      setProgramaciones(progs || []);
    } catch (error) {
      console.error('[EditScheduling] ❌ Error cargando programaciones:', error);
      console.error('[EditScheduling] ❌ Error completo:', error.response || error);
      
      // Determinar mensaje de error específico
      let errorMsg = 'Error al cargar programaciones';
      
      if (error.response?.status === 500) {
        errorMsg = 'Error del servidor al cargar programaciones. Contacte al administrador.';
      } else if (error.response?.status === 404) {
        errorMsg = 'No se encontró el empleado';
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = 'No se puede conectar al servidor';
      }
      
      setLoadError(errorMsg);
      setProgramaciones([]);
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

  const formatDateRange = (fechas) => {
    if (!fechas || fechas.length === 0) return '';
    if (fechas.length === 1) {
      return formatDate(fechas[0]);
    }
    return `${formatDate(fechas[0])} - ${formatDate(fechas[fechas.length - 1])}`;
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
    };
    
    setEditing(editingData);
    
    setProg({
      fechaInicio: grupo.fechaInicio,
      fechaFin: grupo.fechaFin,
      horaInicio: grupo.horaInicio,
      horaFin: grupo.horaFin,
      empleadoId: grupo.primerItem.empleadoId || empleadoId,
      dias: grupo.dias,
    });
    
    setMostrarFormulario(true);
    setErrors({});
  };

  const handleEliminarGrupo = async (grupo) => {
    if (window.confirm(`¿Eliminar esta programación de ${grupo.ids.length} día(s)?`)) {
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

  const gruposProgramaciones = agruparProgramaciones(programaciones);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Cargando programaciones...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar programaciones</h3>
            <p className="text-sm text-red-700 mt-2">{loadError}</p>
            <p className="text-xs text-red-600 mt-2">ID del empleado: {empleadoId}</p>
            <button
              onClick={cargarProgramaciones}
              className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Programaciones</h3>

      {!mostrarFormulario ? (
        <div className="space-y-4">
          {gruposProgramaciones.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4">No hay programaciones registradas</p>
            </div>
          ) : (
            gruposProgramaciones.map((grupo, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">
                          {formatDate(grupo.fechaInicio)} - {formatDate(grupo.fechaFin)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">
                          {grupo.horaInicio} - {grupo.horaFin}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {grupo.ids.length} día{grupo.ids.length > 1 ? 's' : ''}: {grupo.dias.join(', ')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditarGrupo(grupo)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarGrupo(grupo)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Editar Programación</h4>
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
                  disabled
                  title="No se puede cambiar el rango de fechas en edición"
                />
                {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4 opacity-50">
              {diasSemana.map(dia => (
                <label key={dia.key} className="flex items-center gap-2 text-gray-800 text-sm">
                  <input
                    type="checkbox"
                    value={dia.key}
                    checked={prog.dias.includes(dia.key)}
                    onChange={handleProgChange}
                    className="w-4 h-4 accent-orange-600"
                    disabled
                  />
                  <span>{dia.label}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="block text-sm font-medium text-gray-800">Horario</label>
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
        </div>
      )}
    </div>
  );
};

export default EditScheduling;