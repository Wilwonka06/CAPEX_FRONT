import { useState } from "react";
import PropTypes from "prop-types";
import { formatNumber } from "../../../../../shared/utils/formatters";
 
import appointmentsService from "../API/appointmentsService";
import toast from "react-hot-toast";

function limpiarPrecio(valor) {
  return Number(String(valor).replace(/[^\d]/g, "")) || 0;
}

// Colores personalizados para los estados (debe coincidir con Appointments.jsx)
const ESTADO_COLORES = {
  Agendada: { bg: "#FACC15", text: "#7C5700" },
  Confirmada: { bg: "#60A5FA", text: "#1E3A8A" },
  Reprogramada: { bg: "#F59E42", text: "#7C3F00" },
  "En proceso": { bg: "#A78BFA", text: "#4B006E" },
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
    case "En proceso":
      return "text-purple-600";
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
  if (!cita) return null;
  const fechaStr = cita.fecha_servicio
    ? new Date(cita.fecha_servicio).toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
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

  const handleCancelar = async () => {
    setLoadingCancel(true);
    setErrorCancel(null);
    console.log("Intentando cancelar cita...");

    const cancelPromise = (async () => {
      await appointmentsService.cancel(
        cita.id_cita,
        "Cancelada por el usuario"
      );
      console.log("Cita cancelada en API");
      if (onCancel) await onCancel();
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

  // Determinar si la cita está cancelada
  const esCancelada =
    cita.estado === "Cancelada por el usuario" || cita.estado === "No asistio";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm select-none font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-calendar-event text-lg"></i></div><h2 className="text-xl font-bold m-0">Detalles de la cita</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-semibold text-xs px-2 py-1 rounded-full"
            style={{
              background: ESTADO_COLORES[cita.estado]?.bg || "#e5e7eb",
              color: ESTADO_COLORES[cita.estado]?.text || "#374151",
              border: "1px solid #e5e7eb",
            }}
          >
            {cita.estado}
          </span>
          <span className="text-xs text-gray-400">{fechaStr}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="font-semibold mb-2 text-text-main">
            Información del Cliente
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <span className="font-medium">Nombre:</span>{" "}
              {cita.usuario?.nombre || cita.cliente?.nombre || "Cliente"}
            </div>
            <div>
              <span className="font-medium">Teléfono:</span>{" "}
              {cita.usuario?.telefono ||
                cita.cliente?.telefono ||
                "Sin teléfono"}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="font-semibold mb-2 text-text-main">Servicios</div>
          {cita.servicios &&
            cita.servicios.map((s, idx) => {
              // Normalizar campos del backend
              const nombreServicio =
                s.servicio?.nombre || s.nombre_servicio || "Servicio";
              const nombreEmpleado =
                s.empleado?.nombre || s.nombre_empleado || "Sin asignar";
              const duracion = s.duracion || s.servicio?.duracion || 0;
              const precio = s.precio_unitario || s.precio || 0;
              const horaInicio = s.hora_inicio || "";
              const horaFinalizacion = s.hora_finalizacion || s.hora_fin || "";

              return (
                <div
                  key={idx}
                  className="border-b border-gray-200 py-2 flex flex-col md:flex-row md:items-center md:gap-8"
                >
                  <div className="flex-1">
                    <span className="font-semibold">{nombreServicio}</span>{" "}
                    <span className="text-xs text-gray-500">
                      {duracion} min $ {formatNumber(precio)}
                    </span>
                    <div className="text-xs text-gray-500">
                      Profesional: {nombreEmpleado} | Cantidad:{" "}
                      {s.cantidad || 1}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div>
                      Hora inicio:{" "}
                      <span className="font-semibold">{horaInicio}</span>
                    </div>
                    <div>
                      Hora finalización:{" "}
                      <span className="font-semibold">{horaFinalizacion}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="font-semibold mb-2 text-text-main">Horario</div>
          <div className="flex gap-8 text-sm">
            <div>
              Hora inicio: <span className="font-semibold">{horaInicio} h</span>
            </div>
            <div>
              Hora finalización:{" "}
              <span className="font-semibold">{horaFin} h</span>
            </div>
            <div>
              Duración total:{" "}
              <span className="font-semibold">{duracionTotal} min</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-8">
          <div className="text-lg font-bold text-text-main">
            Valor Total: <span className="text-primary">${valorTotal}</span>
          </div>
        </div>
        {errorCancel && (
          <span className="text-xs text-red-500 ml-2">{errorCancel}</span>
        )}
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          {!esCancelada && (
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded shadow hover:bg-gray-300 font-semibold" onClick={handleCancelar} disabled={loadingCancel}>{loadingCancel ? "Cancelando..." : "Cancelar cita"}</button>
          )}
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2" onClick={onClose}><i className="bi bi-check-circle"></i>Cerrar</button>
        </div>
      </div>
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
