import React from 'react'

const DetailServices = ({ service, onClose }) => {
  if (!service) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative border border-accent">
        {/* Imagen del servicio con botón cerrar sobre la imagen */}
        <div className="w-full h-56 rounded-t-xl overflow-hidden flex items-center justify-center relative">
          {service.img ? (
            <img
              src={service.img}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-accent flex items-center justify-center text-6xl text-primary-dark">
              <i className="bi bi-image"></i>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-2xl text-white bg-black bg-opacity-40 rounded-full w-10 h-10 flex items-center justify-center hover:bg-primary-dark transition focus:outline-none"
            title="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Contenido */}
        <div className="p-8 text-text-main">
          <h2 className="text-2xl font-bold mb-4 text-left">{service.name}</h2>
          <div className="mb-2">
            <span className="block text-lg font-medium text-primary-dark mb-1">Categoría</span>
            <span className="block text-base mb-2">{service.category || 'General'}</span>
          </div>
          <div className="mb-6">
            <span className="block text-lg font-medium text-primary-dark mb-1">Descripción</span>
            <p className="block text-base mb-2 whitespace-pre-line">{service.description || 'Sin descripción.'}</p>
          </div>
          <div className="flex justify-between items-end mb-8">
            <span className="text-2xl font-bold text-primary-dark">{service.price}</span>
            <span className="text-lg font-bold text-text-main">{service.duration}</span>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              className="bg-primary-dark text-white px-8 py-3 rounded font-semibold text-lg hover:bg-primary transition w-full"
            >
              Agendar Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DetailServices;
