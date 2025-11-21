import React, { useState, useEffect } from "react";
import { schedulingService } from "../API/employeesService";

const SeeScheduling = ({ empleadoId, onClose }) => {
  const [programaciones, setProgramaciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (empleadoId) {
      cargarProgramaciones();
    } else {
      setLoading(false);
      setLoadError("No se proporcionó ID de empleado");
    }
  }, [empleadoId]);

  const cargarProgramaciones = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      console.log(
        "[SeeScheduling] 🔍 Cargando programaciones para empleadoId:",
        empleadoId
      );

      const progs = await schedulingService.getByUser(empleadoId);
      console.log("[SeeScheduling] ✅ Programaciones cargadas:", progs);
      setProgramaciones(progs || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("[SeeScheduling] ❌ Error cargando programaciones:", error);

      let errorMsg = "Error al cargar programaciones";

      if (error.response?.status === 500) {
        errorMsg =
          "Error del servidor al cargar programaciones. Contacte al administrador.";
      } else if (error.response?.status === 404) {
        errorMsg = "No se encontró el empleado";
      } else if (error.code === "ERR_NETWORK") {
        errorMsg = "No se puede conectar al servidor";
      }

      setLoadError(errorMsg);
      setProgramaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const totalPages = programaciones.length;
  const paginatedProgramaciones = programaciones.slice(
    currentPage - 1,
    currentPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 bg-[#FACC15] rounded-full flex items-center justify-center mb-4">
          <i className="bi bi-arrow-repeat animate-spin text-2xl text-gray-800"></i>
        </div>
        <h4 className="text-lg font-semibold text-gray-800 mb-2 font-nunito">
          Cargando Programaciones
        </h4>
        <p className="text-gray-600 font-lato">
          Estamos obteniendo la información del empleado...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="bi bi-exclamation-triangle text-red-600 text-xl"></i>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 font-nunito mb-2">
              Error al Cargar Programaciones
            </h3>
            <p className="text-red-700 font-lato mb-3">{loadError}</p>
            <p className="text-sm text-red-600 font-mono bg-red-100 px-3 py-1 rounded-lg inline-block">
              ID Empleado: {empleadoId}
            </p>
            <div className="mt-4">
              <button
                onClick={cargarProgramaciones}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-semibold font-lato flex items-center gap-2"
              >
                <i className="bi bi-arrow-repeat"></i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {programaciones.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-calendar-x text-3xl text-gray-500"></i>
          </div>
          <h4 className="text-xl font-bold text-gray-700 mb-2 font-nunito">
            Sin Programaciones
          </h4>
          <p className="text-gray-600 font-lato max-w-md mx-auto">
            Este empleado aún no tiene programaciones de trabajo registradas.
            Puedes agregar una nueva programación desde el calendario.
          </p>
        </div>
      ) : (
        <>
          {paginatedProgramaciones.map((programacion) => (
            <div
              key={programacion.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg">
                  <i className="bi bi-calendar-event text-xl text-white"></i>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 font-nunito">
                    Programación de Trabajo
                  </h4>
                  <p className="text-gray-600 font-lato">
                    Horario asignado al empleado
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                      <i className="bi bi-calendar-day text-white text-sm"></i>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-lato">
                      Fechas
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Inicio:</span>
                      <span className="text-gray-800 font-bold font-mono">
                        {formatDate(
                          programacion.fechaInicio || programacion.fecha
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Fin:</span>
                      <span className="text-gray-800 font-bold font-mono">
                        {formatDate(
                          programacion.fechaInicio || programacion.fecha
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                      <i className="bi bi-clock text-white text-sm"></i>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-lato">
                      Horario
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Entrada:
                      </span>
                      <span className="text-gray-800 font-bold font-mono">
                        {formatTime(
                          programacion.horaInicio || programacion.hora_entrada
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Salida:</span>
                      <span className="text-gray-800 font-bold font-mono">
                        {formatTime(
                          programacion.horaFin || programacion.hora_salida
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Paginación Mejorada */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center gap-2 font-medium text-gray-700 disabled:text-gray-400"
                >
                  <i className="bi bi-chevron-left"></i>
                  Anterior
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-[#FACC15] text-gray-800 rounded-xl font-semibold">
                  <span>{currentPage}</span>
                  <span className="text-gray-600">de</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center gap-2 font-medium text-gray-700 disabled:text-gray-400"
                >
                  Siguiente
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}

            {totalPages === 1 && <div></div>}

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 font-semibold font-lato flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <i className="bi bi-check-circle"></i>
              Cerrar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SeeScheduling;