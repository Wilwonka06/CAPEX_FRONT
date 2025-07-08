import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddScheduling from './AddScheduling';
import EditScheduling from './EditScheduling';

const EMPLOYEES_KEY = 'capex_employees';

const GeneralCalendar = ({ employees = [], onAddEvent }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit'); // 'edit' o 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

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
  let expandedEvents = normalizedEmployees
    .filter(emp => emp && emp.id)
    .flatMap(emp =>
      (emp.schedulings || [])
        .filter(ev => ev && ev.id)
        .flatMap(ev => {
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
    // Extraer el id base (antes del guion bajo)
    const rawId = selectedEvent.extendedProps.id;
    const idBase = rawId ? rawId.split('_')[0] : undefined;
    if (!idBase) return;
    // Eliminar todas las repeticiones con el mismo id base
    const updatedEmployees = employees.map(emp =>
      emp.id === empId
        ? { ...emp, schedulings: (emp.schedulings || []).filter(ev => ev.idBase !== idBase) }
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
    const rawId = selectedEvent.extendedProps.id;
    const idBase = rawId ? rawId.split('_')[0] : undefined;
    if (!idBase) return;
    // Editar el título de todas las repeticiones con el mismo id base
    const updatedEmployees = employees.map(emp =>
      emp.id === empId
        ? {
            ...emp,
            schedulings: (emp.schedulings || []).map(ev =>
              ev.idBase === idBase ? { ...ev, title: titleInput } : ev
            ),
          }
        : emp
    );
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    // Recargar la página para reflejar los cambios
    window.location.reload();
    setModalOpen(false);
  };

  const handleEdit = () => {
    if (!selectedEvent) return;
    // Extraer el id base (antes del guion bajo)
    const rawId = selectedEvent.extendedProps.id;
    const idBase = rawId ? rawId.split('_')[0] : undefined;
    // Buscar la primera programación con ese id base para pasarla al formulario de edición
    let progData = null;
    for (const emp of employees) {
      if (emp.id === selectedEvent.extendedProps.empleadoId) {
        progData = (emp.schedulings || []).find(ev => ev.idBase === idBase);
        break;
      }
    }
    if (!progData) return;
    setEditingData({
      fechaInicio: progData.fechaInicio,
      fechaFin: progData.fechaFin,
      horaInicio: progData.horaInicio,
      horaFin: progData.horaFin,
      repeticion: progData.repeticion,
      dias: progData.dias || [],
      id: idBase,
      title: progData.title,
    });
    setEditFormOpen(true);
  };

  const handleSaveEdit = (prog) => {
    if (!selectedEvent) return;
    const empId = selectedEvent.extendedProps.empleadoId;
    // Chequeo de seguridad para el id
    const rawId = selectedEvent?.extendedProps?.id;
    if (!rawId) {
      alert('Error: la programación seleccionada no tiene un ID válido.');
      return;
    }
    // Extraer el id base (sin sufijo) para comparar correctamente
    const idBase = rawId.split('_')[0];

    // Expansión de la programación editada (igual que al agregar), usando el mismo id base
    function expandirProgramacion(prog, idBase) {
      const { fechaInicio, fechaFin, dias = [], repeticion, ...rest } = prog;
      const start = new Date(fechaInicio);
      const end = new Date(fechaFin || fechaInicio);
      const eventos = [];
      let current = new Date(start);
      const diasSemanaMap = {
        'Domingo': 0,
        'Lunes': 1,
        'Martes': 2,
        'Miercoles': 3,
        'Jueves': 4,
        'Viernes': 5,
        'Sabado': 6,
      };
      const diasSeleccionados = dias.map(d => diasSemanaMap[d]);
      let idx = 0;
      while (current <= end) {
        const diaSemana = current.getDay();
        if (
          (repeticion === 'No se repite' && (diasSeleccionados.length === 0 || diasSeleccionados.includes(diaSemana))) ||
          (repeticion === 'Semanal' && diasSeleccionados.length > 0 && diasSeleccionados.includes(diaSemana)) ||
          (repeticion === 'Mensual' && diasSeleccionados.length > 0 && diasSeleccionados.includes(diaSemana))
        ) {
          eventos.push({
            ...rest,
            fechaInicio: current.toISOString().split('T')[0],
            fechaFin: current.toISOString().split('T')[0],
            dias,
            repeticion,
            id: idBase + '_' + idx,
            idBase,
          });
          idx++;
        }
        current.setDate(current.getDate() + 1);
      }
      return eventos;
    }

    // Actualizar la programación editada en el empleado correspondiente
    const updatedEmployees = employees.map(emp => {
      if (emp.id !== empId) return emp;
      // Eliminar todas las repeticiones con el mismo id base
      let nuevasSchedulings = (emp.schedulings || []).filter(ev => ev.idBase !== idBase);
      // Agregar los eventos expandidos de la edición, usando el mismo id base
      nuevasSchedulings = [...nuevasSchedulings, ...expandirProgramacion(prog, idBase)];
      return { ...emp, schedulings: nuevasSchedulings };
    });
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    setEditFormOpen(false);
    setModalOpen(false);
    setEditingData(null);
    setSelectedEvent(null);
    window.location.reload();
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
      {/* Modal para editar formulario */}
      {editFormOpen && (
        <SeeScheduling
          isOpen={editFormOpen}
          onClose={() => { setEditFormOpen(false); setModalOpen(false); setEditingData(null); setSelectedEvent(null); }}
          title={'Editar programación'}
        >
          <EditScheduling
            editing={editingData}
            onSave={handleSaveEdit}
            onCancelEdit={() => { setEditFormOpen(false); setEditingData(null); }}
          />
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
              if (onAddEvent) onAddEvent(prog);
              setModalOpen(false);
            }}
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
