import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from 'react-router-dom';

// Importar servicios API
import { employeesService } from "./API/employeesService";

// Importar componentes
import EmployeesTable from "./components/EmployeesTable";
import Paginator from "../../../../shared/Paginator";
import AddEmployee from "./components/CreateEmployee";
import EditEmployee from "./components/EditEmployee";
import Search from "../../../../shared/Search";
import ConfirmStatusChangeModal from '../../../../shared/components/ConfirmStatusChangeModal';
import { filterBySearch } from '../../../../shared/utils/searchHelper';
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';

const EmployeesPage = () => {
  const { setTitle } = useOutletContext();
  const navigate = useNavigate();
  
  // Estados principales
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  
  // Estados de vistas/modales
  const [showAddForm, setShowAddForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [newSchedulings, setNewSchedulings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cargar empleados y programaciones
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const employeesData = await employeesService.getAll();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      const errorMsg = err.code === 'ERR_NETWORK' || err.message?.includes('ERR_NAME_NOT_RESOLVED')
        ? "No se puede conectar al servidor. Verifique su conexión a internet."
        : "No se pudieron cargar los datos. Por favor, intente nuevamente.";
      setError(errorMsg);
      showError(err);
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

  // Filtrar empleados usando la función helper de búsqueda universal
  const filteredEmployees = filterBySearch(employees, searchTerm);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, employees]);

  const totalItems = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Handler para cambiar estado - muestra modal primero
  const handleToggleStatus = (employeeId) => {
    const current = employees.find(e => String(e.id) === String(employeeId));
    
    if (!current) {
      showError("Empleado no encontrado");
      return;
    }

    setPendingStatusChange({ employeeId, current });
    setShowStatusModal(true);
  };

  // Handler para confirmar cambio de estado
  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { employeeId, current } = pendingStatusChange;
    const nextEstado = current.estado === 'Activo' ? 'Inactivo' : 'Activo';
    setTogglingId(employeeId);

    // Actualización optimista
    setEmployees(prevList => prevList.map(e =>
      String(e.id) === String(employeeId) ? { ...e, estado: nextEstado } : e
    ));

    try {
      await executeWithToast({
        promiseFn: () => employeesService.toggleStatus(employeeId, nextEstado),
        operation: 'update',
        entity: 'empleado',
        id: employeeId,
        loadingMessage: 'Cambiando estado...',
        successMessage: `Estado cambiado a ${nextEstado} exitosamente`,
        onSuccess: () => {
          setShowStatusModal(false);
          setPendingStatusChange(null);
        },
        onError: () => {
          // Revertir en caso de error
          setEmployees(prevList => prevList.map(e =>
            String(e.id) === String(employeeId) ? { ...e, estado: current.estado } : e
          ));
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    } finally {
      setTogglingId(null);
    }
  };

  // Handler para agregar empleado
  const handleAddEmployee = async (data) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          // Crear el empleado primero
          const createdEmployee = await employeesService.create(data);
          setEmployees(prev => [...prev, createdEmployee]);
          return { employee: createdEmployee, schedulingsCount: 0 };
        },
        operation: 'create',
        entity: 'empleado',
        loadingMessage: 'Creando empleado...',
        successMessage: 'Empleado creado exitosamente',
        onSuccess: () => {
          setShowAddForm(false);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
  };

  // Handler para editar empleado
  const handleEditSave = async (data) => {
    if (!data.id) {
      showError("Error: ID de empleado no encontrado");
      return;
    }

    try {
      await executeWithToast({
        promiseFn: async () => {
          const updatedEmployee = await employeesService.update(data.id, data);
          await loadData();
          return updatedEmployee;
        },
        operation: 'update',
        entity: 'empleado',
        id: data.id,
        loadingMessage: 'Actualizando empleado...',
        successMessage: 'Empleado actualizado exitosamente',
        onSuccess: () => {
          setEditEmployee(null);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
  };

  // Handlers de navegación
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
            {!showAddForm && !editEmployee && (
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
                  employees={pageEmployees}
                  onToggleStatus={handleToggleStatus}
                  togglingId={togglingId}
                  onView={(emp) => navigate(`/dashboard/empleados/${emp.id || emp.id_usuario}`)}
                  onEdit={(emp) => setEditEmployee(emp)}
                  loading={loading}
                />
                <Paginator
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                />
              </>
            )}

            {/* Vista: Agregar empleado */}
            {showAddForm && (
              <div className="space-y-6">
                <AddEmployee
                  onCancel={handleCancel}
                  onSave={handleAddEmployee}
                  schedulings={newSchedulings}
                  setSchedulings={setNewSchedulings}
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de cambio de estado */}
      {showStatusModal && pendingStatusChange && (
        <ConfirmStatusChangeModal
          isOpen={showStatusModal}
          onClose={() => {
            if (!togglingId) {
              setShowStatusModal(false);
              setPendingStatusChange(null);
            }
          }}
          onConfirm={handleConfirmStatusChange}
          isActivating={pendingStatusChange.current.estado === 'Inactivo'}
          itemName={pendingStatusChange.current.nombre}
          loading={togglingId === pendingStatusChange.employeeId}
        />
      )}

      {/* Se redirige a la página dedicada de detalle */}
    </div>
  );
};

export default EmployeesPage;
