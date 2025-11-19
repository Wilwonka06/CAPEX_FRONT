// src/features/landing/pages/orders/Orders.jsx - VERSIÓN CORREGIDA
import { useState, useEffect } from "react";
import OrderList from "./components/OrderList";
import { ordersService } from "./API/OrdersService";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    entregados: 0,
  });

  const { currentUser, loading: authLoading } = useAuth();
  const customerId = currentUser?.id_usuario;

  console.log("🔍 Orders component - Auth state:", {
    currentUser,
    customerId,
    authLoading,
  });

  useEffect(() => {
    console.log("🔄 Orders useEffect triggered:", { customerId, authLoading });

    if (authLoading) {
      console.log("Auth still loading, waiting...");
      return;
    }

    if (customerId) {
      console.log("User authenticated, loading orders for customerId:", customerId);
      loadOrders();
    } else {
      console.log("No customerId found, setting auth error");
      if (!authLoading) {
        setError("Debes iniciar sesión para ver tus pedidos");
        setLoading(false);
      }
    }
  }, [customerId, authLoading]);

  const loadOrders = async () => {
    if (!customerId) {
      console.warn("No hay customerId, abortando carga");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Cargando pedidos para usuario:", customerId);

      const response = await ordersService.getByUsuario(customerId);

      console.log("Respuesta del servicio:", response);

      if (response.success && response.data) {
        // Mapear con validaciones y CORRECCIÓN de cálculos
        const formattedOrders = (response.data || [])
          .filter((pedido) => {
            if (!pedido) return false;
            const id = pedido.id_pedido || pedido.id;
            return id && id > 0;
          })
          .map((pedido) => {
            const id = pedido.id_pedido || pedido.id || 0;
            const fecha = pedido.fecha || new Date().toISOString().split("T")[0];
            const subtotal = parseFloat(pedido.subtotal || 0);
            const envio = parseFloat(pedido.costo_envio || 0);
            const total = parseFloat(pedido.total || 0);
            
            const estado = pedido.estado || "Pendiente";
            const productos = (pedido.detalles || [])
              .filter((det) => det && det.id_producto)
              .map((det) => {
                let fotos = [];
                if (det.producto?.url_foto) {
                  if (typeof det.producto.url_foto === 'string') {
                    fotos = det.producto.url_foto.split(',').map(url => url.trim());
                  } else if (Array.isArray(det.producto.url_foto)) {
                    fotos = det.producto.url_foto;
                  }
                }

                return {
                  id: det.id_producto || 0,
                  nombre: det.producto?.nombre || "Producto sin nombre",
                  imagen: fotos[0] || "/placeholder.png",
                  foto: fotos[0] || "/placeholder.png",
                  fotos: fotos.length > 0 ? fotos : ["/placeholder.png"],
                  cantidad: parseInt(det.cantidad || 0),
                  precioUnitario: parseFloat(det.precio_unitario || 0),
                  color: null,
                  textura: null,
                };
              });

            return {
              id,
              numero: id,
              fecha: typeof fecha === "string" ? fecha.split("T")[0] : fecha,
              estado,
              subtotal, 
              envio,
              total,
              medioPago: "No especificado",
              direccion: pedido.direccion_entrega || "No especificada",
              productos,
            };
          });

        console.log("✅ Pedidos formateados:", formattedOrders.length);
        setOrders(formattedOrders);

        // Calcular estadísticas
        const orderStats = {
          total: formattedOrders.length,
          pendientes: formattedOrders.filter(
            (o) => o.estado?.toLowerCase() === "pendiente"
          ).length,
          enProceso: formattedOrders.filter(
            (o) => o.estado?.toLowerCase() === "en proceso"
          ).length,
          entregados: formattedOrders.filter(
            (o) => o.estado?.toLowerCase() === "entregado"
          ).length,
          cancelados: formattedOrders.filter(
            (o) => o.estado?.toLowerCase() === "cancelado"
          ).length,
        };

        setStats(orderStats);
        console.log("Estadísticas:", orderStats);
      } else {
        throw new Error(response.message || "Error al cargar pedidos");
      }
    } catch (err) {
      console.error("Error cargando pedidos:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los pedidos";

      setError(errorMessage);
      setOrders([]);
      setStats({
        total: 0,
        pendientes: 0,
        enProceso: 0,
        entregados: 0,
        cancelados: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de estado de pedido
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log(`Cambiando estado de pedido ${orderId} a: ${newStatus}`);
      
      // Actualizar estado local inmediatamente (optimistic update)
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, estado: newStatus }
            : order
        )
      );

      // Recargar pedidos del servidor
      await loadOrders();
      
      console.log("Estado actualizado exitosamente");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      // Revertir cambio optimista
      await loadOrders();
    }
  };

  // Filtrar pedidos localmente
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.numero.toString().includes(searchTerm) ||
      order.fecha.includes(searchTerm);
    const matchesStatus =
      filterStatus === "todos" ||
      order.estado.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "todos", label: "Todos los estados" },
    { value: "pendiente", label: "Pendiente" },
    { value: "en proceso", label: "En proceso" },
    { value: "enviado", label: "Enviado" },
    { value: "entregado", label: "Entregado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  // Estado de carga
  if (loading) {
    return <LoadingSpinner message="Cargando pedidos..." subMessage="Estamos preparando tus pedidos" />;
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-background py-10 px-2">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-text-main font-montserrat">
            Mis Pedidos
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">
              Error al cargar pedidos
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOrders}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Migas de pan */}
      <nav className="max-w-6xl mx-auto text-xs text-gray-500 mb-6 flex items-center gap-2">
        <span
          className="hover:underline cursor-pointer"
          onClick={() => (window.location.href = "/landing")}
        >
          Home
        </span>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-semibold">Mis pedidos</span>
      </nav>

      <div className="max-w-6xl mx-auto">
        {/* Header con título y botón de actualizar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 font-montserrat mb-2">
              Mis Pedidos
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gestiona y sigue el estado de todos tus pedidos
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
            title="Actualizar pedidos"
          >
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por número de orden o fecha..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="lg:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <select
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base appearance-none bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
              {stats.total}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Total Pedidos
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">
              {stats.pendientes}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Pendientes
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
              {stats.enProceso}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              En Proceso
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
              {stats.entregados}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Entregados
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            <OrderList orders={filteredOrders} onStatusChange={handleStatusChange} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              {searchTerm || filterStatus !== "todos"
                ? "No se encontraron pedidos"
                : "No tienes pedidos aún"}
            </h3>
            <p className="text-gray-600 mb-8 text-sm sm:text-base max-w-md mx-auto">
              {searchTerm || filterStatus !== "todos"
                ? "Intenta ajustar los filtros de búsqueda para encontrar lo que buscas"
                : "Cuando realices tu primer pedido, aparecerá aquí para que puedas hacer seguimiento"}
            </p>
            {!searchTerm && filterStatus === "todos" && (
              <button
                onClick={() => (window.location.href = "/landing/catalogo")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Explorar Catálogo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;