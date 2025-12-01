import { useState } from "react";
import PropTypes from "prop-types";
import { formatNumber } from "../../../../../shared/utils/formatters";
 
import appointmentsService from "../API/appointmentsService";
import toast from "react-hot-toast";

function limpiarPrecio(valor) {
  return Number(String(valor).replace(/[^\d]/g, "")) || 0;
}

// Función para convertir hora de 24h a 12h (AM/PM)
function convertirHoraA12Horas(hora24) {
  if (!hora24) return '';
  
  // Extraer solo la parte de hora (HH:MM o HH:MM:SS)
  const horaStr = hora24.toString().substring(0, 5);
  const [horas, minutos] = horaStr.split(':').map(Number);
  
  if (isNaN(horas) || isNaN(minutos)) return hora24;
  
  const periodo = horas >= 12 ? 'PM' : 'AM';
  const horas12 = horas === 0 ? 12 : horas > 12 ? horas - 12 : horas;
  
  return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
}

// Colores personalizados para los estados (debe coincidir con Appointments.jsx)
const ESTADO_COLORES = {
  Agendada: { bg: "#FACC15", text: "#7C5700" },
  Confirmada: { bg: "#60A5FA", text: "#1E3A8A" },
  Reprogramada: { bg: "#F59E42", text: "#7C3F00" },
  "En ejecución": { bg: "#2196F3", text: "#FFFFFF" },
  Finalizada: { bg: "#34D399", text: "#065F46" },
  Pagada: { bg: "#22D3EE", text: "#0E7490" },
  "Cancelada por el usuario": { bg: "#F87171", text: "#991B1B" },
  "No asistio": { bg: "#D1D5DB", text: "#374151" },
};

const getEstadoColor = (estado) => {
  switch (estado) {
    case "Agendada":
      return "text-yellow-600";
    case "Confirmada":
      return "text-blue-600";
    case "Reprogramada":
      return "text-orange-600";
    case "En ejecución":
      return "text-blue-600";
    case "Finalizada":
      return "text-green-600";
    case "Pagada":
      return "text-green-800";
    case "Cancelada por el usuario":
      return "text-red-600";
    case "No asistio":
      return "text-gray-500";
    default:
      return "text-gray-700";
  }
};

