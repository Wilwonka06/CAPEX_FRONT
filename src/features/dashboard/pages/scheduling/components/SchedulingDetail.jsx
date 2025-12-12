import PropTypes from 'prop-types';

const SchedulingDetail = ({ scheduling, isOpen, onClose, onEdit, onDelete, canEdit = false, canDelete = false }) => {
  if (!isOpen || !scheduling) return null;

  // Calcular duración total
  const calcularDuracion = (horaEntrada, horaSalida) => {
    if (!horaEntrada || !horaSalida) return 'N/A';
    const [h1, m1] = horaEntrada.split(':').map(Number);
    const [h2, m2] = horaSalida.split(':').map(Number);
    const minutosEntrada = h1 * 60 + m1;
    const minutosSalida = h2 * 60 + m2;
    const diferencia = minutosSalida - minutosEntrada;
    const horas = Math.floor(diferencia / 60);
    const minutos = diferencia % 60;
    return `${horas}h ${minutos}m`;
  };

  // Formatear días de la semana
  const diasSemanaLabels = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  };

  const diasFormateados = scheduling.dias_semana
    ?.map(d => diasSemanaLabels[d])
    .join(', ') || 'No especificados';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-4xl mx-4">
        <div className="bg-white rounded-2xl shadow-2xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-eye text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Detalles de Programación</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Principal */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 md:col-span-2">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <i className="bi bi-calendar-event text-white"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información de Programación</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center p-3 bg-white rounded-md shadow-sm">
                  <i className="bi bi-person text-gray-500 mr-3 text-lg"></i>
                  <div>
                    <p className="text-sm text-gray-500">Empleado</p>
                    <p className="font-medium text-gray-900">{scheduling.empleadoNombre || scheduling.id_usuario || 'Sin nombre'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-white rounded-md shadow-sm">
                  <i className="bi bi-calendar text-gray-500 mr-3 text-lg"></i>
                  <div>
                    <p className="text-sm text-gray-500">Días de la Semana</p>
                    <p className="font-medium text-gray-900">{diasFormateados}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-white rounded-md shadow-sm">
                  <i className="bi bi-calendar-day text-gray-500 mr-3 text-lg"></i>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Inicio</p>
                    <p className="font-medium text-gray-900">
                      {scheduling.fecha_inicio 
                        ? new Date(scheduling.fecha_inicio).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Fecha no disponible'}
                    </p>
                  </div>
                </div>

                {scheduling.fecha_fin && (
                  <div className="flex items-center p-3 bg-white rounded-md shadow-sm">
                    <i className="bi bi-calendar-check text-gray-500 mr-3 text-lg"></i>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Fin</p>
                      <p className="font-medium text-gray-900">
                        {new Date(scheduling.fecha_fin).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Horarios */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <i className="bi bi-clock-history text-white"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Bloques Horarios</h3>
              </div>

              <div className="space-y-2">
                {scheduling.bloques_horarios && scheduling.bloques_horarios.length > 0 ? (
                  scheduling.bloques_horarios.map((bloque, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Bloque {index + 1}:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {bloque.inicio?.substring(0, 5) || '--:--'} - {bloque.fin?.substring(0, 5) || '--:--'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No hay bloques horarios definidos</p>
                )}
              </div>

              {/* Duración calculada */}
              {scheduling.hora_entrada && scheduling.hora_salida && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Duración total:</span>
                    <span className="text-lg font-bold text-blue-800">
                      {calcularDuracion(scheduling.hora_entrada, scheduling.hora_salida)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <i className="bi bi-info-circle text-white"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Detalles Adicionales</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white rounded-md">
                  <span className="text-sm text-gray-600">ID de Programación:</span>
                  <span className="font-mono text-sm text-gray-800">{scheduling.id || scheduling.id_programacion_recurrente || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-md">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    scheduling.estado === 'Activa' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {scheduling.estado || 'Activa'}
                  </span>
                </div>
                {scheduling.observaciones && (
                  <div className="p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">Observaciones:</span>
                    <p className="text-sm text-gray-800 mt-1">{scheduling.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-200 px-6 pb-6">
          {canEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl text-xs"
            >
              <i className="bi bi-pencil"></i>
              Editar
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl text-xs"
            >
              <i className="bi bi-trash"></i>
              Eliminar
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold flex items-center gap-2 text-xs"
          >
            <i className="bi bi-x-lg"></i>
            Cerrar
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

SchedulingDetail.propTypes = {
  scheduling: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool
};

export default SchedulingDetail;