import DetailServices from './components/DetailServices';
import React, { useState } from "react";

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const ServicesPage = () => {
  const servicios = [
    { id: 1, name: 'Corte de cabello', category: 'Peluquería', duration: '30 min', price: '$25.000', active: true, description: 'Corte clásico para hombre o mujer', estado: 'Activo', img: "https://media.istockphoto.com/id/1887700422/photo/hairdresser-creating-a-beautiful-finish-with-drying.jpg?b=1&s=612x612&w=0&k=20&c=iFoFnwfX4RjCHVdcYpZJLeyWjHB_mKdaXxZ7dFgqfoQ=" },
    { id: 2, name: 'Manicura Completa', category: 'Uñas', duration: '45 min', price: '$35.000', active: true, description: 'Manicura profesional con esmaltado', estado: 'Activo', img: "https://media.istockphoto.com/id/1887700422/photo/hairdresser-creating-a-beautiful-finish-with-drying.jpg?b=1&s=612x612&w=0&k=20&c=iFoFnwfX4RjCHVdcYpZJLeyWjHB_mKdaXxZ7dFgqfoQ=" },
    { id: 3, name: 'Masaje Relajante', category: 'Bienestar', duration: '60 min', price: '$80.000', active: false, description: 'Masaje corporal relajante', estado: 'Inactivo', img: "https://media.istockphoto.com/id/1887700422/photo/hairdresser-creating-a-beautiful-finish-with-drying.jpg?b=1&s=612x612&w=0&k=20&c=iFoFnwfX4RjCHVdcYpZJLeyWjHB_mKdaXxZ7dFgqfoQ=" },
    { id: 4, name: 'Depilación Láser', category: 'Estética', duration: '20 min', price: '$150.000', active: true, description: 'Depilación láser definitiva', estado: 'Activo', img: "https://media.istockphoto.com/id/1887700422/photo/hairdresser-creating-a-beautiful-finish-with-drying.jpg?b=1&s=612x612&w=0&k=20&c=iFoFnwfX4RjCHVdcYpZJLeyWjHB_mKdaXxZ7dFgqfoQ=" },
    { id: 5, name: 'Limpieza Facial', category: 'Cuidado Facial', duration: '50 min', price: '$60.000', active: true, description: 'Limpieza profunda de cutis', estado: 'Activo', img: "https://media.istockphoto.com/id/1887700422/photo/hairdresser-creating-a-beautiful-finish-with-drying.jpg?b=1&s=612x612&w=0&k=20&c=iFoFnwfX4RjCHVdcYpZJLeyWjHB_mKdaXxZ7dFgqfoQ=" },
    { id: 6, name: 'Tratamiento Capilar', category: 'Peluquería', duration: '40 min', price: '$75.000', active: false, description: 'Tratamiento nutritivo para el cabello', estado: 'Inactivo', img: "https://media.istockphoto.com/id/1887700422/photo/hairdresser-creating-a-beautiful-finish-with-drying.jpg?b=1&s=612x612&w=0&k=20&c=iFoFnwfX4RjCHVdcYpZJLeyWjHB_mKdaXxZ7dFgqfoQ=" },
  ];
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredServices = servicios.filter(
    (service) =>
      (service.name && normalizeText(service.name).includes(normalizeText(searchTerm))) ||
      (service.category && normalizeText(service.category).includes(normalizeText(searchTerm))) ||
      (service.duration && normalizeText(service.duration).includes(normalizeText(searchTerm))) ||
      (service.price && normalizeText(service.price).includes(normalizeText(searchTerm))) ||
      (service.description && normalizeText(service.description).includes(normalizeText(searchTerm))) ||
      (typeof service.active === 'boolean' && normalizeText(service.active ? 'activo' : 'inactivo').includes(normalizeText(searchTerm))) ||
      (service.estado && normalizeText(service.estado).includes(normalizeText(searchTerm)))
  );

  return (
    <div className="container mx-auto mt-8 px-8 gap-8">
      <div className="flex justify-between mb-4 items-center px-20">
        <h1 className="text-4xl font-bold text-text-main ml-4">Servicios</h1>
        <div className="relative w-full max-w-sm mr-4">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50"></i>
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 py-8 p-20">
        {filteredServices.map((servicio) => (
          <div
            key={servicio.id}
            className="bg-white border border-background rounded-lg overflow-hidden shadow-md flex flex-col w-full h-[340px] gap-x-6"
          >
            <img
              src={servicio.img}
              alt={servicio.name}
              className="w-full h-[160px] object-cover"
            />

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-text-main font-medium text-base">{servicio.name}</h2>
                <span className="text-text-main font-bold text-base">{servicio.price}</span>
              </div>
              <button
                onClick={() => setSelectedService(servicio)}
                className="text-accent text-base hover:underline mb-2 text-left py-2"
              >
                Detalles
              </button>

              <button className="bg-primary-dark text-white w-full py-4 rounded text-lg hover:bg-primary transition mt-auto">
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedService && <DetailServices service={selectedService} onClose={() => setSelectedService(null)} />}
    </div>

  );
};

export default ServicesPage;
