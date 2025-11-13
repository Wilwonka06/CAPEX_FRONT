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
    return <div className="text-center py-4">Cargando programaciones...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Programaciones Recurrentes</h3>
        {!showAddForm && !editingProgramacion && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
          >
            + Agregar Programación
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <AddRecurringScheduling
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            empleadoId={empleadoId}
          />
        </div>
      )}

      {editingProgramacion && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <AddRecurringScheduling
            editing={editingProgramacion}
            onSave={(data) => handleEdit(editingProgramacion.id, data)}
            onCancel={() => setEditingProgramacion(null)}
            empleadoId={empleadoId}
          />
        </div>
      )}

      {programaciones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay programaciones asignadas.</p>
          <p className="text-sm mt-2">Agrega una programación recurrente para este empleado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {programaciones.map((prog) => (
            <div key={prog.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      prog.estado === 'Activa' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prog.estado}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Horario:</span>{' '}
                      {prog.hora_entrada} - {prog.hora_salida}
                    </div>
                    <div>
                      <span className="font-medium">Días:</span>{' '}
                      {formatDiasSemana(prog.dias_semana)}
                    </div>
                    <div>
                      <span className="font-medium">Desde:</span>{' '}
                      {new Date(prog.fecha_inicio).toLocaleDateString('es-ES')}
                    </div>
                    <div>
                      <span className="font-medium">Hasta:</span>{' '}
                      {prog.fecha_fin 
                        ? new Date(prog.fecha_fin).toLocaleDateString('es-ES')
                        : 'Indefinido'}
                    </div>
                  </div>
                  
                  {prog.observaciones && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Observaciones:</span> {prog.observaciones}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingProgramacion(prog)}
                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
                    title="Editar"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(prog.id)}
                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
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

