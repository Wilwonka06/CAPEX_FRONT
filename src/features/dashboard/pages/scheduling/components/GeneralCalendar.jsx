import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddScheduling from './AddScheduling';

const EMPLOYEES_KEY = 'capex_employees';

const GeneralCalendar = ({ employees = [], onAddEvent }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit'); // 'edit' o 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  // Utilidad para obtener todas las fechas entre dos días (inclusive)
  function getDatesInRange(startDate, endDate) {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // Agrupar programaciones por empleado, día y rango horario, y solo dejar la primera de cada grupo
  function normalizeSchedulings(employees) {
    return employees.map(emp => {
      if (!Array.isArray(emp.schedulings)) return emp;
      const group = {};
      emp.schedulings.forEach(ev => {
        const key = `${ev.fechaInicio?.split('T')[0] || ''}_${ev.fechaFin?.split('T')[0] || ''}_${ev.horaInicio || ''}_${ev.horaFin || ''}`;
        if (!group[key]) {
          group[key] = ev;
        }
      });
      return { ...emp, schedulings: Object.values(group) };
    });
  }

  // Usar empleados normalizados
  const normalizedEmployees = normalizeSchedulings(employees);

  // Unir todas las programaciones de todos los empleados, expandiendo rangos y agrupando por empleado y día
  let expandedEvents = normalizedEmployees.flatMap(emp =>
    (emp.schedulings || []).flatMap(ev => {
      let start = ev.fechaInicio ? ev.fechaInicio.split('T')[0] : undefined;
      let end = ev.fechaFin ? ev.fechaFin.split('T')[0] : undefined;
      if (!start) return [];
      if (!end) end = start;
      const days = getDatesInRange(start, end);
      return days.map((date, idx) => ({
        ...ev,
        id: `${ev.id.toString()}_${idx}`,
        title: emp.nombre + ': ' + (ev.title || `${ev.horaInicio}-${ev.horaFin}`),
        start: date.toISOString().split('T')[0],
        allDay: true,
        empleadoId: emp.id,
      }));
    })
  );

  // Mostrar todos los eventos expandidos, sin agrupar
  const calendarEvents = expandedEvents;

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
        selectable={true}
        editable={false}
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
      />
      {/* Modal para editar evento */}
      {modalType === 'edit' && (
        <SeeScheduling
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={'Detalle de programación'}
          onDelete={handleDelete}
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

export default GeneralCalendar;
