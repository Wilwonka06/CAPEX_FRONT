import { useState, useEffect, useCallback } from "react";
import CreateServiceOrder from "./components/CreateServiceOrder";
import ViewServiceSaleDetail from "./components/ViewServiceSaleDetail";
import EditServiceOrder from "./components/EditServiceOrder";
import AnularServiceOrder from "./components/AnularServiceOrder";
import Search from "../../../../shared/Search";
import Paginator from "../../../../shared/Paginator";
import { createServiceOrder, editServiceOrder, anularServiceOrder } from "./services/ServiceOrderService";
import { normalizeText } from '../../../../shared/normalizers.js';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SaleServices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([
    {
      id: 1,
      clientName: "Jolyne",
      status: "En ejecucion",
      date: "14/12/2025",
      time: "2:45 PM",
      dineroProporcionado: 60000,
      devolucion: 10000,
      servicios: [
        { id: 1, name: "Manicura", quantity: 1, price: 50000, subtotal: 50000, employee: { name: "Wilson" } }
      ],
      productos: [],
      totalServices: 50000,
      totalProducts: 0,
      totalGeneral: 50000
    },
    {
      id: 2,
      clientName: "Maria",
      status: "Pagado",
      date: "12/08/2026",
      time: "4:00 PM",
      dineroProporcionado: 50000,
      devolucion: 0,
      servicios: [
        { id: 2, name: "Barbería", quantity: 1, price: 30000, subtotal: 30000, employee: { name: "Cruz" } }
      ],
      productos: [
        { id: 1, name: "Shampoo", quantity: 2, price: 10000, subtotal: 20000 }
      ],
      totalServices: 30000,
      totalProducts: 20000,
      totalGeneral: 50000
    },
    {
      id: 3,
      clientName: "Santiago",
      status: "Pagado",
      date: "7/07/2025",
      time: "3:30 PM",
      dineroProporcionado: 60000,
      devolucion: 10000,
      servicios: [
        { id: 3, name: "Pedicura", quantity: 1, price: 40000, subtotal: 40000, employee: { name: "Sara" } }
      ],
      productos: [
        { id: 2, name: "Tratamiento", quantity: 1, price: 10000, subtotal: 10000 }
      ],
      totalServices: 40000,
      totalProducts: 10000,
      totalGeneral: 50000
    },
    {
      id: 4,
      clientName: "Emilio",
      status: "En ejecucion",
      date: "27/03/2025",
      time: "1:00 PM",
      dineroProporcionado: 70000,
      devolucion: 20000,
      servicios: [
        { id: 4, name: "Corte de Cabello", quantity: 1, price: 30000, subtotal: 30000, employee: { name: "María" } }
      ],
      productos: [
        { id: 3, name: "Acondicionador", quantity: 2, price: 10000, subtotal: 20000 }
      ],
      totalServices: 30000,
      totalProducts: 20000,
      totalGeneral: 50000
    },
    {
      id: 5,
      clientName: "Yuliani",
      status: "Pagado",
      date: "4/04/2025",
      time: "5:00 PM",
      dineroProporcionado: 50000,
      devolucion: 0,
      servicios: [
        { id: 5, name: "Tintura Color verde", quantity: 1, price: 50000, subtotal: 50000, employee: { name: "Cruz" } }
      ],
      productos: [],
      totalServices: 50000,
      totalProducts: 0,
      totalGeneral: 50000
    },
    {
      id: 6,
      clientName: "Valeria",
      status: "En ejecucion",
      date: "10/10/2025",
      time: "11:00 AM",
      dineroProporcionado: 80000,
      devolucion: 30000,
      servicios: [
        { id: 6, name: "Aplicación de Extensión", quantity: 1, price: 50000, subtotal: 50000, employee: { name: "Ana Martínez" } }
      ],
      productos: [
        { id: 4, name: "Mascarilla", quantity: 1, price: 10000, subtotal: 10000 },
        { id: 5, name: "Aceite Capilar", quantity: 2, price: 10000, subtotal: 20000 }
      ],
      totalServices: 50000,
      totalProducts: 30000,
      totalGeneral: 80000
    },
    {
      id: 7,
      clientName: "Carlos",
      status: "Anulado",
      date: "15/11/2025",
      time: "9:30 AM",
      dineroProporcionado: 40000,
      devolucion: 0,
      servicios: [
        { id: 7, name: "Corte de Cabello", quantity: 1, price: 40000, subtotal: 40000, employee: { name: "Juan" } }
      ],
      productos: [],
      totalServices: 40000,
      totalProducts: 0,
      totalGeneral: 40000
    }
  ]);

  const itemsPerPage = 5;
  const [tab, setTab] = useState("En ejecucion");
  const { setTitle } = useOutletContext();

  useEffect(() => {
    setTitle('Venta de Servicios');
    return () => setTitle('');
  }, [setTitle]);

  // Filtrar servicios basado en la búsqueda y el tab
  const filteredServices = services.filter((service) => {
    // Si el término de búsqueda es un número, verificar si coincide exactamente con el ID
    const term = normalizeText(searchTerm);
    const isNumericSearch = /^\d+$/.test(term);
    
    if (isNumericSearch) {
      // Si el ID coincide exactamente, mostrar solo ese servicio
      if (parseInt(term, 10) === service.id) {
        return true;
      }
      
      // Si la longitud del término coincide con la longitud del ID pero no es una coincidencia exacta,
      // no incluir este servicio en los resultados para evitar coincidencias parciales
      if (term.length === service.id.toString().length) {
        return false;
      }
    }
    
    // Búsqueda general en todos los campos si no es una coincidencia exacta de ID
    const matchesSearch = Object.values(service).some((value) =>
      normalizeText(value).toLowerCase().includes(term.toLowerCase())
    );
    
    // Filtrar por estado según el tab seleccionado
    const matchesTab = tab === "En ejecucion"
      ? normalizeText(service.status).toLowerCase() === "en ejecucion" || normalizeText(service.status).toLowerCase() === "anulado"
      : normalizeText(service.status).toLowerCase() === "pagado" || normalizeText(service.status).toLowerCase() === "anulado";
    
    return matchesSearch && matchesTab;
  });

  // Cálculo de paginación basado en servicios filtrados
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  
  // Para paginar los servicios
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  // Ajusta currentPage si es mayor que totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [services, totalPages, currentPage]);

  // Resetear página cuando se cambie de tab
  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleViewClick = useCallback((order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  }, []);

  // handleEditClick abre directamente el modal de edición
  const handleEditClick = useCallback((order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  }, []);

  // handleAnularClick ahora pide confirmación
  const handleAnularClick = async (orderId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas anular la orden #${orderId}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await anularServiceOrder(orderId);
        setServices(prev => prev.map(service => 
          service.id === orderId 
            ? { ...service, status: "Anulado" }
            : service
        ));
        toast.success('Orden anulada exitosamente', { position: 'top-right' });
      } catch (error) {
        toast.error('Error al anular la orden', { position: 'top-right' });
      }
    }
  };



  // Crear orden usando servicio
  const handleCreateOrder = async (orderData) => {
    setLoading(true);
    try {
      const newOrder = await createServiceOrder(orderData, services);
      setServices(prev => [...prev, newOrder]);
      setIsCreateModalOpen(false);
      toast.success('Orden de servicio creada exitosamente', { position: 'top-right' });
    } catch (error) {
      toast.error(error.message || 'Error al crear la orden de servicio', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  // Editar orden usando servicio
  const handleEditOrder = async (formData) => {
    setLoading(true);
    try {
      const updatedOrder = await editServiceOrder({
        id: selectedOrder.id,
        ...formData,
        status: selectedOrder.status
      }, services);
      setServices(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
      setIsEditModalOpen(false);
      setSelectedOrder(null);
      toast.success('Orden de servicio actualizada exitosamente', { position: 'top-right' });
    } catch (error) {
      toast.error(error.message || 'Error al actualizar la orden de servicio', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  // Anular orden usando servicio
  const handleAnularOrder = async (orderId) => {
    setLoading(true);
    try {
      await anularServiceOrder(orderId);
      // Actualizar el estado local
      setServices(prev => prev.map(service => 
        service.id === orderId 
          ? { ...service, status: "Anulado" }
          : service
      ));
      setIsAnularModalOpen(false);
      setSelectedOrder(null);
      toast.success('Orden de servicio anulada exitosamente', { position: 'top-right' });
    } catch (error) {
      toast.error(error.message || 'Error al anular la orden de servicio', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* El título ahora se muestra en el navbar */}
          </div>
          <div className="p-6">
            {/* Botones de filtrado por estado */}
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                className={`px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  tab === "En ejecucion"
                    ? "bg-white text-text-main shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-text-main hover:bg-white/50"
                }`}
                onClick={() => setTab("En ejecucion")}
              >
                <i className={`bi bi-play-circle text-xs ${tab === "En ejecucion" ? "text-yellow-600" : "text-gray-500"}`}></i>
                En ejecución
              </button>
              <button
                className={`px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  tab === "Pagadas"
                    ? "bg-white text-text-main shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-text-main hover:bg-white/50"
                }`}
                onClick={() => setTab("Pagadas")}
              >
                <i className={`bi bi-check-circle text-xs ${tab === "Pagadas" ? "text-green-600" : "text-gray-500"}`}></i>
                Pagadas
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Search searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar órdenes de servicio" />
              <button
                className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <i className="bi bi-plus-circle mr-2"></i> Nueva orden
              </button>
            </div>

            {/* Tabla de órdenes de servicio */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">ID</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Cliente</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Servicios</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Fecha</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Hora</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Valor</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado</th>
                    <th className="py-2 px-3 text-center font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedServices.length > 0 ? paginatedServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3">{service.id}</td>
                      <td className="py-2 px-3">{service.clientName}</td>
                      <td className="py-2 px-3">{(service.servicios || []).map(s => s.name).join(", ")}</td>
                      <td className="py-2 px-3">{service.date}</td>
                      <td className="py-2 px-3">{service.time}</td>
                      <td className="py-2 px-3">${service.totalGeneral?.toLocaleString() || 0}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.status === "Pagado" 
                            ? "bg-green-100 text-green-800" 
                            : service.status === "Anulado"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>{service.status}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button className="text-primary hover:text-blue-700 mr-2 text-lg" title="Ver detalle" onClick={() => handleViewClick(service)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        {normalizeText(service.status).toLowerCase() === "en ejecucion" && (
                          <button className="text-amber-600 hover:text-amber-800 mr-2 text-lg" title="Editar" onClick={() => handleEditClick(service)}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                        )}
                        {normalizeText(service.status).toLowerCase() !== "anulado" && (
                          <button className="text-red-600 hover:text-red-800 mr-2 text-lg" title="Anular" onClick={() => handleAnularClick(service.id)}>
                            <i className="bi bi-x-octagon"></i>
                          </button>
                        )}
                        <button className="text-red-500 hover:text-red-700 text-lg" title="Descargar factura" onClick={() => {
                          toast.info('Función de descarga en desarrollo', { position: 'top-right' });
                        }}>
                          <i className="bi bi-file-earmark-pdf"></i>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-gray-500">No hay órdenes de servicio para mostrar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Paginator
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Información de paginación */}
            <div className="mt-4 text-center text-sm text-gray-600">
              {/* Mostrando {Math.min(filteredServices.length, startIndex + 1)} a {Math.min(filteredServices.length, startIndex + itemsPerPage)} de {filteredServices.length} órdenes. */}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {isCreateModalOpen && (
        <CreateServiceOrder
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateOrder}
          loading={loading}
          services={services}
        />
      )}
      {isEditModalOpen && selectedOrder && (
        <EditServiceOrder
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          order={selectedOrder}
          onEdit={handleEditOrder}
          loading={loading}
          services={services}
        />
      )}
      {isViewModalOpen && selectedOrder && (
        <ViewServiceSaleDetail
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          order={selectedOrder}
        />
      )}
      {isAnularModalOpen && selectedOrder && (
        <AnularServiceOrder
          isOpen={isAnularModalOpen}
          onClose={() => setIsAnularModalOpen(false)}
          order={selectedOrder}
          onAnularSuccess={handleAnularOrder}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default SaleServices;