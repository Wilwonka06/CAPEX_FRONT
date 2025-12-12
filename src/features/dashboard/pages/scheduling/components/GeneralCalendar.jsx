import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import EditScheduling from "./EditScheduling";
import SchedulingDetail from "./SchedulingDetail";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { recurringSchedulingService } from "../../employees/API/employeesService";
import esLocale from "@fullcalendar/core/locales/es";
import "../../../../../shared/styles/calendar.css";

// Función helper para obtener el rango por defecto del mes actual
const getDefaultViewRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999); // Asegurar que incluya todo el último día
  return { start, end };
};

const GeneralCalendar = ({
  employees = [],
  schedulings = [],
  onAddEvent,
  onUpdateRecurring,
  onDeleteRecurring,
}) => {
  // Estados generales del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("edit");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Estado para los eventos del calendario y rango visible
  // Inicializar con un rango por defecto para que los eventos se carguen inmediatamente
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [viewRange, setViewRange] = useState(getDefaultViewRange());

  // Cargar eventos desde programaciones recurrentes
  const loadEvents = () => {
    const programaciones = Array.isArray(schedulings) ? schedulings : [];
    const { start, end } = viewRange;
    if (!start || !end) return;

    const colors = [
      { bg: "#3b82f6", border: "#2563eb" },
      { bg: "#8b5cf6", border: "#7c3aed" },
      { bg: "#10b981", border: "#059669" },
      { bg: "#f59e0b", border: "#d97706" },
      { bg: "#ef4444", border: "#dc2626" },
      { bg: "#06b6d4", border: "#0891b2" },
      { bg: "#6366f1", border: "#4f46e5" },
      { bg: "#ec4899", border: "#db2777" },
    ];

    const events = [];

    for (const prog of programaciones) {
      const empleadoId = prog.id_usuario;
      const employee = employees.find(
        (emp) => String(emp.id) === String(empleadoId)
      );
      const colorIndex = empleadoId ? empleadoId % colors.length : 0;
      const selectedColor = colors[colorIndex];

      const progStart = new Date(
        (prog.fecha_inicio || start.toISOString().split("T")[0]) + "T00:00:00"
      );
      const progEnd = new Date(
        (prog.fecha_fin || end.toISOString().split("T")[0]) + "T00:00:00"
      );
      const rangeStart = new Date(start);
      const rangeEnd = new Date(end);
      const iterStart = rangeStart > progStart ? rangeStart : progStart;
      const iterEnd = rangeEnd < progEnd ? rangeEnd : progEnd;

      const dias = Array.isArray(prog.dias_semana) ? prog.dias_semana : [];
      const bloques = Array.isArray(prog.bloques_horarios)
        ? prog.bloques_horarios
        : [];

      const cursor = new Date(iterStart);
      while (cursor <= iterEnd) {
        const diaSemana = cursor.getDay();
        if (dias.includes(diaSemana)) {
          for (const b of bloques) {
            const horaEntradaFormato = String(b.inicio).substring(0, 5);
            const horaSalidaFormato = String(b.fin).substring(0, 5);
            events.push({
              id: `${prog.id}-${
                cursor.toISOString().split("T")[0]
              }-${horaEntradaFormato}`,
              title: employee
                ? `${employee.nombre} (${horaEntradaFormato} - ${horaSalidaFormato})`
                : `(${horaEntradaFormato} - ${horaSalidaFormato})`,
              start: cursor.toISOString().split("T")[0],
              allDay: true,
              backgroundColor: selectedColor.bg,
              borderColor: selectedColor.border,
              textColor: "#ffffff",
              classNames: ["custom-event", "scheduling-event"],
              extendedProps: {
                programacionId: prog.id,
                empleadoId: empleadoId,
                empleadoNombre: employee?.nombre || "Sin nombre",
                bloque: b,
              },
            });
          }
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    setCalendarEvents(events);
  };

  useEffect(() => {
    loadEvents();
  }, [employees, schedulings, viewRange]);

  // Cerrar modal de detalle cuando se abre el modal de edición
  useEffect(() => {
    if (editFormOpen && modalOpen) {
      setModalOpen(false);
    }
  }, [editFormOpen]);

  const handleEventClick = (info) => {
    setModalType("edit");
    setSelectedEvent(info.event);
    setTitleInput(info.event.title);
    setModalOpen(true);
  };

  const handleDateClick = (info) => {
    if (onAddEvent) onAddEvent(null);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    const programacionId = selectedEvent.extendedProps?.programacionId;
    if (!programacionId) return;

    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar esta programación?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    const deletePromise = (async () => {
      if (onDeleteRecurring) await onDeleteRecurring(programacionId);
      setModalOpen(false);
      return true;
    })();

    toast.promise(deletePromise, {
      loading: "Eliminando programación...",
      success: "Programación eliminada correctamente",
      error: (err) => {
        console.error("[GeneralCalendar] Error eliminando programación:", err);
        const backendMsg =
          err?.response?.data?.message ||
          err?.response?.data?.msg ||
          err?.response?.data?.error;
        return backendMsg || "Error al eliminar programación";
      },
    });

    try {
      await deletePromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  const handleEdit = () => {
    if (!selectedEvent) return;

    const programacionId = selectedEvent.extendedProps?.programacionId;
    const scheduling = schedulings.find(
      (s) => String(s.id) === String(programacionId)
    );

    if (!scheduling) {
      toast.error("No se pudo encontrar la programación");
      return;
    }

    // Cerrar el modal de detalle cuando se abre el de edición
    setModalOpen(false);
    setEditingData(scheduling);
    setEditFormOpen(true);
  };

  const handleSaveEdit = async (prog) => {
    if (!editingData) return;
    if (onUpdateRecurring) await onUpdateRecurring(editingData.id, prog);
    setEditFormOpen(false);
    setModalOpen(false);
    setEditingData(null);
    setSelectedEvent(null);
  };

  const handleAddEvent = (prog) => {
    if (onAddEvent) onAddEvent(prog);
    setModalOpen(false);
  };

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale={esLocale}
        selectable={true}
        editable={false}
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        datesSet={(arg) => {
          // Actualizar el rango cuando el calendario cambia de vista
          // Esto asegura que los eventos se recarguen cuando el usuario navega
          if (arg.start && arg.end) {
            setViewRange({ start: arg.start, end: arg.end });
          }
        }}
        height="auto"
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          prev: "←",
          next: "→",
        }}
        dayHeaderFormat={{ weekday: "short" }}
        titleFormat={{ year: "numeric", month: "long" }}
        contentHeight="auto"
        handleWindowResize={true}
        dayMaxEventRows={3}
        moreLinkClick="popover"
        eventDisplay="block"
        eventTextColor="#ffffff"
        eventBorderColor="transparent"
        eventClassNames="shadow-md hover:shadow-lg"
        dayCellClassNames="hover:bg-gray-50 transition-colors"
        slotLabelClassNames="text-gray-600 font-medium"
        allDayText="Todo el día"
      />

      {modalType === "edit" && !editFormOpen && selectedEvent && (() => {
        const programacionId = selectedEvent.extendedProps?.programacionId;
        const scheduling = schedulings.find(
          (s) => String(s.id) === String(programacionId) || String(s.id_programacion_recurrente) === String(programacionId)
        );
        
        // Si encontramos la programación completa, usarla; si no, construir desde el evento
        const schedulingData = scheduling || {
          id: programacionId,
          id_usuario: selectedEvent.extendedProps?.empleadoId,
          empleadoNombre: selectedEvent.extendedProps?.empleadoNombre,
          hora_entrada: selectedEvent.extendedProps?.hora_entrada,
          hora_salida: selectedEvent.extendedProps?.hora_salida,
          fecha_inicio: selectedEvent.start ? new Date(selectedEvent.start).toISOString().split('T')[0] : null,
          bloques_horarios: selectedEvent.extendedProps?.bloque ? [selectedEvent.extendedProps.bloque] : [],
          dias_semana: [],
          estado: 'Activa',
          observaciones: ''
        };

        return (
          <SchedulingDetail
            scheduling={schedulingData}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={true}
            canDelete={true}
          />
        );
      })()}

      {editFormOpen && editingData && (
        <EditScheduling
          scheduling={editingData}
          onUpdate={handleSaveEdit}
          isOpen={editFormOpen}
          onClose={() => {
            setEditFormOpen(false);
            setModalOpen(false);
            setEditingData(null);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* La creación de programaciones recurrentes se controla desde scheduling.jsx */}
    </div>
  );
};

export default GeneralCalendar;
