import { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import appointmentsService from '../API/appointmentsService';
import { isValidDocumentByType } from '@/shared/validations';
import usersService from '@/features/dashboard/pages/users/API/usersService';
import { employeesService } from '@/features/dashboard/pages/employees/API/employeesService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../users/components/phoneinput-search.css';
import { toBackendDocCode } from '../../../../../shared/constants/documentTypes';
import ServiceSelection from './ServiceSelection';

// Estados posibles de la cita
const APPOINTMENT_STATES = [
  { nombre: 'Agendada', descripcion: 'La cita ha sido creada por el cliente.' },
  { nombre: 'Confirmada', descripcion: 'El establecimiento ha confirmado la disponibilidad.' },
  { nombre: 'Reprogramada', descripcion: 'La cita ha sido modificada en fecha u hora.' },
  { nombre: 'En ejecución', descripcion: 'El servicio está siendo realizado actualmente.' },
  { nombre: 'Finalizada', descripcion: 'El servicio fue realizado con éxito.' },
  { nombre: 'Pagada', descripcion: 'El cliente pagó la cita.' },
  { nombre: 'Cancelada por el usuario', descripcion: 'El cliente canceló la cita.' },
  { nombre: 'No asistio', descripcion: 'El cliente no se presentó a la cita.' },
];
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

function limpiarPrecio(valor) {
  return Number(String(valor).replace(/[^\d]/g, '')) || 0;
}


const AppointmentEditModal = ({ cita, onClose, onSave }) => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [numero, setNumero] = useState('');
  const [existingAppointments, setExistingAppointments] = useState([]);

  // Formulario principal
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    correo: '',
    documento: '',
    tipoDocumento: 'CC',
    fecha: '',
    servicios: [],
    estado: 'Agendada',
    notas: ''
  });

  // Cargar profesionales
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
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
        console.error('Error loading professionals:', error);
        setProfessionals([]);
      }
    };
    loadProfessionals();
  }, []);

  // Cargar datos de la cita al editar (requerido)
  useEffect(() => {
    if (!cita) {
      console.error('AppointmentEditModal requiere una cita para editar');
      toast.error('Error: No se proporcionó una cita para editar');
      onClose();
      return;
    }

    // Función para cargar los datos de la cita
    const loadCitaData = async () => {
      try {
        setLoading(true);
        // Obtener la cita completa desde el backend para asegurar que tenga todos los campos
        const citaId = cita.id_cita;
        const response = await appointmentsService.getById(citaId);
        
        if (!response.success || !response.data) {
          toast.error('Error al cargar los datos de la cita');
          onClose();
          return;
        }

        const citaCompleta = response.data;
        console.log('Loading appointment data for editing:', citaCompleta);
        console.log('Usuario data:', citaCompleta.usuario);
        console.log('Cliente data:', citaCompleta.cliente);
        
        const telefono = citaCompleta.usuario?.telefono || citaCompleta.cliente?.telefono || '';
      const telefonoLimpio = telefono.replace(/[^0-9]/g, '');
      setNumero(telefonoLimpio);
        
        // Convertir documento a string si existe
        const documento = citaCompleta.usuario?.documento || citaCompleta.cliente?.documento || '';
        const documentoStr = documento ? String(documento) : '';
        
      setFormData({
          cliente: citaCompleta.usuario?.nombre || citaCompleta.cliente?.nombre || '',
        telefono: telefono,
          correo: citaCompleta.usuario?.correo || citaCompleta.cliente?.correo || '',
          documento: documentoStr,
          tipoDocumento: citaCompleta.usuario?.tipo_documento || citaCompleta.cliente?.tipo_documento || 'CC',
          fecha: citaCompleta.fecha_servicio || '',
          estado: citaCompleta.estado || 'Agendada',
          servicios: (citaCompleta.servicios || []).map(s => {
          // Normalizar datos del backend
          const nombreEmpleado = s.empleado?.nombre || s.nombre_empleado || '';
          const horaInicio = s.hora_inicio ? (s.hora_inicio.includes(':') ? s.hora_inicio.substring(0, 5) : s.hora_inicio) : '08:00';
          const duracion = s.duracion || s.servicio?.duracion || 30;

          return {
            id: s.id_detalle_servicio || Date.now() + Math.random(),
            servicioId: s.id_servicio || s.servicio?.id_servicio,
            nombre: s.servicio?.nombre || s.nombre_servicio || 'Servicio',
            profesional: nombreEmpleado,
            id_empleado: s.id_empleado || s.empleado?.id_usuario,
            inicio: horaInicio,
            fin: s.hora_finalizacion ? (s.hora_finalizacion.includes(':') ? s.hora_finalizacion.substring(0, 5) : s.hora_finalizacion) : (() => {
              if (!horaInicio || !/^\d{2}:\d{2}$/.test(horaInicio)) return '';
              const [h, m] = horaInicio.split(':').map(Number);
              const totalMin = h * 60 + m + Number(duracion || 0);
              const newH = Math.floor(totalMin / 60);
              const newM = totalMin % 60;
              return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
            })(),
            duracion: duracion,
            precio: s.precio_unitario || s.precio || 0,
            cantidad: s.cantidad || 1,
            observaciones: s.observaciones || ''
          };
        }),
          notas: citaCompleta.motivo || ''
      });
      } catch (error) {
        console.error('Error loading appointment data:', error);
        toast.error('Error al cargar los datos de la cita');
        onClose();
      } finally {
        setLoading(false);
    }
    };

    loadCitaData();
  }, [cita, onClose]);


  // Cargar citas existentes del día seleccionado (excluyendo la cita actual)
  useEffect(() => {
    const loadExistingAppointments = async () => {
      if (!formData.fecha || !cita?.id_cita) {
        setExistingAppointments([]);
        return;
      }

      try {
        const response = await appointmentsService.getAll({
          fecha_servicio: formData.fecha
        });
        
        if (response.success && response.data) {
          // Filtrar solo citas activas (no canceladas) y excluir la cita actual
          const activeAppointments = response.data.filter(
            citaExistente => 
              citaExistente.id_cita !== cita.id_cita &&
              citaExistente.estado !== 'Cancelada por el usuario' && 
              citaExistente.estado !== 'No asistio'
          );
          setExistingAppointments(activeAppointments);
        } else {
          setExistingAppointments([]);
        }
      } catch (error) {
        console.error('Error loading existing appointments:', error);
        setExistingAppointments([]);
      }
    };

    loadExistingAppointments();
  }, [formData.fecha, cita?.id_cita]);


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
        error = validarTelefono(numero);
        break;
      case 'correo':
        error = validarCorreo(formData.correo);
        break;
      case 'documento':
        error = validarDocumento(formData.documento);
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

  // Validación en tiempo real para campos individuales (solo para campos editables)
  const handleFieldChange = (field, value) => {
    // Actualizar el valor del campo
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error si existe
    clearError(field);

    // Validar en tiempo real solo si el campo ya fue tocado
    if (touchedFields[field]) {
      // Usar un timeout para no validar en cada keystroke
      setTimeout(() => {
        validateField(field);
      }, 300);
    }
  };


  // Validación de teléfono
  function validarTelefono(telefono) {
    if (!telefono) return 'El teléfono es requerido';
    const digitsOnly = /^[0-9]{7,15}$/;
    if (!digitsOnly.test(String(telefono))) return 'El teléfono debe tener entre 7 y 15 dígitos';
    return '';
  }

  // Validación de correo
  function validarCorreo(correo) {
    if (!correo) return 'El correo electrónico es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) return 'El correo electrónico no es válido';
    return '';
  }

  // Validación de documento
  function validarDocumento(documento) {
    if (!documento) return 'El número de documento es requerido';
    const ok = isValidDocumentByType(formData.tipoDocumento, documento);
    if (!ok) return 'Número de documento inválido para el tipo seleccionado';
    return '';
  }

  // Validación de fecha
  function validarFecha(fecha) {
    if (!fecha) return 'La fecha es requerida';
    
    // Estados que permiten fechas pasadas (citas ya en curso o finalizadas)
    const estadosQuePermitenFechaPasada = ['En ejecución', 'Finalizada', 'Pagada', 'Cancelada por el usuario', 'No asistio'];
    const permiteFechaPasada = estadosQuePermitenFechaPasada.includes(formData.estado);
    
    if (!permiteFechaPasada) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      // Normalizar la fecha de la cita para evitar problemas de zona horaria
      // Si la fecha viene como string (YYYY-MM-DD), crear la fecha en hora local
      const fechaCita = new Date(fecha + 'T00:00:00');
      fechaCita.setHours(0, 0, 0, 0);
      // Permitir fecha actual (hoy)
      if (fechaCita < hoy) return 'No puedes agendar una cita en una fecha pasada';
    }
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

  // Validación en tiempo real para servicios cuando cambian
  useEffect(() => {
    if (touchedFields.servicios && formData.servicios.length > 0) {
      const serviciosError = haySolapamientoServicios(formData.servicios) ?
        'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.' : '';
      setErrors(prev => ({
        ...prev,
        servicios: serviciosError
      }));
    }
  }, [formData.servicios, touchedFields.servicios]);


  // Verificar si un servicio ya pasó su hora
  const servicioHoraPasada = (service) => {
    if (!formData.fecha || !service.inicio) return false;
    
    const hoyISO = new Date().toISOString().slice(0, 10);
    const esHoy = formData.fecha === hoyISO;
    
    if (!esHoy) return false; // Solo verificar si es hoy
    
    const ahora = new Date();
    const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
    const [hh, mm] = service.inicio.split(':').map(Number);
    const servicioMin = hh * 60 + mm;
    
    return servicioMin < ahoraMin;
  };

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

  // Convertir hora a minutos para ordenar correctamente
  const horaAMinutos = (horaStr) => {
    if (!horaStr) return 0;
    const partes = horaStr.split(':');
    return parseInt(partes[0]) * 60 + parseInt(partes[1] || 0);
  };

  // Calcular duración total, hora inicio/fin global y valor total
  const calcularResumen = () => {
    if (formData.servicios.length === 0) return { duracion: 0, inicio: '', fin: '', total: 0 };
    
    // Ordenar horas correctamente convirtiéndolas a minutos
    const inicios = formData.servicios
      .map(s => s.inicio)
      .filter(h => h) // Filtrar horas vacías
      .sort((a, b) => horaAMinutos(a) - horaAMinutos(b));
    
    const fines = formData.servicios
      .map(s => s.fin)
      .filter(h => h) // Filtrar horas vacías
      .sort((a, b) => horaAMinutos(b) - horaAMinutos(a)); // Orden descendente
    
    const duracion = formData.servicios.reduce((acc, s) => acc + Number(s.duracion || 0), 0);
    const total = formData.servicios.reduce((acc, s) => acc + (limpiarPrecio(s.precio) * (Number(s.cantidad) || 1)), 0);
    
    return {
      duracion,
      inicio: inicios[0] || '',
      fin: fines[0] || '',
      total
    };
  };
  const resumen = calcularResumen();

  // Obtener ID del cliente de la cita (no se crea cliente nuevo en edición)
  const getClientId = () => {
    if (!cita) {
      throw new Error('No se puede editar una cita sin datos');
    }
    // Usar el id_cliente de la cita existente
    return cita.id_cliente || cita.usuario?.id_usuario || cita.cliente?.id_usuario;
  };

  // Guardar cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    // No validar datos del cliente ya que son de solo lectura
    newErrors.fecha = validarFecha(formData.fecha);
    if (formData.servicios.length === 0) {
      newErrors.servicios = 'Debe agregar al menos un servicio';
    } else {
      // Validar que todos los servicios tengan profesional asignado
      const serviciosSinProfesional = formData.servicios.filter(s => !s.profesional || !s.id_empleado);
      if (serviciosSinProfesional.length > 0) {
        newErrors.servicios = 'Todos los servicios deben tener un profesional asignado';
      } else {
        const haySolapamiento = haySolapamientoServicios(formData.servicios);
        console.log('Verificando solapamiento:', haySolapamiento, 'Servicios:', formData.servicios);
        if (haySolapamiento) {
          newErrors.servicios = 'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.';
        }
      }
    }

    // Validación de hora contra el tiempo actual si es el mismo día
    // NO validar si el estado es "En ejecución", "Finalizada" o "Pagada" (estados donde la hora ya pasó o está en curso)
    const estadosQueNoRequierenValidacionHora = ['En ejecución', 'Finalizada', 'Pagada'];
    const requiereValidacionHora = !estadosQueNoRequierenValidacionHora.includes(formData.estado);
    
    try {
      const hoyISO = new Date().toISOString().slice(0, 10);
      if (requiereValidacionHora && formData.fecha === hoyISO && formData.servicios.length > 0) {
        const ahora = new Date();
        const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
        const earliest = Math.min(...formData.servicios.map(s => {
          const [hh, mm] = (s.inicio || '00:00').split(':').map(Number);
          return hh * 60 + mm;
        }));
        if (earliest <= ahoraMin) {
          const msg = `La hora debe ser posterior a ${ahora.toTimeString().slice(0, 5)}`;
          newErrors.servicios = msg;
          toast.error(msg);
        } else if (earliest - ahoraMin <= 30) {
          toast('Atención: la hora seleccionada es muy próxima.');
        }
      }
    } catch { }

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
      // Obtener ID del cliente de la cita existente (no se crea cliente nuevo)
      let clientId;
      try {
        clientId = getClientId();
        console.log('Client ID obtenido de la cita:', clientId);
        if (!clientId) {
          throw new Error('No se pudo obtener el ID del cliente de la cita');
        }
      } catch (error) {
        console.error('Error obteniendo ID del cliente:', error);
        toast.error(error.message || 'Error al obtener los datos del cliente');
        setLoading(false);
        return;
      }

      // Validar que todos los servicios tengan profesional y servicioId
      const serviciosInvalidos = formData.servicios.filter(s => {
        if (!s.profesional || !s.id_empleado) {
          return true;
        }
        if (!s.servicioId) {
          return true;
        }
        return false;
      });

      if (serviciosInvalidos.length > 0) {
        toast.error('Todos los servicios deben tener un profesional y servicio válido asignado');
        setLoading(false);
        return;
      }

      // Mapear profesional a ID usando los profesionales cargados del backend
      const mapProfesionalToId = (servicio) => {
        // Si ya tiene id_empleado, usarlo directamente
        if (servicio.id_empleado) {
          return servicio.id_empleado;
        }

        // Si no, buscar por nombre
        if (!servicio.profesional) {
          throw new Error('Debe seleccionar un profesional para cada servicio');
        }

        const profesional = professionals.find(p => p.name === servicio.profesional);
        if (!profesional) {
          throw new Error(`No se encontró el profesional "${servicio.profesional}". Por favor, verifica que esté registrado.`);
        }
        return profesional.id;
      };

      // Calcular hora_entrada (primera hora de inicio de los servicios)
      const horasInicio = formData.servicios.map(s => s.inicio).sort();
      const primeraHora = horasInicio[0] || '08:00';
      
      // Asegurar formato HH:MM:SS para hora_entrada
      let horaEntrada = primeraHora;
      if (primeraHora.includes(':') && primeraHora.length === 5) {
        horaEntrada = primeraHora + ':00';
      } else if (!primeraHora.includes(':')) {
        horaEntrada = '08:00:00';
      }

      // Validar que clientId sea un número válido
      if (!clientId || (typeof clientId !== 'number' && isNaN(Number(clientId)))) {
        toast.error('Error: ID de cliente inválido');
        setLoading(false);
        return;
      }

      // Preparar servicios con validación
      const serviciosData = formData.servicios.map(s => {
        const idEmpleado = mapProfesionalToId(s);
        
        // Validar que los IDs sean números válidos
        if (!s.servicioId || isNaN(Number(s.servicioId))) {
          throw new Error(`El servicio "${s.nombre}" no tiene un ID válido`);
        }
        if (!idEmpleado || isNaN(Number(idEmpleado))) {
          throw new Error(`El profesional del servicio "${s.nombre}" no tiene un ID válido`);
        }

        // Asegurar formato HH:MM:SS para hora_inicio
        let horaInicio = s.inicio;
        if (horaInicio.includes(':') && horaInicio.length === 5) {
          horaInicio = horaInicio + ':00';
        } else if (!horaInicio.includes(':')) {
          horaInicio = '08:00:00';
        }

        return {
          id_servicio: Number(s.servicioId),
          id_empleado: Number(idEmpleado),
          hora_inicio: horaInicio,
          cantidad: Number(s.cantidad) || 1,
          ...(s.observaciones && s.observaciones.trim() && { observaciones: s.observaciones.trim() })
        };
      });

      // Preparar datos para el backend según la estructura esperada
      // En edición, usar el estado del formulario
      const appointmentData = {
        cita: {
          id_cliente: Number(clientId),
          fecha_servicio: formData.fecha,
          hora_entrada: horaEntrada,
          estado: formData.estado,
          // Solo enviar motivo si tiene contenido, de lo contrario no enviarlo (el backend lo manejará como null)
          ...(formData.notas && formData.notas.trim() && { motivo: formData.notas.trim() })
        },
        servicios: serviciosData
      };

      console.log('=== DATOS DE LA CITA A ENVIAR ===');
      console.log('Appointment data to send:', JSON.stringify(appointmentData, null, 2));
      
      // Validación adicional de fecha antes de enviar
      const fechaServicio = appointmentData.cita.fecha_servicio;
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaCitaObj = new Date(fechaServicio + 'T00:00:00');
      fechaCitaObj.setHours(0, 0, 0, 0);
      
      console.log('Validación de fecha:', {
        fecha_servicio_string: fechaServicio,
        fecha_servicio_obj: fechaCitaObj.toISOString(),
        fecha_servicio_local: fechaCitaObj.toLocaleDateString('es-CO'),
        hoy_obj: hoy.toISOString(),
        hoy_local: hoy.toLocaleDateString('es-CO'),
        es_futura: fechaCitaObj >= hoy,
        diferencia_dias: Math.floor((fechaCitaObj - hoy) / (1000 * 60 * 60 * 24))
      });
      
      console.log('Validating data types:', {
        id_cliente: typeof appointmentData.cita.id_cliente,
        fecha_servicio: typeof appointmentData.cita.fecha_servicio,
        hora_entrada: typeof appointmentData.cita.hora_entrada,
        hora_entrada_value: appointmentData.cita.hora_entrada,
        estado: appointmentData.cita.estado,
        servicios: appointmentData.servicios.map(s => ({
          id_servicio: typeof s.id_servicio,
          id_empleado: typeof s.id_empleado,
          hora_inicio: typeof s.hora_inicio,
          hora_inicio_value: s.hora_inicio
        }))
      });
      console.log('=== FIN DATOS ===');

      // Actualizar la cita (solo edición)
      let result;
      try {
          result = await appointmentsService.update(cita.id_cita, appointmentData);
          toast.success('Cita editada correctamente');
      } catch (error) {
        console.error('=== ERROR AL GUARDAR LA CITA ===');
        console.error('Error completo:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response data (stringified):', JSON.stringify(error.response?.data, null, 2));
        console.error('Error response status:', error.response?.status);
        console.error('Datos que se intentaron enviar:', JSON.stringify(appointmentData, null, 2));
        
        // Log específico de la fecha
        if (appointmentData.cita.fecha_servicio) {
          const fechaEnviada = appointmentData.cita.fecha_servicio;
          const hoy = new Date().toISOString().slice(0, 10);
          console.error('Análisis de fecha:', {
            fecha_enviada: fechaEnviada,
            fecha_hoy: hoy,
            es_futura: fechaEnviada > hoy,
            es_hoy: fechaEnviada === hoy,
            es_pasada: fechaEnviada < hoy
          });
        }
        
        console.error('=== FIN ERROR ===');
        
        // Manejar errores del backend
        let errorMessage = 'Ocurrió un error al guardar la cita.';
        const statusCode = error.response?.status;
        
        if (error.response?.data) {
          const errorData = error.response.data;
          
          // Manejar error 409 (Conflict) - Conflicto de disponibilidad
          if (statusCode === 409) {
            // Priorizar el campo 'error' que contiene el mensaje detallado
            let baseMessage = '';
            if (errorData.error) {
              baseMessage = errorData.error;
            } else if (errorData.message) {
              baseMessage = errorData.message;
            } else {
              baseMessage = 'El empleado no tiene disponibilidad para la fecha y hora seleccionadas.';
            }
            
            // Limpiar el mensaje si tiene caracteres extra al final (como "}")
            baseMessage = baseMessage.replace(/\s*}\s*$/, '').trim();
            
            // Verificar si la fecha es hoy y agregar sugerencia específica
            const hoy = new Date().toISOString().slice(0, 10);
            const fechaSolicitada = appointmentData?.cita?.fecha_servicio;
            const esHoy = fechaSolicitada === hoy;
            
            let sugerencia = 'Verifica que el empleado tenga programación asignada para esta fecha en la sección de Programación de Empleados.';
            
            if (esHoy) {
              // Calcular fecha de mañana
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const fechaManana = tomorrow.toISOString().split('T')[0];
              
              sugerencia = `La programación del empleado podría iniciar desde mañana (${fechaManana}).\n\nSugerencias:\n1. Intenta crear la cita para mañana o una fecha futura\n2. Verifica que el empleado tenga programación asignada para hoy en la sección de Programación de Empleados\n3. Si la programación es recurrente, verifica que la fecha de inicio sea hoy o anterior`;
            }
            
            errorMessage = `${baseMessage}\n\n${sugerencia}`;
          }
          // Manejar error 400 (Bad Request) - Errores de validación
          else if (statusCode === 400) {
            // Si hay un mensaje general
            if (errorData.message) {
              errorMessage = errorData.message;
            }
            
            // Si hay errores de validación específicos
            if (errorData.errors && Array.isArray(errorData.errors)) {
              const validationErrors = errorData.errors.map(err => {
                if (typeof err === 'string') return err;
                if (err.message) return err.message;
                if (err.msg) return err.msg;
                if (err.field && err.message) return `${err.field}: ${err.message}`;
                return JSON.stringify(err);
              }).join('\n');
              
              if (validationErrors) {
                errorMessage = `Errores de validación:\n${validationErrors}`;
              }
            } else if (errorData.errors && typeof errorData.errors === 'object') {
              // Si errors es un objeto con campos específicos
              const validationErrors = Object.entries(errorData.errors)
                .map(([field, messages]) => {
                  const msg = Array.isArray(messages) ? messages.join(', ') : messages;
                  return `${field}: ${msg}`;
                })
                .join('\n');
              
              if (validationErrors) {
                errorMessage = `Errores de validación:\n${validationErrors}`;
              }
            }
            
            // También verificar si hay un campo 'error' con información adicional
            if (errorData.error && !errorMessage.includes(errorData.error)) {
              errorMessage = errorData.error;
            }
          }
          // Otros errores
          else {
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Mostrar error en múltiples líneas si es necesario
        toast.error(errorMessage, { 
          duration: 8000,
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '500px'
          }
        });
        
        // También mostrar un alert más visible para errores de disponibilidad
        if (statusCode === 409) {
          // Separar el mensaje principal de la sugerencia
          const messageParts = errorMessage.split('\n\n');
          const mainMessage = messageParts[0];
          const suggestion = messageParts[1] || '';
          
          Swal.fire({
            icon: 'warning',
            title: 'Conflicto de disponibilidad',
            html: `
              <div style="text-align: left;">
                <p style="margin-bottom: ${suggestion ? '15px' : '0'}; font-weight: 500;">
                  ${mainMessage}
                </p>
                ${suggestion ? `
                  <p style="margin: 0; color: #666; font-size: 0.9em; font-style: italic;">
                    ${suggestion}
                  </p>
                ` : ''}
              </div>
            `,
            confirmButtonText: 'Entendido',
            width: '500px'
          });
        }
        
        setLoading(false);
        return;
      }

      // Solo cerrar y guardar si todo fue exitoso
      onSave();
      onClose();
    } catch (error) {
      console.error('Error inesperado al procesar la cita:', error);
      toast.error(error.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="flex-none bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-pencil-square text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Editar Cita</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Componente de selección de servicios */}
            <ServiceSelection
              servicios={formData.servicios}
              onServicesChange={(newServicios) => {
                setFormData(prev => ({ ...prev, servicios: newServicios }));
                setTouchedFields(prev => ({ ...prev, servicios: true }));
                clearError('servicios');
              }}
              fecha={formData.fecha}
              existingAppointments={existingAppointments}
              errors={errors}
              onErrorsChange={setErrors}
              touchedFields={touchedFields}
              estado={formData.estado}
            />

            {/* Datos del cliente y resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                <input
                  type="text"
                  value={formData.tipoDocumento}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento</label>
                <input
                  type="text"
                  value={formData.documento}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente</label>
                <input
                  type="text"
                  value={formData.cliente}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.correo}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={e => handleFieldChange('fecha', e.target.value)}
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
                  {APPOINTMENT_STATES
                    .filter(estado => {
                      // Al editar, permitir todos los estados excepto algunos finales
                      return !['Pagada', 'Finalizada'].includes(estado.nombre);
                    })
                    .map(estado => (
                      <option key={estado.nombre} value={estado.nombre}>{estado.nombre}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hora inicio</label>
                <input type="text" value={convertirHoraA12Horas(resumen.inicio)} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hora fin</label>
                <input
                  type="text"
                  value={convertirHoraA12Horas(resumen.fin) || ''}
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
          </form>
        </div>

        {/* Footer fijo */}
        <div className="flex-none bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            onClick={onClose}
          >
            <i className="bi bi-x-circle"></i>
            Cancelar
          </button>
          <button
            type="submit"
            form="appointment-form"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-gray-800 border-t-transparent rounded-full"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle-fill"></i>
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

AppointmentEditModal.propTypes = {
  cita: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AppointmentEditModal;