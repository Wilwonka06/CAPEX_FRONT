// src/features/dashboard/pages/orders/orders.jsx
import { useState, useEffect } from "react";
import OrderDetailModal from "./components/OrderDetailModal";
import EditOrderModal from "./components/EditOrderModal";
import Paginator from '../../../../shared/Paginator';
import TableSkeleton from '../../../../shared/components/TableSkeleton';
import Search from '../../../../shared/Search';
import { formatNumber } from '../../../../shared/utils/formatters';
import ordersService from './API/ordersService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

// Estados posibles según el backend unificado
const estados = ["En proceso", "Enviado", "Entregado", "Devolución", "Cancelado"];

function OrdersTable({ orders, onView, onEdit, loading = false }) {
  if (loading) {
    return <TableSkeleton columns={5} rows={5} hasAvatar={false} hasActions={true} />;
  }
  
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
          {orders.length > 0 ? orders.map((order, index) => (
            <tr key={order.id || `order-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
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
    setTitle('Pedidos de productos');
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
        setOrders(response.data || []);
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
          toast.success(`Estado del pedido cambiado a ${nuevoEstado}`);
          
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
        toast.error(error.message || 'Error al actualizar el estado del pedido');
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

            {filteredOrders.length === 0 && !loading ? (
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
                  loading={loading}
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
          nombre: detailOrder.usuario?.nombre || detailOrder.clienteNombre || 'Cliente',
          firstName: detailOrder.usuario?.nombre || detailOrder.clienteNombre || 'Cliente',
          lastName: '',
          documentType: detailOrder.usuario?.tipo_documento || 'CC',
          documentNumber: detailOrder.usuario?.documento || `DOC-${detailOrder.clienteId || 'N/A'}`,
          email: detailOrder.usuario?.correo || 'N/A',
          phone: detailOrder.usuario?.telefono || 'N/A',
          address: detailOrder.direccion_entrega || detailOrder.usuario?.direccion || 'No especificada'
        } : null}
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
      />

      {/* Mensaje de error para datos de cliente faltantes */}
      {orders.some(order => !order.usuario && !order.clienteNombre) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="bi bi-exclamation-triangle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Algunos pedidos no tienen datos de cliente asociados. Por favor, verifique la conexión con la base de datos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      <EditOrderModal
        order={editOrder}
        customer={editOrder ? {
          nombre: editOrder.usuario?.nombre || editOrder.clienteNombre || 'Cliente',
          firstName: editOrder.usuario?.nombre || editOrder.clienteNombre || 'Cliente',
          lastName: '',
          documentType: editOrder.usuario?.tipo_documento || 'CC',
          documentNumber: editOrder.usuario?.documento || `DOC-${editOrder.clienteId || 'N/A'}`,
          email: editOrder.usuario?.correo || 'N/A',
          phone: editOrder.usuario?.telefono || 'N/A',
          address: editOrder.direccion_entrega || editOrder.usuario?.direccion || 'No especificada'
        } : null}
        isOpen={!!editOrder}
        estados={estados}
        onClose={() => setEditOrder(null)}
        onUpdateEstado={handleUpdateEstado}
      />
    </div>
  );
}
