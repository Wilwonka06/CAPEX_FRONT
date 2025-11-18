import React, { useState, useEffect } from "react";
import { apiRequest } from '../../../../../shared/config/apiConfig';
import { formatNumber } from '../../../../../shared/utils/formatters';

const ServiceSelector = ({ selectedServices, onServicesChange }) => {
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedServiceForQuantity, setSelectedServiceForQuantity] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedEmployeeForService, setSelectedEmployeeForService] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Cargar servicios y empleados desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Cargar servicios
        try {
          const servicios = await apiRequest.get('/servicios');
          console.log('🔍 Servicios recibidos del backend:', servicios);
          
          // Manejar diferentes estructuras de respuesta
          let serviciosArray = [];
          if (Array.isArray(servicios)) {
            serviciosArray = servicios;
          } else if (servicios && typeof servicios === 'object') {
            // Si es un objeto, intentar extraer un array
            if (servicios.data && Array.isArray(servicios.data)) {
              serviciosArray = servicios.data;
            } else if (servicios.servicios && Array.isArray(servicios.servicios)) {
              serviciosArray = servicios.servicios;
            } else if (servicios.results && Array.isArray(servicios.results)) {
              serviciosArray = servicios.results;
            } else {
              // Si es un objeto con propiedades que parecen servicios
              serviciosArray = Object.values(servicios).filter(item => 
                item && typeof item === 'object' && (item.id || item.nombre || item.name)
              );
            }
          }
          
          console.log('🔧 Servicios procesados:', serviciosArray);
          setAvailableServices(serviciosArray);
        } catch (error) {
          console.error('Error al cargar servicios:', error);
          setAvailableServices([]);
        }

        // Cargar empleados
        try {
          const empleados = await apiRequest.get('/empleados');
          console.log('🔍 Empleados recibidos del backend:', empleados);
          
          // Manejar diferentes estructuras de respuesta
          let empleadosArray = [];
          if (Array.isArray(empleados)) {
            empleadosArray = empleados;
          } else if (empleados && typeof empleados === 'object') {
            // Si es un objeto, intentar extraer un array
            if (empleados.data && Array.isArray(empleados.data)) {
              empleadosArray = empleados.data;
            } else if (empleados.empleados && Array.isArray(empleados.empleados)) {
              empleadosArray = empleados.empleados;
            } else if (empleados.results && Array.isArray(empleados.results)) {
              empleadosArray = empleados.results;
            } else {
              // Si es un objeto con propiedades que parecen empleados
              empleadosArray = Object.values(empleados).filter(item => 
                item && typeof item === 'object' && (item.id || item.nombre || item.name)
              );
            }
          }
          
          console.log('🔧 Empleados procesados:', empleadosArray);
          setAvailableEmployees(empleadosArray);
        } catch (error) {
          console.error('Error al cargar empleados:', error);
          setAvailableEmployees([]);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setAvailableServices([]);
        setAvailableEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Cleanup del timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Cargar todos los servicios (select simple)
  const cargarServicios = async () => {
    try {
      const servicios = await apiRequest.get('/servicios');
      const serviciosArray = Array.isArray(servicios) ? servicios : (servicios.data || servicios.servicios || []);
      setAvailableServices(serviciosArray);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setAvailableServices([]);
    }
  };

  // Función para normalizar un servicio del backend
  const normalizarServicio = (servicio) => {
    return {
      id: servicio.id_servicio || servicio.id,
      nombre: servicio.nombre || servicio.name || servicio.servicio_nombre || 'Servicio sin nombre',
      precio: servicio.precio || servicio.price || servicio.costo || 0,
      categoria: servicio.categoria || servicio.category || servicio.tipo || servicio.descripcion || 'Sin categoría',
      duracion: servicio.duracion || servicio.duration || servicio.tiempo || 'No especificada'
    };
  };

  // Función para normalizar un empleado del backend
  const normalizarEmpleado = (empleado) => {
    return {
      id: empleado.id_usuario || empleado.id,
      nombre: empleado.nombre || empleado.name || empleado.empleado_nombre || 'Empleado sin nombre'
    };
  };

  // Usar directamente los servicios del backend (ya filtrados por la búsqueda)
  const filteredServices = Array.isArray(availableServices) 
    ? availableServices.map(normalizarServicio) 
    : [];

  const handleServiceSelect = (service) => {
    const isAlreadySelected = selectedServices.some(s => s.id === service.id);
    if (!isAlreadySelected) {
      setSelectedServiceForQuantity(service);
      setQuantity(1);
      setSelectedEmployeeForService("");
      setShowQuantityModal(true);
    }
    setSelectedServiceId("");
  };

  const confirmServiceSelection = () => {
    if (selectedServiceForQuantity && selectedEmployeeForService && quantity > 0) {
      const servicioNormalizado = normalizarServicio(selectedServiceForQuantity);
      const empleadoSeleccionado = availableEmployees.find(emp => emp.id === parseInt(selectedEmployeeForService));
      const empleadoNormalizado = empleadoSeleccionado ? normalizarEmpleado(empleadoSeleccionado) : null;
      
      const serviceWithDetails = {
        ...servicioNormalizado,
        name: servicioNormalizado.nombre,
        price: servicioNormalizado.precio,
        category: servicioNormalizado.categoria,
        duration: servicioNormalizado.duracion,
        quantity: quantity,
        subtotal: servicioNormalizado.precio * quantity,
        employee: empleadoNormalizado,
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

  const isFormValid = selectedEmployeeForService && quantity > 0;
  const totalServices = selectedServices.reduce((total, service) => total + service.subtotal, 0);

  // Funciones simples para evitar problemas de hooks
  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelectedServiceId(val);
    const servicio = filteredServices.find(s => String(s.id) === String(val));
    if (servicio) {
      handleServiceSelect(servicio);
    }
  };

  const handleQuantityChange = (e) => {
    setQuantity(Math.max(1, parseInt(e.target.value) || 1));
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployeeForService(e.target.value);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-black mb-1">Servicio</label>
          <select
            value={selectedServiceId}
            onChange={handleSelectChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            onFocus={cargarServicios}
          >
            <option value="">Seleccionar servicio</option>
            {filteredServices.map(service => (
              <option key={service.id} value={service.id}>
                {service.nombre} - ${service.precio}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal para cantidad, empleado y detalles del servicio */}
      {showQuantityModal && selectedServiceForQuantity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
                  <label className="block text-xs font-medium text-black mb-1">Servicio</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
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
                    ${formatNumber(((selectedServiceForQuantity.precio || selectedServiceForQuantity.price || 0) * quantity))}
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
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Cantidad</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Subtotal</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Duración del servicio</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Acciones</th>
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
                    <td className="px-2 py-2 border-r">{service.name}</td>
                    <td className="px-2 py-2 border-r">{service.employee?.name}</td>
                    <td className="px-2 py-2 border-r text-center">{formatNumber(service.quantity)}</td>
                    <td className="px-2 py-2 border-r">${formatNumber(service.subtotal || 0)}</td>
                    <td className="px-2 py-2 border-r">{service.duration}</td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeService(service.uniqueId)}
                        className="text-red-600 hover:text-red-800"
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
            ${formatNumber(totalServices)}
          </span>
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ServiceSelector;