const AppointmentDetailModal = ({ cita, onClose, onEdit, onCancel }) => {
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [errorCancel, setErrorCancel] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  if (!cita) return null;
  
  // Formatear fecha sin problemas de zona horaria
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "";
    
    // Si la fecha viene como string YYYY-MM-DD, parsearla directamente sin zona horaria
    if (typeof fechaString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fechaString)) {
      const [year, month, day] = fechaString.split('T')[0].split('-');
      const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return fecha.toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    // Si ya es un objeto Date o otro formato, usar directamente
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const fechaStr = formatearFecha(cita.fecha_servicio);
  // Usar horas del backend
  let horaInicio = cita.hora_entrada || "08:00:00",
    horaFin = cita.hora_salida || "09:00:00",
    duracionTotal = 0,
    valorTotal = 0;
  if (cita.servicios && cita.servicios.length > 0) {
    duracionTotal = cita.servicios.reduce((acc, s) => {
      const duracion = s.duracion || s.servicio?.duracion || 0;
      return acc + parseInt(duracion);
    }, 0);
    valorTotal = cita.servicios.reduce((acc, s) => {
      const precio = s.precio_unitario || s.precio || 0;
      const cantidad = parseInt(s.cantidad || 1);
      return acc + limpiarPrecio(precio) * cantidad;
    }, 0);
  }

  const handleCancelarClick = () => {
    setShowCancelModal(true);
    setErrorCancel(null);
  };

  const handleCancelarConfirmar = async () => {
    setLoadingCancel(true);
    setErrorCancel(null);
    console.log("Intentando cancelar cita...");

    const cancelPromise = (async () => {
      // Enviar el motivo si fue proporcionado, o null si está vacío
      const motivo = motivoCancelacion.trim() || null;
      await appointmentsService.cancel(
        cita.id_cita,
        motivo
      );
      console.log("Cita cancelada en API");
      if (onCancel) await onCancel();
      setShowCancelModal(false);
      setMotivoCancelacion('');
      onClose();
      return true;
    })();

    toast.promise(cancelPromise, {
      loading: "Cancelando cita...",
      success: "Cita cancelada",
      error: (err) => {
        setErrorCancel("Error al cancelar la cita. Intenta de nuevo.");
        console.error("Error al cancelar:", err);
        return (
          err.response?.data?.message ||
          err.message ||
          "Error al cancelar la cita"
        );
      },
    });

    try {
      await cancelPromise;
    } catch (err) {
      // Error ya manejado por toast.promise
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleCancelarCancelar = () => {
    setShowCancelModal(false);
    setMotivoCancelacion('');
    setErrorCancel(null);
  };

  // Determinar si la cita está cancelada
  const esCancelada =
    cita.estado === "Cancelada por el usuario" || cita.estado === "No asistio";

  // Determinar si la cita puede ser editada (no cancelada, finalizada o pagada)
  const puedeEditar = !esCancelada && 
    cita.estado !== "Finalizada" && 
    cita.estado !== "Pagada";

  const handleEdit = () => {
    if (onEdit) {
      onEdit(cita);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="flex-none bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-calendar-event text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Detalles de la Cita</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Estado y Fecha */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span
                className="font-semibold text-sm px-3 py-2 rounded-full"
                style={{
                  background: ESTADO_COLORES[cita.estado]?.bg || "#e5e7eb",
                  color: ESTADO_COLORES[cita.estado]?.text || "#374151",
                }}
              >
                {cita.estado}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="bi bi-calendar3"></i>
                <span className="font-medium">{fechaStr}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Valor Total</div>
              <div className="text-2xl font-bold text-primary">
                ${formatNumber(valorTotal)}
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-gray-50 rounded-lg p-5 mb-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <i className="bi bi-person-circle text-primary text-lg"></i>
              <h3 className="font-semibold text-base text-text-main">
                Información del Cliente
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Nombre</div>
                <div className="text-sm font-semibold text-gray-900">
                  {cita.usuario?.nombre || cita.cliente?.nombre || "Cliente"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Teléfono</div>
                <div className="text-sm font-semibold text-gray-900">
                  {cita.usuario?.telefono ||
                    cita.cliente?.telefono ||
                    "Sin teléfono"}
                </div>
              </div>
              {cita.usuario?.correo || cita.cliente?.correo ? (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Correo</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {cita.usuario?.correo || cita.cliente?.correo}
                  </div>
                </div>
              ) : null}
              {cita.usuario?.documento || cita.cliente?.documento ? (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Documento</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {cita.usuario?.documento || cita.cliente?.documento}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-gray-50 rounded-lg p-5 mb-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <i className="bi bi-list-check text-primary text-lg"></i>
              <h3 className="font-semibold text-base text-text-main">
                Servicios ({cita.servicios?.length || 0})
              </h3>
            </div>
            <div className="space-y-3">
              {cita.servicios && cita.servicios.length > 0 ? (
                cita.servicios.map((s, idx) => {
                  // Normalizar campos del backend
                  const nombreServicio =
                    s.servicio?.nombre || s.nombre_servicio || "Servicio";
                  const nombreEmpleado =
                    s.empleado?.nombre || s.nombre_empleado || "Sin asignar";
                  const duracion = s.duracion || s.servicio?.duracion || 0;
                  const precio = s.precio_unitario || s.precio || 0;
                  const cantidad = s.cantidad || 1;
                  const precioTotal = limpiarPrecio(precio) * cantidad;
                  const horaInicio = s.hora_inicio || "";
                  const horaFinalizacion = s.hora_finalizacion || s.hora_fin || "";

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-base text-gray-900 mb-1">
                            {nombreServicio}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <i className="bi bi-clock"></i>
                              {duracion} min
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="bi bi-person"></i>
                              {nombreEmpleado}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="bi bi-123"></i>
                              Cantidad: {cantidad}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Precio unitario</div>
                          <div className="text-sm font-semibold text-gray-900">
                            ${formatNumber(precio)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Total</div>
                          <div className="text-base font-bold text-primary">
                            ${formatNumber(precioTotal)}
                          </div>
                        </div>
                      </div>
                      {horaInicio && horaFinalizacion && (
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <i className="bi bi-clock-history"></i>
                            Inicio: <span className="font-semibold text-gray-900">{convertirHoraA12Horas(horaInicio)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="bi bi-clock-fill"></i>
                            Fin: <span className="font-semibold text-gray-900">{convertirHoraA12Horas(horaFinalizacion)}</span>
                          </span>
                        </div>
                      )}
                      {s.observaciones && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs font-medium text-gray-500 mb-1">Observaciones</div>
                          <div className="text-xs text-gray-700">{s.observaciones}</div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No hay servicios asignados
                </div>
              )}
            </div>
          </div>

          {/* Resumen de Horario */}
          <div className="bg-gray-50 rounded-lg p-5 mb-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <i className="bi bi-calendar-clock text-primary text-lg"></i>
              <h3 className="font-semibold text-base text-text-main">
                Resumen de Horario
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">Hora de Inicio</div>
                <div className="text-base font-semibold text-gray-900">
                  {convertirHoraA12Horas(horaInicio)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">Hora de Finalización</div>
                <div className="text-base font-semibold text-gray-900">
                  {convertirHoraA12Horas(horaFin)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">Duración Total</div>
                <div className="text-base font-semibold text-gray-900">
                  {duracionTotal} min
                </div>
              </div>
            </div>
          </div>

          {/* Motivo/Notas si existe */}
          {cita.motivo && (
            <div className="bg-gray-50 rounded-lg p-5 mb-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <i className="bi bi-sticky text-primary text-lg"></i>
                <h3 className="font-semibold text-base text-text-main">
                  Motivo / Notas
                </h3>
              </div>
              <div className="text-sm text-gray-700 bg-white rounded p-3 border border-gray-200">
                {cita.motivo}
              </div>
            </div>
          )}

          {errorCancel && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm text-red-600">{errorCancel}</span>
            </div>
          )}
        </div>

        {/* Footer fijo */}
        <div className="flex-none bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          {puedeEditar && (
            <button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-sm"
              onClick={handleEdit}
            >
              <i className="bi bi-pencil-square"></i>
              Editar
            </button>
          )}
          {!esCancelada && (
            <button
              className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
              onClick={handleCancelarClick}
              disabled={loadingCancel}
            >
              <i className="bi bi-x-circle"></i>
              Cancelar cita
            </button>
          )}
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-sm"
            onClick={onClose}
          >
            <i className="bi bi-check-circle-fill"></i>
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de confirmación de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none font-inter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in">
            {/* Header */}
            <div className="flex-none bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between px-6 py-4 shadow-lg rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="bi bi-exclamation-triangle text-lg"></i>
                </div>
                <h2 className="text-xl font-bold m-0">Confirmar Cancelación</h2>
              </div>
              <button
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
                onClick={handleCancelarCancelar}
                aria-label="Cerrar"
                disabled={loadingCancel}
              >
                ×
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="bi bi-chat-left-text mr-1"></i>
                  Motivo de cancelación (Opcional)
                </label>
                <textarea
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  placeholder="Ingresa el motivo de la cancelación (opcional)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                  rows="4"
                  disabled={loadingCancel}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este campo es opcional. Puedes dejar un comentario sobre el motivo de la cancelación.
                </p>
              </div>

              {errorCancel && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-exclamation-circle text-red-600"></i>
                    <span className="text-sm text-red-700">{errorCancel}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-none bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                onClick={handleCancelarCancelar}
                disabled={loadingCancel}
              >
                <i className="bi bi-x-circle"></i>
                No, mantener cita
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 shadow-sm"
                onClick={handleCancelarConfirmar}
                disabled={loadingCancel}
              >
                {loadingCancel ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Cancelando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill"></i>
                    Sí, cancelar cita
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AppointmentDetailModal.propTypes = {
  cita: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default AppointmentDetailModal;
