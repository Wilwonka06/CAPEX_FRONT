import { useState, useEffect } from 'react';
import OrderList from './components/OrderList';
import { ordersService } from './API/OrdersService';
import { useAuth } from '../../../../shared/contexts/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    entregados: 0
  });

  // Obtener el ID del usuario del contexto de autenticación
  const { user } = useAuth();
  const customerId = user?.id_usuario;

  // Cargar pedidos al montar el componente
  useEffect(() => {
    if (customerId) {
      loadOrders();
    } else {
      setError('Debes iniciar sesión para ver tus pedidos');
      setLoading(false);
    }
  }, [customerId]);

  const loadOrders = async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener pedidos del backend usando el servicio unificado
      const response = await ordersService.getByUsuario(customerId);

      if (response.success) {
        // Formatear pedidos para el frontend
        const formattedOrders = (response.data || []).map(pedido => ({
          id: pedido.id_pedido,
          numero: pedido.id_pedido,
          fecha: pedido.fecha,
          estado: pedido.estado || 'Pendiente',
          total: parseFloat(pedido.total || 0),
          subtotal: parseFloat(pedido.total || 0),
          envio: 0,
          medioPago: 'No especificado',
          direccion: 'No especificada',
          productos: (pedido.detalles || []).map(det => ({
            id: det.id_producto,
            nombre: det.producto?.nombre || 'N/A',
            imagen: det.producto?.url_foto || '/placeholder.png',
            foto: det.producto?.url_foto || '/placeholder.png',
            fotos: det.producto?.url_foto ? [det.producto.url_foto] : [],
            cantidad: det.cantidad,
            precioUnitario: parseFloat(det.precio_unitario || 0),
            color: null,
            textura: null,
          }))
        }));

        setOrders(formattedOrders);

        // Calcular estadísticas
        const orderStats = {
          total: formattedOrders.length,
          pendientes: formattedOrders.filter(o => o.estado.toLowerCase() === 'pendiente').length,
          enProceso: formattedOrders.filter(o => o.estado.toLowerCase() === 'en proceso').length,
          entregados: formattedOrders.filter(o => o.estado.toLowerCase() === 'entregado').length,
          cancelados: formattedOrders.filter(o => o.estado.toLowerCase() === 'cancelado').length
        };

        setStats(orderStats);
      } else {
        throw new Error(response.message || 'Error al cargar pedidos');
      }

    } catch (err) {
      console.error('Error cargando pedidos:', err);
      setError(err.message || 'Error al cargar los pedidos');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pedidos localmente
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.numero.toString().includes(searchTerm) ||
                         order.fecha.includes(searchTerm);
    const matchesStatus = filterStatus === 'todos' || 
                         order.estado.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en proceso', label: 'En proceso' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-background py-10 px-2">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-text-main font-montserrat">Mis Pedidos</h1>
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Cargando pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-background py-10 px-2">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-text-main font-montserrat">Mis Pedidos</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Error al cargar pedidos</h3>
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
    <div className="min-h-screen bg-background py-10 px-2">
      {/* Migas de pan */}
      <nav className="max-w-4xl mx-auto text-xs text-gray-500 mb-6 flex items-center gap-2">
        <span 
          className="hover:underline cursor-pointer" 
          onClick={() => window.location.href = '/landing'}
        >
          Home
        </span>
        <span className="mx-1">/</span>
        <span className="text-text-main font-semibold">Mis pedidos</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-main font-montserrat">Mis Pedidos</h1>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            title="Actualizar pedidos"
          >
            <span>🔄</span>
            <span>Actualizar</span>
          </button>
        </div>
        
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por número de orden o fecha..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-64">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Pedidos</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendientes}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.enProceso}
            </div>
            <div className="text-sm text-gray-600">En Proceso</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.entregados}
            </div>
            <div className="text-sm text-gray-600">Entregados</div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {filteredOrders.length > 0 ? (
          <OrderList orders={filteredOrders} />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || filterStatus !== 'todos' 
                ? 'No se encontraron pedidos' 
                : 'No tienes pedidos aún'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Cuando realices tu primer pedido, aparecerá aquí'}
            </p>
            {!searchTerm && filterStatus === 'todos' && (
              <button
                onClick={() => window.location.href = '/landing/productos'}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
              >
                Ver Productos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;