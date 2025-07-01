import React, { useState } from "react";
import CreateServiceOrder from "./components/CreateServiceOrder";
import ServiceSalesTabs from "./components/ServiceSalesTabs";
import ChangeServiceStatus from "./components/ChangeServiceStatus";
import ViewServiceOrder from "./components/ViewServiceOrder";
import EditServiceOrder from "./components/EditServiceOrder";
import DeleteServiceOrder from "./components/DeleteServiceOrder";
import SearchServiceOrder from "./components/SearchServiceOrder";
import { createServiceOrder, editServiceOrder, deleteServiceOrder } from "./services/ServiceOrderService";

const SaleServices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
    }
  ]);

  const itemsPerPage = 5;

  const [tab, setTab] = useState("En ejecucion");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState("");

  // Filtrar servicios basado en la búsqueda y el tab
  const filteredServices = services.filter((service) => {
    const matchesSearch = Object.values(service).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesTab = tab === "En ejecucion"
      ? service.status.toLowerCase() === "en ejecucion"
      : service.status.toLowerCase() === "pagado";
    return matchesSearch && matchesTab;
  });

  // Calcular páginas
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  const toggleServiceStatus = (id) => {
    setServices(prev => prev.map(service =>
      service.id === id
        ? { ...service, status: service.status.toLowerCase() === 'en ejecucion' ? 'Pagado' : 'En ejecucion' }
        : service
    ));
  };

  const handleViewClick = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleCreateOrder = async (orderData) => {
    setError("");
    setEditLoading(true);
    try {
      const newOrder = await createServiceOrder(orderData, services);
      setServices(prev => [...prev, newOrder]);
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message || "Error al crear la orden");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditOrder = async (formData) => {
    setEditLoading(true);
    setError("");
    try {
      const updatedOrder = await editServiceOrder({ ...selectedOrder, ...formData }, services);
      setServices(prev => prev.map(order => order.id === selectedOrder.id ? updatedOrder : order));
      setIsEditModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      setError(err.message || "Error al editar la orden");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setEditLoading(true);
    setError("");
    try {
      const updatedOrders = await deleteServiceOrder(orderId, services);
      setServices(updatedOrders);
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      setError(err.message || "Error al eliminar la orden");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (showCreateForm) {
    return <CreateServiceOrder onBack={() => setShowCreateForm(false)} onCreate={handleCreateOrder} error={error} loading={editLoading} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-text-main">Venta de servicios</h1>
              <ServiceSalesTabs tab={tab} setTab={setTab} />
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-dark hover:bg-primary text-white px-4 py-2 rounded-lg transition-colors"
            >
              Crear Orden de Servicio
            </button>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchServiceOrder searchTerm={searchTerm} handleSearch={handleSearch} />
            </div>
            <div className="w-full overflow-x-auto">
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
                  {currentServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-sm text-gray-900">{service.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{service.clientName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{(service.servicios || []).map(s => s.name).join(", ")}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{service.date}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{service.time}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">${service.totalGeneral?.toLocaleString() || 0}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === "Pagado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{service.status}</span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-right">
                        <div className="flex justify-end space-x-2">
                          <button className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-blue-300 rounded-md flex items-center justify-center transition-colors" title="Ver" onClick={() => handleViewClick(service)}>
                            <i className="bi bi-eye text-primary text-sm"></i>
                          </button>
                          {service.status.toLowerCase() === "en ejecucion" && (
                            <button className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50 hover:border-amber-300 rounded-md flex items-center justify-center transition-colors" title="Editar" onClick={() => handleEditClick(service)}>
                              <i className="bi bi-pencil-square text-amber-500 text-sm"></i>
                            </button>
                          )}
                          <button className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md flex items-center justify-center transition-colors" title="Eliminar" onClick={() => handleDeleteClick(service)}>
                            <i className="bi bi-trash text-red-500 text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginador */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-primary-dark hover:bg-accent-light focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                      ? "bg-primary-dark text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
                      : "text-text-main ring-1 ring-inset ring-primary-dark hover:bg-accent-light focus:z-20 focus:outline-offset-0"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-primary-dark hover:bg-accent-light focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </nav>
              <div className="mt-4 text-center">
                <p className="text-sm text-text-main">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a {" "}
                  <span className="font-medium">{Math.min(endIndex, filteredServices.length)}</span> {" "}
                  de <span className="font-medium">{filteredServices.length}</span> resultados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ViewServiceOrder isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} order={selectedOrder} />
      <EditServiceOrder isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} order={selectedOrder} onEdit={handleEditOrder} loading={editLoading} error={error} />
      <DeleteServiceOrder isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onDelete={handleDeleteOrder} order={selectedOrder} loading={editLoading} error={error} />
      {error && <div className="text-red-600 text-center mt-2">{error}</div>}
    </div>
  );
};

export default SaleServices;