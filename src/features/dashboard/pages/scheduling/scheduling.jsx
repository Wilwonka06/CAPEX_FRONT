import { useState, useEffect } from 'react';
import GeneralCalendar from './components/GeneralCalendar';
import SeeScheduling from './components/SeeScheduling';
import CalendarContentSkeleton from '../../../../shared/components/CalendarContentSkeleton';
import { useOutletContext } from 'react-router-dom';
import { recurringSchedulingService } from '../employees/API/employeesService';
import AddRecurringScheduling from '../employees/components/AddRecurringScheduling';
import { employeesService } from '../employees/API/employeesService';
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';

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
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);

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

      console.log("[DEBUG] Intentando cargar programaciones recurrentes...");
      const schedulingsData = await recurringSchedulingService.getAll();
      console.log("[DEBUG] Programaciones recurrentes cargadas:", schedulingsData);

      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setSchedulings(Array.isArray(schedulingsData) ? schedulingsData : []);
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
    setTitle('Módulo de Programación de Empleados');
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

  // Abrir modal para crear programación recurrente
  const openAddRecurringModal = (empleadoId) => {
    setSelectedEmployeeForModal(empleadoId || null);
    setIsAddModalOpen(true);
  };

  // Handler para agregar programación
  const handleAddRecurring = async (data) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          const created = await recurringSchedulingService.create(data);
          setSchedulings(prev => [created, ...prev]);
          return created;
        },
        operation: 'create',
        entity: 'programación',
        loadingMessage: 'Creando programación...',
        successMessage: 'Programación creada exitosamente',
        onSuccess: () => {
          setIsAddModalOpen(false);
          setSelectedEmployeeForModal(null);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
  };

  // Handler para actualizar programación
  const handleUpdateRecurring = async (id, data) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          const updated = await recurringSchedulingService.update(id, data);
          setSchedulings(prev => prev.map(p => (String(p.id) === String(id) ? updated : p)));
          return updated;
        },
        operation: 'update',
        entity: 'programación',
        id,
        loadingMessage: 'Actualizando programación...',
        successMessage: 'Programación actualizada exitosamente',
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
  };

  // Handler para eliminar programación
  const handleDeleteRecurring = async (id) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          await recurringSchedulingService.delete(id);
          setSchedulings(prev => prev.filter(p => String(p.id) !== String(id)));
        },
        operation: 'delete',
        entity: 'programación',
        id,
        loadingMessage: 'Eliminando programación...',
        successMessage: 'Programación eliminada exitosamente',
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
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
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => openAddRecurringModal(null)}
                  className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <i className="bi bi-plus-circle"></i>
                  Crear Programación
                </button>
              </div>
              <GeneralCalendar
                employees={filteredEmployees}
                schedulings={schedulings}
                onAddEvent={openAddRecurringModal}
                onUpdateRecurring={handleUpdateRecurring}
                onDeleteRecurring={handleDeleteRecurring}
              />
              {isAddModalOpen && (
                <SeeScheduling
                  isOpen={isAddModalOpen}
                  onClose={() => { setIsAddModalOpen(false); setSelectedEmployeeForModal(null); }}
                  title={'Agregar programación recurrente'}
                >
                  <AddRecurringScheduling
                    empleadoId={selectedEmployeeForModal}
                    onSave={handleAddRecurring}
                    onCancel={() => { setIsAddModalOpen(false); setSelectedEmployeeForModal(null); }}
                  />
                </SeeScheduling>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default Scheduling;
