import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SeeScheduling from '../../scheduling/components/SeeScheduling';
import AddScheduling from './AddScheduling';
import EditScheduling from './EditScheduling';

const EMPLOYEES_KEY = 'capex_employees';

const GeneralCalendar = ({ employees = [], onAddEvent }) => {
  // ------------------------------
  // Estados generales del modal
  // ------------------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);

  // ✅ NUEVO: Estado para los eventos del calendario
  const [calendarEvents, setCalendarEvents] = useState([]);

  // ------------------------------
  // Expande programaciones repetitivas (ya lo tienes bien)
  // ------------------------------
  const expandirProgramacion = (prog, idBase) => {
    const { fechaInicio, fechaFin, dias = [], exclusiones = [] } = prog;
  
    const diasSemanaMap = {
      domingo: 0, lunes: 1, martes: 2, miercoles: 3, miércoles: 3,
      jueves: 4, viernes: 5, sabado: 6, sábado: 6
    };
  
    const diasSeleccionados = dias.map(d => {
      const limpio = d.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return diasSemanaMap[limpio];
    });
  
    const eventos = [];
  
    const start = new Date(fechaInicio + 'T00:00:00');
    const end = new Date(fechaFin + 'T00:00:00');
    let current = new Date(start);
  
    let idx = 0;
  
    while (current.getTime() <= end.getTime()) {
      const diaSemana = current.getDay();
      const formattedDate = current.toISOString().split('T')[0];
  
      const esDiaValido = diasSeleccionados.length === 0 || diasSeleccionados.includes(diaSemana);
      const estaExcluido = exclusiones.includes(formattedDate);
  
      console.log(`⏰ ${formattedDate} | Día local: ${diaSemana} | Incluir? ${esDiaValido} | Excluido? ${estaExcluido}`);
  
      if (esDiaValido && !estaExcluido) {
        eventos.push({
          ...prog,
          fechaInicio: formattedDate,
          fechaFin: formattedDate,
          id: `${idBase}_${idx}`,
          idBase,
        });
        idx++;
      }
  
      current.setDate(current.getDate() + 1);
    }
  
    console.log("✅ Fechas expandidas:", eventos.map(e => e.fechaInicio));
    return eventos;
  };  

  // ------------------------------
  // Carga eventos desde localStorage o employees
  // ------------------------------
  const loadEvents = () => {
    const empleadosActuales = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || employees || [];
    console.log("Empleados cargados:", empleadosActuales);
  
    const events = empleadosActuales.flatMap(emp =>
      (emp.schedulings || [])
        .filter(Boolean) // ✅ Elimina entradas null o undefined
        .flatMap(prog => {
          const idBase = prog.idBase || prog.id;
  
          // ✅ Llama expandirProgramacion y garantiza un array
          const expandido = expandirProgramacion(prog, idBase) || [];
  
          console.log("Prog:", prog);
          console.log("Expandido:", expandido);
  
          return expandido.map(ev => ({
            ...ev,
            empleadoId: emp.id,
            title: `${emp.nombre}: ${ev.horaInicio}-${ev.horaFin}`,
            start: ev.fechaInicio,
            allDay: true,
          }));
        })
    );
  
    console.log("Eventos finales:", events);
    setCalendarEvents(events);
  };
  

  // ------------------------------
  // useEffect para inicializar y escuchar cambios
  // ------------------------------
  useEffect(() => {
    loadEvents();
    const handleStorageChange = () => loadEvents();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ------------------------------
  // Tu lógica de clicks y handlers
  // ------------------------------
  const handleEventClick = (info) => {
    setModalType('edit');
    setSelectedEvent(info.event);
    setTitleInput(info.event.title);
    setModalOpen(true);
  };

  const handleDateClick = (info) => {
    setModalType('add');
    setSelectedDate(info.dateStr);
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
  
    const rawId = selectedEvent.extendedProps?.id || selectedEvent.id;
    const idBase = rawId?.includes('_') ? rawId.split('_')[0] : rawId;
  
    const empleadoId =
      selectedEvent.extendedProps?.empleadoId ||
      selectedEvent.groupId ||
      selectedEvent.resourceId ||
      selectedEvent.getResources?.()[0]?.id;
  
    console.log('DEBUG eliminar:', { rawId, idBase, empleadoId });
  
    if (!idBase || !empleadoId) {
      alert('⚠️ No se pudo obtener idBase o empleadoId.');
      return;
    }
  
    const updatedEmployees = employees.map(emp =>
      String(emp.id) === String(empleadoId)
        ? {
            ...emp,
            schedulings: (emp.schedulings || []).filter(
              ev =>
                String(ev.idBase) !== String(idBase) &&
                String(ev.id) !== String(idBase)
            ),
          }
        : emp
    );
  
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    setModalOpen(false);
    window.location.reload();
  };

  
    // Tu lógica de delete se mantiene igual
    // Pero reemplaza window.location.reload() por loadEvents()
    //localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    //setModalOpen(false);
    //loadEvents();

    const handleEdit = () => {
      if (!selectedEvent) return;
  
      const rawId = selectedEvent.extendedProps?.id || selectedEvent.id;
      const idBase = rawId.includes('_') ? rawId.split('_')[0] : rawId;
  
      const empleadoId =
        selectedEvent.extendedProps?.empleadoId ||
        selectedEvent.groupId ||
        selectedEvent.resourceId ||
        (selectedEvent.getResources?.()[0]?.id);
  
      console.log('DEBUG handleEdit:', { rawId, idBase, empleadoId });
  
      if (!empleadoId) {
        alert('⚠️ Error: empleadoId no definido. Verifica expandirProgramacion.');
        return;
      }
  
      let progData = null;
      const emp = employees.find(e => e.id && String(e.id) === String(empleadoId));
  
      if (emp && Array.isArray(emp.schedulings)) {
        progData = emp.schedulings.find(ev => {
          const evIdBase = ev.idBase || (ev.id ? ev.id.toString() : undefined);
          return String(evIdBase) === String(idBase) || String(ev.id) === String(idBase);
        });
      }
  
      if (!progData) {
        console.error('No se encontró la programación.', { empleadoId, idBase, emp });
        alert(`No se pudo encontrar la programación para empleadoId=${empleadoId} y idBase=${idBase}`);
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

  
    // Tu lógica se mantiene igual pero:
    //localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    //setEditFormOpen(false);
    //setModalOpen(false);
    //setEditingData(null);
    //setSelectedEvent(null);
    //loadEvents(); // Mejor que recargar la página

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

  // ------------------------------
  // Renderiza FullCalendar y modales
  // ------------------------------
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
