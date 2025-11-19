import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { recurringSchedulingService } from '../API/employeesService';
import AddRecurringScheduling from './AddRecurringScheduling';

const diasSemanaMap = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
};

const RecurringSchedulingManager = ({ empleadoId }) => {
  const [programaciones, setProgramaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProgramacion, setEditingProgramacion] = useState(null);

  useEffect(() => {
    if (empleadoId) {
      loadProgramaciones();
    }
  }, [empleadoId]);

  const loadProgramaciones = async () => {
    setLoading(true);
    try {
      const data = await recurringSchedulingService.getByUser(empleadoId);
      setProgramaciones(data);
    } catch (error) {
      console.error('Error cargando programaciones:', error);
      toast.error('Error al cargar programaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      const nuevaProgramacion = {
        ...data,
        id_usuario: empleadoId
      };
      await recurringSchedulingService.create(nuevaProgramacion);
      toast.success('Programación recurrente creada exitosamente');
      setShowAddForm(false);
      loadProgramaciones();
    } catch (error) {
      console.error('Error creando programación:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al crear programación');
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await recurringSchedulingService.update(id, data);
      toast.success('Programación recurrente actualizada exitosamente');
      setEditingProgramacion(null);
      loadProgramaciones();
    } catch (error) {
      console.error('Error actualizando programación:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al actualizar programación');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta programación recurrente?')) {
      return;
    }

    try {
      await recurringSchedulingService.delete(id);
      toast.success('Programación recurrente eliminada exitosamente');
      loadProgramaciones();
    } catch (error) {
      console.error('Error eliminando programación:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al eliminar programación');
    }
  };

  const formatDiasSemana = (dias) => {
    if (!Array.isArray(dias) || dias.length === 0) return 'Ninguno';
    return dias.map(d => diasSemanaMap[d] || d).join(', ');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
        <div className="w-12 h-12 bg-[#FACC15] rounded-full flex items-center justify-center mb-3">
          <i className="bi bi-arrow-repeat animate-spin text-xl text-gray-800"></i>
        </div>
        <p className="text-gray-600 font-lato">Cargando programaciones recurrentes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800 font-nunito">Programaciones Recurrentes</h3>
          <p className="text-gray-600 font-lato text-sm">Horarios semanales fijos del empleado</p>
        </div>
        {!showAddForm && !editingProgramacion && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 font-semibold font-lato flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <i className="bi bi-plus-circle"></i>
            Agregar Programación
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 font-nunito flex items-center gap-2">
              <i className="bi bi-plus-circle text-[#FACC15]"></i>
              Nueva Programación Recurrente
            </h4>
          </div>
          <AddRecurringScheduling
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            empleadoId={empleadoId}
          />
        </div>
      )}

      {editingProgramacion && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 font-nunito flex items-center gap-2">
              <i className="bi bi-pencil-square text-[#FACC15]"></i>
              Editar Programación Recurrente
            </h4>
          </div>
          <AddRecurringScheduling
            editing={editingProgramacion}
            onSave={(data) => handleEdit(editingProgramacion.id, data)}
            onCancel={() => setEditingProgramacion(null)}
            empleadoId={empleadoId}
          />
        </div>
      )}

      {programaciones.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-calendar-week text-3xl text-gray-500"></i>
          </div>
          <h4 className="text-xl font-bold text-gray-700 mb-2 font-nunito">Sin Programaciones Recurrentes</h4>
          <p className="text-gray-600 font-lato max-w-md mx-auto">Este empleado no tiene programaciones semanales fijas asignadas. Crea una nueva para establecer horarios recurrentes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {programaciones.map((prog) => (
            <div key={prog.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg">
                      <i className="bi bi-calendar-event text-white text-lg"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          prog.estado === 'Activa'
                            ? 'bg-green-100 text-green-800 border-2 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-2 border-gray-200'
                        }`}>
                          <i className={`bi mr-1 ${prog.estado === 'Activa' ? 'bi-check-circle' : 'bi-pause-circle'}`}></i>
                          {prog.estado}
                        </span>
                      </div>
                      <h5 className="text-lg font-bold text-gray-800 font-nunito">Programación Recurrente</h5>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-[#FACC15] rounded-lg flex items-center justify-center">
                          <i className="bi bi-clock text-white text-xs"></i>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-lato">Horario</span>
                      </div>
                      <p className="text-gray-800 font-bold font-mono text-lg">{prog.hora_entrada} - {prog.hora_salida}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-[#FACC15] rounded-lg flex items-center justify-center">
                          <i className="bi bi-calendar-week text-white text-xs"></i>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-lato">Días</span>
                      </div>
                      <p className="text-gray-800 font-medium">{formatDiasSemana(prog.dias_semana)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-[#FACC15] rounded-lg flex items-center justify-center">
                          <i className="bi bi-calendar-day text-white text-xs"></i>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-lato">Fecha Inicio</span>
                      </div>
                      <p className="text-gray-800 font-bold font-mono">{new Date(prog.fecha_inicio).toLocaleDateString('es-ES')}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-[#FACC15] rounded-lg flex items-center justify-center">
                          <i className="bi bi-calendar-check text-white text-xs"></i>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-lato">Fecha Fin</span>
                      </div>
                      <p className="text-gray-800 font-bold font-mono">
                        {prog.fecha_fin
                          ? new Date(prog.fecha_fin).toLocaleDateString('es-ES')
                          : 'Indefinido'}
                      </p>
                    </div>
                  </div>

                  {prog.observaciones && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                          <i className="bi bi-chat-text text-white text-xs"></i>
                        </div>
                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide font-lato">Observaciones</span>
                      </div>
                      <p className="text-blue-800 font-medium">{prog.observaciones}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => setEditingProgramacion(prog)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Editar"
                  >
                    <i className="bi bi-pencil-square text-lg"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(prog.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Eliminar"
                  >
                    <i className="bi bi-trash text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringSchedulingManager;

