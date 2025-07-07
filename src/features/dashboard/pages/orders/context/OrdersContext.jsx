import { createContext, useContext, useState } from 'react';

// Mock de pedidos (idéntico a pedidosMock en Orders.jsx)
const pedidosMock = [
  {
    id: 1001,
    fecha: "2024-06-10",
    clienteId: 1,
    estado: "Pendiente",
    valor: 250000,
    productos: [
      { id: 1, nombre: "Shampoo Nutritivo", cantidad: 2, precio: 50000 },
      { id: 2, nombre: "Acondicionador Suavizante", cantidad: 1, precio: 150000 },
    ],
    numeroOrden: "ORD-20240610-001"
  },
  {
    id: 1002,
    fecha: "2024-06-09",
    clienteId: 2,
    estado: "En proceso",
    valor: 180000,
    productos: [
      { id: 3, nombre: "Mascarilla Reparadora", cantidad: 3, precio: 60000 },
    ],
    numeroOrden: "ORD-20240609-002"
  },
  {
    id: 1003,
    fecha: "2024-06-08",
    clienteId: 3,
    estado: "Enviado",
    valor: 90000,
    productos: [
      { id: 4, nombre: "Gel Fijador", cantidad: 1, precio: 90000 },
    ],
    numeroOrden: "ORD-20240608-003"
  },
];

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(pedidosMock);
  return (
    <OrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders debe usarse dentro de <OrdersProvider>');
  return context;
} 