import React from "react";

const SeeServices = ({ onClose, service }) => {
  if (!service) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-0 relative border border-accent">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-dark hover:text-primary text-2xl font-bold focus:outline-none"
          title="Cerrar"
        >
          ×
        </button>
        {/* Encabezado con ícono */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="bg-primary flex items-center justify-center rounded-full w-16 h-16 mb-2">
            <i className="bi bi-scissors text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-primary-dark mb-2 text-center">Detalle del Servicio</h2>
        </div>
        {/* Detalle en dos columnas */}
        <form className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-text-main/80 text-sm font-semibold mb-1">ID del Servicio</label>
              <input
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                value={`#${service.id}`}
                disabled
              />
            </div>
            <div>
              <label className="block text-text-main/80 text-sm font-semibold mb-1">Estado</label>
              <input
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                value={service.estado}
                disabled
              />
            </div>
            <div>
              <label className="block text-text-main/80 text-sm font-semibold mb-1">Servicio</label>
              <input
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                value={service.name}
                disabled
              />
            </div>
            <div>
              <label className="block text-text-main/80 text-sm font-semibold mb-1">Categoría</label>
              <input
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                value={service.category}
                disabled
              />
            </div>
            <div>
              <label className="block text-text-main/80 text-sm font-semibold mb-1">Duración</label>
              <input
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                value={service.duration}
                disabled
              />
            </div>
            <div>
              <label className="block text-text-main/80 text-sm font-semibold mb-1">Precio</label>
              <input
                className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none"
                value={service.price}
                disabled
              />
            </div>
          </div>
          <div>
            <label className="block text-text-main/80 text-sm font-semibold mb-1">Descripción</label>
            <textarea
              className="w-full bg-background border border-accent-light rounded-md px-3 py-2 text-text-main font-medium focus:outline-none resize-none"
              value={service.description}
              disabled
              rows={2}
            />
          </div>
          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-primary-dark text-white px-6 py-2 rounded font-semibold hover:bg-primary transition"
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default SeeServices;
