import { createContext, useContext, useState, useEffect } from 'react';
import ordersService from '../../../../../shared/services/OrdersService';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar pedidos al inicializar
  useEffect(() => {
    const loadOrders = () => {
      setLoading(true);
      try {
        const allOrders = ordersService.getAllOrders();
        setOrders(allOrders);
      } catch (error) {
        console.error('Error cargando pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Función para actualizar pedidos
  const updateOrders = () => {
    const allOrders = ordersService.getAllOrders();
    setOrders(allOrders);
  };

  // Función para actualizar estado de pedido
  const updateOrderStatus = (id, newStatus) => {
    const updatedOrder = ordersService.updateOrderStatus(id, newStatus);
    if (updatedOrder) {
      updateOrders();
    }
    return updatedOrder;
  };

  // Función para actualizar pedido completo
  const updateOrder = (id, orderData) => {
    const updatedOrder = ordersService.updateOrder(id, orderData);
    if (updatedOrder) {
      updateOrders();
    }
    return updatedOrder;
  };

  // Función para crear nuevo pedido
  const createOrder = (orderData) => {
    const newOrder = ordersService.createOrder(orderData);
    if (newOrder) {
      updateOrders();
    }
    return newOrder;
  };

  // Función para eliminar pedido
  const deleteOrder = (id) => {
    const deletedOrder = ordersService.deleteOrder(id);
    if (deletedOrder) {
      updateOrders();
    }
    return deletedOrder;
  };

  return (
    <OrdersContext.Provider value={{ 
      orders, 
      setOrders: updateOrders,
      updateOrderStatus,
      updateOrder,
      createOrder,
      deleteOrder,
      loading
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders debe usarse dentro de <OrdersProvider>');
  return context;
} 