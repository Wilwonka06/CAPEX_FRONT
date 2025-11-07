import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "./api/servicesApi";
import { getServiceCategories } from "../CatServices/api/serviceCategoriesApi";
import AddServices from './components/AddServices';
import EditServices from "./components/EditServices";
import SeeServices from './components/SeeServices';
import Paginator from "../../../../shared/Paginator";
import SearchProduct from '../../../../shared/Search';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import PropTypes from "prop-types";

const SERVICES_PER_PAGE = 5;

// Componente para la tabla de servicios
const ServicesTable = ({ services, onToggleStatus, onSee, onEdit, onDelete, togglingId }) => (
  <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white font-inter">
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50 hover:bg-gray-100">
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NOMBRE</th>
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CATEGORÍA</th>
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DURACIÓN</th>
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PRECIO</th>
          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ESTADO</th>
          <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACCIONES</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {services.map((service) => {
          const isActive = service.estado === "Activo";
          const isToggling = togglingId === service.id;
          return (
            <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="py-4 px-4 text-xs font-medium text-gray-900">{service.id}</td>
              <td className="py-4 px-4 text-xs font-medium text-gray-900 max-w-[180px] truncate">{service.nombre}</td>
              <td className="py-4 px-4 text-xs text-gray-600 max-w-[180px] truncate">
                {service.categoria?.nombre || service.categoria || 'Sin categoría'}
              </td>
              <td className="py-4 px-4 text-xs text-gray-600">{service.duracion} min</td>
              <td className="py-4 px-4 text-xs text-gray-600">${service.precio?.toLocaleString()}</td>
              <td className="py-4 px-4 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleStatus(service.id)}
                    disabled={isToggling}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-gray-900' : 'bg-gray-300'
                    } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title="Click para cambiar estado"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {isToggling ? 'Cambiando...' : service.estado}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-sm font-medium text-right">
                <div className="flex justify-end space-x-2">
                  <button
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    onClick={() => onSee(service)}
                    title="Ver detalles"
                  >
                    <i className="bi bi-eye text-primary text-lg"></i>
                  </button>
                  <button
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    onClick={() => onEdit(service)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil-square text-amber-500 text-lg"></i>
                  </button>
                  <button
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    onClick={() => onDelete(service)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash text-red-500 text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

ServicesTable.propTypes = {
  services: PropTypes.array.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onSee: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  togglingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const Services = () => {
  const { setTitle } = useOutletContext();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Cargar servicios y categorías
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getServices(),
        getServiceCategories().catch(() => [])
      ]);

      console.log("[DEBUG] Servicios cargados:", servicesData);
      console.log("[DEBUG] Categorías cargadas:", categoriesData);

      setServices(Array.isArray(servicesData) ? servicesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Enriquecer servicios con nombres de categorías si no vienen del backend
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
      toast.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setTitle("Gestión de Servicios");
    return () => setTitle("");
  }, [setTitle]);

  // Filtrar servicios por término de búsqueda
  const filteredServices = services.filter((service) =>
    (service.id?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((service.categoria?.nombre || service.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
    (String(service.duracion || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
    (String(service.precio || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.estado || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, services]);

  // CRUD handlers
  const handleAddService = async (newServiceData) => {
    try {
      await createService(newServiceData);
      // SOLUCIÓN: Recargar todos los datos después de crear
      await loadData();
      setShowAddModal(false);
      toast.success("Servicio agregado exitosamente");
    } catch (error) {
      console.error("Error agregando servicio:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al agregar servicio");
    }
  };

  const handleEditService = async (editedServiceData) => {
    const result = await Swal.fire({
      title: "¿Confirmar edición?",
      text: `¿Editar el servicio "${editedServiceData.nombre}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, editar",
      cancelButtonText: "Cancelar",
    });
    
    if (result.isConfirmed) {
      try {
        await updateService(editedServiceData.id, editedServiceData);
        // SOLUCIÓN: Recargar todos los datos después de editar
        await loadData();
        setShowEditModal(false);
        setSelectedService(null);
        toast.success("Servicio actualizado exitosamente");
      } catch (error) {
        console.error("Error actualizando servicio:", error);
        const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
        toast.error(backendMsg || "Error al actualizar servicio");
      }
    }
  };

  const handleDeleteService = async (service) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Eliminar "${service.nombre}" no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    
    if (result.isConfirmed) {
      try {
        await deleteService(service.id);
        setServices(prev => prev.filter(s => s.id !== service.id));
        toast.success("Servicio eliminado exitosamente");
      } catch (error) {
        console.error("Error eliminando servicio:", error);
        const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
        toast.error(backendMsg || "Error al eliminar servicio");
      }
    }
  };

  const handleToggleStatus = async (serviceId) => {
    const current = services.find(s => s.id === serviceId);
    if (!current) {
      toast.error("Servicio no encontrado");
      return;
    }

    setTogglingId(serviceId);
    const nextEstado = current.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const updatedService = { ...current, estado: nextEstado };

    try {
      await toggleServiceStatus(updatedService);
      // Recargar para asegurar sincronización
      await loadData();
      toast.success(`Estado cambiado a ${nextEstado}`);
    } catch (error) {
      console.error("Error cambiando estado:", error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al cambiar estado");
    } finally {
      setTogglingId(null);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearch = (e) => setSearchTerm(e.target.value);
  
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicios...</p>
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
                Nuevo Servicio
              </button>
            </div>

            {/* Tabla de servicios */}
            {services.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay servicios registrados.</p>
            ) : (
              <>
                <ServicesTable
                  services={paginatedServices}
                  onToggleStatus={handleToggleStatus}
                  togglingId={togglingId}
                  onSee={(service) => {
                    setSelectedService(service);
                    setShowDetailModal(true);
                  }}
                  onEdit={(service) => {
                    setSelectedService(service);
                    setShowEditModal(true);
                  }}
                  onDelete={handleDeleteService}
                />
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
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
        <SeeServices
          onClose={closeModals}
          service={selectedService}
        />
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default Services;