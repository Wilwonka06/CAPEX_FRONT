import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getAllServices } from '@/features/landing/pages/ServicesPage/api/servicesApi';
import { employeesService } from '@/features/dashboard/pages/employees/API/employeesService';
import appointmentsService from '../API/appointmentsService';
import toast from 'react-hot-toast';

const ServiceSelection = ({ 
  servicios, 
  onServicesChange, 
  fecha, 
  existingAppointments = [],
  errors = {},
  onErrorsChange,
  touchedFields = {},
  estado = 'Agendada'
}) => {
  // Estados para el buscador
  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const serviceInputRef = useRef(null);

  // Cargar servicios y profesionales
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar servicios desde el backend
        const servicesData = await getAllServices();
        const normalizedServices = servicesData
          .filter(s => s.active || s.estado === 'Activo')
          .map(s => ({
            id: s.id,
            name: s.name,
            duration: s.duration || 0,
            price: s.price || 0,
            description: s.description || s.descripcion || '',
            active: s.active || s.estado === 'Activo'
          }));
        setAvailableServices(normalizedServices);

        // Cargar empleados desde el backend
        const employeesData = await employeesService.getAll();
        const normalizedProfessionals = employeesData
          .filter(emp => emp.estado === 'Activo' || emp.estado === true)
          .map(emp => ({
            id: emp.id,
            name: emp.nombre,
            active: emp.estado === 'Activo' || emp.estado === true
          }));
        setProfessionals(normalizedProfessionals);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar servicios y profesionales');
        setAvailableServices([]);
        setProfessionals([]);
      }
    };
    loadData();
  }, []);

  // Buscador en tiempo real
  useEffect(() => {
    if (serviceQuery.trim() === '') {
      setFilteredServices(availableServices);
    } else {
      setFilteredServices(
        availableServices.filter(s =>
          s.name.toLowerCase().includes(serviceQuery.toLowerCase()) ||
          (s.description && s.description.toLowerCase().includes(serviceQuery.toLowerCase()))
        )
      );
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

  // Función para convertir hora de 24h a 12h (AM/PM)
  const convertirHoraA12Horas = (hora24) => {
    if (!hora24) return '';
    const horaStr = hora24.toString().substring(0, 5);
    const [horas, minutos] = horaStr.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos)) return hora24;
    const periodo = horas >= 12 ? 'PM' : 'AM';
    const horas12 = horas === 0 ? 12 : horas > 12 ? horas - 12 : horas;
    return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
  };

  // Calcular hora fin a partir de inicio y duración
  const calcularHoraFin = (inicio, duracion) => {
    if (!inicio || !/^\d{2}:\d{2}$/.test(inicio)) return '';
    const [h, m] = inicio.split(':').map(Number);
    const totalMin = h * 60 + m + Number(duracion || 0);
    const newH = Math.floor(totalMin / 60);
    const newM = totalMin % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  };

  // Verificar si una hora está ocupada por el empleado
  const verificarHoraOcupada = (idx, horaInicio, idEmpleado, duracion, serviciosArray = null) => {
    if (!horaInicio || !idEmpleado || !duracion) return null;

    const convertirHoraAMinutos = (horaStr) => {
      if (!horaStr) return 0;
      const partes = horaStr.split(':');
      return parseInt(partes[0]) * 60 + parseInt(partes[1] || 0);
    };

    const inicioA = convertirHoraAMinutos(horaInicio);
    const finA = inicioA + Number(duracion);
    const serviciosActuales = serviciosArray || servicios;

    // Verificar solapamiento con otros servicios del mismo empleado en el formulario
    for (let i = 0; i < serviciosActuales.length; i++) {
      if (i === idx) continue;
      const s = serviciosActuales[i];
      if (s.id_empleado === idEmpleado && s.inicio) {
        const inicioB = convertirHoraAMinutos(s.inicio);
        const finB = convertirHoraAMinutos(s.fin);
        if (inicioA < finB && inicioB < finA) {
          return `Esta hora se solapa con otro servicio del mismo empleado en esta cita (${s.inicio} - ${s.fin})`;
        }
      }
    }

    // Verificar conflictos con servicios del mismo empleado en citas existentes
    if (existingAppointments.length > 0) {
      for (const cita of existingAppointments) {
        if (!cita.servicios || cita.servicios.length === 0) continue;
        
        for (const servicio of cita.servicios) {
          const idEmpleadoServicio = servicio.id_empleado || servicio.empleado?.id_usuario || servicio.empleado?.id;
          if (idEmpleadoServicio !== idEmpleado) continue;
          
          const horaInicioServicio = servicio.hora_inicio || servicio.hora_inicio_servicio;
          if (!horaInicioServicio) continue;
          
          const inicioServicio = convertirHoraAMinutos(horaInicioServicio);
          let finServicio;
          if (servicio.hora_finalizacion || servicio.hora_fin || servicio.hora_fin_servicio) {
            finServicio = convertirHoraAMinutos(servicio.hora_finalizacion || servicio.hora_fin || servicio.hora_fin_servicio);
          } else {
            const duracionServicio = servicio.duracion || servicio.servicio?.duracion || 30;
            finServicio = inicioServicio + duracionServicio;
          }
          
          if (inicioA < finServicio && inicioServicio < finA) {
            const nombreServicio = servicio.servicio?.nombre || servicio.nombre_servicio || 'Servicio';
            const horaFinStr = servicio.hora_finalizacion || servicio.hora_fin || servicio.hora_fin_servicio || 
                              `${Math.floor(finServicio / 60).toString().padStart(2, '0')}:${(finServicio % 60).toString().padStart(2, '0')}`;
            return `Esta hora está ocupada por el empleado en otra cita (${horaInicioServicio.substring(0, 5)} - ${horaFinStr.substring(0, 5)}) - ${nombreServicio}`;
          }
        }
      }
    }

    return null;
  };

  // Generar opciones de hora disponibles para un servicio
  const getHorasDisponibles = (idx, profesional, duracion, idEmpleado) => {
    if (!profesional || !idEmpleado) return [];
    const horas = [];
    const hoyISO = new Date().toISOString().slice(0, 10);
    const esHoy = fecha === hoyISO;
    const ahora = new Date();
    const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
    
    const convertirHoraAMinutos = (horaStr) => {
      if (!horaStr) return 0;
      const partes = horaStr.split(':');
      return parseInt(partes[0]) * 60 + parseInt(partes[1] || 0);
    };

    for (let h = 6; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        let disponible = true;
        const inicioA = h * 60 + m;
        const finA = inicioA + Number(duracion);
        
        // Verificar si es una hora pasada
        const estadosPermitidos = ['En ejecución', 'Finalizada', 'Pagada'];
        if (esHoy && inicioA <= ahoraMin && !estadosPermitidos.includes(estado)) {
          disponible = false;
        }
        
        // Verificar solapamiento con otros servicios del mismo empleado en el formulario
        for (let i = 0; i < servicios.length; i++) {
          if (i === idx) continue;
          const s = servicios[i];
          if (s.id_empleado === idEmpleado) {
            const inicioB = parseInt(s.inicio.split(':')[0]) * 60 + parseInt(s.inicio.split(':')[1]);
            const finB = parseInt(s.fin.split(':')[0]) * 60 + parseInt(s.fin.split(':')[1]);
            if (inicioA < finB && inicioB < finA) {
              disponible = false;
              break;
            }
          }
        }

        // Verificar conflictos con servicios del mismo empleado en citas existentes
        if (disponible && existingAppointments.length > 0) {
          for (const cita of existingAppointments) {
            if (!cita.servicios || cita.servicios.length === 0) continue;
            
            for (const servicio of cita.servicios) {
              const idEmpleadoServicio = servicio.id_empleado || servicio.empleado?.id_usuario || servicio.empleado?.id;
              if (idEmpleadoServicio !== idEmpleado) continue;
              
              const horaInicioServicio = servicio.hora_inicio || servicio.hora_inicio_servicio;
              if (!horaInicioServicio) continue;
              
              const inicioServicio = convertirHoraAMinutos(horaInicioServicio);
              let finServicio;
              if (servicio.hora_finalizacion || servicio.hora_fin || servicio.hora_fin_servicio) {
                finServicio = convertirHoraAMinutos(servicio.hora_finalizacion || servicio.hora_fin || servicio.hora_fin_servicio);
              } else {
                const duracionServicio = servicio.duracion || servicio.servicio?.duracion || 30;
                finServicio = inicioServicio + duracionServicio;
              }
              
              if (inicioA < finServicio && inicioServicio < finA) {
                disponible = false;
                break;
              }
            }
            if (!disponible) break;
          }
        }
        
        horas.push({ 
          hora, // Mantener formato 24h para el value
          horaDisplay: convertirHoraA12Horas(hora), // Formato 12h para mostrar
          disponible 
        });
      }
    }
    return horas;
  };

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
      duracion: parseInt(service.duration?.toString().replace(/[^\d]/g, '') || 0, 10),
      precio: parseInt(service.price?.toString().replace(/[^\d]/g, '') || 0, 10),
      cantidad: 1
    };
    
    onServicesChange([nuevoServicio, ...servicios]);
    setServiceQuery('');
    setIsServiceDropdownOpen(false);
  };

  // Eliminar servicio
  const removeService = (index) => {
    const nuevosServicios = servicios.filter((_, i) => i !== index);
    onServicesChange(nuevosServicios);
    
    // Limpiar error del servicio eliminado
    if (onErrorsChange) {
      const errorKey = `servicio_${index}_hora`;
      onErrorsChange(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        // Reindexar errores
        const reindexedErrors = {};
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('servicio_') && key.endsWith('_hora')) {
            const oldIdx = parseInt(key.split('_')[1]);
            if (oldIdx > index) {
              const newKey = `servicio_${oldIdx - 1}_hora`;
              reindexedErrors[newKey] = newErrors[key];
            } else if (oldIdx < index) {
              reindexedErrors[key] = newErrors[key];
            }
          } else {
            reindexedErrors[key] = newErrors[key];
          }
        });
        return reindexedErrors;
      });
    }
  };

  // Actualizar servicio
  const updateService = (index, field, value) => {
    const newServicios = [...servicios];
    const servicioActualizado = { ...newServicios[index], [field]: value };
    
    // Si cambia hora inicio o duración, recalcular hora fin
    if (['inicio', 'duracion', 'cantidad'].includes(field)) {
      const inicio = field === 'inicio' ? value : servicioActualizado.inicio;
      const duracion = field === 'duracion' ? value : servicioActualizado.duracion;
      const cantidad = field === 'cantidad' ? value : servicioActualizado.cantidad;
      const duracionTotal = Number(duracion) * Number(cantidad || 1);
      servicioActualizado.fin = calcularHoraFin(inicio, duracionTotal);
    }
    
    newServicios[index] = servicioActualizado;
    onServicesChange(newServicios);
    
    // Validación en tiempo real para la hora - Solo si hay todos los datos necesarios
    if (field === 'inicio' && onErrorsChange && servicioActualizado.profesional && servicioActualizado.id_empleado && servicioActualizado.duracion) {
      const errorHora = verificarHoraOcupada(index, value, servicioActualizado.id_empleado, servicioActualizado.duracion, newServicios);
      onErrorsChange(prev => ({
        ...prev,
        [`servicio_${index}_hora`]: errorHora || ''
      }));
    } else if (field === 'inicio' && onErrorsChange) {
      // Limpiar error si no hay datos suficientes
      onErrorsChange(prev => {
        const errorKey = `servicio_${index}_hora`;
        if (prev[errorKey]) {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        }
        return prev;
      });
    }
  };

  // Validación en tiempo real de horas cuando cambian empleado, hora o fecha
  useEffect(() => {
    if (servicios.length === 0 || !onErrorsChange) return;
    
    servicios.forEach((service, idx) => {
      // Solo validar si hay todos los datos necesarios: inicio, empleado, duracion y profesional
      if (service.inicio && service.id_empleado && service.duracion && service.profesional) {
        const errorHora = verificarHoraOcupada(idx, service.inicio, service.id_empleado, service.duracion, servicios);
        onErrorsChange(prev => {
          const errorKey = `servicio_${idx}_hora`;
          const currentError = prev[errorKey];
          if (errorHora !== currentError) {
            if (errorHora) {
              return { ...prev, [errorKey]: errorHora };
            } else {
              const newErrors = { ...prev };
              delete newErrors[errorKey];
              return newErrors;
            }
          }
          return prev;
        });
      } else {
        // Limpiar error si no hay datos suficientes
        onErrorsChange(prev => {
          const errorKey = `servicio_${idx}_hora`;
          if (prev[errorKey]) {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            return newErrors;
          }
          return prev;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicios, fecha, existingAppointments]);

  return (
    <div className="space-y-4">
      {/* Buscador de servicios */}
      <div className="mb-4 relative" ref={serviceInputRef}>
        <label className="block text-xs font-medium text-text-main mb-1">
          Buscar Servicio <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={serviceQuery}
            onChange={e => {
              setServiceQuery(e.target.value);
              setIsServiceDropdownOpen(true);
            }}
            onFocus={() => setIsServiceDropdownOpen(true)}
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
        {isServiceDropdownOpen && filteredServices.length > 0 && (
          <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto">
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
                      <span className="flex items-center gap-1 text-gray-700">
                        <i className="bi bi-clock"></i>
                        <span className="font-medium">{service.duration} min</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <i className="bi bi-currency-dollar"></i>
                        <span className="font-medium">${service.price.toLocaleString('es-CO')}</span>
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
        {isServiceDropdownOpen && filteredServices.length === 0 && serviceQuery.trim() !== '' && (
          <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500 text-sm">
            No se encontraron servicios
          </div>
        )}
        {touchedFields.servicios && errors.servicios && (
          <span className="text-red-500 text-xs block mt-1">{errors.servicios}</span>
        )}
      </div>

      {/* Servicios seleccionados */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="bi bi-list-check text-primary text-lg"></i>
            <h3 className="font-semibold text-base text-text-main">
              Servicios seleccionados ({servicios.length})
            </h3>
          </div>
        </div>
        {touchedFields.servicios && errors.servicios && (
          <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">
            <div className="flex items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{errors.servicios}</span>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {servicios.map((service, idx) => {
            const tieneErrorHora = !!errors[`servicio_${idx}_hora`];
            // Solo validar hora no disponible si hay profesional, empleado y hora seleccionada
            const tieneDatosCompletos = service.profesional && service.id_empleado && service.inicio;
            const horaNoDisponible = tieneDatosCompletos && 
              !getHorasDisponibles(idx, service.profesional, service.duracion, service.id_empleado).some(opt => opt.hora === service.inicio && opt.disponible);
            
            return (
              <div 
                key={service.id} 
                className={`border-2 rounded-lg p-5 bg-white relative transition-all ${
                  tieneErrorHora || horaNoDisponible 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Botón eliminar */}
                <button
                  type="button"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-xl font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition-all"
                  onClick={() => removeService(idx)}
                  title="Eliminar servicio"
                >
                  ×
                </button>

                {/* Header del servicio */}
                <div className="flex items-start justify-between mb-4 pr-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <i className="bi bi-scissors text-primary"></i>
                      <h4 className="font-semibold text-base text-gray-900">{service.nombre}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <i className="bi bi-clock"></i>
                        {service.duracion} min
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="bi bi-currency-dollar"></i>
                        ${service.precio.toLocaleString('es-CO')} c/u
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-lg font-bold text-primary">
                      ${(Number(service.precio) * (Number(service.cantidad) || 1)).toLocaleString('es-CO')}
                    </div>
                  </div>
                </div>

                {/* Mensaje de error destacado - Solo mostrar si hay datos completos y hay un error real */}
                {(tieneErrorHora || (horaNoDisponible && tieneDatosCompletos)) && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <i className="bi bi-exclamation-triangle-fill text-red-600 text-lg flex-shrink-0 mt-0.5"></i>
                      <div className="flex-1">
                        <div className="font-semibold text-red-800 text-sm mb-1">Hora no disponible</div>
                        <div className="text-xs text-red-700">
                          {errors[`servicio_${idx}_hora`] || 'Esta hora está ocupada por el empleado seleccionado. Por favor, elige otra hora.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos del formulario */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Profesional */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bi bi-person mr-1"></i>
                      Profesional <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.profesional}
                      onChange={e => {
                        const selectedProfessional = professionals.find(p => p.name === e.target.value);
                        // Actualizar ambos campos en una sola operación
                        const newServicios = [...servicios];
                        const servicioActualizado = { ...newServicios[idx] };
                        servicioActualizado.profesional = e.target.value;
                        servicioActualizado.id_empleado = selectedProfessional ? selectedProfessional.id : null;
                        // Limpiar hora si se cambia el profesional
                        if (service.profesional !== e.target.value) {
                          servicioActualizado.inicio = '';
                          servicioActualizado.fin = '';
                        }
                        newServicios[idx] = servicioActualizado;
                        onServicesChange(newServicios);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        !service.profesional ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar profesional</option>
                      {professionals.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    {!service.profesional && (
                      <p className="text-xs text-yellow-600 mt-1">Selecciona un profesional para ver horas disponibles</p>
                    )}
                  </div>

                  {/* Hora inicio */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bi bi-clock mr-1"></i>
                      Hora inicio <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.inicio}
                      onChange={e => updateService(idx, 'inicio', e.target.value)}
                      disabled={!service.profesional || !service.id_empleado}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        tieneErrorHora || horaNoDisponible
                          ? 'border-red-400 bg-red-50'
                          : !service.profesional
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                          : 'border-gray-300'
                      }`}
                    >
                      {!service.profesional ? (
                        <option value="">Primero selecciona un profesional</option>
                      ) : (
                        getHorasDisponibles(idx, service.profesional, service.duracion, service.id_empleado).map(opt => (
                          <option key={opt.hora} value={opt.hora} disabled={!opt.disponible}>
                            {opt.horaDisplay} {!opt.disponible ? ' (ocupada)' : ''}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Hora finalización */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bi bi-clock-history mr-1"></i>
                      Hora finalización
                    </label>
                    <input
                      type="time"
                      value={service.fin}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Duración */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bi bi-hourglass-split mr-1"></i>
                      Duración
                    </label>
                    <input
                      type="number"
                      value={service.duracion}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">minutos</p>
                  </div>

                  {/* Cantidad */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bi bi-123 mr-1"></i>
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={service.cantidad}
                      onChange={e => updateService(idx, 'cantidad', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ServiceSelection.propTypes = {
  servicios: PropTypes.array.isRequired,
  onServicesChange: PropTypes.func.isRequired,
  fecha: PropTypes.string.isRequired,
  existingAppointments: PropTypes.array,
  errors: PropTypes.object,
  onErrorsChange: PropTypes.func,
  touchedFields: PropTypes.object,
  estado: PropTypes.string
};

export default ServiceSelection;

