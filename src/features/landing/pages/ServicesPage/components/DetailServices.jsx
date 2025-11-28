import { formatPrice } from '../../../../../shared/utils/formatters';
import { useNavigate } from 'react-router-dom';

const DetailServices = ({ service, onClose }) => {
  const navigate = useNavigate();
  
  if (!service) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleScheduleClick = () => {
    // Redirigir a la página de citas con el servicio preseleccionado
    navigate(`/landing/citas?service=${service.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={handleBackdropClick}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative overflow-hidden animate-scale-in">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#FACC15]/15 rounded-full blur-xl"></div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-all duration-300 hover:scale-110 shadow-lg"
          title="Cerrar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Sección de imagen */}
          <div className="lg:w-1/2 relative">
            <div className="h-64 lg:h-full relative overflow-hidden">
              {(typeof service.imagen === 'string' && service.imagen.startsWith('data:image')) ? (
                <img
                  src={service.imagen}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : service.img ? (
                <img
                  src={service.img}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-[#FACC15]/20 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-lato">Imagen no disponible</p>
                  </div>
                </div>
              )}

              {/* Overlay con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

              {/* Badge de categoría */}
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-[#1E1E1E] font-semibold rounded-full text-sm shadow-lg">
                  {service.category || 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Sección de contenido */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between relative">
            {/* Información principal */}
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1E1E1E] mb-4 font-nunito leading-tight">
                {service.name}
              </h2>

              <div className="space-y-6">
                {/* Descripción */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-[#FACC15] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1E1E1E] font-nunito">Descripción del Servicio</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-lato text-base">
                    {service.description || 'Servicio profesional de alta calidad realizado por expertos certificados.'}
                  </p>
                </div>

                {/* Detalles del servicio */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#FACC15] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-lato">Duración</p>
                      <p className="text-lg font-semibold text-[#1E1E1E] font-nunito">
                        {service.duration ? `${Math.floor(service.duration/60)}h ${service.duration%60}min` : 'Por definir'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#FACC15] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#1E1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-lato">Calidad Garantizada</p>
                      <p className="text-lg font-semibold text-[#1E1E1E] font-nunito">Profesionales Certificados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de precio y acción */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 font-lato mb-1">Precio del servicio</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#FACC15] font-montserrat">
                      {formatPrice(service.price)}
                    </span>
                    {service.duration && (
                      <span className="text-sm text-gray-500 font-lato">
                        ({Math.floor(service.duration/60)}h {service.duration%60}min)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300 font-poppins text-sm"
                >
                  <i className="bi bi-arrow-left mr-2"></i>
                  Volver
                </button>
                <button
                  onClick={handleScheduleClick}
                  className="flex-1 px-4 py-2 bg-[#FACC15] text-[#1E1E1E] font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#FACC15]/50 font-poppins text-sm"
                >
                  <i className="bi bi-calendar-check mr-2"></i>
                  Agendar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailServices;

