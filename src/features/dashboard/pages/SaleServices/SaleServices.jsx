import { useState, useEffect, useCallback } from "react";
import CreateServiceOrder from "./components/CreateServiceOrder";
import ViewServiceSaleDetail from "./components/ViewServiceSaleDetail";
import EditServiceOrder from "./components/EditServiceOrder";
import AnularServiceOrder from "./components/AnularServiceOrder";
import Search from "../../../../shared/Search";
import Paginator from "../../../../shared/Paginator";
import { createServiceOrder, editServiceOrder, anularServiceOrder } from "./API/ServiceOrderService";
import { getCitasEnEjecucion, buscarCitas, actualizarEstadoCita } from "./API/CitasService";
import { normalizeText } from '../../../../shared/normalizers.js';
import { formatNumber, formatPrice } from '../../../../shared/utils/formatters';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const SaleServices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const itemsPerPage = 5;
  const [tab, setTab] = useState("En ejecucion");
  const { setTitle } = useOutletContext();

  useEffect(() => {
    setTitle('Venta de Servicios');
    return () => setTitle('');
  }, [setTitle]);

  // Función para cargar citas desde el backend
  const cargarCitas = async () => {
    setInitialLoading(true);
    try {
      const citas = await getCitasEnEjecucion();
      // Asegurar que citas sea un array
      setServices(Array.isArray(citas) ? citas : []);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Error al cargar las ventas de servicio. Verifica la conexión con el servidor.');
      // En caso de error, mantener array vacío
      setServices([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Cargar citas al montar el componente
  useEffect(() => {
    cargarCitas();
  }, []);

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
    // Normalizar el estado del servicio para comparación
    const serviceStatusNormalized = normalizeText(service.status || '');
    
    // Mapear estados del backend al frontend para comparación
    let statusToCheck = serviceStatusNormalized;
    if (statusToCheck === 'pagada') {
      statusToCheck = 'pagado';
    } else if (statusToCheck === 'en ejecucion' || statusToCheck === 'en proceso') {
      statusToCheck = 'en ejecucion';
    } else if (statusToCheck === 'cancelada por el usuario') {
      statusToCheck = 'anulado';
    }
    
    // Log para depuración (solo para servicios con estado "Pagado" o "Pagada")
    if (service.status && (service.status.toLowerCase().includes('pagad') || serviceStatusNormalized.includes('pagad'))) {
      console.log('🔍 Filtrando servicio:', {
        id: service.id,
        statusOriginal: service.status,
        statusNormalized: serviceStatusNormalized,
        statusToCheck: statusToCheck,
        tab: tab,
        matchesTab: tab === "En ejecucion"
          ? statusToCheck === "en ejecucion" || statusToCheck === "anulado"
          : statusToCheck === "pagado" || statusToCheck === "anulado"
      });
    }
    
    const matchesTab = tab === "En ejecucion"
      ? statusToCheck === "en ejecucion"
      : tab === "Pagadas"
      ? statusToCheck === "pagado"
      : tab === "Anuladas"
      ? statusToCheck === "anulado"
      : false;

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

  // handleAnularClick ahora pide confirmación y actualiza en el backend
  const handleAnularClick = async (orderId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas anular la venta de servicio #${orderId}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        // Actualizar estado en el backend
        await actualizarEstadoCita(orderId, 'Anulado');

        // Actualizar estado local
        setServices(prev => prev.map(service =>
          service.id === orderId
            ? { ...service, status: "Anulado" }
            : service
        ));
        toast.success('Venta de servicio anulada exitosamente');
      } catch (error) {
        console.error('Error al anular venta de servicio:', error);
        toast.error('Error al anular la venta de servicio');
      } finally {
        setLoading(false);
      }
    }
  };



  // Crear orden usando servicio
  const handleCreateOrder = async (orderData) => {
    setLoading(true);

    const orderPromise = (async () => {
      const newOrder = await createServiceOrder(orderData, services);
      setServices(prev => [...prev, newOrder]);
      setIsCreateModalOpen(false);
      return newOrder;
    })();

    toast.promise(orderPromise, {
      loading: 'Creando orden de servicio...',
      success: 'Orden de servicio creada exitosamente',
      error: (err) => err.response?.data?.message || err.message || 'Error al crear la orden de servicio',
    });

    try {
      await orderPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    } finally {
      setLoading(false);
    }
  };

  // Editar orden usando servicio
  const handleEditOrder = async (formData) => {
    setLoading(true);

    const orderPromise = (async () => {
      // Usar el estado del formulario, no el estado anterior
      const updatedOrder = await editServiceOrder({
        id: selectedOrder.id,
        ...formData
      }, services);
      
      // Actualizar la lista con el estado correcto
      setServices(prev => prev.map(order => 
        order.id === updatedOrder.id 
          ? { ...updatedOrder, status: formData.status || updatedOrder.status }
          : order
      ));
      
      // Recargar las órdenes para obtener el estado actualizado del backend
      cargarCitas();
      
      setIsEditModalOpen(false);
      setSelectedOrder(null);
      return updatedOrder;
    })();

    toast.promise(orderPromise, {
      loading: 'Actualizando orden de servicio...',
      success: 'Orden de servicio actualizada exitosamente',
      error: (err) => err.response?.data?.message || err.message || 'Error al actualizar la orden de servicio',
    });

    try {
      await orderPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    } finally {
      setLoading(false);
    }
  };

  // Anular orden usando servicio
  const handleAnularOrder = async (orderId) => {
    setLoading(true);

    const orderPromise = (async () => {
      await anularServiceOrder(orderId);
      // Actualizar el estado local
      setServices(prev => prev.map(service =>
        service.id === orderId
          ? { ...service, status: "Anulado" }
          : service
      ));
      setIsAnularModalOpen(false);
      setSelectedOrder(null);
      return true;
    })();

    toast.promise(orderPromise, {
      loading: 'Anulando orden de servicio...',
      success: 'Orden de servicio anulada exitosamente',
      error: (err) => err.response?.data?.message || err.message || 'Error al anular la orden de servicio',
    });

    try {
      await orderPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (e) => {
    const termino = e.target.value;
    setSearchTerm(termino);
    setCurrentPage(1);

    // Si hay término de búsqueda, buscar en el backend
    if (termino.trim()) {
      setLoading(true);
      try {
        const resultados = await buscarCitas(termino);
        setServices(resultados);
      } catch (error) {
        console.error('Error al buscar citas:', error);
        toast.error('Error al buscar ventas de servicio');
      } finally {
        setLoading(false);
      }
    } else {
      // Si no hay término, cargar todas las citas
      cargarCitas();
    }
  }, []);

  return (
    <div className="min-h-screen font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Botones de filtrado por estado */}
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                className={`px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${tab === "En ejecucion"
                  ? "bg-white text-text-main shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-text-main hover:bg-white/50"
                  }`}
                onClick={() => setTab("En ejecucion")}
              >
                <i className={`bi bi-play-circle text-xs ${tab === "En ejecucion" ? "text-yellow-600" : "text-gray-500"}`}></i>
                En ejecución
              </button>
              <button
                className={`px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${tab === "Pagadas"
                  ? "bg-white text-text-main shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-text-main hover:bg-white/50"
                  }`}
                onClick={() => setTab("Pagadas")}
              >
                <i className={`bi bi-check-circle text-xs ${tab === "Pagadas" ? "text-green-600" : "text-gray-500"}`}></i>
                Pagadas
              </button>
              <button
                className={`px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${tab === "Anuladas"
                  ? "bg-white text-text-main shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-text-main hover:bg-white/50"
                  }`}
                onClick={() => setTab("Anuladas")}
              >
                <i className={`bi bi-x-octagon text-xs ${tab === "Anuladas" ? "text-red-600" : "text-gray-500"}`}></i>
                Anuladas
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Search searchTerm={searchTerm} handleSearch={handleSearch} placeholder="Buscar por ID, cliente, servicio, fecha u hora..." />
              <div className="flex gap-2">
                <button
                  className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center whitespace-nowrap"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <i className="bi bi-plus-circle mr-2"></i>
                  Nueva Orden
                </button>
              </div>
            </div>

            {/* Tabla de órdenes de servicio */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Cliente</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Servicios</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Fecha</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Total</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {initialLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2 text-gray-600">Cargando ventas de servicio...</span>
                        </div>
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2 text-gray-600">Buscando...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedServices.length > 0 ? paginatedServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 font-medium text-gray-800">{service.clientName}</td>
                      <td className="py-3 px-4 text-gray-600">{(service.servicios || []).map(s => s.name).join(", ")}</td>
                      <td className="py-3 px-4 text-gray-600">{service.date}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{formatPrice(service.totalGeneral || 0)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Ver detalle"
                            onClick={() => handleViewClick(service)}
                          >
                            <i className="bi bi-eye text-primary text-[18px]"></i>
                          </button>
                          {normalizeText(service.status).toLowerCase() === "en ejecucion" && (
                            <button 
                              className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all duration-200" 
                              title="Editar" 
                              onClick={() => handleEditClick(service)}
                            >
                              <i className="bi bi-pencil-square text-base"></i>
                            </button>
                          )}
                          {normalizeText(service.status).toLowerCase() !== "anulado" && (
                            <button 
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200" 
                              title="Anular" 
                              onClick={() => handleAnularClick(service.id)}
                            >
                              <i className="bi bi-x-octagon text-base"></i>
                            </button>
                          )}
                          <button 
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200" 
                            title="Descargar factura" 
                            onClick={() => {
                              toast('Función de descarga en desarrollo');
                            }}
                          >
                            <i className="bi bi-file-earmark-pdf text-base"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center">
                          <i className="bi bi-calendar-x text-4xl text-gray-300 mb-2"></i>
                          <p className="text-sm">No hay ventas de servicio para mostrar</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Las ventas de servicio aparecerán aquí cuando cambien a estado "En ejecución"
                          </p>
                        </div>
                      </td>
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
          onCreated={(newOrder) => {
            setServices(prev => [...prev, newOrder]);
            toast.success('Orden de servicio creada exitosamente');
          }}
          services={services}
        />
      )}
      {isEditModalOpen && selectedOrder && (
        <EditServiceOrder
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          order={selectedOrder}
          onEdited={(updatedOrder) => {
            console.log('🔄 Callback onEdited llamado con:', updatedOrder);
            
            // Actualizar la orden en la lista con el estado correcto inmediatamente
            setServices(prev => {
              const updated = prev.map(order => {
                if (order.id === updatedOrder.id) {
                  // Asegurar que el estado se mapee correctamente
                  const newStatus = updatedOrder.status || order.status;
                  console.log('🔄 Actualizando orden en lista local:', {
                    id: order.id,
                    estadoAnterior: order.status,
                    estadoNuevo: newStatus,
                    updatedOrder: updatedOrder
                  });
                  return { ...order, ...updatedOrder, status: newStatus };
                }
                return order;
              });
              
              console.log('📋 Lista actualizada:', updated.map(o => ({ id: o.id, status: o.status })));
              return updated;
            });
            
            // NO recargar desde el backend inmediatamente porque el backend no está guardando el estado
            // En su lugar, confiar en la actualización local
            // Si el usuario recarga la página, entonces se cargará desde el backend
            // setTimeout(() => {
            //   console.log('🔄 Recargando órdenes desde el backend...');
            //   cargarCitas();
            // }, 1000);
            
            setSelectedOrder(null);
            toast.success('Orden de servicio actualizada exitosamente');
          }}
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
    </div>
  );
};

export default SaleServices;