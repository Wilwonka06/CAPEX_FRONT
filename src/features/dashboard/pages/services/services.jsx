import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddServices from './components/AddServices'
import EditServices from "./components/EditServices";
import SeeServices from './components/SeeServices';
import Paginator from "../../../../shared/Paginator";
import SearchProduct from '../../../../shared/Search';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import PropTypes from "prop-types";
import { useServiceCategories, ServiceCategoriesProvider } from './hooks/useServiceCategories';

const LOCAL_STORAGE_KEY = 'servicios';
const SERVICES_PER_PAGE = 5;

const initialServices = [
  { id: 1, name: 'Corte de cabello', category: 'Peluquería', duration: '30 min', price: '$25.000', active: true, description: 'Corte clásico para hombre o mujer', estado: 'Activo' },
  { id: 2, name: 'Manicura Completa', category: 'Uñas', duration: '45 min', price: '$35.000', active: true, description: 'Manicura profesional con esmaltado', estado: 'Activo' },
  { id: 3, name: 'Masaje Relajante', category: 'Bienestar', duration: '60 min', price: '$80.000', active: true, description: 'Masaje corporal relajante', estado: 'Activo' },
  { id: 4, name: 'Depilación Láser', category: 'Estética', duration: '20 min', price: '$150.000', active: true, description: 'Depilación láser definitiva', estado: 'Activo' },
  { id: 5, name: 'Limpieza Facial', category: 'Cuidado Facial', duration: '50 min', price: '$60.000', active: true, description: 'Limpieza profunda de cutis', estado: 'Activo' },
  { id: 6, name: 'Tratamiento Capilar', category: 'Peluquería', duration: '40 min', price: '$75.000', active: true, description: 'Tratamiento nutritivo para el cabello', estado: 'Activo' },
];

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

// Componente para el interruptor de estado
const StatusToggle = ({ isActive, onToggle }) => (
  <label onClick={(e) => { e.stopPropagation(); }} className="flex items-center cursor-pointer">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={isActive} onChange={onToggle} />
      <div className={`block w-11 h-6 rounded-full ${isActive ? 'bg-black' : 'bg-gray-300'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-full' : ''}`}></div>
    </div>
    <div className="ml-3 text-black font-medium">{isActive ? 'Activo' : 'Inactivo'}</div>
  </label>
);

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
        {services.map((service) => (
          <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="py-4 px-4 text-xs font-medium text-gray-900">{service.id}</td>
            <td className="py-4 px-4 text-xs font-medium text-gray-900 max-w-[180px] truncate">{service.name}</td>
            <td className="py-4 px-4 text-xs text-gray-600 max-w-[180px] truncate">{service.category}</td>
            <td className="py-4 px-4 text-xs text-gray-600">{service.duration}</td>
            <td className="py-4 px-4 text-xs text-gray-600">{service.price}</td>
            <td className="py-4 px-4 text-xs">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onToggleStatus(service.id)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none  ${
                    service.active ? 'bg-text-main' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      service.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.active
                      ? ' text-gray-800'
                      : ' text-gray-600 '
                  }`}
                >
                  {service.active ? "Activo" : "Inactivo"}
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
        ))}
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
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Cargar servicios al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let parsed = [];
    try {
      parsed = JSON.parse(stored);
    } catch (e) {
      parsed = [];
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      setServices(initialServices);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialServices));
    } else {
      setServices(parsed);
    }
  }, []);

  // Guardar servicios en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(services));
  }, [services]);

  // Filtrar servicios por término de búsqueda
  const filteredServices = services.filter(
    (service) =>
      (service.id?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.duration || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.price || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.active ? "activo" : "inactivo").includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  // Resetear página al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, services]);

  // CRUD
  const handleAddService = (newService) => {
    setServices((prev) => [...prev, newService]);
    toast.success('Servicio creado exitosamente', { position: 'top-right' });
  };

  const handleEditService = async (editedService) => {
    const result = await Swal.fire({
      title: '¿Confirmar edición?',
      text: `¿Estás seguro de que deseas editar el servicio "${editedService.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      setServices((prev) => prev.map(s => s.id === editedService.id ? editedService : s));
      setShowEditModal(false);
      setSelectedService(null);
      toast.success('Servicio actualizado exitosamente', { position: 'top-right' });
    }
  };

  const handleDeleteService = async (service) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el servicio "${service?.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      setServices((prev) => prev.filter(s => s.id !== service.id));
      toast.success('Servicio eliminado exitosamente', { position: 'top-right' });
    }
  };

  const handleToggleStatus = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    const newStatus = service.active ? 'Inactivo' : 'Activo';
    const result = await Swal.fire({
      title: '¿Confirmar cambio de estado?',
      text: `¿Estás seguro de que deseas cambiar el estado de "${service?.name}" a ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      setServices((prev) => prev.map(s =>
        s.id === serviceId
          ? { ...s, active: !s.active, estado: newStatus }
          : s
      ));
      toast.success(`Estado cambiado a ${newStatus}`, { position: 'top-right' });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedService(null);
  };

  useEffect(() => {
    setTitle('Gestión de Servicios');
    return () => setTitle('');
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