import PropTypes from 'prop-types';
import { formatNumber } from "../../../../../shared/utils/formatters";

// Imagen por defecto para servicios sin imagen
const getDefaultServiceImage = (serviceName = "Service") => {
  const name = encodeURIComponent(serviceName || "Service");
  return `https://ui-avatars.com/api/?name=${name}&background=FACC15&color=fff&size=256&bold=true`;
};

const ServiceDetail = ({ service, isOpen, onClose }) => {
  if (!isOpen || !service) return null;

  const formatPrice = (price) => {
    return formatNumber(price);
  };

  const formatDuration = (duration) => {
    if (!duration) return "0 min";
    return `${duration} min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-eye text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">
              Detalles del Servicio
            </h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Columna Izquierda: Imagen y nombre */}
            <div className="flex flex-col items-center md:w-1/2 w-full">
              <div className="w-60 h-60 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl p-3 border border-gray-100">
                <img
                  src={service.foto || getDefaultServiceImage(service.nombre)}
                  alt={service.nombre}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = getDefaultServiceImage(service.nombre);
                  }}
                />
              </div>
              <div className="text-xl font-bold text-gray-800 text-center mb-3">
                {service.nombre}
              </div>
            </div>
            
            {/* Columna Derecha: Descripción y datos */}
            <div className="flex flex-col gap-6 md:w-1/2 w-full">
              {/* Descripción */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="bi bi-file-text text-[#FACC15]"></i>
                  Descripción del Servicio
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-700 text-xs min-h-[90px] leading-relaxed">
                  {service.descripcion || 'Sin descripción disponible'}
                </div>
              </div>

              {/* Información del servicio */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="bi bi-info-circle text-[#FACC15]"></i>
                  Información del Servicio
                </h3>
                <div className="space-y-1">
                  {/* Categoría */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs text-gray-600 font-medium">Categoría</span>
                    <span className="font-semibold text-gray-800 text-xs bg-gray-100 px-2.5 py-1 rounded-full">
                      {service.categoria?.nombre || service.categoria || 'Sin categoría'}
                    </span>
                  </div>

                  {/* Duración */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs text-gray-600 font-medium">Duración</span>
                    <span className="font-semibold text-gray-800 text-xs">
                      {formatDuration(service.duracion)}
                    </span>
                  </div>

                  {/* Precio */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs text-gray-600 font-medium">Precio</span>
                    <span className="font-bold text-base text-[#FACC15]">
                      ${formatPrice(service.precio || 0)}
                    </span>
                  </div>

                  {/* Estado */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs text-gray-600 font-medium">Estado</span>
                    <span className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
                      service.estado === 'Activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {service.estado || 'Activo'}
                    </span>
                  </div>

                  {/* ID */}
                  {service.id && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-xs text-gray-600 font-medium">ID</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {service.id}
                      </span>
                    </div>
                  )}

                  {/* Fecha de creación */}
                  {service.createdAt && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-xs text-gray-600 font-medium">Fecha de Creación</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {new Date(service.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}

                  {/* Última actualización */}
                  {service.updatedAt && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-xs text-gray-600 font-medium">Última Actualización</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {new Date(service.updatedAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer fijo */}
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            onClick={onClose}
          >
            <i className="bi bi-check-circle"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

ServiceDetail.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    duracion: PropTypes.number,
    precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    estado: PropTypes.string,
    foto: PropTypes.string,
    categoria: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ServiceDetail;