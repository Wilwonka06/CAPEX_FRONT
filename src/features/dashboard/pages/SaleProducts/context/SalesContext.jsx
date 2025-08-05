import { createContext, useContext, useState } from 'react';

// Mock de clientes (idéntico a customers)
const customersMock = [
  { id: 1, documentType: "CC", documentNumber: "1234567890", firstName: "Juan", lastName: "Pérez", email: "juan.perez@email.com", phone: "3101234567", address: "Calle 1 #2-3", status: "Activo" },
  { id: 2, documentType: "CE", documentNumber: "0987654321", firstName: "María", lastName: "González", email: "maria.gonzalez@email.com", phone: "3157894561", address: "Carrera 4 #5-6", status: "Activo" },
  { id: 3, documentType: "CC", documentNumber: "5678901234", firstName: "Carlos", lastName: "Rodríguez", email: "carlos.rodriguez@email.com", phone: "3203216547", address: "Av. 7 #8-9", status: "Inactivo" },
  { id: 4, documentType: "TI", documentNumber: "4321098765", firstName: "Ana", lastName: "Martínez", email: "ana.martinez@email.com", phone: "3112345678", address: "Calle 10 #11-12", status: "Activo" },
  { id: 5, documentType: "CC", documentNumber: "9876543210", firstName: "Pedro", lastName: "Sánchez", email: "pedro.sanchez@email.com", phone: "3145678901", address: "Carrera 13 #14-15", status: "Activo" },
  { id: 6, documentType: "CE", documentNumber: "2345678901", firstName: "Laura", lastName: "López", email: "laura.lopez@email.com", phone: "3167890123", address: "Av. 16 #17-18", status: "Inactivo" },
];

const ventasMock = [
  {
    id: 2001,
    numeroVenta: "VEN-20240610-001",
    fecha: "2024-06-10",
    clienteId: 1,
    valor: 580,
    estado: "Completado",
    productos: [
      { id: 101, codigo: "P001", nombre: "Producto Alpha", cantidad: 2, precio: 150 },
      { id: 103, codigo: "P003", nombre: "Producto Gamma", cantidad: 3, precio: 90 },
    ],
    metodoPago: "Efectivo"
  },
  {
    id: 2002,
    numeroVenta: "VEN-20240609-002",
    fecha: "2024-06-09",
    clienteId: 2,
    valor: 280,
    estado: "Cancelado",
    productos: [
      { id: 102, codigo: "P002", nombre: "Producto Beta", cantidad: 1, precio: 280 },
    ],
    metodoPago: "Transferencia bancaria"
  },
];

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const [sales, setSales] = useState(ventasMock);

  // Agregar una venta
  const createSale = (newSale) => {
    setSales(prev => [
      { ...newSale },
      ...prev
    ]);
  };

  // Actualizar una venta por id
  const updateSale = (saleId, updatedData) => {
    setSales(prev => prev.map(sale =>
      sale.id === saleId ? { ...sale, ...updatedData } : sale
    ));
  };

  // Eliminar una venta por id
  const deleteSale = (saleId) => {
    setSales(prev => prev.filter(sale => sale.id !== saleId));
  };

  return (
    <SalesContext.Provider value={{ sales, setSales, customersMock, createSale, updateSale, deleteSale }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) throw new Error('useSales debe usarse dentro de <SalesProvider>');
  return context;
} 