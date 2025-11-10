import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  validateSchedulingForm,
  validateSchedulingStartDate,
  validateSchedulingEndDate,
  validateSchedulingStartTime,
  validateSchedulingEndTime,
} from '../../../../../shared/validations';
import { getSchedulingsByUser, updateScheduling, deleteScheduling } from '../api/schedulingApi';

const horas = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const initialProg = {
  fechaInicio: '',
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

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
      setCurrentPage(1);
    } catch (error) {
      console.error('[EditScheduling] ❌ Error cargando programaciones:', error);
      
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

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  const handleEditarProgramacion = (programacion) => {
    console.log('[EditScheduling] Editando programación:', programacion);
    
    setEditing({
      id: programacion.id,
      empleadoId: programacion.empleadoId || empleadoId,
    });
    
    setProg({
      fechaInicio: programacion.fechaInicio || programacion.fecha,
      horaInicio: formatTime(programacion.horaInicio || programacion.hora_entrada),
      horaFin: formatTime(programacion.horaFin || programacion.hora_salida),
      empleadoId: programacion.empleadoId || empleadoId,
    });
    
    setMostrarFormulario(true);
    setErrors({});
  };

  const handleEliminarProgramacion = async (programacion) => {
    if (window.confirm(`¿Eliminar la programación del ${formatDate(programacion.fechaInicio || programacion.fecha)}?`)) {
      try {
        await deleteScheduling(programacion.id);
        toast.success('Programación eliminada correctamente');
        await cargarProgramaciones();
      } catch (error) {
        console.error('[EditScheduling] Error eliminando programación:', error);
        toast.error('Error al eliminar programación');
      }
    }
  };

  const handleProgChange = (e) => {
    const { name, value } = e.target;
    setProg((prev) => ({ ...prev, [name]: value }));
    
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
    
    const formErrors = {};
    
    if (!prog.fechaInicio) {
      formErrors.fechaInicio = 'La fecha es obligatoria';
    }
    
    if (!prog.horaInicio) {
      formErrors.horaInicio = 'La hora de inicio es obligatoria';
    }
    
    if (!prog.horaFin) {
      formErrors.horaFin = 'La hora de fin es obligatoria';
    }
    
    if (prog.horaInicio && prog.horaFin && prog.horaFin <= prog.horaInicio) {
      formErrors.horaFin = 'La hora de fin debe ser mayor que la hora de inicio';
    }
    
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
        const errorMsg = error.response?.data?.message || 'Error al actualizar programación';
        toast.error(errorMsg);
      }
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setEditing(null);
    setProg(initialProg);
    setErrors({});
  };

  const totalPages = programaciones.length;
  const paginatedProgramaciones = programaciones.slice(currentPage - 1, currentPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Programaciones</h3>

      {!mostrarFormulario ? (
        <div className="space-y-6">
          {programaciones.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-base">No hay programaciones registradas</p>
            </div>
          ) : (
            <>
              {paginatedProgramaciones.map((programacion) => (
                <div key={programacion.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Detalle de Programación</h4>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-base mb-6">
                    {/* Fecha inicio */}
                    <div>
                      <span className="text-gray-900 font-medium">Fecha inicio: </span>
                      <span className="text-gray-700">{formatDate(programacion.fechaInicio || programacion.fecha)}</span>
                    </div>

                    {/* Fecha fin (igual a fecha inicio) */}
                    <div>
                      <span className="text-gray-900 font-medium">Fecha fin: </span>
                      <span className="text-gray-700">{formatDate(programacion.fechaInicio || programacion.fecha)}</span>
                    </div>

                    {/* Hora inicio */}
                    <div>
                      <span className="text-gray-900 font-medium">Hora inicio: </span>
                      <span className="text-gray-700">{formatTime(programacion.horaInicio || programacion.hora_entrada)}</span>
                    </div>

                    {/* Hora fin */}
                    <div>
                      <span className="text-gray-900 font-medium">Hora fin: </span>
                      <span className="text-gray-700">{formatTime(programacion.horaFin || programacion.hora_salida)}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEditarProgramacion(programacion)}
                      className="text-sm bg-amber-900 text-white px-6 py-2 rounded hover:bg-amber-800 transition font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarProgramacion(programacion)}
                      className="text-sm bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <span className="text-sm text-gray-700 font-medium">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={onClose}
                    className="ml-auto bg-amber-900 text-white px-8 py-2 rounded font-semibold hover:bg-amber-800 transition"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {totalPages === 1 && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={onClose}
                    className="bg-amber-900 text-white px-8 py-2 rounded font-semibold hover:bg-amber-800 transition"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h4 className="text-lg font-bold text-gray-900 mb-6">Editar Programación</h4>
          <form onSubmit={handleEditEvent}>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fecha inicio:
                </label>
                <input 
                  type="date" 
                  name="fechaInicio" 
                  value={prog.fechaInicio} 
                  onChange={handleProgChange} 
                  onBlur={handleBlur} 
                  className={`border rounded px-3 py-2 w-full ${
                    errors.fechaInicio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.fechaInicio && <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fecha fin:
                </label>
                <input 
                  type="date" 
                  value={prog.fechaInicio}
                  className="border rounded px-3 py-2 w-full border-gray-300 bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Hora inicio:
                </label>
                <select 
                  name="horaInicio" 
                  value={prog.horaInicio} 
                  onChange={handleProgChange} 
                  onBlur={handleBlur} 
                  className={`border rounded px-3 py-2 w-full ${
                    errors.horaInicio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  {horas.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                {errors.horaInicio && <p className="text-red-500 text-xs mt-1">{errors.horaInicio}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Hora fin:
                </label>
                <select 
                  name="horaFin" 
                  value={prog.horaFin} 
                  onChange={handleProgChange} 
                  onBlur={handleBlur} 
                  className={`border rounded px-3 py-2 w-full ${
                    errors.horaFin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  {horas.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                {errors.horaFin && <p className="text-red-500 text-xs mt-1">{errors.horaFin}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
              <button 
                type="button" 
                onClick={handleCancelar} 
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="bg-amber-900 text-white px-8 py-2 rounded font-semibold hover:bg-amber-800 transition"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditScheduling;