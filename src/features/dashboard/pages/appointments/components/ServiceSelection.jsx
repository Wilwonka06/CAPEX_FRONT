import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '../../../../../shared/config/apiConfig';
import { formatNumber, formatNumberInput, parseFormattedNumber } from '@/shared/utils/formatters';
import appointmentsService from '../API/appointmentsService';

// Función para convertir hora de 24h a 12h (AM/PM)
const convertirHoraA12Horas = (hora24) => {
  if (!hora24 || hora24 === '') return '';
  const [h, m] = hora24.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return hora24;
  const periodo = h >= 12 ? 'PM' : 'AM';
  const hora12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hora12}:${m.toString().padStart(2, '0')} ${periodo}`;
};

// Función para convertir hora a minutos
const horaAMinutos = (hora) => {
  if (!hora) return 0;
  const [h, m] = hora.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Calcular hora fin
const calcularHoraFin = (inicio, duracion) => {
  if (!inicio || !/^\d{2}:\d{2}$/.test(inicio)) return '';
  const [h, m] = inicio.split(':').map(Number);
  const totalMin = h * 60 + m + Number(duracion || 0);
  const newH = Math.floor(totalMin / 60);
  const newM = totalMin % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
};

const ServiceSelection = ({ 
  servicios, 
  onServicesChange, 
  fecha, 
  professionals = [],
  excludeCitaId = null,
  disabled = false
}) => {
  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [occupiedHours, setOccupiedHours] = useState({}); // { employeeId: { hora: true } }
  const [employeeSchedules, setEmployeeSchedules] = useState({}); // { employeeId: { min: 'HH:MM', max: 'HH:MM', bloques: [...] } }
  const serviceInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Función para normalizar un servicio del backend
  const normalizarServicio = (servicio) => {
    return {
      id: servicio.id_servicio || servicio.id,
      name: servicio.nombre || servicio.name || servicio.servicio_nombre || 'Servicio sin nombre',
      duration: servicio.duracion || servicio.duration || servicio.tiempo || 0,
      price: servicio.precio || servicio.price || servicio.costo || 0,
      description: servicio.descripcion || servicio.description || ''
    };
  };

  // Calcular posición del dropdown
  const updateDropdownPosition = () => {
    if (serviceInputRef.current) {
      const rect = serviceInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Cargar servicios desde el backend
  const cargarServicios = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get('/servicios', { skipGlobalErrorHandling: true });
      
      let serviciosArray = [];
      if (Array.isArray(response)) {
        serviciosArray = response;
      } else if (response?.data && Array.isArray(response.data)) {
        serviciosArray = response.data;
      } else if (response?.servicios && Array.isArray(response.servicios)) {
        serviciosArray = response.servicios;
      } else if (response?.results && Array.isArray(response.results)) {
        serviciosArray = response.results;
      }
      
      const serviciosActivos = serviciosArray.filter(s => {
        const estado = s.estado || s.active;
        return estado === 'Activo' || estado === true;
      });
      
      setAvailableServices(serviciosActivos);
    } catch (error) {
      console.error('Error loading services:', error);
      setAvailableServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar horario del empleado para una fecha específica
  const cargarHorarioEmpleado = async (idEmpleado, fechaServicio) => {
    if (!idEmpleado || !fechaServicio) {
      setEmployeeSchedules(prev => ({ ...prev, [idEmpleado]: null }));
      return;
    }

    try {
      console.log(`📅 Cargando horario para empleado ${idEmpleado} en fecha ${fechaServicio}`);
      const horario = await appointmentsService.getEmployeeSchedule(idEmpleado, fechaServicio);
      console.log(`✅ Respuesta del horario:`, horario);
      
      // Verificar que horario sea un objeto válido
      if (!horario || typeof horario !== 'object' || Array.isArray(horario)) {
        console.warn('⚠️ Formato de respuesta inesperado para horario:', horario);
        setEmployeeSchedules(prev => ({ ...prev, [idEmpleado]: null }));
        return;
      }
      
      // Si el empleado no tiene programación, establecer null sin error
      if (!horario || (!horario.bloques_horarios && !horario.tiene_novedad)) {
        console.log(`ℹ️ Empleado ${idEmpleado} no tiene programación para ${fechaServicio}`);
        setEmployeeSchedules(prev => ({ ...prev, [idEmpleado]: null }));
        return;
      }

      // Verificar si hay novedad de Ausencia o Suspensión
      if (horario.tiene_novedad && (horario.tipo_novedad === 'Ausencia' || horario.tipo_novedad === 'Suspension')) {
        // Si hay ausencia o suspensión, no hay bloques disponibles
        console.log(`⚠️ Empleado ${idEmpleado} tiene ${horario.tipo_novedad} para ${fechaServicio}`);
        setEmployeeSchedules(prev => ({ 
          ...prev, 
          [idEmpleado]: { 
            min: null, 
            max: null, 
            bloques: [],
            tiene_novedad: true,
            tipo_novedad: horario.tipo_novedad,
            motivo: horario.motivo
          } 
        }));
        return;
      }
      
      if (horario.bloques_horarios && Array.isArray(horario.bloques_horarios) && horario.bloques_horarios.length > 0) {
        // Encontrar el min y max de todos los bloques
        let minHora = '23:59';
        let maxHora = '00:00';
        
        horario.bloques_horarios.forEach(bloque => {
          if (bloque.inicio && bloque.fin) {
            const inicioMin = horaAMinutos(bloque.inicio);
            const finMin = horaAMinutos(bloque.fin);
            const minActual = horaAMinutos(minHora);
            const maxActual = horaAMinutos(maxHora);
            
            if (inicioMin < minActual) {
              minHora = bloque.inicio.substring(0, 5); // Asegurar formato HH:MM
            }
            if (finMin > maxActual) {
              maxHora = bloque.fin.substring(0, 5); // Asegurar formato HH:MM
            }
          }
        });
        
        console.log(`✅ Horario cargado para empleado ${idEmpleado}: ${minHora} - ${maxHora}`);
        setEmployeeSchedules(prev => ({ 
          ...prev, 
          [idEmpleado]: { 
            min: minHora, 
            max: maxHora, 
            bloques: horario.bloques_horarios,
            tiene_novedad: horario.tiene_novedad || false,
            tipo_novedad: horario.tipo_novedad || null,
            motivo: horario.motivo || null
          } 
        }));
      } else {
        console.log(`ℹ️ Empleado ${idEmpleado} no tiene bloques horarios para ${fechaServicio}`);
        setEmployeeSchedules(prev => ({ ...prev, [idEmpleado]: null }));
      }
    } catch (error) {
      // Si es un 404, verificar si es porque no hay programación o porque la ruta no existe
      if (error?.response?.status === 404) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
        
        // Si el mensaje indica que la ruta no existe, es un error del sistema
        if (errorMessage.toLowerCase().includes('ruta no encontrada') || 
            errorMessage.toLowerCase().includes('route not found') ||
            error.response?.data?.path) {
          console.error(`❌ Error del sistema: Ruta no encontrada para obtener horario del empleado`);
          console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url,
            baseURL: error.config?.baseURL
          });
          // No establecer null, dejar que el usuario vea que hay un error
          return;
        }
        
        // Si es un 404 normal (empleado sin programación), es esperado
        console.log(`ℹ️ Empleado ${idEmpleado} no tiene programación para ${fechaServicio} (404)`);
        setEmployeeSchedules(prev => ({ ...prev, [idEmpleado]: null }));
      } else {
        console.error(`❌ Error loading employee schedule for ${idEmpleado} on ${fechaServicio}:`, error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          baseURL: error.config?.baseURL
        });
        setEmployeeSchedules(prev => ({ ...prev, [idEmpleado]: null }));
      }
    }
  };

  // Cargar horarios ocupados para un empleado en una fecha específica
  const cargarHorariosOcupados = async (idEmpleado, fechaServicio) => {
    if (!idEmpleado || !fechaServicio) {
      setOccupiedHours(prev => ({ ...prev, [idEmpleado]: {} }));
      return;
    }

    try {
      // Obtener todas las citas para esa fecha
      const response = await appointmentsService.getAll({ 
        fecha_desde: fechaServicio,
        fecha_hasta: fechaServicio
      });

      // Manejar diferentes estructuras de respuesta del API
      let citas = [];
      
      // El backend devuelve: { success: true, data: { citas: [...], pagination: {...} } }
      if (response?.success && response?.data) {
        if (response.data.citas && Array.isArray(response.data.citas)) {
          citas = response.data.citas;
        } else if (Array.isArray(response.data)) {
          citas = response.data;
        }
      } 
      // Si la respuesta es directamente un array
      else if (Array.isArray(response)) {
        citas = response;
      } 
      // Si response.data es directamente un array
      else if (response?.data && Array.isArray(response.data)) {
        citas = response.data;
      }
      // Otras estructuras posibles
      else if (response?.citas && Array.isArray(response.citas)) {
        citas = response.citas;
      } else if (response?.data?.results && Array.isArray(response.data.results)) {
        citas = response.data.results;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        citas = response.data.items;
      }

      const horasOcupadas = {};

      // Procesar cada cita y sus servicios solo si citas es un array válido
      if (Array.isArray(citas)) {
        citas.forEach(cita => {
          // Excluir la cita actual si estamos editando
          if (excludeCitaId && cita.id_cita === excludeCitaId) return;

          if (cita.servicios && Array.isArray(cita.servicios)) {
            cita.servicios.forEach(servicio => {
              // Solo considerar servicios del empleado seleccionado
              if (servicio.id_empleado === idEmpleado && servicio.hora_inicio && servicio.hora_finalizacion) {
                const inicioMin = horaAMinutos(servicio.hora_inicio);
                const finMin = horaAMinutos(servicio.hora_finalizacion);
                
                // Marcar todas las horas ocupadas en ese rango
                for (let min = inicioMin; min < finMin; min += 15) {
                  const h = Math.floor(min / 60);
                  const m = min % 60;
                  const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                  horasOcupadas[hora] = true;
                }
              }
            });
          }
        });
      }

      setOccupiedHours(prev => ({ ...prev, [idEmpleado]: horasOcupadas }));
    } catch (error) {
      console.error('Error loading occupied hours:', error);
      setOccupiedHours(prev => ({ ...prev, [idEmpleado]: {} }));
    }
  };

  // Cargar servicios al montar
  useEffect(() => {
    cargarServicios();
  }, []);

  // Cargar horarios ocupados y horarios de empleados cuando cambia la fecha o un empleado
  useEffect(() => {
    if (fecha) {
      const empleadosUnicos = [...new Set(servicios.map(s => s.id_empleado).filter(Boolean))];
      empleadosUnicos.forEach(idEmpleado => {
        cargarHorarioEmpleado(idEmpleado, fecha);
        cargarHorariosOcupados(idEmpleado, fecha);
      });
    }
  }, [fecha, servicios.map(s => s.id_empleado).join(',')]);

  // Buscador en tiempo real
  useEffect(() => {
    if (availableServices.length > 0) {
      const normalized = availableServices.map(normalizarServicio);
      if (serviceQuery.trim() === '') {
        setFilteredServices(normalized.slice(0, 4));
      } else {
        setFilteredServices(
          normalized.filter(s =>
            s.name.toLowerCase().includes(serviceQuery.toLowerCase())
          ).slice(0, 4)
        );
      }
    } else {
      setFilteredServices([]);
    }
  }, [serviceQuery, availableServices]);

  // Actualizar posición cuando se abre el dropdown
  useEffect(() => {
    if (isServiceDropdownOpen) {
      updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isServiceDropdownOpen]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        serviceInputRef.current && 
        !serviceInputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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

  // Agregar servicio
  const handleAddService = (service) => {
    const nuevoServicio = {
      id: Date.now() + Math.random(),
      servicioId: service.id,
      nombre: service.name,
      profesional: '',
      id_empleado: null,
      inicio: '',
      fin: '',
      duracion: parseFormattedNumber(service.duration?.toString() || '0') || 0,
      precio: parseFormattedNumber(service.price?.toString() || '0') || 0,
      cantidad: 1
    };
    
    onServicesChange([...servicios, nuevoServicio]);
    setServiceQuery('');
    setIsServiceDropdownOpen(false);
  };

  // Eliminar servicio
  const removeService = (index) => {
    const nuevosServicios = servicios.filter((_, i) => i !== index);
    onServicesChange(nuevosServicios);
  };

  // Actualizar servicio
  const updateService = (index, updates) => {
    const nuevosServicios = [...servicios];
    const servicioActualizado = { ...nuevosServicios[index], ...updates };
    
    // Si cambia el profesional, actualizar id_empleado y limpiar horarios
    if (updates.profesional !== undefined) {
      const profesional = professionals.find(p => p.name === updates.profesional);
      servicioActualizado.id_empleado = profesional?.id || null;
      servicioActualizado.inicio = '';
      servicioActualizado.fin = '';
      
      // Cargar horario y horarios ocupados para el nuevo empleado
      if (profesional?.id && fecha) {
        cargarHorarioEmpleado(profesional.id, fecha);
        cargarHorariosOcupados(profesional.id, fecha);
      }
    }
    
    // Si cambia id_empleado directamente
    if (updates.id_empleado !== undefined) {
      servicioActualizado.id_empleado = updates.id_empleado;
      if (updates.id_empleado && fecha) {
        cargarHorarioEmpleado(updates.id_empleado, fecha);
        cargarHorariosOcupados(updates.id_empleado, fecha);
      }
    }
    
    // Si cambia inicio, duración o cantidad, recalcular fin
    if (updates.inicio !== undefined || updates.duracion !== undefined || updates.cantidad !== undefined) {
      const inicio = updates.inicio !== undefined ? updates.inicio : servicioActualizado.inicio;
      const duracion = updates.duracion !== undefined ? updates.duracion : servicioActualizado.duracion;
      const cantidad = updates.cantidad !== undefined ? updates.cantidad : servicioActualizado.cantidad;
      const duracionTotal = Number(duracion) * Number(cantidad || 1);
      servicioActualizado.fin = calcularHoraFin(inicio, duracionTotal);
    }
    
    nuevosServicios[index] = servicioActualizado;
    onServicesChange(nuevosServicios);
  };

  // Verificar si una hora está dentro del horario del empleado
  const verificarHoraEnHorario = (hora, idEmpleado, duracion) => {
    if (!hora || !idEmpleado || !duracion) return false;
    
    const horario = employeeSchedules[idEmpleado];
    if (!horario || !horario.bloques || horario.bloques.length === 0) return false;
    
    const inicioMin = horaAMinutos(hora);
    const finMin = inicioMin + Number(duracion);
    
    // Verificar si el rango [inicio, fin] está completamente dentro de algún bloque
    for (const bloque of horario.bloques) {
      const bloqueInicio = horaAMinutos(bloque.inicio);
      const bloqueFin = horaAMinutos(bloque.fin);
      
      if (inicioMin >= bloqueInicio && finMin <= bloqueFin) {
        return true;
      }
    }
    
    return false;
  };

  // Verificar si una hora está ocupada
  const verificarHoraOcupada = (hora, idEmpleado, duracion, index) => {
    if (!hora || !idEmpleado || !duracion) return false;
    
    // Primero verificar que esté dentro del horario del empleado
    if (!verificarHoraEnHorario(hora, idEmpleado, duracion)) {
      return true; // No está en el horario disponible
    }
    
    const inicioMin = horaAMinutos(hora);
    const finMin = inicioMin + Number(duracion);
    
    // Verificar solapamiento con otros servicios del mismo formulario
    for (let i = 0; i < servicios.length; i++) {
      if (i === index) continue;
      const s = servicios[i];
      if (s.id_empleado === idEmpleado && s.inicio && s.fin) {
        const inicioB = horaAMinutos(s.inicio);
        const finB = horaAMinutos(s.fin);
        if (inicioMin < finB && inicioB < finMin) {
          return true;
        }
      }
    }
    
    // Verificar solapamiento con horarios ocupados del empleado
    const horasOcupadas = occupiedHours[idEmpleado] || {};
    for (let min = inicioMin; min < finMin; min += 15) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      const horaCheck = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      if (horasOcupadas[horaCheck]) {
        return true;
      }
    }
    
    return false;
  };


  const handleFocus = () => {
    setIsServiceDropdownOpen(true);
    setTimeout(() => {
      updateDropdownPosition();
    }, 0);
    cargarServicios();
  };

  // Renderizar dropdown con portal
  const renderDropdown = () => {
    if (!isServiceDropdownOpen) {
      return null;
    }

    const dropdownContent = (
      <div
        ref={dropdownRef}
        className="fixed bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 9999
        }}
      >
        {loading && (
          <div className="p-4 text-center text-gray-500 text-sm">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Cargando servicios...</span>
            </div>
          </div>
        )}
        {!loading && filteredServices.length > 0 && (
          <>
            {filteredServices.map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleAddService(service)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-gray-600 mb-2 line-clamp-2">{service.description}</div>
                    )}
                    <div className="flex items-center gap-4 text-xs">
                      {service.duration && service.duration > 0 && (
                        <span className="flex items-center gap-1 text-gray-700">
                          <i className="bi bi-clock"></i>
                          <span className="font-medium">{service.duration} min</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-gray-700">
                        <i className="bi bi-currency-dollar"></i>
                        <span className="font-medium">${formatNumber(service.price)}</span>
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
          </>
        )}
        {!loading && filteredServices.length === 0 && serviceQuery.trim() !== '' && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No se encontraron servicios
          </div>
        )}
        {!loading && filteredServices.length === 0 && serviceQuery.trim() === '' && availableServices.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No hay servicios disponibles
          </div>
        )}
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div className="space-y-4">
      {/* Buscador de servicios */}
      <div className="relative">
        <label className="block text-xs font-medium text-text-main mb-1">
          Buscar Servicio <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={serviceInputRef}>
          <div className="relative">
            <input
              type="text"
              value={serviceQuery}
              onChange={e => {
                setServiceQuery(e.target.value);
                setIsServiceDropdownOpen(true);
                updateDropdownPosition();
              }}
              onFocus={handleFocus}
              onClick={() => {
                setIsServiceDropdownOpen(true);
                setTimeout(() => updateDropdownPosition(), 0);
              }}
              disabled={disabled}
              className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Buscar por nombre de servicio..."
            />
            <button
              type="button"
              onClick={() => {
                setIsServiceDropdownOpen(!isServiceDropdownOpen);
                if (!isServiceDropdownOpen) {
                  updateDropdownPosition();
                }
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className={`bi bi-chevron-${isServiceDropdownOpen ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>
        {renderDropdown()}
      </div>

      {/* Servicios seleccionados */}
      <div>
        <div className="font-semibold mb-2">Servicios seleccionados ({servicios.length})</div>
        <div className="space-y-4">
          {servicios.map((service, idx) => (
            <div key={service.id} className="border rounded-lg p-4 bg-gray-50 relative">
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => removeService(idx)}
                      disabled={disabled}
                    >
                      ×
                    </button>
              <div className="font-semibold mb-1">{service.nombre}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Profesional</label>
                  <select
                    value={service.profesional || ''}
                    onChange={e => {
                      updateService(idx, { profesional: e.target.value });
                    }}
                    disabled={disabled}
                    className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Seleccionar profesional</option>
                    {professionals.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora inicio</label>
                  {(() => {
                    const horario = service.id_empleado ? employeeSchedules[service.id_empleado] : null;
                    const tieneNovedad = horario?.tiene_novedad && (horario.tipo_novedad === 'Ausencia' || horario.tipo_novedad === 'Suspension');
                    const minTime = horario?.min || '06:00';
                    const maxTime = horario?.max || '20:00';
                    const horaInvalida = service.inicio && service.id_empleado && service.duracion && 
                                       verificarHoraOcupada(service.inicio, service.id_empleado, service.duracion, idx);
                    
                    return (
                      <>
                        <input
                          type="time"
                          value={service.inicio || ''}
                          onChange={e => updateService(idx, { inicio: e.target.value })}
                          min={tieneNovedad ? undefined : minTime}
                          max={tieneNovedad ? undefined : maxTime}
                          step="900"
                          className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                            disabled || !service.profesional || !service.id_empleado || tieneNovedad
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : horaInvalida 
                                ? 'border-red-500 bg-red-50' 
                                : ''
                          }`}
                          disabled={!service.profesional || !service.id_empleado || disabled || tieneNovedad}
                          title={
                            tieneNovedad 
                              ? `El empleado tiene una ${horario.tipo_novedad === 'Ausencia' ? 'ausencia' : 'suspensión'} registrada para esta fecha`
                              : horario 
                                ? `Horario disponible: ${minTime} - ${maxTime}` 
                                : 'Seleccione un empleado primero'
                          }
                        />
                        {tieneNovedad && (
                          <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <span className="text-xs text-yellow-800 font-semibold block">
                              <i className="bi bi-exclamation-triangle mr-1"></i>
                              El empleado tiene una {horario.tipo_novedad === 'Ausencia' ? 'ausencia' : 'suspensión'} registrada para esta fecha
                            </span>
                            {horario.motivo && (
                              <span className="text-xs text-yellow-700 block mt-1">
                                Motivo: {horario.motivo}
                              </span>
                            )}
                          </div>
                        )}
                        {!tieneNovedad && horario && (
                          <span className="text-xs text-gray-500 block mt-1">
                            Horario disponible: {minTime} - {maxTime}
                          </span>
                        )}
                        {!tieneNovedad && service.profesional && service.id_empleado && service.inicio && horaInvalida && (
                          <span className="text-xs text-red-500 block mt-1">
                            {!verificarHoraEnHorario(service.inicio, service.id_empleado, service.duracion) 
                              ? 'Hora fuera del horario del empleado' 
                              : 'Hora no disponible (ocupada)'}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora finalización</label>
                  <input
                    type="text"
                    value={service.fin ? convertirHoraA12Horas(service.fin) : ''}
                    readOnly
                    className="w-full px-2 py-1 border rounded-md bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
                  <input
                    type="text"
                    value={formatNumber(service.duracion, 0)}
                    disabled
                    className="w-full px-2 py-1 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="text"
                    value={formatNumber(service.cantidad || 1, 0)}
                    onChange={e => {
                      const formatted = formatNumberInput(e.target.value, 0);
                      updateService(idx, { cantidad: parseFormattedNumber(formatted) || 1 });
                    }}
                    disabled={disabled}
                    className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio</label>
                  <div className="font-semibold">${formatNumber(Number(service.precio || 0) * (Number(service.cantidad) || 1), 2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;

