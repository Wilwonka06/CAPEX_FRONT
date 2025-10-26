import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddScheduling from './AddScheduling';
import EditScheduling from './EditScheduling';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { deleteScheduling, updateScheduling, createScheduling } from '../services/schedulingApi.js';

const GeneralCalendar = ({ employees = [], schedulings = [], onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  console.log("[GeneralCalendar] RENDER:");
  console.log("  - employees:", employees);
  console.log("  - employees.length:", employees?.length);
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
    console.log("[GeneralCalendar] loadEvents - Programaciones:", schedulingsActuales);

    const events = schedulingsActuales.map(scheduling => {
      const employee = employees.find(emp => String(emp.id) === String(scheduling.id_usuario));
      console.log("[GeneralCalendar] Buscando empleado para scheduling.id_usuario:", scheduling.id_usuario);
      console.log("[GeneralCalendar] Empleado encontrado:", employee);

      return {
        id: scheduling.id,
        title: employee ? `${employee.nombre}: ${scheduling.hora_entrada}-${scheduling.hora_salida}` : `Programación: ${scheduling.hora_entrada}-${scheduling.hora_salida}`,
        start: scheduling.fecha,
        allDay: true,
        extendedProps: {
          id: scheduling.id,
          empleadoId: scheduling.id_usuario,
          hora_entrada: scheduling.hora_entrada,
          hora_salida: scheduling.hora_salida,
        }
      };
    });

    console.log("[GeneralCalendar] Eventos finales:", events);
    setCalendarEvents(events);
  };

  useEffect(() => {
    console.log("[GeneralCalendar] useEffect triggered - reloading events");
    loadEvents();
  }, [employees, schedulings]);

  const handleEventClick = (info) => {
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

    const schedulingId = selectedEvent.extendedProps?.id || selectedEvent.id;

    if (!schedulingId) {
      alert('⚠️ No se pudo obtener el ID de la programación.');
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro de eliminar esta programación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      await deleteScheduling(schedulingId);
      if (onDeleteEvent) {
        onDeleteEvent(schedulingId);
      }
      setModalOpen(false);
      toast.success('Programación eliminada correctamente!');
    } catch (error) {
      console.error("Error eliminando programación:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al eliminar programación");
    }
  };

  const handleEdit = () => {
    if (!selectedEvent) return;

    const schedulingId = selectedEvent.extendedProps?.id || selectedEvent.id;
    const scheduling = schedulings.find(s => s.id === schedulingId);

    if (!scheduling) {
      alert('⚠️ No se pudo encontrar la programación.');
      return;
    }

    setEditingData({
      id: scheduling.id,
      id_usuario: scheduling.id_usuario,
      fecha: scheduling.fecha,
      hora_entrada: scheduling.hora_entrada,
      hora_salida: scheduling.hora_salida,
      empleadoId: scheduling.id_usuario,
    });
    setEditFormOpen(true);
  };

  const handleSaveEdit = (prog) => {
    if (!editingData) {
      alert('Error: no hay datos de edición válidos.');
      return;
    }

    const schedulingData = {
      ...prog,
      id: editingData.id,
    };

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
    <div className="w-full p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        selectable={true}
        editable={false}
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
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
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
            placeholder="Título de la programación"
            value={titleInput}
            readOnly
          />
        </SeeScheduling>
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default GeneralCalendar;