import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';

const EMPLOYEES_KEY = 'capex_employees';

const GeneralCalendar = ({ employees: initialEmployees = [] }) => {
  const [employees, setEmployees] = useState(initialEmployees);
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
    setEmployees(updatedEmployees);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
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
    setEmployees(updatedEmployees);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
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
          onChange={e => setTitleInput(e.target.value)}
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Eliminar
          </button>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Guardar
          </button>
        </div>
      </SeeScheduling>
    </div>
  );
};

export default GeneralCalendar;
