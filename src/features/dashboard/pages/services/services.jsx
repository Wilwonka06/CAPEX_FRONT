import React, { useState, useEffect } from "react";
import { useOutletContext } from 'react-router-dom';

// Importar el nuevo servicio API
import servicesService from './API/ServicesService';

// Importar servicio de categorías (necesitamos mantener esta importación)
import { getServiceCategories } from "../CatServices/API/serviceCategoriesService";

// Importar componentes
import ServicesTable from './components/ServicesTable';
import AddServices from './components/CreateService';
import EditServices from "./components/EditServices";
import ServiceDetail from './components/ServiceDetail';
import SearchProduct from '../../../../shared/Search';
import ConfirmStatusChangeModal from '../../../../shared/components/ConfirmStatusChangeModal';
import ConfirmDeleteModal from '../../../../shared/components/ConfirmDeleteModal';
import { executeWithToast, showError } from '../../../../shared/utils/toastHelpers';
import { filterBySearch } from '../../../../shared/utils/searchHelper';
import Paginator from '../../../../shared/Paginator';

const Services = () => {
  const { setTitle } = useOutletContext();
  
  // Estados
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Cargar servicios y categorías
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [servicesResponse, categoriesData] = await Promise.all([
        servicesService.getAll(),
        getServiceCategories().catch(() => [])
      ]);


      // Procesar servicios
      const servicesData = servicesResponse.success 
        ? servicesResponse.data 
        : (Array.isArray(servicesResponse) ? servicesResponse : []);

      setServices(servicesData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Enriquecer servicios con nombres de categorías si es necesario
      if (servicesData.length && categoriesData.length) {
        const enrichedServices = servicesData.map(service => {
          if (service.categoria?.nombre || typeof service.categoria === 'string') {
            return service;
          }
          
          const category = categoriesData.find(
            cat => (cat.id_categoria_servicio || cat.id) === service.id_categoria_servicio
          );
          
          return category 
            ? { ...service, categoria: { nombre: category.nombre } }
            : service;
        });
        setServices(enrichedServices);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("No se pudieron cargar los servicios.");
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setTitle("Módulo de Servicios");
    return () => setTitle("");
  }, [setTitle]);

  // Filtrar servicios usando la función helper de búsqueda universal
  const filteredServices = filterBySearch(services, searchTerm);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, services]);
  const totalItems = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  // Handler para crear servicio
  const handleAddService = async (newServiceData) => {
    const servicePromise = (async () => {
      const response = await servicesService.create(newServiceData);
      await loadData();
      setShowAddModal(false);
      return response;
    })();

    toast.promise(
      servicePromise,
      {
        loading: 'Creando servicio...',
        success: 'Servicio creado exitosamente',
        error: (err) => {
          console.error("Error creando servicio:", err);
          const backendMsg = err?.response?.data?.message || err?.response?.data?.msg || err?.response?.data?.error;
          return backendMsg || "Error al crear servicio";
        },
      },
      {
        id: 'create-service',
      }
    );

    try {
      await servicePromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    }
  };

  // Handler para editar servicio
  const handleEditService = async (editedServiceData) => {
    try {
      await executeWithToast({
        promiseFn: async () => {
          const response = await servicesService.update(editedServiceData.id, editedServiceData);
          await loadData();
          return response;
        },
        operation: 'update',
        entity: 'servicio',
        id: editedServiceData.id,
        loadingMessage: 'Actualizando servicio...',
        successMessage: 'Servicio actualizado exitosamente',
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedService(null);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    }
  };

  // Handler para eliminar servicio - muestra modal primero
  const handleDeleteService = (service) => {
    setPendingDelete(service);
    setShowDeleteModal(true);
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
      try {
        await executeWithToast({
          promiseFn: async () => {
          await servicesService.delete(pendingDelete.id);
            await loadData();
            return true;
          },
          operation: 'delete',
          entity: 'servicio',
        id: pendingDelete.id,
          loadingMessage: 'Eliminando servicio...',
          successMessage: 'Servicio eliminado exitosamente',
        onSuccess: () => {
          setShowDeleteModal(false);
          setPendingDelete(null);
        },
        });
      } catch {
        // Error ya manejado por executeWithToast
    } finally {
      setDeletingId(null);
    }
  };

  // Handler para cambiar estado - muestra modal primero
  const handleToggleStatus = (serviceId) => {
    const current = services.find(s => s.id === serviceId);
    if (!current) {
      showError("Servicio no encontrado");
      return;
    }

    setPendingStatusChange({ serviceId, current });
    setShowStatusModal(true);
  };

  // Handler para confirmar cambio de estado
  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { serviceId, current } = pendingStatusChange;
    setTogglingId(serviceId);
    const nextEstado = current.estado === 'Activo' ? 'Inactivo' : 'Activo';

    try {
      await executeWithToast({
        promiseFn: async () => {
          await servicesService.changeStatus(serviceId, nextEstado);
          await loadData();
        },
        operation: 'update',
        entity: 'servicio',
        id: serviceId,
        loadingMessage: 'Cambiando estado...',
        successMessage: `Estado cambiado a ${nextEstado} exitosamente`,
        onSuccess: () => {
          setShowStatusModal(false);
          setPendingStatusChange(null);
        },
      });
    } catch {
      // Error ya manejado por executeWithToast
    } finally {
      setTogglingId(null);
    }
  };

  // Handler de búsqueda
  const handleSearch = (e) => setSearchTerm(e.target.value);
  
  // Handler para cerrar modales
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedService(null);
  };

  // Render de error
  if (error && !loading) {
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
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct 
                searchTerm={searchTerm} 
                handleSearch={handleSearch} 
                placeholder="Buscar servicios..." 
              />
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Crear Servicio
              </button>
            </div>

            {/* Tabla de servicios */}
            <ServicesTable
              services={pageServices}
              onToggleStatus={handleToggleStatus}
              togglingId={togglingId}
              onView={(service) => {
                setSelectedService(service);
                setShowDetailModal(true);
              }}
              onEdit={(service) => {
                setSelectedService(service);
                setShowEditModal(true);
              }}
              onDelete={handleDeleteService}
              loading={loading}
            />
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      {showAddModal && (
        <AddServices
          onClose={closeModals}
          onAdd={handleAddService}
          services={services}
          categories={categories}
        />
      )}

      {showEditModal && selectedService && (
        <EditServices
          onClose={closeModals}
          service={selectedService}
          onEdit={handleEditService}
          services={services}
          categories={categories}
        />
      )}

      {showDetailModal && selectedService && (
        <ServiceDetail
          service={selectedService}
          isOpen={showDetailModal}
          onClose={closeModals}
        />
      )}

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
          loading={togglingId === pendingStatusChange.serviceId}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && pendingDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            if (!deletingId) {
              setShowDeleteModal(false);
              setPendingDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          itemName={pendingDelete.nombre}
          entityType="servicio"
          loading={deletingId === pendingDelete.id}
        />
      )}
    </div>
  );
};

export default Services;
