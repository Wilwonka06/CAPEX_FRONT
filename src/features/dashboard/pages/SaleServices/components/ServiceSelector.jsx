import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from '../../../../../shared/config/apiConfig';
import { formatNumber, formatPrice } from '../../../../../shared/utils/formatters';

const ServiceSelector = ({ selectedServices, onServicesChange }) => {
  const [serviceQuery, setServiceQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedServiceForQuantity, setSelectedServiceForQuantity] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedEmployeeForService, setSelectedEmployeeForService] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const serviceInputRef = useRef(null);

  // Cargar servicios y empleados desde el backend
  useEffect(() => {
    let cancelled = false;
    const fetchWithRetry = async (fn, label, attempts = 3, delayMs = 1000) => {
      let lastErr;
      for (let i = 1; i <= attempts; i++) {
        try {
          const res = await fn();
          return res;
        } catch (err) {
          lastErr = err;
          console.warn(`⚠️ Fallo al cargar ${label} (intento ${i}/${attempts})`, err);
          if (i < attempts) await new Promise(r => setTimeout(r, delayMs * i));
        }
      }
      throw lastErr;
    };

    const cargarDatos = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const servicios = await fetchWithRetry(() => apiRequest.get('/servicios', { skipGlobalErrorHandling: true }), 'servicios');
        let serviciosArray = Array.isArray(servicios) ? servicios : (servicios.data || servicios.servicios || servicios.results || []);
        if (!Array.isArray(serviciosArray)) serviciosArray = [];
        if (!cancelled) setAvailableServices(serviciosArray);

        const empleados = await fetchWithRetry(() => apiRequest.get('/empleados', { skipGlobalErrorHandling: true }), 'empleados');
        let empleadosArray = Array.isArray(empleados) ? empleados : (empleados.data || empleados.empleados || empleados.results || []);
        if (!Array.isArray(empleadosArray)) empleadosArray = [];
        if (!cancelled) setAvailableEmployees(empleadosArray);
      } catch (error) {
        console.error('❌ Error al cargar datos de venta de servicios:', error);
        if (!cancelled) setErrorMsg('No se pudieron cargar servicios o empleados. Verifica conexión y reintenta.');
        if (!cancelled) {
          setAvailableServices([]);
          setAvailableEmployees([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    cargarDatos();
    return () => { cancelled = true; };
  }, []);

  // Función para normalizar un servicio del backend
  const normalizarServicio = (servicio) => {
    // Extraer nombre de categoría si es un objeto
    let categoriaNombre = 'Sin categoría';
    if (servicio.categoria) {
      if (typeof servicio.categoria === 'object' && servicio.categoria.nombre) {
        categoriaNombre = servicio.categoria.nombre;
      } else if (typeof servicio.categoria === 'string') {
        categoriaNombre = servicio.categoria;
      }
    } else if (servicio.category) {
      if (typeof servicio.category === 'object' && servicio.category.nombre) {
        categoriaNombre = servicio.category.nombre;
      } else if (typeof servicio.category === 'string') {
        categoriaNombre = servicio.category;
      }
    } else if (servicio.tipo) {
      categoriaNombre = typeof servicio.tipo === 'string' ? servicio.tipo : 'Sin categoría';
    } else if (servicio.descripcion) {
      categoriaNombre = typeof servicio.descripcion === 'string' ? servicio.descripcion : 'Sin categoría';
    }
    
    return {
      id: servicio.id_servicio || servicio.id,
      nombre: servicio.nombre || servicio.name || servicio.servicio_nombre || 'Servicio sin nombre',
      precio: servicio.precio || servicio.price || servicio.costo || 0,
      categoria: categoriaNombre,
      duracion: servicio.duracion || servicio.duration || servicio.tiempo || 'No especificada'
    };
  };

  // Buscador en tiempo real
  useEffect(() => {
    if (availableServices.length > 0) {
      const normalized = availableServices.map(normalizarServicio);
      if (serviceQuery.trim() === '') {
        setFilteredServices(normalized);
      } else {
        setFilteredServices(
          normalized.filter(s =>
            s.nombre.toLowerCase().includes(serviceQuery.toLowerCase()) ||
            (s.categoria && s.categoria.toLowerCase().includes(serviceQuery.toLowerCase()))
          )
        );
      }
    } else {
      setFilteredServices([]);
    }
  }, [serviceQuery, availableServices]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceInputRef.current && !serviceInputRef.current.contains(event.target)) {
        setIsServiceDropdownOpen(false);
      }
    };

    if (isServiceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServiceDropdownOpen]);

  // Cargar todos los servicios (select simple)
  const cargarServicios = async () => {
    setRetrying(true);
    try {
      const servicios = await apiRequest.get('/servicios', { skipGlobalErrorHandling: true });
      const serviciosArray = Array.isArray(servicios) ? servicios : (servicios.data || servicios.servicios || []);
      setAvailableServices(Array.isArray(serviciosArray) ? serviciosArray : []);
      setErrorMsg('');
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setErrorMsg('No se pudieron cargar los servicios. Intenta nuevamente.');
    } finally {
      setRetrying(false);
    }
  };

  // Función para normalizar un empleado del backend
  const normalizarEmpleado = (empleado) => {
    return {
      id: empleado.id_usuario || empleado.id,
      nombre: empleado.nombre || empleado.name || empleado.empleado_nombre || 'Empleado sin nombre'
    };
  };

  const handleServiceSelect = (service) => {
    const isAlreadySelected = selectedServices.some(s => s.id === service.id);
    if (!isAlreadySelected) {
      setSelectedServiceForQuantity(service);
      setQuantity(1);
      setSelectedEmployeeForService("");
      setShowQuantityModal(true);
      setServiceQuery('');
      setIsServiceDropdownOpen(false);
    }
  };

  // Función para calcular tiempo de inicio y fin automáticamente
  const calculateServiceTimes = (duration, existingServices) => {
    const now = new Date();
    let startTime;
    
    if (existingServices.length === 0) {
      // Primer servicio: usar hora actual
      startTime = now;
    } else {
      // Servicios subsecuentes: calcular desde el último servicio
      const lastService = existingServices[existingServices.length - 1];
      if (lastService.endTime) {
        // Parsear la hora de fin del último servicio
        const [hours, minutes] = lastService.endTime.split(':').map(Number);
        startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);
      } else {
        // Si no hay endTime en el último servicio, usar hora actual
        startTime = now;
      }
    }
    
    // Calcular hora de fin sumando la duración
    const endTime = new Date(startTime.getTime() + (duration * 60000)); // duration en minutos
    
    // Formatear a HH:MM
    const formatTime = (date) => {
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };
    
    return {
      startTime: formatTime(startTime),
      endTime: formatTime(endTime)
    };
  };

  const confirmServiceSelection = () => {
    if (selectedServiceForQuantity && selectedEmployeeForService && quantity > 0) {
      const servicioNormalizado = normalizarServicio(selectedServiceForQuantity);
      const empleadoSeleccionado = availableEmployees.find(emp => emp.id === parseInt(selectedEmployeeForService));
      const empleadoNormalizado = empleadoSeleccionado ? normalizarEmpleado(empleadoSeleccionado) : null;
      
      // Calcular tiempos automáticamente
      const duration = servicioNormalizado.duracion || 30; // Default 30 min si no hay duración
      const times = calculateServiceTimes(duration, selectedServices);
      
      const serviceWithDetails = {
        ...servicioNormalizado,
        name: servicioNormalizado.nombre,
        price: servicioNormalizado.precio,
        category: servicioNormalizado.categoria,
        duration: duration,
        quantity: quantity,
        subtotal: servicioNormalizado.precio * quantity,
        employee: empleadoNormalizado,
        startTime: times.startTime,
        endTime: times.endTime,
        uniqueId: Date.now()
      };
      onServicesChange([...selectedServices, serviceWithDetails]);
      setShowQuantityModal(false);
      setSelectedServiceForQuantity(null);
      setQuantity(1);
      setSelectedEmployeeForService("");
    }
  };

  const cancelServiceSelection = () => {
    setShowQuantityModal(false);
    setSelectedServiceForQuantity(null);
    setQuantity(1);
    setSelectedEmployeeForService("");
  };

  const removeService = (uniqueId) => {
    onServicesChange(selectedServices.filter(s => s.uniqueId !== uniqueId));
  };

  const isFormValid = selectedEmployeeForService && quantity > 0 && availableServices.length > 0 && availableEmployees.length > 0;
  const totalServices = selectedServices.reduce((total, service) => total + service.subtotal, 0);

  const handleQuantityChange = (e) => {
    setQuantity(Math.max(1, parseInt(e.target.value) || 1));
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployeeForService(e.target.value);
  };

  return (
    <div className="relative">
      {errorMsg && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm flex items-center justify-between">
          <span className="text-red-700">{errorMsg}</span>
          <button onClick={cargarServicios} disabled={retrying} className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50">
            {retrying ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      )}
      {/* Buscador de servicios */}
      <div className="relative" ref={serviceInputRef}>
        <div className="relative">
          <input
            type="text"
            value={serviceQuery}
            onChange={e => {
              setServiceQuery(e.target.value);
              setIsServiceDropdownOpen(true);
            }}
            onFocus={() => {
              setIsServiceDropdownOpen(true);
              cargarServicios();
            }}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Buscar por nombre de servicio..."
          />
          <button
            type="button"
            onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className={`bi bi-chevron-${isServiceDropdownOpen ? 'up' : 'down'}`}></i>
          </button>
        </div>
        {isServiceDropdownOpen && (
          <>
            {loading && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Cargando servicios...</span>
                </div>
              </div>
            )}
            {!loading && filteredServices.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto">
                {filteredServices.map(service => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceSelect(service)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">{service.nombre}</div>
                        {service.categoria && service.categoria !== 'Sin categoría' && (
                          <div className="text-xs text-gray-600 mb-2 line-clamp-2">{service.categoria}</div>
                        )}
                        <div className="flex items-center gap-4 text-xs">
                          {service.duracion && service.duracion !== 'No especificada' && (
                            <span className="flex items-center gap-1 text-gray-700">
                              <i className="bi bi-clock"></i>
                              <span className="font-medium">{service.duracion} min</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-gray-700">
                            <i className="bi bi-currency-dollar"></i>
                            <span className="font-medium">{formatPrice(service.precio)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-primary text-sm font-medium">Agregar</span>
                        <i className="bi bi-plus-circle ml-2 text-primary"></i>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!loading && filteredServices.length === 0 && serviceQuery.trim() !== '' && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500 text-sm">
                No se encontraron servicios
              </div>
            )}
            {!loading && filteredServices.length === 0 && serviceQuery.trim() === '' && availableServices.length === 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500 text-sm">
                No hay servicios disponibles
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para cantidad, empleado y detalles del servicio */}
      {showQuantityModal && selectedServiceForQuantity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in flex flex-col border border-gray-200">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
              <div>
                <h2 className="text-xl font-bold text-accent m-0">Detalles del Servicio</h2>
              </div>
              <button
                onClick={cancelServiceSelection}
                className="text-gray-400 hover:text-black text-xl font-bold"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            {/* Contenido */}
            <div className="p-8 bg-white">
              <div className="space-y-4">
                <div>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm font-medium">
                    {selectedServiceForQuantity.nombre || selectedServiceForQuantity.name}
                  </div>
                </div>
                
                
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Duración</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    {selectedServiceForQuantity.duracion || selectedServiceForQuantity.duration || 'No especificada'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Precio unitario</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                    ${selectedServiceForQuantity.precio || selectedServiceForQuantity.price || 0}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Empleado <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedEmployeeForService}
                    onChange={handleEmployeeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-black text-sm bg-white"
                  >
                    <option value="">Seleccionar empleado</option>
                    {availableEmployees.map(employee => {
                      const empleadoNormalizado = normalizarEmpleado(employee);
                      return (
                        <option key={empleadoNormalizado.id} value={empleadoNormalizado.id}>
                          {empleadoNormalizado.nombre}
                      </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="border-t pt-3">
                  <label className="block text-xs font-medium text-black mb-1">Subtotal</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-bold text-blue-600">
                    {formatPrice(((selectedServiceForQuantity.precio || selectedServiceForQuantity.price || 0) * quantity))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelServiceSelection}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmServiceSelection}
                  disabled={!isFormValid}
                  className={`px-4 py-2 rounded-md text-white ${isFormValid ? 'bg-accent hover:bg-accent-dark' : 'bg-gray-300 cursor-not-allowed'} transition-colors`}
                >
                  Agregar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de servicios seleccionados - SIEMPRE VISIBLE */}
      <div className="mt-4">
        <h4 className="text-xs font-medium mb-2">Lista de Servicios:</h4>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Servicio</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Empleado</th>
                <th className="px-2 py-2 text-center border-r text-xs font-medium text-gray-700">Duración</th>
                <th className="px-2 py-2 text-center border-r text-xs font-medium text-gray-700">Horario</th>
                <th className="px-2 py-2 text-center border-r text-xs font-medium text-gray-700">Cantidad</th>
                <th className="px-2 py-2 text-right border-r text-xs font-medium text-gray-700">Subtotal</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {selectedServices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-2 py-4 text-center text-gray-500">
                    No hay servicios seleccionados
                  </td>
                </tr>
              ) : (
                selectedServices.map((service) => (
                  <tr key={service.uniqueId} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 border-r font-medium">{service.name}</td>
                    <td className="px-2 py-2 border-r">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        <i className="bi bi-person-badge mr-1"></i>
                        {service.employee?.name || service.employee?.nombre || 'N/A'}
                      </span>
                    </td>
                    <td className="px-2 py-2 border-r text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        <i className="bi bi-clock mr-1"></i>
                        {service.duration} min
                      </span>
                    </td>
                    <td className="px-2 py-2 border-r text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium text-green-700">{service.startTime}</span>
                        <span className="text-gray-400 text-xs">→</span>
                        <span className="font-medium text-red-700">{service.endTime}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 border-r text-center">{formatNumber(service.quantity)}</td>
                    <td className="px-2 py-2 border-r text-right font-semibold">{formatPrice(service.subtotal || 0)}</td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeService(service.uniqueId)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar servicio"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Total de servicios */}
        <div className="mt-2 text-sm bg-blue-50 p-2 rounded-md border border-blue-100">
          <span className="font-medium">TOTAL DE SERVICIOS: </span>
          <span className="font-bold text-blue-600">
            {formatPrice(totalServices)}
          </span>
        </div>
      </div>

    </div>
  );
};

export default ServiceSelector;