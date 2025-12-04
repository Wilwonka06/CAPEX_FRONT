import { useState, useEffect } from 'react';
import GeneralCalendar from './components/GeneralCalendar';
import CreateScheduling from './components/CreateScheduling';
import CalendarContentSkeleton from '../../../../shared/components/CalendarContentSkeleton';
import { useOutletContext } from 'react-router-dom';
import { recurringSchedulingService, novedadesService } from '../employees/API/employeesService';
import { employeesService } from '../employees/API/employeesService';
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';
import AddNovedadModal from '../employees/components/AddNovedadModal';
import { useAuth } from '../../../../shared/contexts/AuthContext';

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const Scheduling = () => {
  const { setTitle } = useOutletContext();
  const { hasPrivilege } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [schedulings, setSchedulings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNovedadModalOpen, setIsNovedadModalOpen] = useState(false);
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);

  // Verificar permisos
  const canCreate = hasPrivilege('Programación', 'Crear');
  const canCreateNovedades = hasPrivilege('Programación', 'Crear novedades');

  // Cargar empleados y programaciones
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const employeesData = await employeesService.getAll();
      const schedulingsData = await recurringSchedulingService.getAll();

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

  // Abrir modal para crear novedad
  const openNovedadModal = () => {
    setIsNovedadModalOpen(true);
  };

  // Handler para agregar programación
  const handleAddRecurring = async (data) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          const created = await recurringSchedulingService.create(data);
          setSchedulings(prev => [created, ...prev]);
          await loadData(); // Recargar datos para actualizar el calendario
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
          await loadData(); // Recargar datos para actualizar el calendario
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
          await loadData(); // Recargar datos para actualizar el calendario
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

  // Handler para crear novedad
  const handleCreateNovedad = async (data) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          await novedadesService.create(data);
          await loadData(); // Recargar datos para actualizar el calendario
          return true;
        },
        operation: 'create',
        entity: 'novedad',
        loadingMessage: 'Creando novedad...',
        successMessage: 'Novedad creada exitosamente',
        onSuccess: () => {
          setIsNovedadModalOpen(false);
        },
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
          <div className="flex gap-2">
            {canCreate && (
              <button
                onClick={() => openAddRecurringModal(null)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <i className="bi bi-plus-circle"></i>
                Crear Programación
              </button>
            )}
            {canCreateNovedades && (
              <button
                onClick={openNovedadModal}
                className="px-4 py-2.5 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <i className="bi bi-calendar-plus"></i>
                Crear Novedad
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 overflow-x-auto">
          {loading ? (
            <CalendarContentSkeleton />
          ) : (
            <>
              <GeneralCalendar
                employees={filteredEmployees}
                schedulings={schedulings}
                onAddEvent={canCreate ? openAddRecurringModal : undefined}
                onUpdateRecurring={handleUpdateRecurring}
                onDeleteRecurring={handleDeleteRecurring}
              />
              <CreateScheduling
                empleadoId={selectedEmployeeForModal}
                employees={employees}
                onCreate={handleAddRecurring}
                isOpen={isAddModalOpen}
                onClose={() => {
                  setIsAddModalOpen(false);
                  setSelectedEmployeeForModal(null);
                }}
              />
              {isNovedadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md overflow-hidden animate-fade-in">
                  <div className="w-full max-w-4xl mx-4 max-h-[95vh] overflow-hidden">
                    <div className="bg-white rounded-3xl shadow-2xl relative flex flex-col overflow-hidden transform transition-all duration-300 scale-100">
                      {/* Header mejorado */}
                      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-t-3xl flex items-center justify-between px-8 py-5 shadow-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                            <i className="bi bi-calendar-plus text-2xl"></i>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold m-0">Crear Nueva Novedad</h2>
                            <p className="text-blue-100 text-sm m-0 mt-1">Registra cambios en la programación de empleados</p>
                          </div>
                        </div>
                        <button
                          className="text-white/80 hover:text-white hover:bg-white/20 rounded-2xl w-10 h-10 flex items-center justify-center text-xl font-bold transition-all duration-300 hover:scale-110 shadow-lg"
                          onClick={() => setIsNovedadModalOpen(false)}
                          aria-label="Cerrar"
                        >
                          ×
                        </button>
                      </div>

                      {/* Contenido con mejor diseño */}
                      <div className="overflow-y-auto overflow-x-hidden p-8 flex-1 bg-gradient-to-br from-gray-50 to-blue-50/30">
                        <div className="max-w-3xl mx-auto">
                          <AddNovedadModal
                            programaciones={schedulings}
                            onSave={handleCreateNovedad}
                            onCancel={() => setIsNovedadModalOpen(false)}
                            showTitle={false}
                          />
                        </div>
                      </div>

                      {/* Footer mejorado */}
                      <div className="rounded-b-3xl flex justify-end gap-3 px-8 py-5 bg-white border-t border-gray-100 shadow-lg">
                        <button
                          type="button"
                          onClick={() => setIsNovedadModalOpen(false)}
                          className="px-6 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <i className="bi bi-x-circle text-lg"></i>
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          form="novedad-form"
                          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <i className="bi bi-plus-circle text-lg"></i>
                          Crear Novedad
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default Scheduling;
