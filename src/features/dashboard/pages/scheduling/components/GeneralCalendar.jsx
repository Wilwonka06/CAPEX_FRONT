import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddScheduling from './AddScheduling';

const EMPLOYEES_KEY = 'capex_employees';

const GeneralCalendar = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  // Estado para guardar el empleado seleccionado en el modal de AddScheduling
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);


  // --- Función expandirProgramacion (con manejo de UTC y logs de depuración) ---
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
    
    // Normalizar las fechas de inicio y fin a medianoche UTC.
    // Añadir 'T00:00:00Z' asegura que se interpreten como UTC y en el inicio del día.
    const startUTC = new Date(fechaInicio + 'T00:00:00Z');
    const endUTC = new Date(fechaFin + 'T00:00:00Z');

    let current = new Date(startUTC); // Clona la fecha de inicio para iterar

    let idx = 0;

    // --- CONSOLE.LOGS DEPURACIÓN EN expandirProgramacion ---
    console.log("3. prog recibido en expandirProgramacion:", JSON.parse(JSON.stringify(prog))); // Log completo del objeto
    console.log(`Rango recibido (prog original): ${fechaInicio} a ${fechaFin}`);
    console.log(`Días seleccionados (numéricos): ${diasSeleccionados}`);
    console.log(`startUTC (ISO): ${startUTC.toISOString()}`);
    console.log(`endUTC (ISO): ${endUTC.toISOString()}`);
    // ---------------------------------------------------------------------

    // Bucle para iterar desde la fecha de inicio hasta (e incluyendo) la fecha de fin.
    // Usamos getTime() para comparar milisegundos, que es más preciso.
    while (current.getTime() <= endUTC.getTime()) {
      // Obtener el día de la semana en UTC (0=Domingo, 1=Lunes, etc.)
      const diaSemana = current.getUTCDay();

      // Formatear la fecha actual para FullCalendar (YYYY-MM-DD).
      // toISOString() devuelve la fecha en UTC, y split('T')[0] toma solo la parte de la fecha.
      const formattedDate = current.toISOString().split('T')[0];

      // --- CONSOLE.LOGS DEPURACIÓN PARA CADA ITERACIÓN ---
      console.log(`  Iteración: Fecha actual (ISO): ${current.toISOString()} | Dia UTC: ${diaSemana} | Incluir? ${diasSeleccionados.includes(diaSemana) || diasSeleccionados.length === 0}`);
      // ---------------------------------------------------------------------

      // Si no hay días seleccionados (se muestran todos), o si el día actual está en los seleccionados
      if (diasSeleccionados.length === 0 || diasSeleccionados.includes(diaSemana)) {
        eventos.push({
          ...prog, // Mantener todas las propiedades originales de la programación
          fechaInicio: formattedDate, // Usar la fecha expandida para el inicio del evento
          fechaFin: formattedDate,   // Y también para el fin (es un evento de un solo día)
          id: `${idBase}_${idx}`,    // ID único para cada evento expandido
          idBase,                    // Referencia al ID original de la programación
        });
        idx++;
      }

      // Incrementar la fecha actual en un día en UTC para la siguiente iteración
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // --- CONSOLE.LOGS DEPURACIÓN AL FINAL DE LA EXPANSIÓN ---
    console.log("4. Eventos generados por expandirProgramacion:", eventos.map(e => e.fechaInicio));
    console.log("------------------------------------------"); // Separador para claridad
    // ---------------------------------------------------------------------

    return eventos;
  };
  // --- FIN expandirProgramacion ---

  const loadEvents = () => {
    const empleadosActuales = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
    // --- CONSOLE.LOG DEPURACIÓN AL CARGAR EMPLEADOS ---
    console.log("2. Empleados cargados de localStorage en loadEvents:", JSON.parse(JSON.stringify(empleadosActuales)));
    // --------------------------------------------------

    const events = empleadosActuales.flatMap(emp =>
      (emp.schedulings || []).flatMap(prog => {
        const idBase = prog.idBase || prog.id;
        // Aquí prog contiene el rango completo (ej: 2025-07-14 a 2025-07-25)
        return expandirProgramacion(prog, idBase).map(ev => ({
          ...ev,
          empleadoId: emp.id,
          title: `${emp.nombre}: ${ev.horaInicio}-${ev.horaFin}`,
          start: ev.fechaInicio, // 'fechaInicio' ya viene formateado YYYY-MM-DD desde expandirProgramacion
          allDay: true,
        }));
      })
    );
    // --- CONSOLE.LOG DEPURACIÓN ANTES DE setCalendarEvents ---
    console.log("5. Eventos finales pasados a setCalendarEvents:", events.map(e => e.start));
    // --------------------------------------------------------
    setCalendarEvents(events);
  };

  useEffect(() => {
    loadEvents();
    // Escucha cambios en localStorage para actualizar el calendario
    const handleStorageChange = () => loadEvents();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddEvent = (prog) => {
    // prog ya debería traer empleadoId de AddScheduling, pero se añade un fallback por seguridad.
    if (!prog.empleadoId) {
        alert('Selecciona un empleado');
        return;
    }

    const empleados = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
    // Genera un idBase único para la nueva programación (si no viene de una edición)
    // AddScheduling ya está generando un id para 'nuevaProg', pero este es para el idBase
    const idBase = prog.idBase || (Date.now().toString() + Math.floor(Math.random() * 10000).toString());

    // --- CONSOLE.LOG DEPURACIÓN EN handleAddEvent ---
    console.log("1. Prog (objeto a guardar) en handleAddEvent:", JSON.parse(JSON.stringify(prog)));
    // ------------------------------------------------

    const nuevosEmpleados = empleados.map(emp =>
        String(emp.id) === String(prog.empleadoId)
            ? { ...emp, schedulings: [...(emp.schedulings || []), { ...prog, idBase }] }
            : emp
    );

    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(nuevosEmpleados));
    setModalOpen(false);
    // Llama a loadEvents DIRECTAMENTE para actualizar el calendario sin recargar la página
    loadEvents(); 
  };

  // Función para abrir el modal y seleccionar el empleado
  const handleDateClick = (info) => {
    // Si tu dateClick solo abre el modal para AÑADIR una programación,
    // puedes dejar el empleado como null inicialmente o seleccionarlo en el modal.
    // Si quieres asociarlo a un empleado existente, necesitarías un mecanismo de selección de empleado antes de abrir el modal.
    setSelectedEmployeeForModal(null); // Reinicia el empleado seleccionado
    setModalOpen(true);
  };

  return (
    <div className="w-full p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        dateClick={handleDateClick} // Usa la función revisada
        // Puedes añadir más opciones de FullCalendar aquí
        locale="es" // Asegúrate de que el calendario use el idioma español
      />

      {modalOpen && (
        <SeeScheduling
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Agregar programación"
        >
          {/* Aquí pasamos el empleado si AddScheduling lo necesita */}
          <AddScheduling
            onAdd={handleAddEvent}
            editing={null} // Si no estás editando, es null
            onCancelEdit={() => setModalOpen(false)}
            // 'employees' se pasa a AddScheduling para el selector de empleado
            // Asegúrate de que este 'employees' sea el array completo de empleados para el select
            employees={JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || []}
            // Si AddScheduling espera un solo objeto 'empleado'
            // empleado={selectedEmployeeForModal} // Pasa el empleado si es relevante para el flujo del formulario
          />
        </SeeScheduling>
      )}
    </div>
  );
};

export default GeneralCalendar;