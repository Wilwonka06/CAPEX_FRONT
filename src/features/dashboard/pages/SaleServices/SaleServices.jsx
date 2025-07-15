import React, { useState, useEffect } from "react";
import CreateServiceOrder from "./components/CreateServiceOrder";
import ServiceSalesTabs from "./components/ServiceSalesTabs";
import ViewServiceSaleDetail from "./components/ViewServiceSaleDetail";
import EditServiceOrder from "./components/EditServiceOrder";
import AnularServiceOrder from "./components/AnularServiceOrder";
import SearchServiceOrder from "./components/SearchServiceOrder";
import Paginator from "./components/Paginator.jsx";
import { createServiceOrder, editServiceOrder, anularServiceOrder } from "./services/ServiceOrderService";
import { normalizeText } from '../../../../shared/normalizers.js';
import Swal from 'sweetalert2';

const SaleServices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '', show: false });
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

  // Función para mostrar mensajes de feedback
  const showMessage = (text, type = 'success') => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type === 'success' ? 'success' : 'error',
      title: text,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

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
    
    // Mostrar todas las órdenes en ambas pestañas, incluyendo las anuladas
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewClick = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  // handleEditClick ahora pide confirmación
  const handleEditClick = (order) => {
    Swal.fire({
      title: '¿Editar orden?',
      text: '¿Deseas editar la información de esta orden?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedOrder(order);
        setIsEditModalOpen(true);
      }
    });
  };

  // handleAnularClick ahora pide confirmación
  const handleAnularClick = (order) => {
    Swal.fire({
      title: '¿Anular orden?',
      text: 'Esta acción anulará la orden de servicio permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedOrder(order);
        setIsAnularModalOpen(true);
      }
    });
  };



  // Crear orden usando servicio
  const handleCreateOrder = async (orderData) => {
    setLoading(true);
    try {
      const newOrder = await createServiceOrder(orderData, services);
      setServices(prev => [...prev, newOrder]);
      setIsCreateModalOpen(false);
      showMessage('Orden de servicio creada exitosamente', 'success');
    } catch (error) {
      showMessage(error.message || 'Error al crear la orden de servicio', 'error');
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
      showMessage('Orden de servicio actualizada exitosamente', 'success');
    } catch (error) {
      showMessage(error.message || 'Error al actualizar la orden de servicio', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Anular orden usando servicio
  const handleAnularOrder = async (orderId) => {
    setLoading(true);
    try {
      const updatedServices = await anularServiceOrder(orderId, services);
      setServices(updatedServices);
      setIsAnularModalOpen(false);
      setSelectedOrder(null);
      showMessage('Orden de servicio anulada exitosamente', 'success');
    } catch (error) {
      showMessage(error.message || 'Error al anular la orden de servicio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Mensaje de feedback */}
      {message.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-primary text-white' 
            : 'bg-primary-dark text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Venta de Servicios</h1>
            <p className="mt-1">Administra las órdenes de servicio del sistema</p>
            <ServiceSalesTabs tab={tab} setTab={setTab} />
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchServiceOrder searchTerm={searchTerm} handleSearch={handleSearch} />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-text-main hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center"
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Nueva Orden
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre Cliente</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Servicios</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hora</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Monto Total</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-sm text-gray-900">{service.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{service.clientName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{(service.servicios || []).map(s => s.name).join(", ")}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{service.date}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{service.time}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">${service.totalGeneral?.toLocaleString() || 0}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.status === "Pagado" 
                            ? "bg-green-100 text-green-800" 
                            : service.status === "Anulado"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>{service.status}</span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors" 
                            title="Ver"
                            onClick={() => handleViewClick(service)}
                          >
                            <i className="bi bi-eye text-primary text-sm"></i>
                          </button>
                          {normalizeText(service.status).toLowerCase() === "en ejecucion" && (
                            <button 
                              className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors" 
                              title="Editar"
                              onClick={() => handleEditClick(service)}
                            >
                              <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                            </button>
                          )}
                          {normalizeText(service.status).toLowerCase() !== "anulado" && (
                            <button
                              className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors"
                              title="Anular"
                              onClick={() => handleAnularClick(service)}
                            >
                              <i className="bi bi-x-circle text-red-500 text-sm"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="mt-6">
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>

            {/* Mostrar información de paginación */}
            <div className="mt-4 text-center">
              <p className="text-sm text-text-main">
                Mostrando <span className="font-medium">{filteredServices.length > 0 ? startIndex + 1 : 0}</span> a {" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredServices.length)}</span> {" "}
                de <span className="font-medium">{filteredServices.length}</span> resultados
              </p>
            </div>
          </div>
        </div>

        <CreateServiceOrder
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateOrder}
          loading={loading}
          services={services}
        />
        <EditServiceOrder
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          order={selectedOrder}
          onEdit={handleEditOrder}
          loading={loading}
          services={services}
        />
        <ViewServiceSaleDetail
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          order={selectedOrder}
        />
        <AnularServiceOrder
          isOpen={isAnularModalOpen}
          onClose={() => setIsAnularModalOpen(false)}
          onAnular={handleAnularOrder}
          order={selectedOrder}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SaleServices;