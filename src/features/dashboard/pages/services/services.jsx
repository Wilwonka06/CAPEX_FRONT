import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddServices from './components/AddServices';
import EditServices from "./components/EditServices";
import SeeServices from './components/SeeServices';
import Paginator from "../../../../shared/Paginator";
import SearchProduct from '../../../../shared/Search';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import PropTypes from "prop-types";
import { useServiceCategories, ServiceCategoriesProvider } from './hooks/useServiceCategories';
import { getServiceCategories as fetchServiceCategoriesApi } from "../CatServices/api/serviceCategoriesApi";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus
} from "./api/servicesApi"; // ⚡ nuevo archivo API

const SERVICES_PER_PAGE = 5;

// Adaptadores entre backend (ES) y UI (EN) para componentes internos
const toUIService = (s) => ({
  id: s.id,
  name: s.nombre,
  category: s.categoria?.nombre || s.categoria || "",
  duration: s.duracion,
  price: s.precio,
  description: s.descripcion,
  active: s.estado ? s.estado === "Activo" : !!s.activo,
  imagen: s.foto || s.imagen || s.img || null,
});

const toApiServiceFromUI = (s) => ({
  id: s.id,
  nombre: s.nombre ?? s.name,
  descripcion: s.descripcion ?? s.description,
  duracion: s.duracion ?? (typeof s.duration === 'string' ? parseInt(s.duration) : s.duration),
  precio: s.precio ?? (typeof s.price === 'string' ? Number(s.price.replace(/[^0-9.]/g, '')) : s.price),
  estado: s.estado ?? (typeof s.active === 'boolean' ? (s.active ? 'Activo' : 'Inactivo') : s.estado),
  id_categoria_servicio: s.id_categoria_servicio ?? s.categoryId,
});

// Componente para la tabla de servicios
const ServicesTable = ({ services, onToggleStatus, onSee, onEdit, onDelete }) => (
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
          const ui = toUIService(service);
          return (
          <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="py-4 px-4 text-xs font-medium text-gray-900">{service.id}</td>
            <td className="py-4 px-4 text-xs font-medium text-gray-900 max-w-[180px] truncate">{ui.name}</td>
            <td className="py-4 px-4 text-xs text-gray-600 max-w-[180px] truncate">{ui.category}</td>
            <td className="py-4 px-4 text-xs text-gray-600">{ui.duration}</td>
            <td className="py-4 px-4 text-xs text-gray-600">{ui.price}</td>
            <td className="py-4 px-4 text-xs">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onToggleStatus(service.id)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    ui.active ? 'bg-text-main' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      ui.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ui.active ? ' text-gray-800' : ' text-gray-600'
                  }`}
                >
                  {ui.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </td>
            <td className="py-4 px-4 text-sm font-medium text-right">
              <div className="flex justify-end space-x-2">
                <button
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => onSee(ui)}
                  title="Ver detalles"
                >
                  <i className="bi bi-eye text-primary text-lg"></i>
                </button>
                <button
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => onEdit(ui)}
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
        );})}
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
};

const ServicesContent = () => {
  const { setTitle } = useOutletContext();
  const { categories } = useServiceCategories();
  const [apiCategories, setApiCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Cargar categorías reales desde la API y luego servicios, enriqueciendo la categoría por nombre si el backend no la envía
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [cats, servicesData] = await Promise.all([
          fetchServiceCategoriesApi().catch(() => []),
          getServices(),
        ]);
        setApiCategories(cats || []);
        const sourceCategories = (cats && cats.length ? cats : categories) || [];
        const enriched = Array.isArray(servicesData)
          ? servicesData.map((s) => {
              if (s?.categoria?.nombre || typeof s?.categoria === 'string') return s;
              const catName = sourceCategories.find(
                (c) => (c.id_categoria_servicio || c.id) === (s.id_categoria_servicio || s.categoryId)
              )?.nombre;
              return catName ? { ...s, categoria: { nombre: catName } } : s;
            })
          : [];
        setServices(enriched);
      } catch (error) {
        toast.error("Error al cargar servicios");
      }
    };
    loadAll();
  }, []);

  // Filtrar servicios por término de búsqueda
  const filteredServices = services.filter((service) =>
    (service.id?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((service.categoria?.nombre || service.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
    (String(service.duracion || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
    (String(service.precio || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((service.estado === 'Activo' ? 'activo' : 'inactivo').includes(searchTerm.toLowerCase()))
  );

  // Paginación
  const totalPages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, services]);

  // CRUD con API
  const handleAddService = async (newService) => {
    // newService viene ya creado desde el modal (AddServices)
    setServices((prev) => [...prev, newService]);
    toast.success("Servicio agregado exitosamente", { position: "top-right" });
  };

  const handleEditService = async (editedService) => {
    const result = await Swal.fire({
      title: "¿Confirmar edición?",
      text: `¿Editar el servicio "${editedService.name || editedService.nombre}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, editar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        const updated = await updateService(toApiServiceFromUI(editedService));
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setShowEditModal(false);
        setSelectedService(null);
        toast.success("Servicio actualizado exitosamente", { position: "top-right" });
      } catch {
        toast.error("Error al actualizar servicio");
      }
    }
  };

  const handleDeleteService = async (service) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Eliminar "${service?.nombre || service?.name}" no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await deleteService(service.id);
        setServices((prev) => prev.filter((s) => s.id !== service.id));
        toast.success("Servicio eliminado exitosamente", { position: "top-right" });
      } catch {
        toast.error("Error al eliminar servicio");
      }
    }
  };

  const handleToggleStatus = async (serviceId) => {
    try {
      // Optimista: calcular nuevo estado localmente por si el backend no devuelve el objeto
      const current = services.find((s) => s.id === serviceId);
      const nextEstado = current?.estado === 'Activo' ? 'Inactivo' : 'Activo';

      await toggleServiceStatus(serviceId);

      setServices((prev) => prev.map((s) => (
        s.id === serviceId
          ? { ...s, estado: nextEstado, activo: typeof s.activo === 'boolean' ? !s.activo : undefined }
          : s
      )));

      toast.success(`Estado cambiado a ${nextEstado}`, { position: "top-right" });
    } catch (error) {
      const backendMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.response?.data?.error;
      toast.error(backendMsg || "Error al cambiar estado");
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

  useEffect(() => {
    setTitle("Gestión de Servicios");
    return () => setTitle("");
  }, [setTitle]);

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Barra de búsqueda y botón de crear */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchProduct searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar servicios..." />
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Nuevo Servicio
              </button>
            </div>
            {/* Tabla de servicios */}
            <ServicesTable
              services={paginatedServices}
              onToggleStatus={handleToggleStatus}
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
      <ToastContainer />
    </div>
  );
};

const Services = () => (
  <ServiceCategoriesProvider>
    <ServicesContent />
  </ServiceCategoriesProvider>
);

export default Services;
