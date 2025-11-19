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
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
        <div className="w-12 h-12 bg-[#FACC15] rounded-full flex items-center justify-center mb-3">
          <i className="bi bi-arrow-repeat animate-spin text-xl text-gray-800"></i>
        </div>
        <p className="text-gray-600 font-lato">Cargando novedades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 font-nunito">Novedades y Excepciones</h3>
          <p className="text-gray-600 font-lato text-sm">Cambios temporales en las programaciones</p>
        </div>
        {programaciones.length > 0 && !showAddModal && !editingNovedad && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 font-semibold font-lato flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <i className="bi bi-plus-circle"></i>
            Crear Novedad
          </button>
        )}
      </div>

      {programaciones.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="bi bi-exclamation-triangle text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-yellow-800 font-nunito mb-2">Programación Requerida</h4>
              <p className="text-yellow-700 font-lato">El empleado no tiene programaciones recurrentes. Debes crear una programación recurrente antes de poder agregar novedades o excepciones.</p>
            </div>
          </div>
        </div>
      )}

      {programaciones.length > 0 && (
        <>
          {/* Filtros Mejorados */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 font-nunito mb-4 flex items-center gap-2">
              <i className="bi bi-funnel text-[#FACC15]"></i>
              Filtros de Búsqueda
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
                  <i className="bi bi-tag text-[#FACC15]"></i>
                  Tipo de Novedad
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all font-lato"
                >
                  <option value="Todos">Todos los tipos</option>
                  <option value="Ausencia">Ausencia</option>
                  <option value="Cambio_Horario">Cambio de Horario</option>
                  <option value="Suspension">Suspensión</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 font-lato flex items-center gap-2">
                  <i className="bi bi-calendar-event text-[#FACC15]"></i>
                  Fecha Específica
                </label>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all font-lato"
                />
              </div>
              {(filtroTipo !== 'Todos' || filtroFecha) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFiltroTipo('Todos');
                      setFiltroFecha('');
                    }}
                    className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold font-lato flex items-center gap-2"
                  >
                    <i className="bi bi-x-circle"></i>
                    Limpiar
                  </button>
                </div>
              )}
            </div>
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
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-journal-x text-3xl text-gray-500"></i>
              </div>
              <h4 className="text-xl font-bold text-gray-700 mb-2 font-nunito">Sin Novedades</h4>
              <p className="text-gray-600 font-lato max-w-md mx-auto">
                {filtroTipo !== 'Todos' || filtroFecha
                  ? 'No se encontraron novedades con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
                  : 'No hay novedades registradas para este empleado. Crea una nueva novedad para registrar cambios temporales.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNovedades.map((nov) => (
                <div key={nov.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg">
                          <i className={`bi ${
                            nov.tipo === 'Ausencia' ? 'bi-person-dash' :
                            nov.tipo === 'Cambio_Horario' ? 'bi-arrow-repeat' :
                            'bi-pause-circle'
                          } text-white text-lg`}></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              nov.tipo === 'Ausencia'
                                ? 'bg-red-100 text-red-800 border-2 border-red-200'
                                : nov.tipo === 'Cambio_Horario'
                                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                                : 'bg-gray-100 text-gray-800 border-2 border-gray-200'
                            }`}>
                              <i className={`bi mr-1 ${
                                nov.tipo === 'Ausencia' ? 'bi-person-dash' :
                                nov.tipo === 'Cambio_Horario' ? 'bi-arrow-repeat' :
                                'bi-pause-circle'
                              }`}></i>
                              {tipoLabels[nov.tipo]}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              nov.estado === 'Aprobada'
                                ? 'bg-green-100 text-green-800 border-2 border-green-200'
                                : nov.estado === 'Pendiente'
                                ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                                : 'bg-red-100 text-red-800 border-2 border-red-200'
                            }`}>
                              <i className={`bi mr-1 ${
                                nov.estado === 'Aprobada' ? 'bi-check-circle' :
                                nov.estado === 'Pendiente' ? 'bi-clock' :
                                'bi-x-circle'
                              }`}></i>
                              {estadoLabels[nov.estado]}
                            </span>
                          </div>
                          <h5 className="text-lg font-bold text-gray-800 font-nunito">Novedad Registrada</h5>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-6 h-6 bg-[#FACC15] rounded-lg flex items-center justify-center">
                              <i className="bi bi-calendar-event text-white text-xs"></i>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-lato">Fecha</span>
                          </div>
                          <p className="text-gray-800 font-bold font-mono text-base">
                            {new Date(nov.fecha).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        {nov.tipo === 'Cambio_Horario' && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-6 h-6 bg-[#FACC15] rounded-lg flex items-center justify-center">
                                <i className="bi bi-clock-history text-white text-xs"></i>
                              </div>
                              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-lato">Nuevo Horario</span>
                            </div>
                            <div className="space-y-1">
                              {nov.hora_entrada_nueva && (
                                <p className="text-gray-800 font-medium">
                                  <span className="text-gray-600">Entrada:</span> <span className="font-bold font-mono">{nov.hora_entrada_nueva}</span>
                                </p>
                              )}
                              {nov.hora_salida_nueva && (
                                <p className="text-gray-800 font-medium">
                                  <span className="text-gray-600">Salida:</span> <span className="font-bold font-mono">{nov.hora_salida_nueva}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {nov.motivo && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                              <i className="bi bi-chat-text text-white text-xs"></i>
                            </div>
                            <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide font-lato">Motivo</span>
                          </div>
                          <p className="text-blue-800 font-medium">{nov.motivo}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      <button
                        onClick={() => setEditingNovedad(nov)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Editar"
                      >
                        <i className="bi bi-pencil-square text-lg"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(nov.id)}
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
        </>
      )}
    </div>
  );
};

export default NovedadManager;

