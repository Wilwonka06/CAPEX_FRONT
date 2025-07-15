import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import AddScheduling from './AddScheduling';

const EMPLOYEES_KEY = 'capex_employees';

const Calendar = ({ empleado, onUpdateEmpleado }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [eventos, setEventos] = useState([]);

  const expandirProgramacion = (prog, idBase) => {
    const { fechaInicio, fechaFin, dias = [] } = prog;
  
    const diasSemanaMap = {
      domingo: 0, lunes: 1, martes: 2, miercoles: 3,
      miércoles: 3, jueves: 4, viernes: 5, sabado: 6, sábado: 6
    };
  
    const diasSeleccionados = dias.map(d => {
      const limpio = d.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return diasSemanaMap[limpio];
    });
  
    const eventos = [];
    const start = new Date(fechaInicio + 'T00:00');
    const end = new Date(fechaFin + 'T23:59');
  
    let current = new Date(start);
    let idx = 0;
  
    while (current <= end) {
      const diaSemana = current.getDay();
  
      if (diasSeleccionados.length === 0 || diasSeleccionados.includes(diaSemana)) {
        eventos.push({
          ...prog,
          fechaInicio: current.toISOString().split('T')[0],
          fechaFin: current.toISOString().split('T')[0],
          id: `${idBase}_${idx}`,
          idBase,
        });
        idx++;
      }
  
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    }
  
    return eventos;
  };
  

  const handleAddEvent = (prog) => {
    const empleados = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
    const idBase = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    const nuevoProg = { ...prog, idBase };

    const nuevosEmpleados = empleados.map(emp =>
      emp.id === empleado.id
        ? { ...emp, schedulings: [...(emp.schedulings || []), nuevoProg] }
        : emp
    );

    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(nuevosEmpleados));
    if (onUpdateEmpleado) onUpdateEmpleado(nuevosEmpleados.find(e => e.id === empleado.id));

    const eventosNuevos = expandirProgramacion(nuevoProg, idBase).map(ev => ({
      id: ev.id,
      title: `${ev.horaInicio} - ${ev.horaFin}`,
      start: ev.fechaInicio,
      allDay: true,
    }));

    setEventos(prev => [...prev, ...eventosNuevos]);
    setModalOpen(false);

    window.location.reload();
  };

  useEffect(() => {
    if (!empleado) return;

    const schedulings = empleado.schedulings || [];
    const todosEventos = schedulings.flatMap(prog => {
      const idBase = prog.idBase || prog.id;
      return expandirProgramacion(prog, idBase);
    }).map(ev => ({
      id: ev.id,
      title: `${ev.horaInicio} - ${ev.horaFin}`,
      start: ev.fechaInicio,
      allDay: true,
    }));

    setEventos(todosEventos);
  }, [empleado]);

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={eventos}
        dateClick={() => setModalOpen(true)}
      />

      {modalOpen && (
        <div className="mt-4">
          <AddScheduling
            onAdd={handleAddEvent}
            empleado={empleado}
            editing={null}
            onCancelEdit={() => setModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar;
