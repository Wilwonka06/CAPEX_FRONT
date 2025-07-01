import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';

const EMPLOYEES_KEY = 'capex_employees';

const GeneralCalendar = ({ employees = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState('');

  // Unir todas las programaciones de todos los empleados
  const calendarEvents = employees.flatMap(emp =>
    (emp.schedulings || []).map(ev => ({
      ...ev,
      id: ev.id.toString(),
      title: emp.nombre + ': ' + (ev.title || `${ev.horaInicio}-${ev.horaFin}`),
      start: ev.fechaInicio,
      end: ev.fechaFin,
      empleadoId: emp.id,
    }))
  );

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setTitleInput(info.event.title);
    setModalOpen(true);
  };

  // Eliminar programación
  const handleDelete = () => {
    if (!selectedEvent) return;
    const empId = selectedEvent.extendedProps.empleadoId;
    const progId = selectedEvent.id;
    const updatedEmployees = employees.map(emp =>
      emp.id === empId
        ? { ...emp, schedulings: (emp.schedulings || []).filter(ev => ev.id.toString() !== progId) }
        : emp
    );
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    // Recargar la página para reflejar los cambios
    window.location.reload();
    setModalOpen(false);
  };

  // Editar programación (solo título)
  const handleSave = () => {
    if (!selectedEvent) return;
    const empId = selectedEvent.extendedProps.empleadoId;
    const progId = selectedEvent.id;
    const updatedEmployees = employees.map(emp =>
      emp.id === empId
        ? {
            ...emp,
            schedulings: (emp.schedulings || []).map(ev =>
              ev.id.toString() === progId ? { ...ev, title: titleInput } : ev
            ),
          }
        : emp
    );
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    // Recargar la página para reflejar los cambios
    window.location.reload();
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

export default GeneralCalendar;
