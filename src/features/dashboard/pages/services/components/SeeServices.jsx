import React from "react";

const SeeServices = ({ onClose, service }) => {
  if (!service) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Detalle del Servicio</h2>
          <button
            className="text-gray-400 hover:text-primary text-xl font-bold"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1">
          <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">ID del Servicio</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-text-main text-sm bg-gray-50"
                  value={`#${service.id}`}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Estado</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-text-main text-sm bg-gray-50"
                  value={service.estado}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Servicio</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-text-main text-sm bg-gray-50"
                  value={service.name}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Categoría</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-text-main text-sm bg-gray-50"
                  value={service.category}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Duración</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-text-main text-sm bg-gray-50"
                  value={service.duration}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Precio</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-text-main text-sm bg-gray-50"
                  value={service.price}
                  disabled
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Descripción</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-text-main text-sm bg-gray-50 resize-none"
                value={service.description}
                disabled
                rows={2}
              />
            </div>
          {service.imagen && (
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Imagen</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex justify-center">
                <img 
                  src={service.imagen instanceof File ? URL.createObjectURL(service.imagen) : service.imagen} 
                  alt={`Imagen de ${service.name}`}
                  className="max-w-32 h-auto max-h-24 object-contain rounded"
                />
              </div>
            </div>
          )}
          </div>
        </div>
        {/* Footer fijo */}
        <div className="sticky bottom-0 bg-white rounded-b-lg flex justify-end px-8 py-4">
          <button
            type="button"
            className="px-4 py-2 rounded-md font-semibold transition text-sm bg-text-main text-white hover:bg-primary-dark"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
export default SeeServices;
