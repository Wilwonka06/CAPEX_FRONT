import DetailServices from "./components/DetailServices";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllServices } from "./api/servicesApi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../../../shared/components/Footer";
import { formatPrice } from "../../../../shared/utils/formatters";
import LoadingSpinner from "../../components/LoadingSpinner";

// Función para normalizar texto (remover tildes)
const normalizeText = (text) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const ServicesPage = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  // =======================
  // Cargar servicios desde la API
  // =======================
  const loadServices = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("[ServicesPage] Cargando servicios...");
      const data = await getAllServices();
      console.log("[ServicesPage] Servicios cargados:", data);

      // Filtrar solo servicios activos para la vista de cliente
      const activeServices = data.filter(
        (service) => service.active === true || service.estado === "Activo"
      );
      console.log("[ServicesPage] Servicios activos:", activeServices);
      setServicios(activeServices);
    } catch (err) {
      console.error("[ServicesPage] Error cargando servicios:", err);
      const errorMsg =
        err.code === "ERR_NETWORK" ||
        err.message?.includes("ERR_NAME_NOT_RESOLVED")
          ? "No se puede conectar al servidor. Verifique la conexión a internet."
          : "No se pudieron cargar los servicios.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // =======================
  // Filtrado y búsqueda
  // =======================

  const filteredServices = servicios.filter(
    (service) =>
      (service.name &&
        normalizeText(service.name).includes(normalizeText(searchTerm))) ||
      (service.category &&
        normalizeText(service.category).includes(normalizeText(searchTerm))) ||
      (service.duration &&
        normalizeText(service.duration).includes(normalizeText(searchTerm))) ||
      (service.price &&
        normalizeText(service.price.toString()).includes(
          normalizeText(searchTerm)
        )) ||
      (service.description &&
        normalizeText(service.description).includes(normalizeText(searchTerm)))
  );

  // =======================
  // Estados de carga o error
  // =======================
  if (loading) {
    return <LoadingSpinner message="Cargando servicios..." subMessage="Estamos preparando nuestros servicios para ti" />;
  }

  if (error) {
    return (
      <>
        <div className="container mx-auto mt-8 px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <svg
                  className="mx-auto h-12 w-12 text-red-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Error al cargar servicios
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadServices}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // =======================
  // Render principal
  // =======================
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br  from-white via-gray-50 to-white">
        {/* Header mejorado */}
        <div className="bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] text-white py-16 relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-lg animate-bounce"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            {/* Migas de pan */}
            <nav className="text-sm text-white/70 mb-6 flex items-center gap-2">
              <span
                className="hover:text-[#FACC15] cursor-pointer transition-colors"
                onClick={() => (window.location.href = "/landing")}
              >
                Home
              </span>
              <span className="mx-2">/</span>
              <span className="text-[#FACC15] font-semibold">Servicios</span>
            </nav>

            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 font-montserrat bg-gradient-to-r from-white via-[#FACC15] to-white bg-clip-text text-transparent">
                Nuestros Servicios
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto font-lato leading-relaxed">
                Servicios de alta calidad realizados por profesionales
                certificados. Calidad excepcional para realzar tu belleza
                natural.
              </p>
            </div>
          </div>
        </div>

          {/* /* Barra de búsqueda mejorada */}
          {/* <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-12 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-16 h-16 bg-[#FACC15]/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-[#FACC15]/10 rounded-full blur-lg"></div>

            <div className="flex justify-center relative z-10">
              <div className="relative w-full max-w-lg">
                <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#FACC15]/20 focus:border-[#FACC15] bg-gray-50 hover:bg-white hover:border-gray-300 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="bi bi-x-circle text-xl"></i>
                  </button>
                )}
              </div>
            </div>
          </div> */}

          {/* Lista de servicios */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-[#1E1E1E] mb-4 font-montserrat">
                No se encontraron servicios
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Intenta ajustar tus filtros de búsqueda para encontrar más
                opciones
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-8 py-3 bg-[#FACC15] text-[#1E1E1E] font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-16">
            {filteredServices.slice(0, 20).map((servicio, idx) => (
              <div
                key={servicio.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer flex flex-col h-full"
                onClick={() => setSelectedService(servicio)}
                style={{ animationDelay: `${idx * 50}ms` }}
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
                <div className="p-6 flex flex-col gap-3 flex-grow">
                  <h3 className="font-bold text-lg text-[#1E1E1E] group-hover:text-[#FACC15] transition-colors duration-300 line-clamp-2 font-nunito leading-tight">
                    {servicio.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 font-lato leading-relaxed flex-grow">
                    {servicio.description}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-[#FACC15] font-montserrat">
                      {formatPrice(servicio.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {servicio.category || "General"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(servicio);
                        }}
                        className="text-gray-400 hover:text-[#FACC15] transition-colors duration-200 p-1"
                        title="Ver detalles"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/landing/citas?service=${servicio.id}`);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-[#1E1E1E] font-bold rounded-full hover:from-[#F59E0B] hover:to-[#D97706] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-poppins border-2 border-transparent hover:border-[#FACC15]/30 mt-auto"
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
        )}

        {/* Paginador cuando hay más de 20 servicios */}
        {filteredServices.length > 20 && (
          <div className="w-full mt-12 mb-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-4xl mx-auto">
              <p className="text-gray-600 text-center">
                Mostrando los primeros 20 servicios. Para ver más servicios,
                refine su búsqueda.
              </p>
            </div>
          </div>
        )}

        {selectedService && (
          <DetailServices
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default ServicesPage;
