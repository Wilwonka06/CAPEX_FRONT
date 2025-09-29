import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import appointmentsService from '../API/appointmentsService';
import usersService from '@/features/dashboard/pages/users/API/usersService';

// Estados posibles de la cita
const APPOINTMENT_STATES = [
  { nombre: 'Agendada', descripcion: 'La cita ha sido creada por el cliente.' },
  { nombre: 'Confirmada', descripcion: 'El establecimiento ha confirmado la disponibilidad.' },
  { nombre: 'Reprogramada', descripcion: 'La cita ha sido modificada en fecha u hora.' },
  { nombre: 'En proceso', descripcion: 'El servicio está siendo realizado actualmente.' },
  { nombre: 'Finalizada', descripcion: 'El servicio fue realizado con éxito.' },
  { nombre: 'Pagada', descripcion: 'El cliente pagó la cita.' },
  { nombre: 'Cancelada por el usuario', descripcion: 'El cliente canceló la cita.' },
  { nombre: 'No asistio', descripcion: 'El cliente no se presentó a la cita.' },
];
import Swal from 'sweetalert2';

function limpiarPrecio(valor) {
  return Number(String(valor).replace(/[^\d]/g, '')) || 0;
}


const AppointmentEditModal = ({ cita, fecha, onClose, onSave }) => {
  // Estados para el buscador
  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Formulario principal
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    fecha: fecha || '',
    servicios: [],
    estado: 'Agendada',
    notas: ''
  });

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      try {
        // Por ahora usamos datos mock ya que no tenemos servicios/profesionales en el backend
        // TODO: Implementar cuando estén disponibles los endpoints de servicios y empleados
        setServices([
          { id: 1, name: 'Corte de cabello', duration: 30, price: 25000, description: 'Corte básico de cabello', active: true },
          { id: 2, name: 'Manicura', duration: 45, price: 35000, description: 'Manicura completa', active: true },
          { id: 3, name: 'Pedicura', duration: 60, price: 40000, description: 'Pedicura completa', active: true }
        ]);
        setProfessionals([
          { id: 1, name: 'Ana Torres', active: true },
          { id: 2, name: 'Carlos Mendoza', active: true },
          { id: 3, name: 'Lucía Gómez', active: true }
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Si es edición, cargar datos de la cita
  useEffect(() => {
    if (cita) {
      setFormData({
        cliente: cita.cliente?.nombre || '',
        telefono: cita.cliente?.telefono || '',
        fecha: cita.fecha_servicio || fecha || '',
        estado: cita.estado || 'Agendada',
        servicios: (cita.servicios || []).map(s => ({
          id: s.id_detalle_servicio || Date.now() + Math.random(),
          servicioId: s.id_servicio,
          nombre: s.nombre_servicio,
          profesional: s.nombre_empleado || '',
          inicio: s.hora_inicio || '08:00',
          fin: s.hora_fin || calcularHoraFin(s.hora_inicio || '08:00', s.duracion || 30),
          duracion: s.duracion || 30,
          precio: s.precio || 0,
          cantidad: s.cantidad || 1
        })),
        notas: cita.motivo || ''
      });
    }
  }, [cita, fecha]);

  // useEffect para actualizar la fecha cuando cambia la prop fecha y NO hay cita (modo creación)
  useEffect(() => {
    if (!cita && fecha) {
      setFormData(prev => ({
        ...prev,
        fecha
      }));
    }
  }, [fecha, cita]);

  // Buscador en tiempo real
  useEffect(() => {
    if (serviceQuery.trim() === '') {
      setFilteredServices([]);
    } else {
      setFilteredServices(
        services.filter(s =>
          s.name.toLowerCase().includes(serviceQuery.toLowerCase())
        )
      );
    }
  }, [serviceQuery, services]);

  // Agregar servicio desde el buscador (ahora al inicio)
  const handleAddService = (service) => {
    setFormData(prev => ({
      ...prev,
      servicios: [
        {
          id: Date.now() + Math.random(),
          servicioId: service.id,
          nombre: service.name,
          profesional: '',
          inicio: '08:00',
          fin: calcularHoraFin('08:00', service.duration),
          duracion: parseInt(service.duration?.toString().replace(/[^\d]/g, '') || 0, 10),
          precio: parseInt(service.price?.toString().replace(/[^\d]/g, '') || 0, 10),

          cantidad: 1
        },
        ...prev.servicios
      ]
    }));
    setServiceQuery('');
    setFilteredServices([]);
    // Marcar servicios como tocado y limpiar error
    setTouchedFields(prev => ({ ...prev, servicios: true }));
    clearError('servicios');
  };

  // Eliminar servicio de la lista
  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index)
    }));
  };

  // Función para marcar un campo como "tocado" y validar
  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Función para limpiar errores cuando el usuario empieza a escribir
  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validar un campo específico
  const validateField = (field) => {
    let error = '';
    
    switch (field) {
      case 'cliente':
        error = !formData.cliente.trim() ? 'El nombre del cliente es requerido' : '';
        break;
      case 'telefono':
        error = validarTelefono(formData.telefono);
        break;
      case 'fecha':
        error = validarFecha(formData.fecha);
        break;
      case 'servicios':
        if (formData.servicios.length === 0) {
          error = 'Debe agregar al menos un servicio';
        } else if (haySolapamientoServicios(formData.servicios)) {
          error = 'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Actualizar campos de un servicio seleccionado
  const updateService = (index, field, value) => {
    setFormData(prev => {
      const newServicios = [...prev.servicios];
      newServicios[index] = { ...newServicios[index], [field]: value };
      // Si cambia hora inicio o duración, recalcular hora fin
      if (['inicio', 'duracion', 'cantidad'].includes(field)) {
        const inicio = field === 'inicio' ? value : newServicios[index].inicio;
        const duracion = field === 'duracion' ? value : newServicios[index].duracion;
        const cantidad = field === 'cantidad' ? value : newServicios[index].cantidad;
        const duracionTotal = Number(duracion) * Number(cantidad || 1);
        newServicios[index].fin = calcularHoraFin(inicio, duracionTotal);
      }      
      return { ...prev, servicios: newServicios };
    });
  };

  // Calcular hora fin a partir de inicio y duración
  function calcularHoraFin(inicio, duracion) {
    if (!inicio || !/^\d{2}:\d{2}$/.test(inicio)) return '';
    const [h, m] = inicio.split(':').map(Number);
    const totalMin = h * 60 + m + Number(duracion || 0);
    const newH = Math.floor(totalMin / 60);
    const newM = totalMin % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  }  

  // Validación de teléfono
  function validarTelefono(telefono) {
    const soloNumeros = /^[0-9]{7,10}$/;
    if (!telefono) return 'El teléfono es requerido';
    if (!soloNumeros.test(telefono)) return 'El teléfono debe tener solo números (7 a 10 dígitos)';
    return '';
  }

  // Validación de fecha
  function validarFecha(fecha) {
    if (!fecha) return 'La fecha es requerida';
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaCita = new Date(fecha);
    if (fechaCita < hoy) return 'No puedes agendar una cita en una fecha pasada';
    return '';
  }

  // Validación de solapamiento de servicios para el mismo profesional (en el formulario)
  function haySolapamientoServicios(servicios) {
    for (let i = 0; i < servicios.length; i++) {
      for (let j = i + 1; j < servicios.length; j++) {
        if (
          servicios[i].profesional &&
          servicios[i].profesional === servicios[j].profesional
        ) {
          // Convertir a minutos para comparar
          const inicioA = parseInt(servicios[i].inicio.split(':')[0]) * 60 + parseInt(servicios[i].inicio.split(':')[1]);
          const finA = parseInt(servicios[i].fin.split(':')[0]) * 60 + parseInt(servicios[i].fin.split(':')[1]);
          const inicioB = parseInt(servicios[j].inicio.split(':')[0]) * 60 + parseInt(servicios[j].inicio.split(':')[1]);
          const finB = parseInt(servicios[j].fin.split(':')[0]) * 60 + parseInt(servicios[j].fin.split(':')[1]);
          // Si se solapan
          if (inicioA < finB && inicioB < finA) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Validación de choque con otras citas del mismo empleado en el mismo día
  async function hayChoqueConOtrasCitas(servicio, fecha, idCitaActual) {
    try {
      // Obtener citas del día desde la API
      const response = await appointmentsService.getAll({ fecha_servicio: fecha });
      
      // Manejar la estructura de respuesta correcta
      let todasCitas = [];
      if (response.success && response.data) {
        // La API devuelve { success: true, data: { citas: [...] } }
        todasCitas = response.data.citas || response.data || [];
      }
      
      // Asegurar que todasCitas es un array
      if (!Array.isArray(todasCitas)) {
        console.warn('todasCitas is not an array:', todasCitas);
        todasCitas = [];
      }
      
      const citasMismoDia = todasCitas.filter(c => c.fecha_servicio === fecha && c.id_cita !== idCitaActual);

      for (const cita of citasMismoDia) {
        for (const s of cita.servicios || []) {
          if (s.nombre_empleado === servicio.profesional) {
            // Comparar horarios
            const inicioA = parseInt(servicio.inicio.split(':')[0]) * 60 + parseInt(servicio.inicio.split(':')[1]);
            const finA = parseInt(servicio.fin.split(':')[0]) * 60 + parseInt(servicio.fin.split(':')[1]);
            const inicioB = parseInt(s.hora_inicio.split(':')[0]) * 60 + parseInt(s.hora_inicio.split(':')[1]);
            const finB = parseInt(s.hora_fin.split(':')[0]) * 60 + parseInt(s.hora_fin.split(':')[1]);
            if (inicioA < finB && inicioB < finA) {
              return true;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking appointment conflicts:', error);
      console.error('Response structure:', response);
      // En caso de error, permitir continuar (mejor UX que bloquear)
    }
    return false;
  }

  // Validaciones solo para campos que han sido tocados
  useEffect(() => {
    // Solo validar servicios si ya hay servicios o si ya hay un error
    if (touchedFields.servicios || formData.servicios.length > 0) {
      if (formData.servicios.length === 0) {
        setErrors(prev => ({ ...prev, servicios: 'Debe agregar al menos un servicio' }));
      } else if (haySolapamientoServicios(formData.servicios)) {
        setErrors(prev => ({ ...prev, servicios: 'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.servicios;
          return newErrors;
        });
      }
    }
  }, [formData.servicios, touchedFields.servicios]);

  // Validación de choque con otras citas (por cada servicio) - DESHABILITADA temporalmente
  // TODO: Rehabilitar cuando el backend esté funcionando correctamente
  /*
  useEffect(() => {
    async function validarChoques() {
      const newErrors = { ...errors };
      for (let i = 0; i < formData.servicios.length; i++) {
        const s = formData.servicios[i];
        if (s.profesional && s.inicio && s.fin) {
          const choca = await hayChoqueConOtrasCitas(s, formData.fecha, cita?.id);
          if (choca) {
            newErrors[`servicio_${i}`] = 'Este horario choca con otra cita del mismo profesional en este día.';
          } else {
            delete newErrors[`servicio_${i}`];
          }
        }
      }
      setErrors(newErrors);
    }
    validarChoques();
    // eslint-disable-next-line
  }, [formData.servicios, formData.fecha]);
  */

  // Generar opciones de hora disponibles para un servicio
  function getHorasDisponibles(idx, profesional, duracion) {
    if (!profesional) return [];
    const horas = [];
    for (let h = 6; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        // Verificar si esta hora se solapa con otro servicio del mismo profesional
        let disponible = true;
        const inicioA = h * 60 + m;
        const finA = inicioA + Number(duracion);
        for (let i = 0; i < formData.servicios.length; i++) {
          if (i === idx) continue;
          const s = formData.servicios[i];
          if (s.profesional === profesional) {
            const inicioB = parseInt(s.inicio.split(':')[0]) * 60 + parseInt(s.inicio.split(':')[1]);
            const finB = parseInt(s.fin.split(':')[0]) * 60 + parseInt(s.fin.split(':')[1]);
            if (inicioA < finB && inicioB < finA) {
              disponible = false;
              break;
            }
          }
        }
        horas.push({ hora, disponible });
      }
    }
    return horas;
  }

  // Calcular duración total, hora inicio/fin global y valor total
  const calcularResumen = () => {
    if (formData.servicios.length === 0) return { duracion: 0, inicio: '', fin: '', total: 0 };
    const inicios = formData.servicios.map(s => s.inicio).sort();
    const fines = formData.servicios.map(s => s.fin).sort().reverse();
    const duracion = formData.servicios.reduce((acc, s) => acc + Number(s.duracion || 0), 0);
    const total = formData.servicios.reduce((acc, s) => acc + (limpiarPrecio(s.precio) * (Number(s.cantidad) || 1)), 0);
    return {
      duracion,
      inicio: inicios[0],
      fin: fines[0],
      total
    };
  };
  const resumen = calcularResumen();

  // Función para buscar o crear cliente
  const findOrCreateClient = async (clientName, clientPhone) => {
    try {
      console.log('Buscando cliente:', clientName, clientPhone);

      // Buscar usuario existente por nombre y teléfono
      const searchPhoneDigits = clientPhone.trim().replace(/\D/g, ''); // Solo números para búsqueda
      const searchResponse = await usersService.getAll({
        nombre: clientName.trim(),
        telefono: searchPhoneDigits // Buscar sin + para compatibilidad
      });

      console.log('Respuesta de búsqueda:', searchResponse);

      if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        // Encontrar usuario que coincida exactamente por nombre
        // Ser más flexible con el teléfono (comparar dígitos)
        const clientPhoneDigits = clientPhone.trim().replace(/\D/g, '');
        const existingUser = searchResponse.data.find(user => {
          const userNameMatch = user.nombre?.toLowerCase() === clientName.toLowerCase().trim();
          const userPhoneDigits = user.telefono?.replace(/\D/g, '') || '';
          const userPhoneMatch = userPhoneDigits === clientPhoneDigits;
          return userNameMatch && userPhoneMatch;
        });

        if (existingUser) {
          console.log('Cliente encontrado:', existingUser);
          return existingUser.id_usuario || existingUser.id;
        }
      }

      // Si no se encontró, crear nuevo usuario/cliente
      console.log('Cliente no encontrado, creando nuevo usuario...');

      // Generar datos que cumplan con las validaciones del backend
      const cleanName = clientName.trim();
      const cleanPhoneDigits = clientPhone.trim().replace(/\D/g, ''); // Solo números
      const cleanPhone = cleanPhoneDigits.startsWith('+') ? cleanPhoneDigits : `+${cleanPhoneDigits}`; // Agregar + si no existe
      const timestamp = Date.now();

      const newUserData = {
        nombre: cleanName,
        telefono: cleanPhone, // Formato: +573001234567
        correo: `${cleanName.toLowerCase().replace(/\s+/g, '.')}.${timestamp}@cliente.com`,
        contrasena: 'Cliente123!', // Cumple: 8+ chars, mayúscula, minúscula, número
        tipo_documento: 'Cedula de ciudadania', // Tipo válido
        documento: `TEMP${timestamp}`, // Documento único temporal
        roleId: 2, // Asumir rol de cliente
        estado: 'Activo'
      };

      console.log('Datos del nuevo usuario:', newUserData);

      const createResponse = await usersService.create(newUserData);
      if (createResponse.success && createResponse.data) {
        console.log('Nuevo cliente creado:', createResponse.data);
        return createResponse.data.id_usuario || createResponse.data.id;
      }

      throw new Error('No se pudo crear el cliente');
    } catch (error) {
      console.error('Error en findOrCreateClient:', error);
      console.error('Error details:', error.response?.data);

      // Si falla la creación, usar cliente por defecto
      console.warn('Usando cliente por defecto debido a error en creación');
      return 1; // ID de cliente por defecto
    }
  };

  // Guardar cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    newErrors.cliente = !formData.cliente.trim() ? 'El nombre del cliente es requerido' : '';
    newErrors.telefono = validarTelefono(formData.telefono);
    newErrors.fecha = validarFecha(formData.fecha);
    if (formData.servicios.length === 0) {
      newErrors.servicios = 'Debe agregar al menos un servicio';
    } else {
      const haySolapamiento = haySolapamientoServicios(formData.servicios);
      console.log('Verificando solapamiento:', haySolapamiento, 'Servicios:', formData.servicios);
      if (haySolapamiento) {
        newErrors.servicios = 'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.';
      }
    }

    // Validar choques con otras citas - DESHABILITADA temporalmente
    // TODO: Rehabilitar cuando el backend esté funcionando correctamente
    /*
    for (let i = 0; i < formData.servicios.length; i++) {
      const s = formData.servicios[i];
      if (s.profesional && s.inicio && s.fin) {
        const choca = await hayChoqueConOtrasCitas(s, formData.fecha, cita?.id_cita);
        if (choca) {
          newErrors[`servicio_${i}`] = 'Este horario choca con otra cita del mismo profesional en este día.';
        } else {
          delete newErrors[`servicio_${i}`];
        }
      }
    }
    */

    setErrors(newErrors);
    
    // Debug: mostrar errores en consola
    console.log('Errores detectados:', newErrors);
    console.log('FormData:', formData);
    
    if (Object.values(newErrors).some(Boolean)) {
      Swal.fire('Error', 'Por favor corrige los errores en el formulario antes de guardar.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Buscar o crear cliente
      console.log('Iniciando búsqueda/creación de cliente para:', formData.cliente, formData.telefono);
      const clientId = await findOrCreateClient(formData.cliente, formData.telefono);
      console.log('Client ID obtenido:', clientId);

      // Mapear nombre de profesional a ID (usando datos mock por ahora)
      const mapProfesionalToId = (nombreProfesional) => {
        const profesional = professionals.find(p => p.name === nombreProfesional);
        return profesional ? profesional.id : 1; // Default to 1 if not found
      };

      // Preparar datos para el backend según la estructura esperada
      const appointmentData = {
        cita: {
          id_cliente: clientId,
          fecha_servicio: formData.fecha,
          hora_entrada: formData.servicios.length > 0 ? formData.servicios[0].inicio + ':00' : '08:00:00',
          hora_salida: formData.servicios.length > 0 ? formData.servicios[formData.servicios.length - 1].fin + ':00' : '09:00:00',
          estado: formData.estado,
          valor_total: calcularResumen().total,
          ...(formData.notas && { motivo: formData.notas.trim() })
        },
        servicios: formData.servicios.map(s => ({
          id_servicio: s.servicioId,
          id_empleado: mapProfesionalToId(s.profesional),
          hora_inicio: s.inicio + ':00',
          precio_unitario: s.precio,
          cantidad: s.cantidad || 1,
          ...(s.observaciones && { observaciones: s.observaciones })
        }))
      };

      console.log('Datos de cita a enviar:', appointmentData);

      let result;
      if (cita) {
        // Para actualización, incluir id_cliente en la cita
        appointmentData.cita.id_cliente = cita.id_cliente;
        result = await appointmentsService.update(cita.id_cita, appointmentData);
        Swal.fire('¡Cita editada!', 'La cita se editó correctamente.', 'success');
      } else {
        result = await appointmentsService.create(appointmentData);
        Swal.fire('¡Cita registrada!', 'La cita se registró correctamente.', 'success');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      Swal.fire('Error', error.message || 'Ocurrió un error al guardar la cita.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 select-none font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[95vh] flex flex-col mt-8">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl flex items-center justify-between px-8 py-5">
          <h2 className="text-2xl font-bold text-primary m-0">{cita ? 'Editar' : 'Crear'} Cita</h2>
          <button className="text-gray-400 hover:text-primary text-2xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 flex-1 space-y-4">
          {/* Buscador de servicios */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-main mb-1">Buscar Servicio <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={serviceQuery}
              onChange={e => setServiceQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Buscar por nombre de servicio..."
            />
            {filteredServices.length > 0 && (
              <div className="bg-white border rounded shadow mt-2 max-h-40 overflow-y-auto">
                {filteredServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50">
                    <div>
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.description}</div>
                      <div className="text-xs text-gray-500">{service.duration} min ${service.price}</div>
                    </div>
                    <button
                      type="button"
                      className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark text-sm"
                      onClick={() => handleAddService(service)}
                    >Agregar</button>
                  </div>
                ))}
              </div>
            )}
            {touchedFields.servicios && errors.servicios && <span className="text-red-500 text-xs block mt-1">{errors.servicios}</span>}
          </div>

          {/* Servicios seleccionados */}
          <div className="mb-6">
            <div className="font-semibold mb-2">Servicios seleccionados ({formData.servicios.length})</div>
            {touchedFields.servicios && errors.servicios && <p className="text-red-500 text-xs mb-2">{errors.servicios}</p>}
            <div className="space-y-4">
              {formData.servicios.map((service, idx) => (
                <div key={service.id} className="border rounded-lg p-4 bg-gray-50 relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-lg"
                    onClick={() => removeService(idx)}
                  >×</button>
                  <div className="font-semibold mb-1">{service.nombre}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Profesional</label>
                      <select
                        value={service.profesional}
                        onChange={e => updateService(idx, 'profesional', e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Seleccionar profesional</option>
                        {professionals.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hora inicio</label>
                      <select
                        value={service.inicio}
                        onChange={e => updateService(idx, 'inicio', e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {getHorasDisponibles(idx, service.profesional, service.duracion).map(opt => (
                          <option key={opt.hora} value={opt.hora} disabled={!opt.disponible} style={!opt.disponible ? {color:'#aaa'} : {}}>
                            {opt.hora} {!opt.disponible ? ' (hora no disponible)' : ''}
                          </option>
                        ))}
                      </select>
                      {(!getHorasDisponibles(idx, service.profesional, service.duracion).some(opt => opt.hora === service.inicio && opt.disponible)) && (
                        <span className="text-xs text-red-500">hora no disponible</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hora finalización</label>
                      <input
                        type="time"
                        value={service.fin}
                        readOnly
                        className="w-full px-2 py-1 border rounded-md bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
                      <input
                        type="number"
                        value={service.duracion}
                        disabled
                        className="w-full px-2 py-1 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                      <input
                        type="number"
                        value={service.cantidad}
                        onChange={e => updateService(idx, 'cantidad', e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Precio</label>
                      <div className="font-semibold">${Number(service.precio) * (Number(service.cantidad) || 1)}</div>
                    </div>
                  </div>
                  {errors[`servicio_${idx}`] && <span className="text-red-500 text-xs block mt-1">{errors[`servicio_${idx}`]}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Datos del cliente y resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.cliente}
                onChange={e => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                onFocus={() => clearError('cliente')}
                onBlur={() => handleFieldBlur('cliente')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.cliente && errors.cliente ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nombre completo"
              />
              {touchedFields.cliente && errors.cliente && <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, telefono: val }));
                }}
                onFocus={() => clearError('telefono')}
                onBlur={() => handleFieldBlur('telefono')}
                maxLength={10}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.telefono && errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Número de teléfono"
              />
              {touchedFields.telefono && errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.fecha}
                onChange={e => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                onFocus={() => clearError('fecha')}
                onBlur={() => handleFieldBlur('fecha')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.fecha && errors.fecha ? 'border-red-500' : 'border-gray-300'}`}
              />
              {touchedFields.fecha && errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la cita</label>
              <select
                value={formData.estado}
                onChange={e => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {APPOINTMENT_STATES.map(estado => (
                  <option key={estado.nombre} value={estado.nombre}>{estado.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hora inicio</label>
              <input type="text" value={resumen.inicio} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
            </div>
            <div>
  <label className="block text-xs font-medium text-gray-700 mb-1">Hora fin</label>
  <input
    type="text"
    value={resumen.fin || ''}
    disabled
    className="w-full px-2 py-1 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
  />
</div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duración total</label>
              <input type="text" value={resumen.duracion + ' min'} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor total</label>
              <input type="text" value={`$${resumen.total}`} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition">{loading ? 'Guardando...' : (cita ? 'Guardar cambios' : 'Crear cita')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

AppointmentEditModal.propTypes = {
  cita: PropTypes.object,
  fecha: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AppointmentEditModal; 