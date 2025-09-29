import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
} from "./api/employeesApi";
import {
  getAllSchedulings,
  getSchedulingsByUser,
  createScheduling,
  updateScheduling,
  deleteScheduling,
} from "./api/schedulingApi";
import Paginator from "../../../../shared/Paginator";
import Calendar from "../../../dashboard/pages/employees/components/Calendar";
import AddEmployee from "../../../dashboard/pages/employees/components/AddEmployee";
import EditEmployee from "../../../dashboard/pages/employees/components/EditEmployee";
import SeeEmployee from "../../../dashboard/pages/employees/components/SeeEmployee";
import AddScheduling from "./components/AddScheduling";
import EditScheduling from "./components/EditScheduling";
import { useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';

const normalizeText = (text) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

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

  // Cargar empleados y programaciones
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("[DEBUG] Intentando cargar empleados...");
      const employeesData = await getEmployees();
      console.log("[DEBUG] Empleados cargados:", employeesData);
      console.log("[DEBUG] Primer empleado:", employeesData[0]);

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
    setTitle('Gestión de Empleados');
    return () => setTitle('');
  }, [setTitle]);

  const filteredEmployees = employees.filter(emp =>
    normalizeText(emp.nombre).includes(normalizeText(searchTerm)) ||
    normalizeText(emp.documento).includes(normalizeText(searchTerm)) ||
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
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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

    // Optimista: aplicar cambio local y revertir si falla
    const prevEmployees = employees;
    setEmployees(prevList => prevList.map(e =>
      String(e.id) === String(employeeId)
        ? { ...e, estado: nextEstado }
        : e
    ));

    try {
      const updated = await toggleEmployeeStatus(employeeId, nextEstado);
      // Sincronizar con respuesta del backend si viene completa
      if (updated && updated.id) {
        setEmployees(prevList => prevList.map(e => 
          String(e.id) === String(updated.id) ? updated : e
        ));
      }
      toast.success(`Estado cambiado a ${nextEstado}`);
    } catch (error) {
      setEmployees(prevEmployees); // revertir
      console.error("Error cambiando estado:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al cambiar estado");
    }
  };

  const handleAddScheduling = async (prog) => {
    if (editingScheduling) {
      // Editing existing scheduling - convert format and update
      try {
        const apiData = {
          id_usuario: editingScheduling.id_usuario,
          fecha: prog.fechaInicio || editingScheduling.fecha,
          hora_entrada: prog.horaInicio || editingScheduling.hora_entrada,
          hora_salida: prog.horaFin || editingScheduling.hora_salida,
        };

        const updatedScheduling = await updateScheduling(editingScheduling.id, apiData);
        setSchedulings(prev => prev.map(s => s.id === updatedScheduling.id ? updatedScheduling : s));
        setEditingScheduling(null);
        toast.success('Programación actualizada exitosamente');
      } catch (error) {
        console.error("Error actualizando programación:", error);
        const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
        toast.error(backendMsg || "Error al actualizar programación");
      }
    } else {
      // Adding new scheduling to temporary list for new employee
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
    try {
      console.log("[DEBUG] Creando empleado con datos:", data);
      const createdEmployee = await createEmployee(data);
      console.log("[DEBUG] Empleado creado:", createdEmployee);
      setEmployees(prev => [...prev, createdEmployee]);

      if (addEmployeeSchedulings.length > 0) {
        console.log("[DEBUG] Creando programaciones para el empleado:", addEmployeeSchedulings);
        const schedulingPromises = [];

        addEmployeeSchedulings.forEach(prog => {
          if (prog.dias && prog.dias.length > 0) {
            const today = new Date();
            prog.dias.forEach(dia => {
              const dayIndex = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'].indexOf(dia);
              if (dayIndex !== -1) {
                const nextDate = new Date(today);
                const daysUntilNext = (dayIndex - today.getDay() + 7) % 7;
                nextDate.setDate(today.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));

                schedulingPromises.push(
                  createScheduling({
                    id_usuario: createdEmployee.id,
                    fecha_inicio: nextDate.toISOString().split('T')[0],
                    hora_entrada: prog.horaInicio,
                    hora_salida: prog.horaFin,
                  })
                );
              }
            });
          }
        });

        try {
          const createdSchedulings = await Promise.all(schedulingPromises);
          setSchedulings(prev => [...prev, ...createdSchedulings]);
          console.log("Schedulings created:", createdSchedulings);
        } catch (schedulingError) {
          console.error("Error creating schedulings:", schedulingError);
          toast.warning('Empleado creado, pero hubo un error con las programaciones');
        }
      }

      setShowForm(false);
      setAddEmployeeSchedulings([]);
      toast.success('Empleado agregado exitosamente!');
    } catch (error) {
      console.error("Error agregando empleado:", error);
      const isNetworkError = error.code === 'ERR_NETWORK' || error.message?.includes('ERR_NAME_NOT_RESOLVED') || !error.response;
      const errorMsg = isNetworkError
        ? "No se puede conectar al servidor. Verifique la conexión a internet o contacte al administrador."
        : (error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error || "Error al agregar empleado");
      toast.error(errorMsg);
    }
  };

  const handleEditClick = (employee) => {
    console.log("[DEBUG] handleEditClick called with employee:", employee);
    console.log("[DEBUG] Employee ID:", employee.id);
    setEditEmployee(employee);
  };

  const handleEditSave = async (data) => {
    try {
      console.log("[DEBUG] handleEditSave called with data:", data);
      console.log("[DEBUG] Employee ID to update:", data.id);
      
      if (!data.id) {
        console.error("[DEBUG] ERROR: No ID in data");
        toast.error("Error: ID de empleado no encontrado");
        return;
      }

      const updatedEmployee = await updateEmployee(data.id, data);
      console.log("[DEBUG] Employee updated successfully:", updatedEmployee);
      
      setEmployees(prev => prev.map(emp => 
        String(emp.id) === String(updatedEmployee.id) ? updatedEmployee : emp
      ));
      setEditEmployee(null);
      toast.success('Empleado actualizado exitosamente!');
    } catch (error) {
      console.error("Error actualizando empleado:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al actualizar empleado");
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
      try {
        console.log("[DEBUG] Deleting employee with ID:", employee.id);
        await deleteEmployee(employee.id);
        
        setEmployees(prev => {
          const updated = prev.filter(e => String(e.id) !== String(employee.id));
          console.log("[DEBUG] Employees after delete:", updated);
          return updated;
        });
        
        toast.success("Empleado eliminado exitosamente");
      } catch (error) {
        console.error("Error eliminando empleado:", error);
        const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
        toast.error(backendMsg || "Error al eliminar empleado");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empleados...</p>
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
        <div className="flex flex-col lg:flex-row gap-6">
          {(showForm || editEmployee || seeEmployee) && (
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md mb-4">
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
          <div className={(showForm || editEmployee || seeEmployee) ? "lg:w-1/3 lg:ml-auto" : "w-full"}>
            {!showForm && !editEmployee && !seeEmployee && (
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <div className="relative w-full max-w-xs flex-1">
                  <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50"></i>
                  <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="border border-gray-300 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                  />
                </div>
                <button
                  className="bg-text-main hover:bg-primary-dark text-white px-5 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm"
                  onClick={() => setShowForm(true)}
                >
                  <i className="bi bi-plus-lg text-lg"></i>
                  Agregar
                </button>
              </div>
            )}

            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <AddEmployee
                  onCancel={handleCancel}
                  onSave={handleAddEmployee}
                  schedulings={addEmployeeSchedulings}
                  setSchedulings={setAddEmployeeSchedulings}
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Editar Empleado</h2>
                <EditEmployee 
                  employee={editEmployee} 
                  onCancel={handleEditCancel} 
                  onSave={handleEditSave} 
                />
              </div>
            )}

            {seeEmployee && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <SeeEmployee employee={seeEmployee} onClose={handleSeeClose} />
              </div>
            )}

            {!showForm && !editEmployee && !seeEmployee && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Lista de Empleados</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 text-text-main/80 uppercase">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Nombre</th>
                        <th className="py-3 px-4 font-semibold">Documento</th>
                        <th className="py-3 px-4 font-semibold">Teléfono</th>
                        <th className="py-3 px-4 font-semibold">Correo</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                        <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-text-main">
                      {paginatedEmployees.map((emp) => (
                        <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{emp.nombre}</td>
                          <td className="py-3 px-4">{emp.documento}</td>
                          <td className="py-3 px-4">{emp.telefono}</td>
                          <td className="py-3 px-4">{emp.correo}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleToggleStatus(emp.id)}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                                  emp.estado === 'Activo' ? 'bg-text-main' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                    emp.estado === 'Activo' ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  emp.estado === 'Activo' ? 'text-green-800' : 'text-red-700'
                                }`}
                              >
                                {emp.estado}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <button
                                className="bg-transparent p-0 m-0 border-none focus:outline-none"
                                title="Visualizar"
                                onClick={() => handleSeeClick(emp)}
                              >
                                <i className="bi bi-eye text-xl" style={{ color: '#b8864b' }}></i>
                              </button>
                              <button
                                className="bg-transparent p-0 m-0 border-none focus:outline-none"
                                title="Editar"
                                onClick={() => handleEditClick(emp)}
                              >
                                <i className="bi bi-pencil-square text-xl" style={{ color: '#ffc107' }}></i>
                              </button>
                              <button
                                className="bg-transparent p-0 m-0 border-none focus:outline-none"
                                title="Eliminar"
                                onClick={() => handleDeleteEmployee(emp)}
                              >
                                <i className="bi bi-trash text-xl" style={{ color: '#dc3545' }}></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
                <div className="text-center mt-4">
                  <p className="text-sm text-text-main/70">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} de {filteredEmployees.length} empleados
                  </p>
                </div>
              </div>
            )}
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
};

export default EmployeesPage;