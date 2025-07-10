import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddScheduling from './AddScheduling';
import EditScheduling from './EditScheduling';

const EMPLOYEES_KEY = 'capex_employees';

const GeneralCalendar = ({ employees = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // ✅ EXPANSIÓN de eventos robusta
  const calendarEvents = employees
    .filter(emp => emp && emp.id)
    .flatMap(emp =>
      (emp.schedulings || [])
        .filter(ev => ev && (ev.id || ev.idBase))
        .flatMap(ev => {
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

          const baseId = ev.idBase || (ev.id ? ev.id.toString() : Date.now().toString());

          return days.map((date, idx) => ({
            ...ev,
            id: `${baseId}_${idx}`,
            idBase: baseId,
            empleadoId: emp.id,
            title: emp.nombre + ': ' + (ev.title || `${ev.horaInicio}-${ev.horaFin}`),
            start: date.toISOString().split('T')[0],
            allDay: true,
          }));
        })
    );

  // 📅 Expandir programaciones con getUTCDay() corregido
  const expandirProgramacion = (prog, idBase) => {
    const { fechaInicio, fechaFin, dias = [], repeticion, ...rest } = prog;
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin || fechaInicio);

    const diasSemanaMap = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miercoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sabado: 6,
    };

    const diasSeleccionados = dias.map(d => diasSemanaMap[d]);
    const eventos = [];

    let current = new Date(start);
    let idx = 0;

    while (current <= end) {
      const diaSemana = current.getUTCDay(); // ✅ CORRECTO
      if (
        (repeticion === 'No se repite' && (diasSeleccionados.length === 0 || diasSeleccionados.includes(diaSemana))) ||
        (repeticion === 'Semanal' && diasSeleccionados.includes(diaSemana)) ||
        (repeticion === 'Mensual' && diasSeleccionados.includes(diaSemana))
      ) {
        eventos.push({
          ...rest,
          fechaInicio: current.toISOString().split('T')[0],
          fechaFin: current.toISOString().split('T')[0],
          dias,
          repeticion,
          id: idBase + '_' + idx,
          idBase,
          empleadoId: prog.empleadoId,
        });
        idx++;
      }
      current.setDate(current.getDate() + 1);
    }

    return eventos;
  };

  // ✅ AGREGAR programación correctamente
  const handleAddEvent = (prog) => {
    if (!prog.empleadoId) {
      alert('⚠️ Debes seleccionar un empleado.');
      return;
    }

    const empleados = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
    const idBase = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    const eventos = expandirProgramacion(prog, idBase);

    const nuevosEmpleados = empleados.map(emp =>
      emp.id && prog.empleadoId && emp.id.toString() === prog.empleadoId.toString()
        ? { ...emp, schedulings: [...(emp.schedulings || []), ...eventos] }
        : emp
    );

    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(nuevosEmpleados));
    setModalOpen(false);
    window.location.reload();
  };

  // ✅ EDITAR programación
  const handleEdit = () => {
    if (!selectedEvent) return;

    const rawId = selectedEvent.extendedProps?.id || selectedEvent.id;
    const idBase = rawId.includes('_') ? rawId.split('_')[0] : rawId;

    const empleadoId =
      selectedEvent.extendedProps?.empleadoId ||
      selectedEvent.groupId ||
      selectedEvent.resourceId ||
      (selectedEvent.getResources?.()[0]?.id);

    if (!empleadoId) {
      alert('⚠️ Error: empleadoId no definido.');
      return;
    }

    const emp = employees.find(e => e.id && String(e.id) === String(empleadoId));
    let progData = null;

    if (emp && Array.isArray(emp.schedulings)) {
      progData = emp.schedulings.find(ev => {
        const evIdBase = ev.idBase || (ev.id ? ev.id.toString() : undefined);
        return String(evIdBase) === String(idBase) || String(ev.id) === String(idBase);
      });
    }

    if (!progData) {
      alert(`No se encontró la programación para empleadoId=${empleadoId} y idBase=${idBase}`);
      return;
    }

    setEditingData({
      fechaInicio: progData.fechaInicio,
      fechaFin: progData.fechaFin,
      horaInicio: progData.horaInicio,
      horaFin: progData.horaFin,
      repeticion: progData.repeticion,
      dias: progData.dias || [],
      id: idBase,
      idBase,
      empleadoId,
      title: progData.title,
    });
    setEditFormOpen(true);
  };

  // ✅ GUARDAR edición
  const handleSaveEdit = (prog) => {
    if (!editingData) {
      alert('Error: no hay datos de edición válidos.');
      return;
    }

    const empId = editingData.empleadoId;
    const idBase = editingData.idBase || editingData.id || Date.now().toString();

    const updatedEmployees = employees.map(emp => {
      if (emp.id !== empId) return emp;

      let nuevasSchedulings = (emp.schedulings || []).filter(
        ev => String(ev.idBase) !== String(idBase) && String(ev.id) !== String(idBase)
      );

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

  // ✅ ELIMINAR programación
  const handleDelete = () => {
    if (!selectedEvent) return;
  
    const empId = selectedEvent.extendedProps?.empleadoId;
    const rawId = selectedEvent.extendedProps?.id || selectedEvent.id;
    const idBase = rawId ? rawId.split('_')[0] : undefined;
  
    console.log('🗑️ Eliminando:', { empId, rawId, idBase });
  
    if (!idBase) {
      alert('⚠️ No se pudo obtener idBase.');
      return;
    }
  
    const updatedEmployees = employees.map(emp => {
      if (String(emp.id) !== String(empId)) return emp;
  
      const schedulingsAntes = emp.schedulings || [];
      const schedulingsDespues = schedulingsAntes.filter(
        ev => String(ev.idBase) !== String(idBase)
      );
  
      console.log('Antes:', schedulingsAntes);
      console.log('Después:', schedulingsDespues);
  
      return { ...emp, schedulings: schedulingsDespues };
    });
  
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    setModalOpen(false);
    window.location.reload();
  };
  

  const handleEventClick = (info) => {
    setModalType('edit');
    setSelectedEvent(info.event);
    setTitleInput(info.event.title);
    setModalOpen(true);
  };

  const handleDateClick = (info) => {
    setModalType('add');
    setModalOpen(true);
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

      {modalType === 'add' && (
        <SeeScheduling
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={'Agregar programación'}
        >
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
