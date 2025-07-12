import OrderList from './components/OrderList';

const mockOrders = [
  {
    id: 1,
    numero: 567,
    fecha: '03/03/2025',
    estado: 'Pendiente pago',
    total: '469.000',
    medioPago: 'Transferencia o deposito',
    direccion: 'Calle Falsa 123, Piso 2, Ciudad, País',
    productos: [
      {
        id: 'a1',
        nombre: 'Shampoo Capilar',
        imagen: '',
        color: 'Azul',
        cantidad: 1,
        precioUnitario: '200.000',
      },
      {
        id: 'a2',
        nombre: 'Acondicionador',
        imagen: '',
        cantidad: 2,
        precioUnitario: '134.800',
      },
    ],
    subtotal: '456.600',
    envio: '13.000',
  },
  {
    id: 2,
    numero: 568,
    fecha: '10/03/2025',
    estado: 'En preparación',
    total: '120.000',
    medioPago: 'Tarjeta',
    direccion: 'Av. Siempre Viva 742, Ciudad, País',
    productos: [
      {
        id: 'b1',
        nombre: 'Extensión Premium',
        imagen: '',
        color: 'Negro',
        cantidad: 1,
        precioUnitario: '120.000',
      },
    ],
    subtotal: '120.000',
    envio: '0',
  },
];

const Orders = () => {
  return (
    <div className="min-h-screen bg-background py-10 px-2">
      <h1 className="text-3xl font-bold mb-8 text-text-main font-montserrat">Mis Pedidos</h1>
      <OrderList orders={mockOrders} />
    </div>
  );
};

export default Orders;
