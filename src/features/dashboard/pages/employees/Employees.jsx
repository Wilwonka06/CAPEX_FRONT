
import React, { useState, useEffect } from "react";
import Paginator from "../../../../shared/Paginator";
import Calendar from "../../../dashboard/pages/employees/components/Calendar";
import AddEmployee from "../../../dashboard/pages/employees/components/AddEmployee";
import EditEmployee from "../../../dashboard/pages/employees/components/EditEmployee";
import SeeEmployee from "../../../dashboard/pages/employees/components/SeeEmployee";
import AddScheduling from "./components/AddScheduling";

const initialEmployees = [
  { id: 1, nombre: "Ana", apellido: "García", documento: "12345678", estado: true, schedulings: [] },
  { id: 2, nombre: "Luis", apellido: "Pérez", documento: "87654321", estado: true, schedulings: [] },
  { id: 3, nombre: "María", apellido: "López", documento: "11223344", estado: false, schedulings: [] },
  { id: 4, nombre: "Carlos", apellido: "Ramírez", documento: "99887766", estado: true, schedulings: [] },
];

const EMPLOYEES_KEY = 'capex_employees';

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

// Utilidad para expandir una programación a eventos diarios
// Utilidad para expandir una programación a eventos diarios
// adentro de tu archivo EmployeesPage.jsx

