import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllServices } from '../pages/ServicesPage/api/servicesApi';
import { formatPrice } from '../../../shared/utils/formatters';

const FeaturedServices = () => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getAllServices();
        // Filtrar solo servicios activos y tomar los primeros 4
        const activeServices = data
          .filter((service) => service.active === true || service.estado === "Activo")
          .slice(0, 4);
        setServicios(activeServices);
      } catch (err) {
        console.error('Error cargando servicios destacados:', err);
        setServicios([]);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white/80">Cargando servicios...</p>
        </div>
      </section>
    );
  }

  if (servicios.length === 0) {
    return null;
  }

  return (
  <section className="py-20 bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] relative overflow-hidden">
    {/* Elementos decorativos */}
    <div className="absolute top-20 right-20 w-40 h-40 bg-[#FACC15]/5 rounded-full blur-3xl"></div>
    <div className="absolute bottom-20 left-20 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-2xl"></div>

    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white font-montserrat mb-6">
          Nuestros <span className="text-[#FACC15]">servicios</span>
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto font-lato">
          Servicios de alta calidad realizados por profesionales certificados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {servicios.map((servicio, idx) => (
          <div
            key={servicio.id}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer"
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => navigate(`/landing/citas?service=${servicio.id}`)}
          >
            {/* Imagen con overlay */}
            <div className="relative w-full aspect-[5/2] bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={
                  servicio.imagen
                    ? servicio.imagen
                    : "https://via.placeholder.com/300x160?text=Sin+Imagen"
                }
                alt={servicio.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/300x160?text=Imagen+No+Disponible";
                }}
              />
              {/* Overlay al hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Info del servicio */}
            <div className="p-6 flex flex-col gap-3">
              <h3 className="font-bold text-lg text-[#1E1E1E] group-hover:text-[#FACC15] transition-colors duration-300 line-clamp-2 font-nunito leading-tight">
                {servicio.name}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-2 font-lato leading-relaxed">
                {servicio.description || ''}
              </p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-[#FACC15] font-montserrat">
                  {formatPrice(servicio.price)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {servicio.category || "General"}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/landing/citas?service=${servicio.id}`);
                }}
                className="w-full py-3 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-[#1E1E1E] font-bold rounded-full hover:from-[#F59E0B] hover:to-[#D97706] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-poppins border-2 border-transparent hover:border-[#FACC15]/30"
              >
                <i className="bi bi-calendar-check mr-2"></i>
                Agendar Cita
              </button>
            </div>

            {/* Elemento decorativo */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#FACC15]/10 rounded-full blur-lg group-hover:bg-[#FACC15]/20 transition-colors duration-500"></div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-16">
        <Link to="/landing/servicios">
          <button className="group relative px-10 py-4 bg-transparent border-2 border-[#FACC15] text-[#FACC15] font-bold rounded-full shadow-lg hover:shadow-[#FACC15]/50 transition-all duration-300 transform hover:scale-105 font-poppins overflow-hidden">
            <span className="relative">Ver todos los servicios</span>
            <div className="absolute inset-0 bg-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-[#1E1E1E] font-bold">Explorar Servicios</span>
            </div>
          </button>
        </Link>
      </div>
    </div>
  </section>
  );
};

export default FeaturedServices; 