import PropTypes from 'prop-types';
import { formatPrice } from "../../../../../shared/utils/formatters";
 

const SeeServices = ({ onClose, service }) => {
  if (!service) return null;

  const formatDuration = (duration) => {
    if (!duration) return "0 min";
    return `${duration} min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-clipboard2-pulse text-lg"></i></div><h2 className="text-xl font-bold m-0">Detalle del Servicio</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
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

        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200"><button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition" onClick={onClose}><i className="bi bi-check-circle"></i>Cerrar</button></div>
      </div>
    </div>
  );
};

SeeServices.propTypes = {
  onClose: PropTypes.func.isRequired,
  service: PropTypes.object,
};

export default SeeServices;