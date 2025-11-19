import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import GeneralCalendar from './components/GeneralCalendar';
import CalendarContentSkeleton from '../../../../shared/components/CalendarContentSkeleton';
import { useOutletContext } from 'react-router-dom';
import { schedulingService } from './API/schedulingService';
import { employeesService } from '../employees/API/employeesService';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      const employeesData = await employeesService.getAll();
      console.log("[DEBUG] Empleados cargados:", employeesData);

      console.log("[DEBUG] Intentando cargar programaciones...");
      const schedulingsData = await schedulingService.getAll();
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
    setTitle('Programación de Empleados');
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
  // Reemplaza SOLO la función calculateSpecificDates en scheduling.jsx (línea ~88)

// Función para calcular las fechas específicas basadas en días seleccionados
const calculateSpecificDates = (fechaInicio, fechaFin, diasSeleccionados) => {
  const fechas = [];
  
  // Agregar 'T00:00:00' para evitar problemas de zona horaria
  const startDate = new Date(fechaInicio + 'T00:00:00');
  const endDate = new Date(fechaFin + 'T00:00:00');

  console.log('[calculateSpecificDates] Rango:', fechaInicio, 'a', fechaFin);
  console.log('[calculateSpecificDates] Días seleccionados:', diasSeleccionados);

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
  console.log('[calculateSpecificDates] Días números:', diasNumeros);

  // Iterar por cada día en el rango usando while
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const diaSemana = currentDate.getDay();
    
    console.log('[calculateSpecificDates] Verificando fecha:', currentDate.toISOString().split('T')[0], 'día:', diaSemana);

    // Si el día de la semana está en los días seleccionados, agregarlo
    if (diasNumeros.includes(diaSemana)) {
      fechas.push(new Date(currentDate));
      console.log('[calculateSpecificDates] ✓ Fecha agregada:', currentDate.toISOString().split('T')[0]);
    }

    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log('[calculateSpecificDates] Total fechas calculadas:', fechas.length);
  return fechas;
};

  // Handler para agregar programación
  const handleAddEvent = async (prog) => {
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

    const schedulingPromise = (async () => {
      console.log("[DEBUG] handleAddEvent received prog:", JSON.stringify(prog, null, 2));

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

        const createdScheduling = await schedulingService.create(apiData);
        console.log("[DEBUG] Created scheduling response:", JSON.stringify(createdScheduling, null, 2));

        createdSchedulings.push(createdScheduling);
      }

      // Agregar todas las programaciones creadas al estado
      setSchedulings(prev => [...prev, ...createdSchedulings]);
      return createdSchedulings;
    })();

    toast.promise(schedulingPromise, {
      loading: 'Creando programación(es)...',
      success: (schedulings) => `${schedulings.length} programación(es) creada(s) exitosamente`,
      error: (err) => {
        console.error("Error creando programación:", err);
        console.error("Error details:", {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message
        });
        const backendMsg = err?.response?.data?.message || err?.response?.data?.msg || err?.response?.data?.error;
        return backendMsg || "Error al crear programación";
      },
    });

    try {
      await schedulingPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  // Handler para actualizar programación
  const handleUpdateEvent = async (prog) => {
    const schedulingPromise = (async () => {
      console.log("[DEBUG] Actualizando programación:", prog);

      // Convertir el formato del frontend al formato de la API (solo los 4 campos del modelo)
      const apiData = {
        id_usuario: parseInt(prog.id_usuario || prog.empleadoId),
        fecha_inicio: prog.fecha || prog.fechaInicio || prog.fecha_inicio,
        hora_entrada: prog.hora_entrada || prog.horaInicio,
        hora_salida: prog.hora_salida || prog.horaFin,
      };

      console.log("[DEBUG] API data to send:", JSON.stringify(apiData, null, 2));

      const updatedScheduling = await schedulingService.update(prog.id, apiData);
      setSchedulings(prev => prev.map(s =>
        s.id === updatedScheduling.id ? updatedScheduling : s
      ));
      return updatedScheduling;
    })();

    toast.promise(schedulingPromise, {
      loading: 'Actualizando programación...',
      success: 'Programación actualizada exitosamente',
      error: (err) => {
        console.error("Error actualizando programación:", err);
        const backendMsg = err?.response?.data?.message || err?.response?.data?.msg || err?.response?.data?.error;
        return backendMsg || "Error al actualizar programación";
      },
    });

    try {
      await schedulingPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  // Handler para eliminar programación
  const handleDeleteEvent = (schedulingId) => {
    console.log("[DEBUG] Eliminando programación del estado:", schedulingId);
    setSchedulings(prev => prev.filter(s => s.id !== schedulingId));
  };

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
    <div className="min-h-screen bg-background p-6 font-inter">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50"></i>
            <input
              type="text"
              placeholder="Buscar empleado por nombre o documento..."
              value={searchTerm}
              onChange={handleSearch}
              className="border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full shadow-sm"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 overflow-x-auto">
          {loading ? (
            <CalendarContentSkeleton />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default Scheduling;
