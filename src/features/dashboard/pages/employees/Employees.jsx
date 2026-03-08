import { useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from 'react-router-dom';

import { employeesService } from "./API/employeesService";

import EmployeesTable from "./components/EmployeesTable";
import Paginator from "../../../../shared/Paginator";
import AddEmployee from "./components/CreateEmployee";
import EditEmployee from "./components/EditEmployee";
import Search from "../../../../shared/Search";
import ConfirmStatusChangeModal from '../../../../shared/components/ConfirmStatusChangeModal';
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';

const ITEMS_PER_PAGE = 5;

const EmployeesPage = () => {
  const { setTitle } = useOutletContext();
  const navigate = useNavigate();

  // ── Estado principal ───────────────────────────────────────────────────────
  const [employees,   setEmployees]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [togglingId,  setTogglingId]  = useState(null);

  // ── Paginación y búsqueda controladas por backend ─────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const [searchTerm,  setSearchTerm]  = useState("");

  // ── Modales ────────────────────────────────────────────────────────────────
  const [showAddForm,       setShowAddForm]       = useState(false);
  const [editEmployee,      setEditEmployee]      = useState(null);
  const [showStatusModal,   setShowStatusModal]   = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [newSchedulings,    setNewSchedulings]    = useState([]);

  // ── Carga de datos ─────────────────────────────────────────────────────────
  // useCallback para poder llamarlo desde varios lugares sin crear funciones nuevas
  const loadData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    setError("");
    try {
      const response = await employeesService.getAll({
        page,
        limit: ITEMS_PER_PAGE,
        search,
      });

      // El backend ahora devuelve { success, data, pagination }
      if (response?.success) {
        setEmployees(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total      || 0);
      } else {
        // Compatibilidad si el backend devuelve array directo (sin success)
        const list = Array.isArray(response) ? response : [];
        setEmployees(list);
        setTotalPages(1);
        setTotalItems(list.length);
      }
    } catch (err) {
      console.error("Error cargando empleados:", err);
      const errorMsg =
        err.code === 'ERR_NETWORK' || err.message?.includes('ERR_NAME_NOT_RESOLVED')
          ? "No se puede conectar al servidor. Verifique su conexión a internet."
          : "No se pudieron cargar los datos. Por favor, intente nuevamente.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    setTitle("Empleados");
    loadData(1, "");
    return () => setTitle("");
  }, [setTitle, loadData]);

  // Cuando cambia la búsqueda, volver a página 1
  useEffect(() => {
    setCurrentPage(1);
    loadData(1, searchTerm);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cuando cambia la página (sin cambio de búsqueda)
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadData(newPage, searchTerm);
  };

  // ── Handlers de CRUD ───────────────────────────────────────────────────────
  const handleAddEmployee = async (employeeData) => {
    await executeWithToast({
      promiseFn: () => employeesService.create(employeeData),
      operation: "create",
      entity: "empleado",
      loadingMessage: "Creando empleado...",
      successMessage: "Empleado creado exitosamente",
      onSuccess: () => {
        setShowAddForm(false);
        loadData(currentPage, searchTerm);
      },
    });
  };

  const handleEditEmployee = async (id, data) => {
    await executeWithToast({
      promiseFn: () => employeesService.update(id, data),
      operation: "update",
      entity: "empleado",
      loadingMessage: "Actualizando empleado...",
      successMessage: "Empleado actualizado exitosamente",
      onSuccess: () => {
        setEditEmployee(null);
        loadData(currentPage, searchTerm);
      },
    });
  };

  const handleStatusChangeRequest = (employee) => {
    setPendingStatusChange(employee);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    setTogglingId(pendingStatusChange.id);
    const newStatus = pendingStatusChange.estado === 'Activo' ? 'Inactivo' : 'Activo';
    await executeWithToast({
      promiseFn: () => employeesService.updateStatus(pendingStatusChange.id, newStatus),
      operation: "update",
      entity: "empleado",
      loadingMessage: "Actualizando estado...",
      successMessage: `Empleado ${newStatus === 'Activo' ? 'activado' : 'desactivado'} exitosamente`,
      onSuccess: () => {
        setShowStatusModal(false);
        setPendingStatusChange(null);
        loadData(currentPage, searchTerm);
      },
    });
    setTogglingId(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (showAddForm) {
    return (
      <AddEmployee
        onAdd={handleAddEmployee}
        onCancel={() => setShowAddForm(false)}
        newSchedulings={newSchedulings}
        setNewSchedulings={setNewSchedulings}
      />
    );
  }

  if (editEmployee) {
    return (
      <EditEmployee
        employee={editEmployee}
        onEdit={handleEditEmployee}
        onCancel={() => setEditEmployee(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Search
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre, correo o documento..."
        />
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg"
        >
          + Nuevo Empleado
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <EmployeesTable
        employees={employees}
        loading={loading}
        togglingId={togglingId}
        onEdit={setEditEmployee}
        onStatusChange={handleStatusChangeRequest}
        onNavigate={(id) => navigate(`/dashboard/empleados/${id}/programaciones`)}
      />

      {/* [FIX #5] Paginator recibe datos reales del backend — no slice local */}
      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={totalItems}
        showInfo
      />

      {showStatusModal && pendingStatusChange && (
        <ConfirmStatusChangeModal
          isOpen={showStatusModal}
          entity={pendingStatusChange}
          entityType="empleado"
          onConfirm={handleConfirmStatusChange}
          onCancel={() => { setShowStatusModal(false); setPendingStatusChange(null); }}
        />
      )}
    </div>
  );
};

export default EmployeesPage;