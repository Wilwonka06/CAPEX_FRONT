import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddRecurringScheduling from '../../employees/components/AddRecurringScheduling';
import SchedulingDetailView from './SchedulingDetailView';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { recurringSchedulingService } from '../../employees/API/employeesService';
import esLocale from '@fullcalendar/core/locales/es';
import '../../../../../shared/styles/calendar.css';

const GeneralCalendar = ({ employees = [], schedulings = [], onAddEvent, onUpdateRecurring, onDeleteRecurring }) => {
  console.log("[GeneralCalendar] RENDER:");
  console.log("  - employees:", employees);
  console.log("  - employees.length:", employees?.length);
  console.log("  - schedulings:", schedulings);
  console.log("  - schedulings.length:", schedulings?.length);

  // Estados generales del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  

  // Estado para los eventos del calendario y rango visible
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [viewRange, setViewRange] = useState({ start: null, end: null });

  // Cargar eventos desde programaciones recurrentes
  const loadEvents = () => {
    const programaciones = Array.isArray(schedulings) ? schedulings : [];
    const { start, end } = viewRange;
    if (!start || !end) return;

    const colors = [
      { bg: '#3b82f6', border: '#2563eb' },
      { bg: '#8b5cf6', border: '#7c3aed' },
      { bg: '#10b981', border: '#059669' },
      { bg: '#f59e0b', border: '#d97706' },
      { bg: '#ef4444', border: '#dc2626' },
      { bg: '#06b6d4', border: '#0891b2' },
      { bg: '#6366f1', border: '#4f46e5' },
      { bg: '#ec4899', border: '#db2777' },
    ];

    const events = [];

    for (const prog of programaciones) {
      const empleadoId = prog.id_usuario;
      const employee = employees.find(emp => String(emp.id) === String(empleadoId));
      const colorIndex = empleadoId ? (empleadoId % colors.length) : 0;
      const selectedColor = colors[colorIndex];

      const progStart = new Date((prog.fecha_inicio || start.toISOString().split('T')[0]) + 'T00:00:00');
      const progEnd = new Date((prog.fecha_fin || end.toISOString().split('T')[0]) + 'T00:00:00');
      const rangeStart = new Date(start);
      const rangeEnd = new Date(end);
      const iterStart = rangeStart > progStart ? rangeStart : progStart;
      const iterEnd = rangeEnd < progEnd ? rangeEnd : progEnd;

      const dias = Array.isArray(prog.dias_semana) ? prog.dias_semana : [];
      const bloques = Array.isArray(prog.bloques_horarios) ? prog.bloques_horarios : [];

      const cursor = new Date(iterStart);
      while (cursor <= iterEnd) {
        const diaSemana = cursor.getDay();
        if (dias.includes(diaSemana)) {
          for (const b of bloques) {
            const horaEntradaFormato = String(b.inicio).substring(0,5);
            const horaSalidaFormato = String(b.fin).substring(0,5);
            events.push({
              id: `${prog.id}-${cursor.toISOString().split('T')[0]}-${horaEntradaFormato}`,
              title: employee ? `${employee.nombre} (${horaEntradaFormato} - ${horaSalidaFormato})` : `(${horaEntradaFormato} - ${horaSalidaFormato})`,
              start: cursor.toISOString().split('T')[0],
              allDay: true,
              backgroundColor: selectedColor.bg,
              borderColor: selectedColor.border,
              textColor: '#ffffff',
              classNames: ['custom-event','scheduling-event'],
              extendedProps: {
                programacionId: prog.id,
                empleadoId: empleadoId,
                empleadoNombre: employee?.nombre || 'Sin nombre',
                bloque: b
              }
            });
          }
        }
        cursor.setDate(cursor.getDate()+1);
      }
    }

    setCalendarEvents(events);
  };

  useEffect(() => {
    loadEvents();
  }, [employees, schedulings, viewRange]);

  const handleEventClick = (info) => {
    console.log("[GeneralCalendar] Evento clickeado:", info.event);
    setModalType('edit');
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
      title: '¿Estás seguro de eliminar esta programación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    });
    
    if (!result.isConfirmed) return;

    const deletePromise = (async () => {
      if (onDeleteRecurring) await onDeleteRecurring(programacionId);
      setModalOpen(false);
      return true;
    })();

    toast.promise(deletePromise, {
      loading: 'Eliminando programación...',
      success: 'Programación eliminada correctamente',
      error: (err) => {
        console.error("[GeneralCalendar] Error eliminando programación:", err);
        const backendMsg = err?.response?.data?.message || err?.response?.data?.msg || err?.response?.data?.error;
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
    const scheduling = schedulings.find(s => String(s.id) === String(programacionId));

    console.log("[GeneralCalendar] handleEdit - schedulingId:", schedulingId);
    console.log("[GeneralCalendar] handleEdit - scheduling encontrado:", scheduling);

    if (!scheduling) {
      toast.error('No se pudo encontrar la programación');
      return;
    }

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
    console.log("[GeneralCalendar] handleAddEvent called with prog:", prog);
    if (onAddEvent) onAddEvent(prog);
    setModalOpen(false);
  };

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        locale={esLocale}
        selectable={true}
        editable={false}
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        datesSet={(arg) => {
          setViewRange({ start: arg.start, end: arg.end });
        }}
        height="auto"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          prev: '←',
          next: '→',
        }}
        dayHeaderFormat={{ weekday: 'short' }}
        titleFormat={{ year: 'numeric', month: 'long' }}
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

      {modalType === 'edit' && !editFormOpen && (
        <SeeScheduling
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={'Detalle de programación'}
          onDelete={handleDelete}
          onEdit={handleEdit}
          canEdit={true}
          canDelete={true}
        >
                    <SchedulingDetailView selectedEvent={selectedEvent} />`n        </SeeScheduling>
      )}

      {editFormOpen && (
        <SeeScheduling
          isOpen={editFormOpen}
          onClose={() => {
            setEditFormOpen(false);
            setModalOpen(false);
            setEditingData(null);
            setSelectedEvent(null);
          }}
          title={'Editar programación'}
        >
          <AddRecurringScheduling
            editing={editingData}
            empleadoId={editingData?.id_usuario}
            onSave={handleSaveEdit}
            onCancel={() => {
              setEditFormOpen(false);
              setEditingData(null);
            }}
          />
        </SeeScheduling>
      )}

      {/* La creación de programaciones recurrentes se controla desde scheduling.jsx */}
      
    </div>
  );
};

export default GeneralCalendar;
