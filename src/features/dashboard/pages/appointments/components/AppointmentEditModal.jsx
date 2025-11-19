import { useState, useEffect } from 'react';
 
import PropTypes from 'prop-types';
import appointmentsService from '../API/appointmentsService';
import { isValidDocumentByType } from '@/shared/validations';
import usersService from '@/features/dashboard/pages/users/API/usersService';
import { getAllServices } from '@/features/landing/pages/ServicesPage/api/servicesApi';
import { employeesService } from '@/features/dashboard/pages/employees/API/employeesService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../users/components/phoneinput-search.css';

const APPOINTMENT_STATES = [
  { nombre: 'Agendada', descripcion: 'La cita ha sido creada por el cliente.' },
  { nombre: 'Confirmada', descripcion: 'El establecimiento ha confirmado la disponibilidad.' },
];

import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

function limpiarPrecio(valor) {
  return Number(String(valor).replace(/[^\d]/g, '')) || 0;
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const AppointmentEditModal = ({ cita, fecha, onClose, onSave }) => {
  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [numero, setNumero] = useState('');

  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    correo: '',
    documento: '',
    tipoDocumento: 'CC',

    fecha: fecha || '',
    servicios: [],
    estado: 'Agendada',
    notas: ''
  });

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar servicios desde el backend
        const servicesData = await getAllServices();
        // Filtrar solo servicios activos y normalizar al formato esperado
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
        setServices(normalizedServices);

        // Cargar empleados desde el backend
        const employeesData = await employeesService.getAll();
        // Filtrar solo empleados activos y convertir a formato de profesionales
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
        // En caso de error, usar arrays vacíos
        setServices([]);
        setProfessionals([]);

      }
    };
    loadData();
  }, []);

  // Función para parsear teléfono desde el backend (igual que en proveedores)
  const parsePhoneFromBackend = (telefono) => {
    if (!telefono) return '';
    // Remover el símbolo + y retornar solo números
    return telefono.replace(/[^0-9]/g, '');
  };

  // Cargar datos de edición
  useEffect(() => {
    if (cita) {
      console.log('Loading appointment data for editing:', cita);
      const telefono = cita.usuario?.telefono || cita.cliente?.telefono || '';
      const telefonoLimpio = telefono.replace(/[^0-9]/g, '');
      setNumero(telefonoLimpio);
      setFormData({
        cliente: cita.usuario?.nombre || cita.cliente?.nombre || '',
        telefono: telefono,
        correo: cita.usuario?.correo || cita.cliente?.correo || '',
        documento: cita.usuario?.documento || cita.cliente?.documento || '',
        fecha: cita.fecha_servicio || fecha || '',
        estado: cita.estado || 'Agendada',
        servicios: (cita.servicios || []).map(s => {
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
            fin: s.hora_finalizacion ? (s.hora_finalizacion.includes(':') ? s.hora_finalizacion.substring(0, 5) : s.hora_finalizacion) : calcularHoraFin(horaInicio, duracion),
            duracion: duracion,
          precio: s.precio_unitario || s.precio || 0,
          cantidad: s.cantidad || 1,
          observaciones: s.observaciones || ''
          };
        }),
        notas: cita.motivo || ''
      });

      setErrors({});
      setTouchedFields({});
    }
  }, [cita, fecha]);

  // Actualizar fecha cuando cambia (modo creación)
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
    setTouchedFields(prev => ({ ...prev, servicios: true }));
    clearError('servicios');
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index)
    }));
  };

  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

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

  // Busca cliente por documento y autocompleta
  const lookupClientByDocument = async (doc) => {
    try {
      if (!doc || doc.length < 6) return;
      const res = await usersService.getAll({ documento: doc });
      const list = (res && res.data) ? res.data : [];
      const match = list.find(u => (u.documento || '').toString().trim() === doc);
      if (match) {
        setFormData(prev => ({
          ...prev,
          cliente: match.nombre || prev.cliente,
          correo: match.correo || prev.correo,
          documento: match.documento || prev.documento,
          tipoDocumento: match.tipo_documento || prev.tipoDocumento,
        }));
        const phone = (match.telefono || '').replace(/[^0-9]/g, '');
        if (phone) setNumero(phone);
        toast.success('Cliente encontrado');
      } else {
        toast('Registre los datos del nuevo cliente');
      }
    } catch (e) {
      console.error('Lookup error:', e);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);

    // Autocompletar al salir del documento
    if (field === 'documento' && value && value.length >= 6) {
      lookupClientByDocument(value);
    }

    if (touchedFields[field]) {
      setTimeout(() => {
        validateField(field);
      }, 300);
    }
  };

  const updateService = (index, field, value) => {
    setFormData(prev => {
      const newServicios = [...prev.servicios];
      newServicios[index] = { ...newServicios[index], [field]: value };
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
  // Nota: Esta función está disponible pero deshabilitada temporalmente
  // eslint-disable-next-line no-unused-vars
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
    const hoyISO = new Date().toISOString().slice(0,10);
    const esHoy = formData.fecha === hoyISO;
    const ahora = new Date();
    const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
    for (let h = 6; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        // Verificar si esta hora se solapa con otro servicio del mismo profesional
        let disponible = true;
        const inicioA = h * 60 + m;
        const finA = inicioA + Number(duracion);
        if (esHoy && inicioA <= ahoraMin) {
          disponible = false;
        }
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

  // Función para buscar o crear cliente por documento
  const findOrCreateClient = async (clientName, clientPhone, clientEmail, clientDocument) => {
    try {
      console.log('Buscando cliente por documento:', clientDocument);

      // Buscar usuario existente por documento
      const searchResponse = await usersService.getAll({ documento: clientDocument.trim() });

      console.log('Respuesta de búsqueda por documento:', searchResponse);

      if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        // Encontrar usuario que coincida exactamente por documento
        const existingUser = searchResponse.data.find(user => {
          const userDoc = user.documento?.toString().trim() || '';
          const searchDoc = clientDocument.trim();
          return userDoc === searchDoc;
        });

        if (existingUser) {
          console.log('Cliente encontrado por documento:', existingUser);
          return existingUser.id_usuario || existingUser.id;
        }
      }

      // Si no se encontró, crear nuevo usuario/cliente
      console.log('Cliente no encontrado, creando nuevo usuario...');

      // Generar contraseña temporal aleatoria
      const generateTempPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        // Asegurar al menos una mayúscula, una minúscula, un número y un carácter especial
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
        // Completar hasta 12 caracteres
        for (let i = password.length; i < 12; i++) {
          password += chars[Math.floor(Math.random() * chars.length)];
        }
        // Mezclar caracteres
        return password.split('').sort(() => Math.random() - 0.5).join('');
      };

      // Generar datos que cumplan con las validaciones del backend
      const cleanName = clientName.trim();
      const cleanPhone = '+' + String(clientPhone).replace(/[^0-9]/g, '');
      const cleanEmail = clientEmail.trim();
      const cleanDocument = clientDocument.trim();
      const tempPassword = generateTempPassword();

      const newUserData = {
        nombre: cleanName,
        telefono: cleanPhone, // Formato: +573001234567
        correo: cleanEmail,
        contrasena: tempPassword, // Contraseña temporal generada
        tipo_documento: formData.tipoDocumento || 'CC',
        documento: cleanDocument,
        roleId: 2, // Rol de cliente
        estado: 'Activo',
        sendEmail: true, // Indicar que se debe enviar correo
        tempPassword: tempPassword // Pasar contraseña temporal para el correo
      };

      console.log('Datos del nuevo usuario:', { ...newUserData, contrasena: '***', tempPassword: '***' });

      const createResponse = await usersService.create(newUserData);
      if (createResponse.success && createResponse.data) {
        console.log('Nuevo cliente creado:', createResponse.data);
        // Retornar ID del usuario creado

        return createResponse.data.id_usuario || createResponse.data.id;
      }

      return 1; // ID por defecto
    } catch (error) {
      console.error('Error en findOrCreateClient:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let newErrors = {};
    newErrors.cliente = !formData.cliente.trim() ? 'El nombre del cliente es requerido' : '';
    newErrors.telefono = validarTelefono(numero);
    newErrors.correo = validarCorreo(formData.correo);
    newErrors.documento = validarDocumento(formData.documento);
    newErrors.fecha = validarFecha(formData.fecha);
    if (formData.servicios.length === 0) {
      newErrors.servicios = 'Debe agregar al menos un servicio';
    }

    setTouchedFields({
      cliente: true,
      telefono: true,
      correo: true,
      fecha: true,
      servicios: true
    });

    // Validación de hora contra el tiempo actual si es el mismo día
    try {
      const hoyISO = new Date().toISOString().slice(0,10);
      if (formData.fecha === hoyISO && formData.servicios.length > 0) {
        const ahora = new Date();
        const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
        const earliest = Math.min(...formData.servicios.map(s => {
          const [hh, mm] = (s.inicio || '00:00').split(':').map(Number);
          return hh*60+mm;
        }));
        if (earliest <= ahoraMin) {
          const msg = `La hora debe ser posterior a ${ahora.toTimeString().slice(0,5)}`;
          newErrors.servicios = msg;
          toast.error(msg);
        } else if (earliest - ahoraMin <= 30) {
          toast('Atención: la hora seleccionada es muy próxima.');
        }
      }
    } catch {}

    setErrors(newErrors);

    console.log('Errores detectados:', newErrors);
    console.log('FormData:', formData);
    console.log('Número de teléfono:', numero);

    if (Object.values(newErrors).some(Boolean)) {
      Swal.fire('Error', 'Por favor corrige los errores en el formulario antes de guardar.', 'error');
      return;
    }

    setLoading(true);+
    
    const appointmentPromise = (async () => {
      // Buscar o crear cliente por documento
      console.log('Iniciando búsqueda/creación de cliente para:', formData.cliente, formData.documento);
      const clientResult = await findOrCreateClient(
        formData.cliente, 
        numero, 
        formData.correo, 
        formData.documento
      );
      
      // clientResult ahora siempre es un ID numérico
      const clientId = clientResult;
      
      console.log('Client ID obtenido:', clientId);

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
      const horaEntrada = primeraHora.includes(':') && primeraHora.length === 5 ? primeraHora + ':00' : primeraHora;
      const appointmentData = {
        cita: {
          id_cliente: clientId,
          fecha_servicio: formData.fecha,
          hora_entrada: horaEntrada, // Agregar hora_entrada requerida
          estado: formData.estado,
          ...(formData.notas && { motivo: formData.notas.trim() })
        },
        servicios: formData.servicios.map(s => ({
          id_servicio: s.servicioId,
          id_empleado: mapProfesionalToId(s),
          hora_inicio: s.inicio.includes(':') && s.inicio.length === 5 ? s.inicio + ':00' : s.inicio,
          cantidad: s.cantidad || 1,
          ...(s.observaciones && { observaciones: s.observaciones })
        }))
      };

      console.log('Datos a enviar:', JSON.stringify(appointmentData, null, 2));

      if (cita) {
        appointmentData.cita.id_cliente = cita.id_cliente;
        result = await appointmentsService.update(cita.id_cita, appointmentData);
      } else {
        result = await appointmentsService.create(appointmentData);

      }

      // Validación de conflictos en tiempo real posterior (informativa)
      try {
        const res = await appointmentsService.getAll({ fecha_servicio: formData.fecha });
        const citas = (res && res.data && res.data.citas) ? res.data.citas : [];
        const conflicto = citas.some(c => (c.servicios||[]).some(s => appointmentData.servicios.some(ns => ns.id_empleado === (s.id_empleado||s.empleado?.id_usuario) && ns.hora_inicio === (s.hora_inicio||''))));
        if (conflicto) {
          toast('Se detectó una posible coincidencia de horario. El backend confirmará disponibilidad.');
        }
      } catch {}

      onSave();
      onClose();
      return result;
    })();

    toast.promise(appointmentPromise, {
      loading: cita ? 'Actualizando cita...' : 'Creando cita...',
      success: cita ? 'Cita editada correctamente' : 'Cita registrada correctamente',
      error: (err) => {
        console.error('Error saving appointment:', err);
        return err.response?.data?.message || err.message || 'Ocurrió un error al guardar la cita.';
      },
    });

    try {
      await appointmentPromise;
    } catch {

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm select-none font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className={`bi ${cita ? 'bi-pencil-square' : 'bi-plus-circle'} text-lg`}></i></div><h2 className="text-xl font-bold m-0">{cita ? 'Editar' : 'Crear'} Cita</h2></div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items.center justify.center text-lg font-bold transition-all duration-200" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <form onSubmit={handleSubmit} id="appointment-form" className="space-y-4">
          {/* Buscador de servicios */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1">Buscar Servicio <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={serviceQuery}
              onChange={e => setServiceQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Buscar por nombre de servicio..."
            />
            {filteredServices.length > 0 && (
              <div className="bg-white border rounded shadow mt-2 max-h-40 overflow-y-auto">
                {filteredServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50">
                    <div>
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.duration} min ${service.price}</div>
                    </div>
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      onClick={() => handleAddService(service)}
                    >Agregar</button>
                  </div>
                ))}
              </div>
            )}
            {touchedFields.servicios && errors.servicios && <span className="text-red-500 text-xs mt-1">{errors.servicios}</span>}
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
                        onChange={e => {
                          const selectedProfessional = professionals.find(p => p.name === e.target.value);
                          updateService(idx, 'profesional', e.target.value);
                          if (selectedProfessional) {
                            updateService(idx, 'id_empleado', selectedProfessional.id);
                          }
                        }}
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
                </div>
              </div>
            ))}
          </div>

          {/* Datos del cliente */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento <span className="text-red-500">*</span></label>
              <select
                value={formData.tipoDocumento}
                onChange={e => handleFieldChange('tipoDocumento', e.target.value)}
                onFocus={() => clearError('tipoDocumento')}
                onBlur={() => handleFieldBlur('tipoDocumento')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.tipoDocumento && errors.tipoDocumento ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar</option>
                {['RC','TI','CC','TE','CE','NIT','PP','PEP','DIE','NUIP','FOREIGN_NIT'].map(type => (
                  <option key={type} value={type}>{`${type} - ${{
                    RC:'Registro civil',TI:'Tarjeta de identidad',CC:'Cedula de ciudadania',TE:'Tarjeta de extranjeria',CE:'Cedula de extranjeria',NIT:'Número de identificación tributaria',PP:'Pasaporte',PEP:'Permiso especial de permanencia',DIE:'Documento de identificación extranjero',NUIP:'NUIP',FOREIGN_NIT:'NIT de otro país'
                  }[type]}`}</option>
                ))}
              </select>
              {touchedFields.tipoDocumento && errors.tipoDocumento && <p className="text-red-500 text-xs mt-1">{errors.tipoDocumento}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.documento}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  handleFieldChange('documento', val);
                }}
                onFocus={() => clearError('documento')}
                onBlur={() => handleFieldBlur('documento')}
                maxLength={15}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.documento && errors.documento ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Número de documento (6-15 dígitos)"
              />
              {touchedFields.documento && errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.cliente}
                onChange={e => handleFieldChange('cliente', e.target.value)}
                onBlur={() => handleFieldBlur('cliente')}
                className={`w-full px-3 py-2 border rounded-md ${touchedFields.cliente && errors.cliente ? 'border-red-500' : ''}`}
                placeholder="Nombre completo"
              />
              {touchedFields.cliente && errors.cliente && <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
              <PhoneInput
                country={'co'}
                value={numero}
                onChange={(value) => {
                  setNumero(value);
                  handleFieldBlur('telefono');
                }}
                onFocus={() => clearError('telefono')}
                onBlur={() => handleFieldBlur('telefono')}
                inputClass={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.telefono && errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                containerClass="w-full"
                inputProps={{
                  name: 'telefono',
                  required: true,
                  placeholder: 'Ej: 3001234567',
                }}
                specialLabel=""
              />
              {touchedFields.telefono && errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              {numero && !errors.telefono && (
                <p className="text-green-600 text-xs mt-1">✓ Teléfono: +{numero}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={formData.correo}
                onChange={e => handleFieldChange('correo', e.target.value)}
                onFocus={() => clearError('correo')}
                onBlur={() => handleFieldBlur('correo')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.correo && errors.correo ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="correo@ejemplo.com"
              />
              {touchedFields.correo && errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.fecha}
                onChange={e => handleFieldChange('fecha', e.target.value)}
                onBlur={() => handleFieldBlur('fecha')}
                className={`w-full px-3 py-2 border rounded-md ${touchedFields.fecha && errors.fecha ? 'border-red-500' : ''}`}
              />
              {touchedFields.fecha && errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <span className="text-xs text-gray-600">Hora inicio</span>
              <div className="font-semibold">{resumen.inicio || '--:--'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">Hora fin</span>
              <div className="font-semibold">{resumen.fin || '--:--'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">Duración</span>
              <div className="font-semibold">{resumen.duracion} min</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">Valor total</span>
              <div className="font-semibold text-green-600">${resumen.total}</div>
            </div>
          </div>
        </form>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-x-circle"></i>Cancelar</button>
          <button type="submit" form="appointment-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2">{loading ? 'Guardando...' : (cita ? 'Guardar cambios' : 'Crear cita')}</button>
        </div>
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
