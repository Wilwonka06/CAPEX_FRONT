import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { employeesService, schedulingService } from "./API/employeesService";
import Paginator from "../../../../shared/Paginator";
import LoadingTable from "../../../../shared/components/LoadingTable";
import Search from "../../../../shared/Search";
import Calendar from "../../../dashboard/pages/employees/components/Calendar";
import AddEmployee from "../../../dashboard/pages/employees/components/AddEmployee";
import EditEmployee from "../../../dashboard/pages/employees/components/EditEmployee";
import SeeEmployee from "../../../dashboard/pages/employees/components/SeeEmployee";
import EditScheduling from "./components/EditScheduling";
import { useOutletContext } from 'react-router-dom';
import { normalizeText } from '../../../../shared/validations';

const EmployeesPage = () => {
  const { setTitle } = useOutletContext();
  const [employees, setEmployees] = useState([]);
  const [schedulings, setSchedulings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [seeEmployee, setSeeEmployee] = useState(null);
  const [addEmployeeSchedulings, setAddEmployeeSchedulings] = useState([]);
  const [editingScheduling, setEditingScheduling] = useState(null);

  // Función para calcular las fechas específicas basadas en días seleccionados
  const calculateSpecificDates = (fechaInicio, fechaFin, diasSeleccionados) => {
    const fechas = [];
    
    const startDate = new Date(fechaInicio + 'T00:00:00');
    const endDate = new Date(fechaFin + 'T00:00:00');

    console.log('[calculateSpecificDates] Rango:', fechaInicio, 'a', fechaFin);
    console.log('[calculateSpecificDates] Días seleccionados:', diasSeleccionados);

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

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const diaSemana = currentDate.getDay();
      
      console.log('[calculateSpecificDates] Verificando fecha:', currentDate.toISOString().split('T')[0], 'día:', diaSemana);

      if (diasNumeros.includes(diaSemana)) {
        fechas.push(new Date(currentDate));
        console.log('[calculateSpecificDates] ✓ Fecha agregada:', currentDate.toISOString().split('T')[0]);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('[calculateSpecificDates] Total fechas calculadas:', fechas.length);
    return fechas;
  };

  // Cargar empleados y programaciones
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("[DEBUG] Intentando cargar empleados...");
      const employeesData = await employeesService.getAll();
      console.log("[DEBUG] Empleados cargados:", employeesData);
      console.log("[DEBUG] Primer empleado:", employeesData[0]);

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
    setTitle('Gestión de Empleados');
    return () => setTitle('');
  }, [setTitle]);

  const filteredEmployees = employees.filter(emp =>
    normalizeText(emp.nombre).includes(normalizeText(searchTerm)) ||
    normalizeText(emp.documento || emp.numero_documento || emp.num_documento || '').includes(normalizeText(searchTerm)) ||
    (emp.telefono && normalizeText(emp.telefono).includes(normalizeText(searchTerm))) ||
    (emp.correo && normalizeText(emp.correo).includes(normalizeText(searchTerm))) ||
    (emp.direccion && normalizeText(emp.direccion).includes(normalizeText(searchTerm))) ||
    (emp.tipoDocumento && normalizeText(emp.tipoDocumento).includes(normalizeText(searchTerm))) ||
    normalizeText(emp.estado).includes(normalizeText(searchTerm))
  );

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleToggleStatus = async (employeeId) => {
    console.log("[DEBUG] handleToggleStatus called with ID:", employeeId);
    console.log("[DEBUG] Type of ID:", typeof employeeId);
    console.log("[DEBUG] Current employees state:", employees);
    
    const current = employees.find(e => {
      console.log("[DEBUG] Comparing e.id:", e.id, "with employeeId:", employeeId);
      return String(e.id) === String(employeeId);
    });
    
    if (!current) {
      console.error("[DEBUG] Employee NOT FOUND. Looking for ID:", employeeId);
      console.error("[DEBUG] Available employee IDs:", employees.map(e => e.id));
      toast.error("Empleado no encontrado");
      return;
    }

    console.log("[DEBUG] Found employee:", current);

    const nextEstado = current.estado === 'Activo' ? 'Inactivo' : 'Activo';

    const prevEmployees = employees;
    setEmployees(prevList => prevList.map(e =>
      String(e.id) === String(employeeId)
        ? { ...e, estado: nextEstado }
        : e
    ));

    try {
      const updated = await employeesService.toggleStatus(employeeId, nextEstado);
      if (updated && updated.id) {
        setEmployees(prevList => prevList.map(e => 
          String(e.id) === String(updated.id) ? updated : e
        ));
      }
      toast.success(`Estado cambiado a ${nextEstado}`);
    } catch (error) {
      setEmployees(prevEmployees);
      console.error("Error cambiando estado:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al cambiar estado");
    }
  };

  const handleAddScheduling = async (prog) => {
    if (editingScheduling) {
      try {
        const apiData = {
          id_usuario: editingScheduling.id_usuario,
          fecha: prog.fechaInicio || editingScheduling.fecha,
          hora_entrada: prog.horaInicio || editingScheduling.hora_entrada,
          hora_salida: prog.horaFin || editingScheduling.hora_salida,
        };

        const updatedScheduling = await schedulingService.update(editingScheduling.id, apiData);
        setSchedulings(prev => prev.map(s => s.id === updatedScheduling.id ? updatedScheduling : s));
        setEditingScheduling(null);
        toast.success('Programación actualizada exitosamente');
      } catch (error) {
        console.error("Error actualizando programación:", error);
        const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
        toast.error(backendMsg || "Error al actualizar programación");
      }
    } else {
      setAddEmployeeSchedulings(prev => [
        ...prev,
        {
          ...prog,
          id: Date.now().toString(),
          idBase: Date.now().toString() + Math.floor(Math.random() * 10000).toString(),
        },
      ]);
    }
  };

  const handleEditScheduling = (prog) => {
    setEditingScheduling(prog);
  };

  const handleAddEmployee = async (data) => {
    const employeePromise = (async () => {
      console.log("[DEBUG] Creando empleado con datos:", data);
      
      // PASO 1: Crear el empleado primero
      const createdEmployee = await employeesService.create(data);
      console.log("[DEBUG] Empleado creado:", createdEmployee);
      
      // Actualizar lista de empleados inmediatamente
      setEmployees(prev => [...prev, createdEmployee]);

      // PASO 2: Si hay programaciones, crearlas una por una
      if (addEmployeeSchedulings.length > 0) {
        console.log("[DEBUG] Programaciones a procesar:", addEmployeeSchedulings);
        
        const schedulingPromises = [];

        // Iterar sobre cada programación
        for (const prog of addEmployeeSchedulings) {
          console.log("[DEBUG] Procesando programación:", prog);
          
          // Verificar que tenga fechas y días
          if (!prog.fechaInicio || !prog.fechaFin || !prog.dias || prog.dias.length === 0) {
            console.warn("[DEBUG] Programación sin fechas o días válidos:", prog);
            continue;
          }

          // ✅ USAR calculateSpecificDates para obtener todas las fechas
          const fechasEspecificas = calculateSpecificDates(
            prog.fechaInicio, 
            prog.fechaFin, 
            prog.dias
          );

          console.log("[DEBUG] Fechas específicas calculadas:", fechasEspecificas.length);

          // Crear una programación por cada fecha calculada y por cada bloque de horario
          const blocks = (prog.bloques && prog.bloques.length > 0) ? prog.bloques : [{ inicio: prog.horaInicio, fin: prog.horaFin }];
          for (const fecha of fechasEspecificas) {
            const fechaFormateada = fecha.toISOString().split('T')[0];
            for (const b of blocks) {
              const schedulingData = {
                id_usuario: createdEmployee.id,
                fecha_inicio: fechaFormateada,
                hora_entrada: b.inicio.includes('M') ? to24h(b.inicio) : b.inicio,
                hora_salida: b.fin.includes('M') ? to24h(b.fin) : b.fin,
              };
              console.log("[DEBUG] Creando programación para fecha:", fechaFormateada, schedulingData);
              schedulingPromises.push(schedulingService.create(schedulingData));
            }
          }
        }

        // Ejecutar todas las promesas de programación
        if (schedulingPromises.length > 0) {
          console.log("[DEBUG] Total de programaciones a crear:", schedulingPromises.length);
          
          const createdSchedulings = await Promise.all(schedulingPromises);
          console.log("[DEBUG] Programaciones creadas exitosamente:", createdSchedulings.length);
          
          // Actualizar lista de programaciones
          setSchedulings(prev => [...prev, ...createdSchedulings]);
          return { employee: createdEmployee, schedulingsCount: createdSchedulings.length };
        } else {
          return { employee: createdEmployee, schedulingsCount: 0 };
        }
      } else {
        return { employee: createdEmployee, schedulingsCount: 0 };
      }
    })();

    toast.promise(employeePromise, {
      loading: 'Creando empleado...',
      success: (result) => {
        // Limpiar y cerrar formulario
        setShowForm(false);
        setAddEmployeeSchedulings([]);
        
        if (result.schedulingsCount > 0) {
          return `Empleado creado con ${result.schedulingsCount} programación(es)!`;
        }
        return 'Empleado creado exitosamente. Puedes agregar programación desde la vista de edición.';
      },
      error: (err) => {
        console.error("[DEBUG] Error agregando empleado:", err);
        console.error("[DEBUG] Error response:", err.response?.data);
        
        const isNetworkError = err.code === 'ERR_NETWORK' || 
                              err.message?.includes('ERR_NAME_NOT_RESOLVED') || 
                              !err.response;
        
        const errorMsg = isNetworkError
          ? "No se puede conectar al servidor. Verifique la conexión a internet o contacte al administrador."
          : (err?.response?.data?.message || 
             err?.response?.data?.msg || 
             err?.response?.data?.error || 
             "Error al agregar empleado");
        
        return errorMsg;
      },
    });

    try {
      await employeePromise;
    } catch {
      // Error ya manejado por toast.promise
    }
  };

  const handleEditClick = (employee) => {
    console.log("[DEBUG] handleEditClick called with employee:", employee);
    console.log("[DEBUG] Employee ID:", employee.id);
    setEditEmployee(employee);
  };

  const handleEditSave = async (data) => {
    console.log("🔵 [DEBUG] handleEditSave INICIO");
    console.log("🔵 [DEBUG] Data recibida:", data);
    console.log("🔵 [DEBUG] Employee ID:", data.id);
    
    if (!data.id) {
      console.error("❌ [DEBUG] ERROR: No ID in data");
      toast.error("Error: ID de empleado no encontrado");
      return;
    }

    const employeePromise = (async () => {
      console.log("🔵 [DEBUG] Llamando a updateEmployee...");
      const updatedEmployee = await employeesService.update(data.id, data);
      console.log("✅ [DEBUG] Response de updateEmployee:", updatedEmployee);
      
      console.log("🔵 [DEBUG] Llamando a loadData para recargar lista...");
      await loadData();
      console.log("✅ [DEBUG] loadData completado");
      
      console.log("🔵 [DEBUG] Employees después de loadData:", employees.length);
      
      setEditEmployee(null);
      
      return updatedEmployee;
    })();

    toast.promise(employeePromise, {
      loading: 'Actualizando empleado...',
      success: 'Empleado actualizado exitosamente!',
      error: (err) => {
        console.error("❌ [DEBUG] Error en handleEditSave:", err);
        console.error("❌ [DEBUG] Error response:", err.response?.data);
        console.error("❌ [DEBUG] Error status:", err.response?.status);
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

  const handleEditCancel = () => setEditEmployee(null);
  
  const handleSeeClick = (employee) => {
    console.log("[DEBUG] handleSeeClick called with employee:", employee);
    setSeeEmployee(employee);
  };
  
  const handleSeeClose = () => setSeeEmployee(null);
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingScheduling(null);
    setAddEmployeeSchedulings([]);
  };

  const handleDeleteEmployee = async (employee) => {
    console.log("[DEBUG] handleDeleteEmployee called with employee:", employee);
    console.log("[DEBUG] Employee ID:", employee.id);
    
    if (!employee || !employee.id) {
      console.error("[DEBUG] ERROR: Invalid employee or missing ID");
      toast.error("Error: Empleado inválido");
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Eliminar "${employee.nombre}" no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const employeePromise = (async () => {
        console.log("[DEBUG] Deleting employee with ID:", employee.id);
        await employeesService.delete(employee.id);
        
        setEmployees(prev => {
          const updated = prev.filter(e => String(e.id) !== String(employee.id));
          console.log("[DEBUG] Employees after delete:", updated);
          return updated;
        });
        try {
          const userId = employee.id || employee.id_usuario;
          if (userId) {
            const userSchedulings = await schedulingService.getByUser(userId);
            const deletePromises = userSchedulings.map(s => schedulingService.delete(s.id));
            await Promise.all(deletePromises);
            setSchedulings(prev => prev.filter(s => String(s.id_usuario) !== String(userId)));
            console.log("[DEBUG] Cascaded schedulings deleted for user:", userId);
          }
        } catch (e) {
          console.warn("[DEBUG] Cascade delete of schedulings failed:", e);
        }
        
        return true;
      })();

      toast.promise(employeePromise, {
        loading: 'Eliminando empleado...',
        success: 'Empleado eliminado exitosamente',
        error: (err) => {
          console.error("Error eliminando empleado:", err);
          const backendMsg = err?.response?.data?.message || err?.response?.data?.msg || err?.response?.data?.error;
          return backendMsg || "Error al eliminar empleado";
        },
      });

      try {
        await employeePromise;
      } catch {
        // Error ya manejado por toast.promise
      }
    }
  };

  const isInitialLoading = loading;
  const hasError = error && !isInitialLoading;

  return (
    <div className="min-h-screen bg-background p-6 font-inter">
      <div className="w-full">
        <div className="flex flex-col gap-6">
          <div className="w-full">
            {!showForm && !editEmployee && !seeEmployee && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Search
                  searchTerm={searchTerm}
                  handleSearch={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar empleados por nombre, documento, teléfono o correo..."
                />
                <button
                  className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 font-semibold transition"
                  onClick={() => setShowForm(true)}
                >
                  <i className="bi bi-plus-lg text-lg"></i>
                  Crear Empleado
                </button>
              </div>
            )}

            {showForm && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <AddEmployee
                  onCancel={handleCancel}
                  onSave={handleAddEmployee}
                  schedulings={addEmployeeSchedulings}
                  setSchedulings={setAddEmployeeSchedulings}
                  employees={employees}
                  onEditScheduling={handleEditScheduling}
                />

                {editingScheduling && (
                  <EditScheduling
                    editing={editingScheduling}
                    onSave={handleAddScheduling}
                    onCancelEdit={() => setEditingScheduling(null)}
                  />
                )}
              </div>
            )}

            {editEmployee && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Editar Empleado</h2>
                <EditEmployee
                  employee={editEmployee}
                  employees={employees}
                  onCancel={handleEditCancel}
                  onSave={handleEditSave}
                />
              </div>
            )}

            {seeEmployee && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <SeeEmployee employee={seeEmployee} onClose={handleSeeClose} />
              </div>
            )}

            {/* Calendar section - below the forms */}
            {(showForm || editEmployee || seeEmployee) && (
              <div className="w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#FACC15] rounded-full flex items-center justify-center">
                      <i className="bi bi-calendar-event text-xl text-gray-800"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Calendario de Programaciones</h3>
                      <p className="text-sm text-gray-600">Visualiza y gestiona las programaciones del empleado</p>
                    </div>
                  </div>
                  <Calendar
                    empleado={
                      showForm
                        ? { schedulings: addEmployeeSchedulings }
                        : editEmployee
                          ? { ...editEmployee, schedulings: schedulings.filter(s => String(s.id_usuario) === String(editEmployee.id)) }
                          : seeEmployee
                            ? { ...seeEmployee, schedulings: schedulings.filter(s => String(s.id_usuario) === String(seeEmployee.id)) }
                            : null
                    }
                    schedulings={schedulings}
                    onUpdateSchedulings={setSchedulings}
                  />
                </div>
              </div>
            )}

            {!showForm && !editEmployee && !seeEmployee && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
                  {isInitialLoading ? (
                    <LoadingTable message="Cargando empleados..." />
                  ) : hasError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="bi bi-exclamation-triangle text-red-400"></i>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error al cargar empleados</h3>
                          <p className="text-sm text-red-700 mt-1">{error}</p>
                          <button
                            onClick={loadData}
                            className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                          >
                            Reintentar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : paginatedEmployees.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="bi bi-people text-6xl text-gray-300"></i>
                      <p className="mt-4 text-gray-500">No hay empleados registrados.</p>
                      <p className="text-xs text-gray-400 mt-1">Los empleados aparecerán aquí cuando se registren.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead>
                          <tr className="bg-gray-50 hover:bg-gray-100">
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Nombre</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Documento</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Teléfono</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Correo</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 tracking-wider">Estado</th>
                            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 tracking-wider">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedEmployees.map((emp) => (
                            <tr key={emp.id || `employee-${Math.random()}`} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="py-4 px-4 text-xs font-medium text-gray-900">{emp.nombre}</td>
                              <td className="py-4 px-4 text-xs font-medium text-gray-900">{emp.documento || emp.numero_documento || emp.num_documento || ''}</td>
                              <td className="py-4 px-4 text-xs text-gray-600">{emp.telefono}</td>
                              <td className="py-4 px-4 text-xs text-gray-600">{emp.correo}</td>
                              <td className="py-4 px-4 text-xs">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => handleToggleStatus(emp.id)}
                                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none  ${
                                      emp.estado === 'Activo' ? 'bg-text-main' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        emp.estado === 'Activo' ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                  <span className={`text-xs font-semibold rounded-full px-2 py-1
                                    ${emp.estado === 'Activo' ? 'bg-green-100 text-green-800' : ''}
                                    ${emp.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : ''}
                                  `}>
                                    {emp.estado === 'Activo' ? "Activo" : "Inactivo"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm font-medium text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="h-8 w-8 p-0 flex items-center justify-center"
                                    onClick={() => handleSeeClick(emp)}
                                    title="Ver detalles"
                                  >
                                    <i className="bi bi-eye text-primary text-lg"></i>
                                  </button>
                                  <button
                                    className="h-8 w-8 p-0 flex items-center justify-center"
                                    onClick={() => handleEditClick(emp)}
                                    title="Editar"
                                  >
                                    <i className="bi bi-pencil-square text-amber-500 text-lg"></i>
                                  </button>
                                  {/* Eliminación deshabilitada: usar inactivación */}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {totalPages > 1 && !isInitialLoading && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
