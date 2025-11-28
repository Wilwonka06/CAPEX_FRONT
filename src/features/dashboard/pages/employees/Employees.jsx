import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext, useNavigate } from 'react-router-dom';

// Importar servicios API
import { employeesService, recurringSchedulingService } from "./API/employeesService";

// Importar componentes
import EmployeesTable from "./components/EmployeesTable";
import AddEmployee from "./components/CreateEmployee";
import EditEmployee from "./components/EditEmployee";
import EmployeeDetail from "./components/EmployeeDetail";
import RecurringSchedulingManager from "./components/RecurringSchedulingManager";
import Paginator from "../../../../shared/Paginator";
import Search from "../../../../shared/Search";
import { normalizeText } from '../../../../shared/validations';
import { to24h } from '../../../../shared/utils/timeFormat';

const EMPLOYEES_PER_PAGE = 10;

const EmployeesPage = () => {
  const { setTitle } = useOutletContext();
  const navigate = useNavigate();
  
  // Estados principales
  const [employees, setEmployees] = useState([]);
  const [schedulings, setSchedulings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingId, setTogglingId] = useState(null);
  
  // Estados de vistas/modales
  const [showAddForm, setShowAddForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  

  // Función para calcular fechas específicas basadas en días seleccionados
  const calculateSpecificDates = (fechaInicio, fechaFin, diasSeleccionados) => {
    const fechas = [];
    const startDate = new Date(fechaInicio + 'T00:00:00');
    const endDate = new Date(fechaFin + 'T00:00:00');

    const diasMap = {
      'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miercoles': 3,
      'Jueves': 4, 'Viernes': 5, 'Sabado': 6
    };

    const diasNumeros = diasSeleccionados.map(dia => diasMap[dia]).filter(dia => dia !== undefined);
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const diaSemana = currentDate.getDay();
      if (diasNumeros.includes(diaSemana)) {
        fechas.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return fechas;
  };

  // Cargar empleados y programaciones
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [employeesData, schedulingsData] = await Promise.all([
        employeesService.getAll(),
        recurringSchedulingService.getAll()
      ]);

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
    setTitle('Módulo de Empleados');
    return () => setTitle('');
  }, [setTitle]);

  // Filtrar empleados
  const filteredEmployees = employees.filter(emp =>
    normalizeText(emp.nombre).includes(normalizeText(searchTerm)) ||
    normalizeText(emp.documento || emp.numero_documento || emp.num_documento || '').includes(normalizeText(searchTerm)) ||
    (emp.telefono && normalizeText(emp.telefono).includes(normalizeText(searchTerm))) ||
    (emp.correo && normalizeText(emp.correo).includes(normalizeText(searchTerm))) ||
    (emp.direccion && normalizeText(emp.direccion).includes(normalizeText(searchTerm))) ||
    (emp.tipoDocumento && normalizeText(emp.tipoDocumento).includes(normalizeText(searchTerm))) ||
    normalizeText(emp.estado).includes(normalizeText(searchTerm))
  );

  // Paginación
  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE);
  const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + EMPLOYEES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, employees]);

  // Handler para cambiar estado
  const handleToggleStatus = async (employeeId) => {
    const current = employees.find(e => String(e.id) === String(employeeId));
    
    if (!current) {
      toast.error("Empleado no encontrado");
      return;
    }

    const nextEstado = current.estado === 'Activo' ? 'Inactivo' : 'Activo';
    setTogglingId(employeeId);

    // Actualización optimista
    setEmployees(prevList => prevList.map(e =>
      String(e.id) === String(employeeId) ? { ...e, estado: nextEstado } : e
    ));

    try {
      await employeesService.toggleStatus(employeeId, nextEstado);
      toast.success(`Estado cambiado a ${nextEstado}`);
    } catch (error) {
      // Revertir en caso de error
      setEmployees(prevList => prevList.map(e =>
        String(e.id) === String(employeeId) ? { ...e, estado: current.estado } : e
      ));
      console.error("Error cambiando estado:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al cambiar estado");
    } finally {
      setTogglingId(null);
    }
  };

  // Handler para agregar empleado
  const handleAddEmployee = async (data) => {
    const employeePromise = (async () => {
      // Crear el empleado primero
      const createdEmployee = await employeesService.create(data);
      setEmployees(prev => [...prev, createdEmployee]);

      // Si hay programaciones, crearlas
      if (addEmployeeSchedulings.length > 0) {
        const schedulingPromises = [];

        for (const prog of addEmployeeSchedulings) {
          if (!prog.fechaInicio || !prog.fechaFin || !prog.dias || prog.dias.length === 0) {
            continue;
          }

          const fechasEspecificas = calculateSpecificDates(
            prog.fechaInicio, 
            prog.fechaFin, 
            prog.dias
          );

          const blocks = (prog.bloques && prog.bloques.length > 0) 
            ? prog.bloques 
            : [{ inicio: prog.horaInicio, fin: prog.horaFin }];
          
          for (const fecha of fechasEspecificas) {
            const fechaFormateada = fecha.toISOString().split('T')[0];
            for (const b of blocks) {
              const schedulingData = {
                id_usuario: createdEmployee.id,
                fecha_inicio: fechaFormateada,
                hora_entrada: b.inicio.includes('M') ? to24h(b.inicio) : b.inicio,
                hora_salida: b.fin.includes('M') ? to24h(b.fin) : b.fin,
              };
              schedulingPromises.push(schedulingService.create(schedulingData));
            }
          }
        }

        if (schedulingPromises.length > 0) {
          const createdSchedulings = await Promise.all(schedulingPromises);
          setSchedulings(prev => [...prev, ...createdSchedulings]);
          return { employee: createdEmployee, schedulingsCount: createdSchedulings.length };
        }
      }
      
      return { employee: createdEmployee, schedulingsCount: 0 };
    })();

    toast.promise(employeePromise, {
      loading: 'Creando empleado...',
      success: (result) => {
        setShowAddForm(false);
        setAddEmployeeSchedulings([]);
        
        if (result.schedulingsCount > 0) {
          return `Empleado creado con ${result.schedulingsCount} programación(es)!`;
        }
        return 'Empleado creado exitosamente. Puedes agregar programación desde la vista de edición.';
      },
      error: (err) => {
        console.error("Error agregando empleado:", err);
        const isNetworkError = err.code === 'ERR_NETWORK' || 
                              err.message?.includes('ERR_NAME_NOT_RESOLVED') || 
                              !err.response;
        
        return isNetworkError
          ? "No se puede conectar al servidor. Verifique la conexión a internet o contacte al administrador."
          : (err?.response?.data?.message || 
             err?.response?.data?.msg || 
             err?.response?.data?.error || 
             "Error al agregar empleado");
      },
    });

    try {
      await employeePromise;
    } catch {
      // Error ya manejado por toast.promise
    }
  };

  // Handler para editar empleado
  const handleEditSave = async (data) => {
    if (!data.id) {
      toast.error("Error: ID de empleado no encontrado");
      return;
    }

    const employeePromise = (async () => {
      const updatedEmployee = await employeesService.update(data.id, data);
      await loadData();
      setEditEmployee(null);
      return updatedEmployee;
    })();

    toast.promise(employeePromise, {
      loading: 'Actualizando empleado...',
      success: 'Empleado actualizado exitosamente!',
      error: (err) => {
        console.error("Error actualizando empleado:", err);
        const backendMsg = err?.response?.data?.message || err?.response?.data?.msg || err?.response?.data?.error;
        return backendMsg || "Error al actualizar empleado";
      },
    });

    try {
      await employeePromise;
    } catch {
      // Error ya manejado por toast.promise
    }
  };

  // Handlers de navegación
  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleCancel = () => {
    setShowAddForm(false);
  };

  // Render de error
  const hasError = error && !loading;

  if (hasError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <i className="bi bi-exclamation-triangle text-red-400 text-4xl"></i>
            <h3 className="text-lg font-semibold text-red-800 mt-4">Error al cargar empleados</h3>
            <p className="text-sm text-red-700 mt-2">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Vista principal: Lista de empleados */}
            {!showAddForm && !editEmployee && !viewEmployee && (
              <>
                {/* Barra de búsqueda y botón crear */}
                <div className="flex items-center gap-4 mb-6">
                  <Search
                    searchTerm={searchTerm}
                    handleSearch={handleSearch}
                    placeholder="Buscar empleados por nombre, documento, teléfono o correo..."
                  />
                  <button
                    className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center"
                    onClick={() => setShowAddForm(true)}
                  >
                    <i className="bi bi-plus-circle mr-2"></i>
                    Crear Empleado
                  </button>
                </div>

                {/* Tabla de empleados */}
                <EmployeesTable
                  employees={paginatedEmployees}
                  onToggleStatus={handleToggleStatus}
                  togglingId={togglingId}
                  onView={(emp) => navigate(`/dashboard/empleados/${emp.id || emp.id_usuario}`)}
                  onEdit={(emp) => setEditEmployee(emp)}
                  loading={loading}
                />

                {/* Paginación */}
                {totalPages > 1 && !loading && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}

            {/* Vista: Agregar empleado */}
            {showAddForm && (
              <div className="space-y-6">
                <AddEmployee
                  onCancel={handleCancel}
                  onSave={handleAddEmployee}
                  schedulings={[]}
                  setSchedulings={() => {}}
                  employees={employees}
                  onEditScheduling={() => {}}
                />
              </div>
            )}

            {/* Vista: Editar empleado */}
            {editEmployee && (
              <div className="space-y-6">
                <EditEmployee
                  employee={editEmployee}
                  employees={employees}
                  onCancel={() => setEditEmployee(null)}
                  onSave={handleEditSave}
                />

                <RecurringSchedulingManager empleadoId={editEmployee.id || editEmployee.id_usuario} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Se redirige a la página dedicada de detalle */}
    </div>
  );
};

export default EmployeesPage;
