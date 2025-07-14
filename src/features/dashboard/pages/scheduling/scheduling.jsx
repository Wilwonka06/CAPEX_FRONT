import React, { useState, useEffect } from 'react';
import GeneralCalendar from './components/GeneralCalendar';

const EMPLOYEES_KEY = 'capex_employees';

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

// MIGRACIÓN GLOBAL: asegurar que todas las schedulings tengan id y idBase
function migrarEmpleados() {
  const empleados = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
  let cambios = false;
  const empleadosMigrados = empleados.map(emp => {
    if (!Array.isArray(emp.schedulings)) return emp;
    const nuevasSchedulings = emp.schedulings.map(ev => {
      let newEv = { ...ev };
      if (!newEv.id) {
        newEv.id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
        cambios = true;
      }
      if (!newEv.idBase) {
        newEv.idBase = newEv.id;
        cambios = true;
      }
      return newEv;
    });
    return { ...emp, schedulings: nuevasSchedulings };
  });
  if (cambios) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(empleadosMigrados));
  }
}

const Scheduling = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    migrarEmpleados();
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    setEmployees(stored ? JSON.parse(stored) : []);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar empleados basado en el término de búsqueda
  const filteredEmployees = employees.filter(emp => {
    const hasMatchingSchedulings = (emp.schedulings || []).some(ev =>
      normalizeText(emp.nombre).includes(normalizeText(searchTerm)) ||
      normalizeText(ev.title || '').includes(normalizeText(searchTerm)) ||
      normalizeText(ev.fechaInicio || '').includes(normalizeText(searchTerm)) ||
      normalizeText(ev.fechaFin || '').includes(normalizeText(searchTerm)) ||
      normalizeText(ev.horaInicio || '').includes(normalizeText(searchTerm)) ||
      normalizeText(ev.horaFin || '').includes(normalizeText(searchTerm)) ||
      normalizeText(ev.repeticion || '').includes(normalizeText(searchTerm)) ||
      normalizeText(ev.dias?.join(', ') || '').includes(normalizeText(searchTerm))
    );
    return hasMatchingSchedulings;
  });

  // Expansión robusta de programaciones
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
          empleadoId: prog.empleadoId // ⚡️ CLAVE
        });
        idx++;
      }
      current.setDate(current.getDate() + 1);
    }
    return eventos;
  }

  // Handler para agregar programación
  const handleAddEvent = (prog) => {
    const empleados = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
    const idBase = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    const eventos = expandirProgramacion(prog, idBase);
    const nuevosEmpleados = empleados.map(emp =>
      emp.id && prog.empleadoId && emp.id.toString() === prog.empleadoId.toString()
        ? { ...emp, schedulings: [...(emp.schedulings || []), ...eventos] }
        : emp
    );
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(nuevosEmpleados));
    setEmployees(nuevosEmpleados);
    window.location.reload();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Agendamiento de Servicios</h1>
      <div className="flex justify-end mb-8">
        <div className="relative w-full max-w-xs pr-4">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50"></i>
          <input
            type="text"
            placeholder="Buscar programación..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
          />
        </div>
      </div>
      <div className="w-full">
        <GeneralCalendar
          employees={filteredEmployees}
          onAddEvent={handleAddEvent}
        />
      </div>
    </div>
  );
}

export default Scheduling;
