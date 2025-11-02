import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GeneralCalendar from './components/GeneralCalendar';
import { useOutletContext } from 'react-router-dom';
import {
  getAllSchedulings,
  createScheduling,
  updateScheduling,
  deleteScheduling,
  searchSchedulings,
} from './services/schedulingApi';
import { getEmployees } from '../employees/api/employeesApi';

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const Scheduling = () => {
  const { setTitle } = useOutletContext();
  const [employees, setEmployees] = useState([]);
  const [schedulings, setSchedulings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // LOG TEMPORAL PARA DEBUG
  useEffect(() => {
    console.log("🔍 [Scheduling] Estado actual:");
    console.log("  - employees:", employees);
    console.log("  - employees.length:", employees.length);
    console.log("  - schedulings:", schedulings);
    console.log("  - schedulings.length:", schedulings.length);
  }, [employees, schedulings]);

  // Cargar empleados y programaciones
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("[DEBUG] Intentando cargar empleados...");
      const employeesData = await getEmployees();
      console.log("[DEBUG] Empleados cargados:", employeesData);

      console.log("[DEBUG] Intentando cargar programaciones...");
      const schedulingsData = await getAllSchedulings();
      console.log("[DEBUG] Programaciones cargadas:", schedulingsData);

      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setSchedulings(Array.isArray(schedulingsData) ? schedulingsData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      const errorMsg = err.code === 'ERR_NETWORK' || err.message?.includes('ERR_NAME_NOT_RESOLVED')
        ? "No se puede conectar al servidor. Verifique la conexión a internet o contacte al administrador."
        : "No se pudieron cargar los empleados y programaciones.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setTitle('Agendamiento de Servicios');
    return () => setTitle('');
  }, [setTitle]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar empleados basado en el término de búsqueda
  const filteredEmployees = searchTerm.trim()
    ? employees.filter(emp =>
        normalizeText(emp.nombre).includes(normalizeText(searchTerm)) ||
        normalizeText(emp.documento).includes(normalizeText(searchTerm))
      )
    : employees;

  // Función para calcular las fechas específicas basadas en días seleccionados
  const calculateSpecificDates = (fechaInicio, fechaFin, diasSeleccionados) => {
    const fechas = [];
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);

    // Mapear nombres de días a números (0 = Domingo, 1 = Lunes, etc.)
    const diasMap = {
      'Domingo': 0,
      'Lunes': 1,
      'Martes': 2,
      'Miercoles': 3,
      'Jueves': 4,
      'Viernes': 5,
      'Sabado': 6
    };

    const diasNumeros = diasSeleccionados.map(dia => diasMap[dia]).filter(dia => dia !== undefined);

    // Iterar por cada día en el rango
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const diaSemana = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.

      // Si el día de la semana está en los días seleccionados, agregarlo
      if (diasNumeros.includes(diaSemana)) {
        fechas.push(new Date(date));
      }
    }

    return fechas;
  };

  // Handler para agregar programación
  const handleAddEvent = async (prog) => {
    try {
      console.log("[DEBUG] handleAddEvent received prog:", JSON.stringify(prog, null, 2));

      // Validar que los datos requeridos estén presentes
      if (!prog.empleadoId || !prog.fechaInicio || !prog.horaInicio || !prog.horaFin) {
        toast.error("Faltan datos obligatorios para crear la programación");
        console.error("[DEBUG] Missing required fields:", {
          empleadoId: prog.empleadoId,
          fechaInicio: prog.fechaInicio,
          horaInicio: prog.horaInicio,
          horaFin: prog.horaFin
        });
        return;
      }

      // Calcular las fechas específicas basadas en días seleccionados
      const fechasEspecificas = calculateSpecificDates(prog.fechaInicio, prog.fechaFin, prog.dias);
      console.log("[DEBUG] Calculated specific dates:", fechasEspecificas.map(d => d.toISOString().split('T')[0]));

      if (fechasEspecificas.length === 0) {
        toast.error("No se encontraron fechas válidas para los días seleccionados");
        return;
      }

      const createdSchedulings = [];

      // Crear una programación por cada fecha específica
      for (const fecha of fechasEspecificas) {
        const fechaStr = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        
        // Solo enviar los 4 campos que el backend requiere según el modelo Sequelize
        const apiData = {
          id_usuario: parseInt(prog.empleadoId),
          fecha_inicio: fechaStr,
          hora_entrada: prog.horaInicio,
          hora_salida: prog.horaFin,
        };

        console.log("[DEBUG] API data to send for date", fechaStr, ":", JSON.stringify(apiData, null, 2));

        const createdScheduling = await createScheduling(apiData);
        console.log("[DEBUG] Created scheduling response:", JSON.stringify(createdScheduling, null, 2));

        createdSchedulings.push(createdScheduling);
      }

      // Agregar todas las programaciones creadas al estado
      setSchedulings(prev => [...prev, ...createdSchedulings]);
      toast.success(`${createdSchedulings.length} programación(es) creada(s) exitosamente`);
    } catch (error) {
      console.error("Error creando programación:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al crear programación");
    }
  };

  // Handler para actualizar programación
  const handleUpdateEvent = async (prog) => {
    try {
      console.log("[DEBUG] Actualizando programación:", prog);

      // Convertir el formato del frontend al formato de la API (solo los 4 campos del modelo)
      const apiData = {
        id_usuario: parseInt(prog.id_usuario || prog.empleadoId),
        fecha_inicio: prog.fecha || prog.fechaInicio || prog.fecha_inicio,
        hora_entrada: prog.hora_entrada || prog.horaInicio,
        hora_salida: prog.hora_salida || prog.horaFin,
      };

      console.log("[DEBUG] API data to send:", JSON.stringify(apiData, null, 2));

      const updatedScheduling = await updateScheduling(prog.id, apiData);
      setSchedulings(prev => prev.map(s =>
        s.id === updatedScheduling.id ? updatedScheduling : s
      ));
      toast.success('Programación actualizada exitosamente');
    } catch (error) {
      console.error("Error actualizando programación:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al actualizar programación");
    }
  };

  // Handler para eliminar programación
  const handleDeleteEvent = (schedulingId) => {
    console.log("[DEBUG] Eliminando programación del estado:", schedulingId);
    setSchedulings(prev => prev.filter(s => s.id !== schedulingId));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando programaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
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
            {console.log("[DEBUG] Passing to GeneralCalendar:")}
            {console.log("  - filteredEmployees:", filteredEmployees)}
            {console.log("  - schedulings:", schedulings)}
            <GeneralCalendar
              employees={filteredEmployees}
              schedulings={schedulings}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}
export default Scheduling;