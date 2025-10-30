// src/features/dashboard/pages/orders/orders.jsx
import { useState, useEffect } from "react";
import OrderDetailModal from "./components/OrderDetailModal";
import EditOrderModal from "./components/EditOrderModal";
import Paginator from '../../../../shared/Paginator';
import LoadingTable from '../../../../shared/components/LoadingTable';
import Search from '../../../../shared/Search';
import { formatNumber } from '../../../../shared/utils/formatters';
import ordersService from './API/ordersService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

// Estados posibles según el backend unificado
const estados = ["Pendiente", "En proceso", "Enviado", "Entregado", "Cancelado"];

function OrdersTable({ orders, onView, onEdit }) {
  
  return (
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
          {orders.length > 0 ? orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="py-4 px-4 text-xs font-medium text-gray-900">{order.fecha}</td>
              <td className="py-4 px-4 text-xs text-gray-600">{order.numeroOrden}</td>
              <td className="py-4 px-4 text-xs text-gray-600">
                {order.clienteNombre || 'Cliente #' + order.clienteId}
              </td>
              <td className="py-4 px-4 text-xs text-gray-600">{order.estado}</td>
              <td className="py-4 px-4 text-xs text-gray-600 font-semibold">
                ${formatNumber(order.valor)}
              </td>
              <td className="py-4 px-4 text-sm font-medium text-center">
                <div className="flex justify-center space-x-2">
                  <button 
                    className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors" 
                    title="Ver detalles" 
                    onClick={() => onView(order)}
                  >
                    <i className="bi bi-eye text-primary text-lg"></i>
                  </button>
                  <button 
                    className="h-8 w-8 p-0 hover:bg-yellow-50 hover:border-yellow-300 rounded-md flex items-center justify-center transition-colors" 
                    title="Editar" 
                    onClick={() => onEdit(order)}
                  >
                    <i className="bi bi-pencil-square text-yellow-600 text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No hay pedidos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function OrdersPage() {
  // ===== ESTADOS PRINCIPALES =====
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const { setTitle } = useOutletContext();
  const itemsPerPage = 5;

  // ===== CARGAR DATOS INICIALES =====
  useEffect(() => {
    setTitle('Gestión de Pedidos');
    loadOrders();
    return () => setTitle('');
  }, [setTitle]);

  // Cargar pedidos desde el backend
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ordersService.getAll({
        page: 1,
        limit: 100 // Cargar todos para filtrado local
      });

      if (response.success) {
        // Transformar datos del backend al formato frontend
        const transformedOrders = (response.data || []).map(pedido => ({
          id: pedido.id_pedido,
          numeroOrden: `PED-${pedido.id_pedido.toString().padStart(6, '0')}`,
          fecha: pedido.fecha,
          clienteId: pedido.id_usuario,
          clienteNombre: pedido.usuario?.nombre || `Usuario ${pedido.id_usuario}`,
          valor: parseFloat(pedido.total || 0),
          estado: pedido.estado,
          productos: (pedido.detalles || []).map(det => ({
            codigo: `P${det.id_producto.toString().padStart(3, '0')}`,
            nombre: det.producto?.nombre || 'N/A',
            cantidad: det.cantidad,
            precio: parseFloat(det.precio_unitario || 0)
          }))
        }));

        setOrders(transformedOrders);
      } else {
        throw new Error(response.message || 'Error al cargar pedidos');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading orders:', err);
      toast.error(err.message || 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTRAR PEDIDOS =====
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOrders(orders);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    setFilteredOrders(
      orders.filter(order =>
        (order.fecha || '').toLowerCase().includes(lowerTerm) ||
        (order.numeroOrden || '').toLowerCase().includes(lowerTerm) ||
        (order.clienteNombre || '').toLowerCase().includes(lowerTerm) ||
        (order.valor?.toString() || '').includes(lowerTerm) ||
        (order.estado || '').toLowerCase().includes(lowerTerm)
      )
    );
  }, [searchTerm, orders]);

  // ===== PAGINACIÓN =====
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ===== MANEJADORES =====
  const handleUpdateEstado = async (id, nuevoEstado) => {
    const order = orders.find(o => o.id === id);
    
    const result = await Swal.fire({
      title: '¿Confirmar cambio de estado?',
      text: `¿Estás seguro de que deseas cambiar el estado del pedido #${order?.numeroOrden} a "${nuevoEstado}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        
        const response = await ordersService.changeStatus(id, nuevoEstado);
        
        if (response.success) {
          toast.success(`Estado del pedido cambiado a ${nuevoEstado}`, { 
            position: 'top-right' 
          });
          
          // Actualizar estado local
          setOrders(prev => prev.map(o => 
            o.id === id ? { ...o, estado: nuevoEstado } : o
          ));
          
          setEditOrder(null);
        } else {
          throw new Error(response.message || 'Error al actualizar el estado');
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.error(error.message || 'Error al actualizar el estado del pedido', { 
          position: 'top-right' 
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // ===== RENDER =====

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Search
                searchTerm={searchTerm}
                handleSearch={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por orden, cliente o estado..."
              />
            </div>

            {loading ? (
              <LoadingTable message="Cargando pedidos..." />
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <i className="bi bi-inbox text-6xl text-gray-300"></i>
                <p className="mt-4 text-gray-500">
                  {searchTerm
                    ? 'No se encontraron pedidos que coincidan con tu búsqueda'
                    : 'No hay pedidos registrados'}
                </p>
              </div>
            ) : (
              <>
                <OrdersTable
                  orders={paginatedOrders}
                  onView={setDetailOrder}
                  onEdit={setEditOrder}
                />

                {totalPages > 1 && (
                  <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      <OrderDetailModal
        order={detailOrder}
        customer={detailOrder ? {
          firstName: detailOrder.clienteNombre || 'Cliente',
          lastName: '',
          documentType: 'CC',
          documentNumber: `DOC-${detailOrder.clienteId}`,
          email: 'cliente@example.com',
          phone: '300123456',
          address: 'Dirección del cliente'
        } : null}
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
      />

      {/* Modal de edición */}
      <EditOrderModal
        order={editOrder}
        customer={editOrder ? {
          firstName: editOrder.clienteNombre || 'Cliente',
          lastName: '',
          documentType: 'CC',
          documentNumber: `DOC-${editOrder.clienteId}`,
          email: 'cliente@example.com',
          phone: '300123456',
          address: 'Dirección del cliente'
        } : null}
        isOpen={!!editOrder}
        estados={estados}
        onClose={() => setEditOrder(null)}
        onUpdateEstado={handleUpdateEstado}
      />
      
      <ToastContainer />
    </div>
  );
}