import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from '../../../../../shared/config/apiConfig';
import { formatNumber, formatPrice } from '../../../../../shared/utils/formatters';

const ServiceSelector = ({ selectedServices, onServicesChange }) => {
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Reset form when service changes
  useEffect(() => {
    if (selectedServiceId) {
      setQuantity(1);
      setSelectedEmployeeId("");
      setSelectedTime("");
      setErrors(prev => ({ ...prev, service: '', employee: '', quantity: '', time: '' }));
    } else {
      setQuantity(1);
      setSelectedEmployeeId("");
      setSelectedTime("");
    }
  }, [selectedServiceId]);

  // Load available time slots when employee or date changes
  useEffect(() => {
    if (selectedEmployeeId && selectedDate) {
      loadAvailableTimeSlots(selectedEmployeeId, selectedDate);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedEmployeeId, selectedDate]);

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

  // Función para cargar horarios disponibles del empleado
  const loadAvailableTimeSlots = async (employeeId, date) => {
    if (!employeeId || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    try {
      // Obtener el horario efectivo del empleado para la fecha
      const scheduleResponse = await apiRequest.get(`/programaciones-recurrentes/horario-fecha?id_usuario=${employeeId}&fecha=${date}`);

      if (scheduleResponse && scheduleResponse.bloques_horarios) {
        const timeSlots = [];

        // Generar slots de 30 minutos para cada bloque horario
        scheduleResponse.bloques_horarios.forEach(bloque => {
          const [startHour, startMinute] = bloque.inicio.split(':').map(Number);
          const [endHour, endMinute] = bloque.fin.split(':').map(Number);

          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;

          // Generar slots de 30 minutos
          for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

            // Verificar disponibilidad para este slot (30 minutos)
            const slotEndMinutes = minutes + 30;
            const slotEndHour = Math.floor(slotEndMinutes / 60);
            const slotEndMinute = slotEndMinutes % 60;
            const endTimeString = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`;

            timeSlots.push({
              time: timeString,
              display: timeString,
              available: true // Por ahora asumimos disponible, luego verificaremos
            });
          }
        });

        // Filtrar slots disponibles (no ocupados por otros servicios)
        const availableSlots = [];
        for (const slot of timeSlots) {
          try {
            const availabilityResponse = await apiRequest.get(
              `/programaciones-recurrentes/disponibilidad?id_usuario=${employeeId}&fecha=${date}&inicio=${slot.time}&fin=${slot.time.replace(/(\d{2}):(\d{2})/, (match, h, m) => {
                const minutes = parseInt(h) * 60 + parseInt(m) + 30;
                const newHour = Math.floor(minutes / 60);
                const newMinute = minutes % 60;
                return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
              })}`
            );

            if (availabilityResponse.disponible) {
              availableSlots.push(slot);
            }
          } catch (error) {
            console.warn(`Error checking availability for ${slot.time}:`, error);
          }
        }

        setAvailableTimeSlots(availableSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error loading available time slots:', error);
      setAvailableTimeSlots([]);
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

  const handleAddService = () => {
    let newErrors = {};

    if (!selectedServiceId) {
      newErrors.service = "Seleccione un servicio.";
    }
    if (!selectedEmployeeId) {
      newErrors.employee = "Seleccione un empleado.";
    }
    if (!selectedTime) {
      newErrors.time = "Seleccione una hora.";
    }
    if (quantity <= 0) {
      newErrors.quantity = "La cantidad debe ser mayor a 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const selectedService = availableServices.find(s => (s.id_servicio || s.id) === parseInt(selectedServiceId));
    const selectedEmployee = availableEmployees.find(e => (e.id_usuario || e.id) === parseInt(selectedEmployeeId));

    if (!selectedService) {
      setErrors({ service: "Servicio no encontrado." });
      return;
    }

    const servicioNormalizado = normalizarServicio(selectedService);
    const empleadoNormalizado = selectedEmployee ? normalizarEmpleado(selectedEmployee) : null;

    // Usar la hora seleccionada en lugar de calcular automáticamente
    const duration = servicioNormalizado.duracion || 30; // Default 30 min si no hay duración
    const [startHour, startMinute] = selectedTime.split(':').map(Number);
    const startTimeDate = new Date();
    startTimeDate.setHours(startHour, startMinute, 0, 0);
    const endTimeDate = new Date(startTimeDate.getTime() + (duration * 60000));

    const formatTime = (date) => {
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };

    const serviceWithDetails = {
      ...servicioNormalizado,
      name: servicioNormalizado.nombre,
      price: servicioNormalizado.precio,
      category: servicioNormalizado.categoria,
      duration: duration,
      quantity: quantity,
      subtotal: servicioNormalizado.precio * quantity,
      employee: empleadoNormalizado,
      startTime: selectedTime,
      endTime: formatTime(endTimeDate),
      serviceDate: selectedDate,
      uniqueId: Date.now()
    };

    onServicesChange([...selectedServices, serviceWithDetails]);

    // Reset form
    setSelectedServiceId("");
    setQuantity(1);
    setSelectedEmployeeId("");
    setSelectedTime("");
  };

  const removeService = (uniqueId) => {
    onServicesChange(selectedServices.filter(s => s.uniqueId !== uniqueId));
  };

  const totalServices = selectedServices.reduce((total, service) => total + service.subtotal, 0);

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(value);
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: '' }));
    }
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployeeId(e.target.value);
    if (errors.employee) {
      setErrors(prev => ({ ...prev, employee: '' }));
    }
  };

  const handleServiceChange = (e) => {
    setSelectedServiceId(e.target.value);
    if (errors.service) {
      setErrors(prev => ({ ...prev, service: '' }));
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(""); // Reset time when date changes
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    if (errors.time) {
      setErrors(prev => ({ ...prev, time: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm flex items-center justify-between">
          <span className="text-red-700">{errorMsg}</span>
          <button onClick={cargarServicios} disabled={retrying} className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50">
            {retrying ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      )}

      {/* Sección para agregar servicios */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Agregar Servicios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.date
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.date}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Servicio <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.service
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
              value={selectedServiceId}
              onChange={handleServiceChange}
              disabled={loading}
            >
              <option value="">
                {loading ? "Cargando..." : "Seleccionar servicio"}
              </option>
              {availableServices.map(service => {
                const normalized = normalizarServicio(service);
                return (
                  <option key={normalized.id} value={normalized.id}>
                    {normalized.nombre} - ${formatPrice(normalized.precio)}
                  </option>
                );
              })}
            </select>
            {errors.service && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.service}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Empleado <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.employee
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
              value={selectedEmployeeId}
              onChange={handleEmployeeChange}
              disabled={!selectedServiceId || loading}
            >
              <option value="">
                {loading ? "Cargando..." : "Seleccionar empleado"}
              </option>
              {availableEmployees.map(employee => {
                const normalized = normalizarEmpleado(employee);
                return (
                  <option key={normalized.id} value={normalized.id}>
                    {normalized.nombre}
                  </option>
                );
              })}
            </select>
            {errors.employee && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.employee}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hora <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.time
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
              value={selectedTime}
              onChange={handleTimeChange}
              disabled={!selectedEmployeeId}
            >
              <option value="">
                {!selectedEmployeeId ? "Seleccione empleado primero" : "Seleccionar hora"}
              </option>
              {availableTimeSlots.map(slot => (
                <option key={slot.time} value={slot.time}>
                  {slot.display}
                </option>
              ))}
            </select>
            {errors.time && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.time}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className={`w-full px-3 py-2 border-2 rounded-xl text-sm ${
                errors.quantity
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all bg-white disabled:bg-gray-100`}
              disabled={!selectedServiceId}
              min="1"
              placeholder="1"
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.quantity}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold text-sm flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-white"
            onClick={handleAddService}
            disabled={!selectedServiceId || loading}
          >
            <i className="bi bi-plus-circle"></i>
            Agregar a la Lista
          </button>
        </div>
      </div>

      {/* Lista de servicios seleccionados - SIEMPRE VISIBLE */}
      <div className="mt-4">
        <h4 className="text-xs font-medium mb-2">Lista de Servicios:</h4>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Servicio</th>
                <th className="px-2 py-2 text-left border-r text-xs font-medium text-gray-700">Fecha</th>
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
                  <td colSpan="8" className="px-2 py-4 text-center text-gray-500">
                    No hay servicios seleccionados
                  </td>
                </tr>
              ) : (
                selectedServices.map((service) => (
                  <tr key={service.uniqueId} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 border-r font-medium">{service.name}</td>
                    <td className="px-2 py-2 border-r">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <i className="bi bi-calendar mr-1"></i>
                        {service.serviceDate || selectedDate}
                      </span>
                    </td>
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