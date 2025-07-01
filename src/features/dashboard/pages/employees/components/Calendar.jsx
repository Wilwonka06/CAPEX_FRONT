import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';

const Calendar = ({ events = [], onEditEvent, onDeleteEvent }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit'); // Solo edición
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState('');

  const handleEventClick = (info) => {
    setModalType('edit');
    setSelectedEvent(info.event);
    setTitleInput(info.event.title);
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

  // Adaptar las programaciones a eventos de FullCalendar
  const calendarEvents = events.map(ev => ({
    id: ev.id.toString(),
    title: ev.title || `${ev.horaInicio}-${ev.horaFin}`,
    start: ev.fechaInicio,
    end: ev.fechaFin,
    ...ev,
  }));

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
        selectable={false}
        editable={false}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="auto"
      />
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
    </div>
  );
};

export default Calendar;
