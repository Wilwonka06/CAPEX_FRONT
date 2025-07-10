import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddScheduling from './AddScheduling';

const Calendar = ({ events = [], onEditEvent, onDeleteEvent, onAddEvent }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit'); // 'edit' o 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  // Expansión robusta de eventos
  const calendarEvents = events.flatMap(ev => {
    let start = ev.fechaInicio ? ev.fechaInicio.split('T')[0] : undefined;
    let end = ev.fechaFin ? ev.fechaFin.split('T')[0] : undefined;
    if (!start) return [];
    if (!end) end = start;
    const days = [];
    let current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days.map((date, idx) => ({
      ...ev,
      id: `${ev.id ? ev.id.toString() : (ev.idBase ? ev.idBase.toString() : 'noid')}_${idx}`,
      idBase: ev.idBase ? ev.idBase : (ev.id ? ev.id.toString() : 'noid'),
      title: ev.title || `${ev.horaInicio}-${ev.horaFin}`,
      start: date.toISOString().split('T')[0],
      allDay: true,
    }));
  });

  const handleEventClick = (info) => {
    setModalType('edit');
    setSelectedEvent(info.event);
    setTitleInput(info.event.title);
    setModalOpen(true);
  };

  // Nuevo: manejar click en un día vacío
  const handleDateClick = (info) => {
    setModalType('add');
    setSelectedDate(info.dateStr);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (onEditEvent && selectedEvent) {
      onEditEvent({
        ...selectedEvent.extendedProps,
        id: selectedEvent.id,
        title: titleInput,
        date: selectedEvent.startStr,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (onDeleteEvent && selectedEvent) {
      onDeleteEvent(selectedEvent.id);
    }
    setModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
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
        displayEventTime={false}
      />
      {/* Modal para editar evento */}
      {modalType === 'edit' && (
        <SeeScheduling
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={'Detalle de programación'}>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
            placeholder="Título de la programación"
            value={titleInput}
            readOnly
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">
              Cerrar
            </button>
          </div>
        </SeeScheduling>
      )}
      {/* Modal para agregar evento */}
      {modalType === 'add' && (
        <SeeScheduling
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={'Agregar programación'}>
          <AddScheduling
            onAdd={(prog) => {
              if (onAddEvent) onAddEvent({ ...prog, fechaInicio: selectedDate, fechaFin: selectedDate });
              setModalOpen(false);
            }}
            editing={null}
            onCancelEdit={() => setModalOpen(false)}
          />
        </SeeScheduling>
      )}
    </div>
  );
};

export default Calendar;