function expandirProgramacion(prog, idBase) {
  const { fechaInicio, fechaFin, dias = [] } = prog;

  const diasSemanaMap = {
    Domingo: 0, Lunes: 1, Martes: 2, Miercoles: 3,
    Jueves: 4, Viernes: 5, Sabado: 6,
  };

  const diasSeleccionados = dias.map(d => diasSemanaMap[d.trim()]);
  const eventos = [];

  const start = new Date(fechaInicio);
  const end = new Date(fechaFin || fechaInicio);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  let current = new Date(start);
  let idx = 0;

  while (current <= end) {
    const diaSemana = current.getDay();
    if (diasSeleccionados.length > 0 ? diasSeleccionados.includes(diaSemana) : current.getTime() === start.getTime()) {
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
}



const EmployeesPage = () => {
  // Leer empleados de localStorage al iniciar
  const [employees, setEmployees] = useState(() => {
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    return stored ? JSON.parse(stored) : initialEmployees;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [seeEmployee, setSeeEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('empleado'); // 'empleado' o 'programacion'
  const [employeeForm, setEmployeeForm] = useState(null); // Estado temporal del formulario de empleado
  const [schedulings, setSchedulings] = useState([]); // Lista de programaciones
  const [editingScheduling, setEditingScheduling] = useState(null); // Programación en edición
  const [addEmployeeSchedulings, setAddEmployeeSchedulings] = useState([]);

  // Guardar empleados en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  }, [employees]);

  // Filtrado por nombre, apellido o documento
  const filteredEmployees = employees.filter(emp =>
    normalizeText(emp.nombre).includes(normalizeText(searchTerm)) ||
    normalizeText(emp.apellido).includes(normalizeText(searchTerm)) ||
    normalizeText(emp.documento).includes(normalizeText(searchTerm)) ||
    (emp.correo && normalizeText(emp.correo).includes(normalizeText(searchTerm))) ||
    (emp.tipoDocumento && normalizeText(emp.tipoDocumento).includes(normalizeText(searchTerm))) ||
    normalizeText(emp.estado ? 'activo' : 'inactivo').includes(normalizeText(searchTerm))
  );

  // Paginación
  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleEstado = (id) => {
    setEmployees(
      employees.map(emp =>
        emp.id === id ? { ...emp, estado: !emp.estado } : emp
      )
    );
  };

  const handleAddEmployee = (data) => {
    // ✅ 1) NO expandas la programación aquí.
    // Guarda las programaciones tal cual: con fechaInicio, fechaFin, días, repetición, etc.
  
    const schedulingsCrudo = addEmployeeSchedulings.map(prog => ({
      ...prog,
      idBase: Date.now().toString() + Math.floor(Math.random() * 10000).toString(),
    }));
  
    console.log('✅ Schedulings guardados CRUDO:', schedulingsCrudo);
  
    // ✅ 2) Agrega el empleado con la programación base.
    setEmployees([
      ...employees,
      {
        id: Date.now(),
        ...data,
        schedulings: schedulingsCrudo,
      }
    ]);
  
    // ✅ 3) Limpia el formulario.
    setShowForm(false);
    setAddEmployeeSchedulings([]);
  };
  

  const handleEditClick = (employee) => {
    setEditEmployee(employee);
  };

  const handleEditSave = (data) => {
    setEmployees(employees.map(emp =>
      emp.id === editEmployee.id
        ? {
            ...emp,
            nombre: data.nombre,
            apellido: data.apellidos,
            documento: data.documento,
            estado: data.estado === 'Activo',
            correo: data.correo,
            tipoDocumento: data.tipoDocumento,
            schedulings: data.schedulings || emp.schedulings, // Incluir las programaciones actualizadas
          }
        : emp
    ));
    setEditEmployee(null);
  };

  const handleEditCancel = () => {
    setEditEmployee(null);
  };

  const handleSeeClick = (employee) => {
    setSeeEmployee(employee);
  };

  const handleSeeClose = () => {
    setSeeEmployee(null);
  };

  // Guardar datos del formulario de empleado sin cerrar
  const handleEmployeeFormChange = (form) => {
    setEmployeeForm(form);
  };

  // Agregar o editar programación
  const handleAddScheduling = (prog) => {
    if (editingScheduling) {
      setSchedulings(schedulings.map(s => s.id === editingScheduling.id ? { ...prog, id: editingScheduling.id } : s));
      setEditingScheduling(null);
    } else {
      // Expandir la programación a eventos diarios
      const nuevosEventos = expandirProgramacion(prog, Date.now());
      setSchedulings([
        ...schedulings,
        ...nuevosEventos,
      ]);
    }
  };

  // Editar programación
  const handleEditScheduling = (prog) => {
    setEditingScheduling(prog);
    setActiveTab('programacion');
  };

  // Eliminar programación
  const handleDeleteScheduling = (id) => {
    setSchedulings(schedulings.filter(s => s.id !== id));
  };

  // Guardar todo (empleado + programaciones)
  const handleSaveAll = () => {
    if (!employeeForm) return;
    setEmployees([
      ...employees,
      {
        id: Date.now(),
        nombre: employeeForm.nombre,
        apellido: employeeForm.apellidos,
        documento: employeeForm.documento,
        estado: employeeForm.estado === 'Activo',
        correo: employeeForm.correo,
        tipoDocumento: employeeForm.tipoDocumento,
        schedulings: schedulings,
      }
    ]);
    setShowForm(false);
    setEmployeeForm(null);
    setSchedulings([]);
    setEditingScheduling(null);
    setActiveTab('empleado');
  };

  // Cancelar y limpiar
  const handleCancel = () => {
    setShowForm(false);
    setEmployeeForm(null);
    setSchedulings([]);
    setEditingScheduling(null);
    setActiveTab('empleado');
    setAddEmployeeSchedulings([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-main">Gestión de Empleados</h1>
        </div>
        {/* Contenedor principal: calendario a la izquierda, buscador y empleados a la derecha */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendario - Lado izquierdo */}
          {(showForm || editEmployee || seeEmployee) && (
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md mb-4">
                <Calendar
                  empleado={
                    showForm
                      ? { schedulings: addEmployeeSchedulings, ...employeeForm }
                      : editEmployee
                        ? editEmployee
                        : seeEmployee
                          ? seeEmployee
                          : null
                  }
                  onUpdateEmpleado={empleadoActualizado => {
                    if (editEmployee) {
                      setEmployees(emps =>
                        emps.map(emp => emp.id === empleadoActualizado.id ? empleadoActualizado : emp)
                      );
                      setEditEmployee(empleadoActualizado);
                    }
                    if (showForm) {
                      setAddEmployeeSchedulings(empleadoActualizado.schedulings || []);
                      setEmployeeForm(empleadoActualizado);
                    }
                    if (seeEmployee) {
                      setSeeEmployee(empleadoActualizado);
                    }
                  }}
                />
              </div>
            </div>
          )}
          {/* Lado derecho: buscador y empleados */}
          <div className={(showForm || editEmployee || seeEmployee) ? "lg:w-1/3 lg:ml-auto" : "w-full"}>
            {/* Buscador y botón en la parte superior izquierda de la columna */}
            {!(showForm || editEmployee || seeEmployee) ? (
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
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-full max-w-xs">
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
            {showForm ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <AddEmployee
                  onCancel={handleCancel}
                  onSave={handleAddEmployee}
                  schedulings={addEmployeeSchedulings}
                  setSchedulings={setAddEmployeeSchedulings}
                />
              </div>
            ) : editEmployee ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Editar Empleado</h2>
                <EditEmployee employee={editEmployee} onCancel={handleEditCancel} onSave={handleEditSave} />
              </div>
            ) : seeEmployee ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <SeeEmployee employee={seeEmployee} onClose={handleSeeClose} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Lista de Empleados</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 text-text-main/80 uppercase">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Nombre</th>
                        <th className="py-3 px-4 font-semibold">Apellido</th>
                        <th className="py-3 px-4 font-semibold">Documento</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                        <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-text-main">
                      {paginatedEmployees.map((emp) => (
                        <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{emp.nombre}</td>
                          <td className="py-3 px-4">{emp.apellido}</td>
                          <td className="py-3 px-4">{emp.documento}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleEstado(emp.id)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none transition ${emp.estado ? 'bg-black' : 'bg-gray-200 text-gray-600'}`}
                            >
                              <span className={emp.estado ? 'text-white' : 'text-gray-600'}>{emp.estado ? 'Activo' : 'Inactivo'}</span>
                            </button>
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Paginador */}
                {totalPages > 1 && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
                {/* Info de paginación */}
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
    </div>
  );
};

export default EmployeesPage;