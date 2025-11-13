import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { novedadesService, recurringSchedulingService } from '../API/employeesService';
import AddNovedadModal from './AddNovedadModal';

const tipoLabels = {
  'Ausencia': 'Ausencia',
  'Cambio_Horario': 'Cambio de Horario',
  'Suspension': 'Suspensión'
};

const estadoLabels = {
  'Pendiente': 'Pendiente',
  'Aprobada': 'Aprobada',
  'Rechazada': 'Rechazada'
};

const NovedadManager = ({ empleadoId }) => {
  const [novedades, setNovedades] = useState([]);
  const [programaciones, setProgramaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNovedad, setEditingNovedad] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    if (empleadoId) {
      loadData();
    }
  }, [empleadoId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [novedadesData, programacionesData] = await Promise.all([
        novedadesService.getByUsuario(empleadoId),
        recurringSchedulingService.getByUser(empleadoId)
      ]);
      setNovedades(novedadesData);
      setProgramaciones(programacionesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar novedades');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      await novedadesService.create(data);
      toast.success('Novedad creada exitosamente');
      setShowAddModal(false);
      loadData();
    } catch (error) {
      console.error('Error creando novedad:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al crear novedad');
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await novedadesService.update(id, data);
      toast.success('Novedad actualizada exitosamente');
      setEditingNovedad(null);
      loadData();
    } catch (error) {
      console.error('Error actualizando novedad:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al actualizar novedad');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta novedad?')) {
      return;
    }

    try {
      await novedadesService.delete(id);
      toast.success('Novedad eliminada exitosamente');
      loadData();
    } catch (error) {
      console.error('Error eliminando novedad:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al eliminar novedad');
    }
  };

  const filteredNovedades = novedades.filter(nov => {
    if (filtroTipo !== 'Todos' && nov.tipo !== filtroTipo) return false;
    if (filtroFecha && nov.fecha !== filtroFecha) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-4">Cargando novedades...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold">Novedades</h3>
        {programaciones.length > 0 && !showAddModal && !editingNovedad && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary-dark transition"
          >
            + Crear Novedad
          </button>
        )}
      </div>

      {programaciones.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <i className="bi bi-exclamation-triangle mr-2"></i>
          El empleado no tiene programaciones recurrentes. Debes crear una programación recurrente antes de agregar novedades.
        </div>
      )}

      {programaciones.length > 0 && (
        <>
          {/* Filtros */}
          <div className="flex gap-4 items-center flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-1">Filtrar por tipo:</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="Todos">Todos</option>
                <option value="Ausencia">Ausencia</option>
                <option value="Cambio_Horario">Cambio de Horario</option>
                <option value="Suspension">Suspensión</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filtrar por fecha:</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              />
            </div>
            {(filtroTipo !== 'Todos' || filtroFecha) && (
              <button
                onClick={() => {
                  setFiltroTipo('Todos');
                  setFiltroFecha('');
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {showAddModal && (
            <AddNovedadModal
              programaciones={programaciones}
              onSave={handleAdd}
              onCancel={() => setShowAddModal(false)}
            />
          )}

          {editingNovedad && (
            <AddNovedadModal
              editing={editingNovedad}
              programaciones={programaciones}
              onSave={(data) => handleEdit(editingNovedad.id, data)}
              onCancel={() => setEditingNovedad(null)}
            />
          )}

          {filteredNovedades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay novedades registradas.</p>
              <p className="text-sm mt-2">
                {filtroTipo !== 'Todos' || filtroFecha 
                  ? 'No se encontraron novedades con los filtros aplicados.'
                  : 'Crea una novedad para este empleado.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNovedades.map((nov) => (
                <div key={nov.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          nov.tipo === 'Ausencia' 
                            ? 'bg-red-100 text-red-800'
                            : nov.tipo === 'Cambio_Horario'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tipoLabels[nov.tipo]}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          nov.estado === 'Aprobada'
                            ? 'bg-green-100 text-green-800'
                            : nov.estado === 'Pendiente'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {estadoLabels[nov.estado]}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <span className="font-medium">Fecha:</span>{' '}
                          {new Date(nov.fecha).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {nov.tipo === 'Cambio_Horario' && (
                          <>
                            {nov.hora_entrada_nueva && (
                              <div>
                                <span className="font-medium">Nueva Entrada:</span>{' '}
                                {nov.hora_entrada_nueva}
                              </div>
                            )}
                            {nov.hora_salida_nueva && (
                              <div>
                                <span className="font-medium">Nueva Salida:</span>{' '}
                                {nov.hora_salida_nueva}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {nov.motivo && (
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Motivo:</span> {nov.motivo}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingNovedad(nov)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
                        title="Editar"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(nov.id)}
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
        </>
      )}
    </div>
  );
};

export default NovedadManager;

