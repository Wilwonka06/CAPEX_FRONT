import { useState, useEffect } from 'react';
import OrderList from './components/OrderList';
import ordersService from '../../../../shared/services/OrdersService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Simular ID de cliente (en una app real vendría del contexto de autenticación)
  const customerId = 1; // Por ahora usamos el cliente 1

  useEffect(() => {
    const loadOrders = () => {
      setLoading(true);
      try {
        // Obtener pedidos formateados para el landing
        const formattedOrders = ordersService.getFormattedOrdersForLanding(customerId);
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error cargando pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [customerId]);

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.fecha.includes(searchTerm);
    const matchesStatus = filterStatus === 'todos' || order.estado.toLowerCase() === filterStatus.toLowerCase();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-10 px-2">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-text-main font-montserrat">Mis Pedidos</h1>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-2">
      {/* Migas de pan */}
      <nav className="max-w-4xl mx-auto text-xs text-gray-500 mb-6 flex items-center gap-2">
        <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/landing'}>Home</span>
        <span className="mx-1">/</span>
        <span className="text-text-main font-semibold">Mis pedidos</span>
      </nav>
      <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-text-main font-montserrat">Mis Pedidos</h1>
        
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
            <div className="text-2xl font-bold text-primary">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Pedidos</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.estado === 'Pendiente').length}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.estado === 'En proceso').length}
            </div>
            <div className="text-sm text-gray-600">En Proceso</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.estado === 'Entregado').length}
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
              {searchTerm || filterStatus !== 'todos' ? 'No se encontraron pedidos' : 'No tienes pedidos aún'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Cuando realices tu primer pedido, aparecerá aquí'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
