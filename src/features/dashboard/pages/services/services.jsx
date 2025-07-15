import React, { useState } from "react";
import AddServices from './components/AddServices'
import EditServices from "./components/EditServices";
import SeeServices from './components/SeeServices';
import Paginator from "../../../../shared/Paginator";
import { initialCategories } from '../CatServices/CatServices';
import SearchProduct from '../../../../shared/Search';

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
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-left">
      <thead className="bg-gray-50 text-text-main/80 uppercase">
        <tr>
          <th className="py-3 px-4 font-semibold">Servicio</th>
          <th className="py-3 px-4 font-semibold">Categoría</th>
          <th className="py-3 px-4 font-semibold">Duración</th>
          <th className="py-3 px-4 font-semibold">Precio</th>
          <th className="py-3 px-4 font-semibold">Estado</th>
          <th className="py-3 px-4 font-semibold text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="bg-white text-text-main">
        {services.map((service) => (
          <tr key={service.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4">{service.name}</td>
            <td className="py-3 px-4 text-text-main/80">{service.category}</td>
            <td className="py-3 px-4 text-text-main/80">{service.duration}</td>
            <td className="py-3 px-4 text-text-main/80">{service.price}</td>
            <td className="py-3 px-4">
              <StatusToggle 
                isActive={service.active} 
                onToggle={() => onToggleStatus(service.id)}
              />
            </td>
            <td className="py-4 px-4 text-sm font-medium text-right">
              <div className="flex justify-end items-center gap-2">
                <button onClick={() => onSee(service)} title="Visualizar" className="bg-transparent p-0 m-0 border-none focus:outline-none">
                  <i className="bi bi-eye text-xl" style={{ color: '#b8864b' }}></i>
                </button>
                <button onClick={() => onEdit(service)} title="Editar" className="bg-transparent p-0 m-0 border-none focus:outline-none">
                  <i className="bi bi-pencil-square text-xl" style={{ color: '#ffc107' }}></i>
                </button>
                <button onClick={() => onDelete(service)} title="Eliminar" className="bg-transparent p-0 m-0 border-none focus:outline-none">
                  <i className="bi bi-trash text-xl" style={{ color: '#ef4444' }}></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Services = () => {
  const [services, setServices] = useState([
    { id: 1, name: 'Corte de cabello', category: 'Peluquería', duration: '30 min', price: '$25.000', active: true, description: 'Corte clásico para hombre o mujer', estado: 'Activo' },
    { id: 2, name: 'Manicura Completa', category: 'Uñas', duration: '45 min', price: '$35.000', active: true, description: 'Manicura profesional con esmaltado', estado: 'Activo' },
    { id: 3, name: 'Masaje Relajante', category: 'Bienestar', duration: '60 min', price: '$80.000', active: false, description: 'Masaje corporal relajante', estado: 'Inactivo' },
    { id: 4, name: 'Depilación Láser', category: 'Estética', duration: '20 min', price: '$150.000', active: true, description: 'Depilación láser definitiva', estado: 'Activo' },
    { id: 5, name: 'Limpieza Facial', category: 'Cuidado Facial', duration: '50 min', price: '$60.000', active: true, description: 'Limpieza profunda de cutis', estado: 'Activo' },
    { id: 6, name: 'Tratamiento Capilar', category: 'Peluquería', duration: '40 min', price: '$75.000', active: false, description: 'Tratamiento nutritivo para el cabello', estado: 'Inactivo' },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSeeModalOpen, setIsSeeModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [categories, setCategories] = useState(initialCategories);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleServiceStatus = (id) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, active: !service.active, estado: service.active ? 'Inactivo' : 'Activo' } : service
      )
    );
  };

  const handleAddService = (newService) => {
    setServices([
      ...services,
      { ...newService, id: Date.now(), active: newService.estado === 'Activo' }
    ]);
    setIsAddModalOpen(false);
  };

  const handleEditService = (editedService) => {
    setServices(
      services.map((service) =>
        service.id === editedService.id ? { ...editedService, active: editedService.estado === 'Activo' } : service
      )
    );
    setIsEditModalOpen(false);
    setSelectedService(null);
  };

  const handleSeeService = (service) => {
    setSelectedService(service);
    setIsSeeModalOpen(true);
  };

  const handleEditClick = (service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleDeleteService = (service) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el servicio "${service.name}"?`)) {
      setServices(services.filter((s) => s.id !== service.id));
    }
  };

  const filteredServices = services.filter(
    (service) =>
      normalizeText(service.name).includes(normalizeText(searchTerm)) ||
      normalizeText(service.category).includes(normalizeText(searchTerm)) ||
      normalizeText(service.duration).includes(normalizeText(searchTerm)) ||
      normalizeText(service.price).includes(normalizeText(searchTerm)) ||
      normalizeText(service.description).includes(normalizeText(searchTerm)) ||
      (service.active ? 'Activo' : 'Inactivo').includes(searchTerm)
  );

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 pb-0">
            <h1 className="text-2xl font-bold text-text-main mb-1">Gestión de Servicios</h1>
            <p className="text-text-main/60">Administra los servicios que ofreces en tu tienda.</p>
          </div>
          <div className="p-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <div className="relative w-full max-w-sm">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50"></i>
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="border border-gray-300 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-text-main hover:bg-primary-dark text-white px-5 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <i className="bi bi-plus-lg text-lg"></i>
                Nuevo Servicio
              </button>
            </div>
            <ServicesTable
              services={paginatedServices}
              onToggleStatus={toggleServiceStatus}
              onSee={handleSeeService}
              onEdit={handleEditClick}
              onDelete={handleDeleteService}
            />
            {totalPages > 1 && (
              <>
                <div className="flex justify-center mt-4">
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-text-main/70">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredServices.length)} de {filteredServices.length} servicios
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Modales */}
      {isAddModalOpen && <AddServices onClose={() => setIsAddModalOpen(false)} onAdd={handleAddService} categories={categories} />}
      {isEditModalOpen && selectedService && <EditServices onClose={() => { setIsEditModalOpen(false); setSelectedService(null); }} service={selectedService} onEdit={handleEditService} categories={categories} />}
      {isSeeModalOpen && selectedService && <SeeServices onClose={() => { setIsSeeModalOpen(false); setSelectedService(null); }} service={selectedService} />}
    </div>
  );
}

export default Services;