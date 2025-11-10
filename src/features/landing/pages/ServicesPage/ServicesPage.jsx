import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getAllServices } from "./api/servicesApi";
import DetailServices from "./components/DetailServices";
import Paginator from "../../../../shared/Paginator";
import Footer from "../../../../shared/components/Footer";

// =======================
// Constantes
// =======================
const EMPLOYEES_KEY = "capex_employees";
const SERVICES_KEY = "services";

// =======================
// Funciones auxiliares
// =======================
const normalizeText = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// =======================
// Componente principal
// =======================
const ServicesPage = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

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
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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
  // Paginación
  // =======================
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // =======================
  // Estados de carga o error
  // =======================
  if (loading) {
    return (
      <div className="container mx-auto mt-8 px-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando servicios...</p>
          </div>
        </div>
      </div>
    );
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
      <div className="container mx-auto mt-8 px-8 gap-8">
        {/* Header */}
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

        {/* Lista de servicios */}
        {paginatedServices.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                {searchTerm
                  ? "No se encontraron servicios con ese criterio"
                  : "No hay servicios disponibles"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 py-8 p-20">
            {paginatedServices.map((servicio) => (
              <div
                key={servicio.id}
                className="bg-white border border-background rounded-lg overflow-hidden shadow-md flex flex-col w-full h-[350px] gap-x-6 hover:shadow-lg transition"
              >
                <img
                  src={
                    servicio.imagen
                      ? servicio.imagen
                      : "https://via.placeholder.com/300x160?text=Sin+Imagen"
                  }
                  alt={servicio.name}
                  className="w-full h-[160px] object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300x160?text=Imagen+No+Disponible";
                  }}
                />

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div className="flex flex-col mb-2">
                    <div className="flex justify-between items-center">
                      <h2 className="text-text-main font-medium text-base truncate">
                        {servicio.name}
                      </h2>
                      <span className="text-text-main font-bold text-base whitespace-nowrap ml-2">
                        {servicio.price}
                      </span>
                    </div>
                    <span className="text-xs text-primary-dark font-semibold mt-1">
                      {servicio.category || "General"}
                    </span>
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
        )}

        {/* Paginador */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 mb-8">
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal de detalles */}
        {selectedService && (
          <DetailServices
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}

        {/* Footer */}
        <Footer />
      </div>

      {/* Notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </>
  );
};

export default ServicesPage;
