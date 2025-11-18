import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import AddScheduling from './AddScheduling';
import { schedulingService } from '../API/employeesService';
import toast from 'react-hot-toast';

const Calendar = ({ empleado, schedulings = [], onUpdateSchedulings }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [eventos, setEventos] = useState([]);

  console.log("[Calendar] Render - empleado:", empleado);
  console.log("[Calendar] Render - schedulings:", schedulings);

  // Función para expandir programaciones con días seleccionados
  const expandirProgramacion = (prog) => {
    console.log("[Calendar] expandirProgramacion input:", prog);
    
    const { fechaInicio, fechaFin, dias = [] } = prog;

    if (!fechaInicio) {
      console.warn("[Calendar] No fechaInicio, returning single event");
      return [{
        id: prog.id,
        title: `${prog.horaInicio || prog.hora_entrada} - ${prog.horaFin || prog.hora_salida}`,
        start: prog.fecha || prog.fechaInicio,
        allDay: true,
      }];
    }
  
    const diasSemanaMap = {
      domingo: 0, lunes: 1, martes: 2, miercoles: 3,
      miércoles: 3, jueves: 4, viernes: 5, sabado: 6, sábado: 6
    };
  
    const diasSeleccionados = dias.map(d => {
      const limpio = d.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return diasSemanaMap[limpio];
    }).filter(d => d !== undefined);
  
    const eventos = [];
    const start = new Date(fechaInicio + 'T00:00');
    const end = new Date(fechaFin + 'T23:59');
  
    let current = new Date(start);
  
    while (current <= end) {
      const diaSemana = current.getDay();
  
      if (diasSeleccionados.length === 0 || diasSeleccionados.includes(diaSemana)) {
        eventos.push({
          id: `${prog.id}_${current.toISOString().split('T')[0]}`,
          title: `${prog.horaInicio || prog.hora_entrada} - ${prog.horaFin || prog.hora_salida}`,
          start: current.toISOString().split('T')[0],
          allDay: true,
        });
      }
  
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    }

    console.log("[Calendar] expandirProgramacion output:", eventos);
    return eventos;
  };

  const handleAddEvent = async (prog) => {
    console.log("[Calendar] handleAddEvent input:", prog);
    
    try {
      if (!empleado || !empleado.id) {
        toast.error("No hay empleado seleccionado");
        return;
      }

      // Calcular fechas específicas basadas en días seleccionados
      const { fechaInicio, fechaFin, dias, horaInicio, horaFin } = prog;
      
      if (!dias || dias.length === 0) {
        toast.error("Debes seleccionar al menos un día");
        return;
      }

      const diasSemanaMap = {
        domingo: 0, lunes: 1, martes: 2, miercoles: 3,
        miércoles: 3, jueves: 4, viernes: 5, sabado: 6, sábado: 6
      };

      const diasSeleccionados = dias.map(d => {
        const limpio = d.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return diasSemanaMap[limpio];
      }).filter(d => d !== undefined);

      // Calcular fechas específicas
      const start = new Date(fechaInicio + 'T00:00');
      const end = new Date(fechaFin + 'T23:59');
      const fechasEspecificas = [];

      let current = new Date(start);
      while (current <= end) {
        const diaSemana = current.getDay();
        if (diasSeleccionados.includes(diaSemana)) {
          fechasEspecificas.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
      }

      console.log("[Calendar] Fechas específicas calculadas:", fechasEspecificas);

      if (fechasEspecificas.length === 0) {
        toast.error("No hay fechas válidas para los días seleccionados");
        return;
      }

      // Crear una programación por cada fecha
      const createdSchedulings = [];
      for (const fecha of fechasEspecificas) {
        const schedulingData = {
          id_usuario: empleado.id,
          fecha_inicio: fecha,
          hora_entrada: horaInicio,
          hora_salida: horaFin,
        };

        console.log("[Calendar] Creating scheduling for fecha:", fecha, schedulingData);
        const created = await schedulingService.create(schedulingData);
        createdSchedulings.push(created);
      }

      // Actualizar lista de schedulings
      if (onUpdateSchedulings) {
        onUpdateSchedulings(prev => [...prev, ...createdSchedulings]);
      }

      setModalOpen(false);
      toast.success(`${createdSchedulings.length} programación(es) creada(s) exitosamente`);
    } catch (error) {
      console.error("[Calendar] Error agregando programación:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al agregar programación");
    }
  };

  useEffect(() => {
    console.log("[Calendar] useEffect triggered");
    if (!empleado) {
      console.log("[Calendar] No empleado, clearing events");
      setEventos([]);
      return;
    }

    const employeeSchedulings = empleado.schedulings || [];
    console.log("[Calendar] Employee schedulings:", employeeSchedulings);

    const todosEventos = employeeSchedulings.flatMap(prog => expandirProgramacion(prog));
    console.log("[Calendar] All events:", todosEventos);

    setEventos(todosEventos);
  }, [empleado, schedulings]);

  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-xl mt-4 p-4 border border-gray-200">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={eventos}
          dateClick={() => setModalOpen(true)}
          height="500px"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          locale="es"
        />
      </div>

      {modalOpen && (
        <div className="mt-6">
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