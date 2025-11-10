import PropTypes from "prop-types";
import { formatPrice } from "../../../../../shared/utils/formatters";

const SeeServices = ({ onClose, service }) => {
  if (!service) return null;

  const formatDuration = (duration) => {
    if (!duration) return "0 min";
    return `${duration} min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">Detalle del Servicio</h2>
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
          <div className="flex flex-col md:flex-row gap-8">
            {/* Columna Izquierda: Imagen y nombre */}
            <div className="flex flex-col items-center md:w-1/2 w-full">
              <div className="w-60 h-60 bg-gray-50 rounded-lg flex items-center justify-center mb-4 shadow-lg p-0">
                {service.foto ? (
                  <img
                    src={service.foto instanceof File ? URL.createObjectURL(service.foto) : service.foto}
                    alt={`Imagen de ${service.nombre}`}
                    className="w-full h-full object-cover rounded-lg m-0"
                  />
                ) : (
                  <div className="text-center">
                    <i className="bi bi-image text-4xl text-gray-400 mb-2"></i>
                    <span className="text-gray-400 text-sm">Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="text-lg font-bold text-gray-800 text-center mb-2">
                {service.nombre}
              </div>
            </div>
            
            {/* Columna Derecha: Detalles */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Descripción</span>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                  {service.descripcion || "Sin descripción"}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Categoría</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {service.categoria?.nombre || service.categoria || "Sin categoría"}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Duración</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {formatDuration(service.duracion)}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Precio</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {formatPrice(service.precio)}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">Estado</span>
                  <span className={`font-semibold text-sm ${
                    service.estado === 'Activo' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {service.estado || 'Activo'}
                  </span>
                </div>
                {service.id && (
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">ID</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {service.id}
                    </span>
                  </div>
                )}
                {service.createdAt && (
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Fecha de creación</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer fijo */}
        <div className="rounded-b-lg flex justify-end px-8 py-4">
          <button
            className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

SeeServices.propTypes = {
  onClose: PropTypes.func.isRequired,
  service: PropTypes.object,
};

export default SeeServices;