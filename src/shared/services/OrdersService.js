// Servicio compartido para manejar pedidos entre dashboard y landing
class OrdersService {
  constructor() {
    // Simular almacenamiento local para persistir datos
    this.storageKey = 'capex_orders';
    this.orders = this.loadOrders();
  }

  // Cargar pedidos desde localStorage
  loadOrders() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getInitialOrders();
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      return this.getInitialOrders();
    }
  }

  // Guardar pedidos en localStorage
  saveOrders() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
    } catch (error) {
      console.error('Error guardando pedidos:', error);
    }
  }

  // Datos iniciales de pedidos
  getInitialOrders() {
    return [
      {
        id: 1001,
        fecha: "2024-06-10",
        clienteId: 1,
        estado: "Pendiente",
        valor: 350000,
        productos: [
          { id: 1, nombre: "Extensión Lacia Natural", cantidad: 1, precio: 350000, imagen: "" },
        ],
        numeroOrden: "ORD-20240610-001",
        medioPago: "Transferencia o depósito",
        direccion: "Calle Falsa 123, Piso 2, Ciudad, País",
        subtotal: 350000,
        envio: 0
      },
      {
        id: 1002,
        fecha: "2024-06-09",
        clienteId: 2,
        estado: "En proceso",
        valor: 215000,
        productos: [
          { id: 2, nombre: "Shampoo Nutritivo", cantidad: 1, precio: 120000, imagen: "" },
          { id: 3, nombre: "Acondicionador Suavizante", cantidad: 1, precio: 95000, imagen: "" },
        ],
        numeroOrden: "ORD-20240609-002",
        medioPago: "Tarjeta de crédito",
        direccion: "Av. Siempre Viva 742, Ciudad, País",
        subtotal: 215000,
        envio: 0
      },
      {
        id: 1003,
        fecha: "2024-06-08",
        clienteId: 3,
        estado: "Enviado",
        valor: 900000,
        productos: [
          { id: 4, nombre: "Gel Fijador Premium", cantidad: 1, precio: 900000, imagen: "" },
        ],
        numeroOrden: "ORD-20240608-003",
        medioPago: "Efectivo",
        direccion: "Carrera 4 #5-6, Ciudad, País",
        subtotal: 900000,
        envio: 0
      },
      {
        id: 1004,
        fecha: "2024-06-07",
        clienteId: 4,
        estado: "Entregado",
        valor: 469000,
        productos: [
          { id: 5, nombre: "Shampoo Capilar", cantidad: 1, precio: 200000, imagen: "", color: "Azul" },
          { id: 6, nombre: "Acondicionador", cantidad: 2, precio: 134800, imagen: "" },
        ],
        numeroOrden: "ORD-20240607-004",
        medioPago: "Transferencia o depósito",
        direccion: "Calle 10 #11-12, Ciudad, País",
        subtotal: 456600,
        envio: 13000
      },
      {
        id: 1005,
        fecha: "2024-06-06",
        clienteId: 5,
        estado: "Cancelado",
        valor: 120000,
        productos: [
          { id: 7, nombre: "Extensión Premium", cantidad: 1, precio: 120000, imagen: "", color: "Negro" },
        ],
        numeroOrden: "ORD-20240606-005",
        medioPago: "Tarjeta de débito",
        direccion: "Carrera 13 #14-15, Ciudad, País",
        subtotal: 120000,
        envio: 0
      }
    ];
  }

  // Obtener todos los pedidos
  getAllOrders() {
    return this.orders;
  }

  // Obtener pedidos por cliente
  getOrdersByCustomer(customerId) {
    return this.orders.filter(order => order.clienteId === customerId);
  }

  // Obtener pedido por ID
  getOrderById(id) {
    return this.orders.find(order => order.id === id);
  }

  // Crear nuevo pedido
  createOrder(orderData) {
    const newOrder = {
      id: Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      numeroOrden: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.orders.length + 1).padStart(3, '0')}`,
      estado: "Pendiente",
      ...orderData
    };
    
    this.orders.unshift(newOrder);
    this.saveOrders();
    return newOrder;
  }

  // Actualizar estado de pedido
  updateOrderStatus(id, newStatus) {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex !== -1) {
      this.orders[orderIndex].estado = newStatus;
      this.saveOrders();
      return this.orders[orderIndex];
    }
    return null;
  }

  // Actualizar pedido completo
  updateOrder(id, orderData) {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex !== -1) {
      this.orders[orderIndex] = { ...this.orders[orderIndex], ...orderData };
      this.saveOrders();
      return this.orders[orderIndex];
    }
    return null;
  }

  // Eliminar pedido
  deleteOrder(id) {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex !== -1) {
      const deletedOrder = this.orders.splice(orderIndex, 1)[0];
      this.saveOrders();
      return deletedOrder;
    }
    return null;
  }

  // Buscar pedidos
  searchOrders(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.orders.filter(order => 
      order.numeroOrden.toLowerCase().includes(term) ||
      order.estado.toLowerCase().includes(term) ||
      order.fecha.includes(term) ||
      order.valor.toString().includes(term)
    );
  }

  // Obtener estadísticas de pedidos
  getOrderStats() {
    const total = this.orders.length;
    const pendientes = this.orders.filter(o => o.estado === 'Pendiente').length;
    const enProceso = this.orders.filter(o => o.estado === 'En proceso').length;
    const enviados = this.orders.filter(o => o.estado === 'Enviado').length;
    const entregados = this.orders.filter(o => o.estado === 'Entregado').length;
    const cancelados = this.orders.filter(o => o.estado === 'Cancelado').length;
    const totalValor = this.orders.reduce((sum, order) => sum + order.valor, 0);

    return {
      total,
      pendientes,
      enProceso,
      enviados,
      entregados,
      cancelados,
      totalValor
    };
  }

  // Formatear número con separadores de miles
  formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Obtener pedidos formateados para el landing
  getFormattedOrdersForLanding(customerId = null) {
    const orders = customerId ? this.getOrdersByCustomer(customerId) : this.orders;
    
    return orders.map(order => ({
      id: order.id,
      numero: order.numeroOrden,
      fecha: new Date(order.fecha).toLocaleDateString('es-ES'),
      estado: order.estado,
      total: this.formatNumber(order.valor),
      medioPago: order.medioPago || 'No especificado',
      direccion: order.direccion || 'No especificada',
      productos: order.productos.map(prod => ({
        id: prod.id,
        nombre: prod.nombre,
        imagen: prod.imagen || '',
        color: prod.color || '',
        cantidad: prod.cantidad,
        precioUnitario: this.formatNumber(prod.precio)
      })),
      subtotal: this.formatNumber(order.subtotal || order.valor),
      envio: this.formatNumber(order.envio || 0)
    }));
  }
}

// Instancia singleton
const ordersService = new OrdersService();

export default ordersService; 