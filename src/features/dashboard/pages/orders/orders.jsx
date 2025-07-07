import { useState } from "react";
import OrderDetailModal from "./components/OrderDetailModal";
import EditOrderModal from "./components/EditOrderModal";
import { useSales } from '../SaleProducts/context/SalesContext';
import { useOrders } from './context/OrdersContext';

// Datos mock de clientes (idénticos a los de customers/customer.jsx)
const customersMock = [
  { id: 1, documentType: "CC", documentNumber: "1234567890", firstName: "Juan", lastName: "Pérez", email: "juan.perez@email.com", phone: "3101234567", address: "Calle 1 #2-3", status: "Activo" },
  { id: 2, documentType: "CE", documentNumber: "0987654321", firstName: "María", lastName: "González", email: "maria.gonzalez@email.com", phone: "3157894561", address: "Carrera 4 #5-6", status: "Activo" },
  { id: 3, documentType: "CC", documentNumber: "5678901234", firstName: "Carlos", lastName: "Rodríguez", email: "carlos.rodriguez@email.com", phone: "3203216547", address: "Av. 7 #8-9", status: "Inactivo" },
  { id: 4, documentType: "TI", documentNumber: "4321098765", firstName: "Ana", lastName: "Martínez", email: "ana.martinez@email.com", phone: "3112345678", address: "Calle 10 #11-12", status: "Activo" },
  { id: 5, documentType: "CC", documentNumber: "9876543210", firstName: "Pedro", lastName: "Sánchez", email: "pedro.sanchez@email.com", phone: "3145678901", address: "Carrera 13 #14-15", status: "Activo" },
  { id: 6, documentType: "CE", documentNumber: "2345678901", firstName: "Laura", lastName: "López", email: "laura.lopez@email.com", phone: "3167890123", address: "Av. 16 #17-18", status: "Inactivo" },
];

// Estados posibles
const estados = ["Pendiente", "En proceso", "Enviado", "Entregado", "Cancelado"];

export default function OrdersPage() {
  const { orders, setOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const { sales, setSales } = useSales();

  // Búsqueda
  const filteredOrders = orders.filter((order) => {
    const cliente = customersMock.find(c => c.id === order.clienteId);
    const nombreCompleto = cliente ? `${cliente.firstName} ${cliente.lastName}` : "";
    return (
      order.fecha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.valor.toString().includes(searchTerm) ||
      order.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.estado.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Actualizar estado
  const handleUpdateEstado = (id, nuevoEstado) => {
    setOrders(prev => prev.map(o => {
      // Si el estado cambia a 'Enviado' y antes no lo era, crear la venta
      if (o.id === id && nuevoEstado === "Enviado" && o.estado !== "Enviado") {
        // Evitar duplicados: verifica si ya existe una venta con ese número de orden
        const yaEsVenta = sales.some(sale => sale.numeroVenta === o.numeroOrden);
        if (!yaEsVenta) {
          setSales(prevSales => [
            {
              id: Date.now(),
              numeroVenta: o.numeroOrden,
              fecha: o.fecha,
              clienteId: o.clienteId,
              valor: o.valor,
              estado: "Completado",
              productos: o.productos,
              metodoPago: "No especificado"
            },
            ...prevSales
          ]);
        }
      }
      return o.id === id ? { ...o, estado: nuevoEstado } : o;
    }));
    setEditOrder(null);
  };

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar por orden, cliente o estado..."
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Tabla de pedidos */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Fecha</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Orden</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Cliente</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Valor</th>
                    <th className="py-2 px-3 text-center font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedOrders.length > 0 ? paginatedOrders.map((order) => {
                    const cliente = customersMock.find(c => c.id === order.clienteId);
                    return (
                      <tr key={order.id}>
                        <td className="py-2 px-3">{order.fecha}</td>
                        <td className="py-2 px-3">{order.numeroOrden}</td>
                        <td className="py-2 px-3">{cliente ? `${cliente.firstName} ${cliente.lastName}` : "-"}</td>
                        <td className="py-2 px-3">{order.estado}</td>
                        <td className="py-2 px-3">${order.valor.toLocaleString()}</td>
                        <td className="py-2 px-3 text-center">
                          <button className="text-primary hover:text-blue-700 mr-2 text-lg" title="Ver detalle" onClick={() => setDetailOrder(order)}>
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-800 text-lg" title="Editar" onClick={() => setEditOrder(order)}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">No hay pedidos para mostrar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Paginador */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-l disabled:opacity-50">Anterior</button>
                <span className="px-4 py-1 border-t border-b">Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-r disabled:opacity-50">Siguiente</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal de detalle */}
      <OrderDetailModal
        order={detailOrder}
        customer={detailOrder ? customersMock.find(c => c.id === detailOrder.clienteId) : null}
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
      />
      {/* Modal de edición */}
      <EditOrderModal
        order={editOrder}
        customer={editOrder ? customersMock.find(c => c.id === editOrder.clienteId) : null}
        isOpen={!!editOrder}
        estados={estados}
        onClose={() => setEditOrder(null)}
        onUpdateEstado={handleUpdateEstado}
      />
    </div>
  );
}