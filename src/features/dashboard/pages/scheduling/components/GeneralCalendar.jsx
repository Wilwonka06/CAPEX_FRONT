import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddScheduling from './AddScheduling';
import EditScheduling from './EditScheduling';
import SchedulingDetailView from './SchedulingDetailView';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { schedulingService } from '../API/schedulingService';
import esLocale from '@fullcalendar/core/locales/es';
import '../../../../../shared/styles/calendar.css';

const GeneralCalendar = ({ employees = [], schedulings = [], onAddEvent, onUpdateEvent, onDeleteEvent }) => {
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
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);

  // Estado para los eventos del calendario
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Cargar eventos desde schedulings API
  const loadEvents = () => {
    const schedulingsActuales = schedulings || [];
    console.log("[GeneralCalendar] loadEvents - Programaciones recibidas:", schedulingsActuales);
    console.log("[GeneralCalendar] loadEvents - Empleados disponibles:", employees);

    const events = schedulingsActuales.map(scheduling => {
      console.log("[GeneralCalendar] Procesando scheduling:", scheduling);
      
      // Buscar empleado por id_usuario
      const empleadoId = scheduling.id_usuario || scheduling.empleadoId;
      const employee = employees.find(emp => {
        const match = String(emp.id) === String(empleadoId);
        console.log(`[GeneralCalendar] Comparando emp.id=${emp.id} con empleadoId=${empleadoId}: ${match}`);
        return match;
      });
      
      console.log("[GeneralCalendar] Empleado encontrado para id_usuario", empleadoId, ":", employee);

      // Obtener la fecha correcta (puede venir como fecha_inicio, fechaInicio o fecha)
      const fecha = scheduling.fecha_inicio || scheduling.fechaInicio || scheduling.fecha;
      
      // Obtener las horas
      const horaEntrada = scheduling.hora_entrada || scheduling.horaInicio;
      const horaSalida = scheduling.hora_salida || scheduling.horaFin;

      console.log("[GeneralCalendar] Datos del evento:", {
        fecha,
        horaEntrada,
        horaSalida,
        empleadoNombre: employee?.nombre
      });

      // Colores para programaciones - usando colores del sidebar
      // Variaciones sutiles de grises y azules para diferenciar empleados
      const colors = [
        { bg: '#3b82f6', border: '#2563eb' }, // Azul
        { bg: '#8b5cf6', border: '#7c3aed' }, // Morado
        { bg: '#10b981', border: '#059669' }, // Verde
        { bg: '#f59e0b', border: '#d97706' }, // Naranja
        { bg: '#ef4444', border: '#dc2626' }, // Rojo
        { bg: '#06b6d4', border: '#0891b2' }, // Cyan
        { bg: '#6366f1', border: '#4f46e5' }, // Índigo
        { bg: '#ec4899', border: '#db2777' }, // Rosa
      ];
      
      // Seleccionar color basado en el ID del empleado para consistencia
      const colorIndex = empleadoId ? (empleadoId % colors.length) : 0;
      const selectedColor = colors[colorIndex];
      
      // Formatear horas
      const horaEntradaFormato = horaEntrada ? horaEntrada.substring(0, 5) : '00:00';
      const horaSalidaFormato = horaSalida ? horaSalida.substring(0, 5) : '00:00';
      
      return {
        id: String(scheduling.id),
        title: employee 
          ? `${employee.nombre} (${horaEntradaFormato} - ${horaSalidaFormato})` 
          : `Programación: ${horaEntradaFormato} - ${horaSalidaFormato}`,
        start: fecha,
        allDay: true,
        backgroundColor: selectedColor.bg,
        borderColor: selectedColor.border,
        textColor: '#ffffff',
        classNames: ['custom-event', 'scheduling-event'],
        extendedProps: {
          schedulingId: scheduling.id,
          empleadoId: empleadoId,
          empleadoNombre: employee?.nombre || 'Sin nombre',
          hora_entrada: horaEntrada,
          hora_salida: horaSalida,
        }
      };
    });

    console.log("[GeneralCalendar] Eventos finales para el calendario:", events);
    setCalendarEvents(events);
  };

  useEffect(() => {
    console.log("[GeneralCalendar] useEffect triggered - reloading events");
    loadEvents();
  }, [employees, schedulings]);

  const handleEventClick = (info) => {
    console.log("[GeneralCalendar] Evento clickeado:", info.event);
    setModalType('edit');
    setSelectedEvent(info.event);
    setTitleInput(info.event.title);
    setModalOpen(true);
  };

  const handleDateClick = (info) => {
    console.log("[GeneralCalendar] handleDateClick - Opening add modal");
    console.log("[GeneralCalendar] employees at modal open:", employees);
    console.log("[GeneralCalendar] employees.length at modal open:", employees?.length);
    setModalType('add');
    setSelectedDate(info.dateStr);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    const schedulingId = selectedEvent.extendedProps?.schedulingId || selectedEvent.id;

    if (!schedulingId) {
      toast.error('No se pudo obtener el ID de la programación');
      return;
    }

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
      await schedulingService.delete(schedulingId);
      if (onDeleteEvent) {
        onDeleteEvent(schedulingId);
      }
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

    const schedulingId = selectedEvent.extendedProps?.schedulingId || selectedEvent.id;
    const scheduling = schedulings.find(s => String(s.id) === String(schedulingId));

    console.log("[GeneralCalendar] handleEdit - schedulingId:", schedulingId);
    console.log("[GeneralCalendar] handleEdit - scheduling encontrado:", scheduling);

    if (!scheduling) {
      toast.error('No se pudo encontrar la programación');
      return;
    }

    // Mapear los datos al formato que espera EditScheduling
    setEditingData({
      id: scheduling.id,
      fechaInicio: scheduling.fecha_inicio || scheduling.fechaInicio || scheduling.fecha,
      fechaFin: scheduling.fecha_inicio || scheduling.fechaInicio || scheduling.fecha,
      horaInicio: scheduling.hora_entrada || scheduling.horaInicio,
      horaFin: scheduling.hora_salida || scheduling.horaFin,
      empleadoId: scheduling.id_usuario || scheduling.empleadoId,
      dias: [],
      repeticion: 'No se repite'
    });
    setEditFormOpen(true);
  };

  const handleSaveEdit = async (prog) => {
    if (!editingData) {
      toast.error('Error: no hay datos de edición válidos');
      return;
    }

    console.log("[GeneralCalendar] handleSaveEdit - prog:", prog);
    console.log("[GeneralCalendar] handleSaveEdit - editingData:", editingData);

    const schedulingData = {
      id: editingData.id,
      id_usuario: prog.empleadoId,
      fecha_inicio: prog.fechaInicio,
      hora_entrada: prog.horaInicio,
      hora_salida: prog.horaFin,
    };

    console.log("[GeneralCalendar] handleSaveEdit - schedulingData a enviar:", schedulingData);

    if (onUpdateEvent) {
      onUpdateEvent(schedulingData);
    }

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
          <EditScheduling
            editing={editingData}
            onSave={handleSaveEdit}
            onCancelEdit={() => {
              setEditFormOpen(false);
              setEditingData(null);
            }}
          />
        </SeeScheduling>
      )}

      {modalType === 'add' && modalOpen && (
        <SeeScheduling
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={'Agregar programación'}
        >
          {console.log("[GeneralCalendar] Rendering AddScheduling with employees:", employees)}
          <AddScheduling
            onAdd={handleAddEvent}
            editing={null}
            onCancelEdit={() => setModalOpen(false)}
            employees={employees}
          />
        </SeeScheduling>
      )}
      
    </div>
  );
};

export default GeneralCalendar;

