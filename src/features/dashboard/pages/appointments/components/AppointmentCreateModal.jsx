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
import { toBackendDocCode } from '../../../../../shared/constants/documentTypes';

// Estados posibles de la cita (solo para crear)
const APPOINTMENT_STATES = [
  { nombre: 'Agendada', descripcion: 'La cita ha sido creada por el cliente.' },
  { nombre: 'Confirmada', descripcion: 'El establecimiento ha confirmado la disponibilidad.' },
];
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

function limpiarPrecio(valor) {
  return Number(String(valor).replace(/[^\d]/g, '')) || 0;
}


const AppointmentCreateModal = ({ fecha, onClose, onSave }) => {
  // Estados para el buscador
  const [serviceQuery, setServiceQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [numero, setNumero] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // Formulario principal
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

  // Cargar datos necesarios desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar servicios desde el backend
        const servicesData = await getAllServices();
        console.log('Servicios recibidos de la API:', servicesData);
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
        console.log('Servicios normalizados:', normalizedServices);
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

  // useEffect para actualizar la fecha cuando cambia la prop fecha
  useEffect(() => {
    if (fecha) {
      setFormData(prev => ({
        ...prev,
        fecha
      }));
    }
  }, [fecha]);

  // Buscador en tiempo real
  useEffect(() => {
    if (services.length === 0) {
      setFilteredServices([]);
      return;
    }

    if (serviceQuery.trim() === '') {
      // Si no hay texto de búsqueda, mostrar los primeros 4 servicios
      const firstFour = services.slice(0, 4);
      console.log('Mostrando primeros 4 servicios:', firstFour);
      setFilteredServices(firstFour);
    } else {
      // Si hay búsqueda, filtrar y limitar a 4
      const filtered = services.filter(s =>
        s.name.toLowerCase().includes(serviceQuery.toLowerCase())
      ).slice(0, 4);
      console.log('Servicios filtrados:', filtered);
      setFilteredServices(filtered);
    }
  }, [serviceQuery, services]);

  // Actualizar filteredServices cuando se muestra el dropdown
  useEffect(() => {
    if (showServiceDropdown && services.length > 0 && serviceQuery.trim() === '') {
      console.log('Dropdown activado, actualizando servicios filtrados');
      const firstFour = services.slice(0, 4);
      if (firstFour.length > 0) {
        setFilteredServices(firstFour);
      }
    }
  }, [showServiceDropdown, services, serviceQuery]);

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
    setShowServiceDropdown(false);
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

  // Busca cliente por documento y autocompleta
  const lookupClientByDocument = async (doc) => {
    try {
      const searchResponse = await usersService.getAll({ documento: doc.trim() });
      if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        const existingUser = searchResponse.data.find(user => {
          const userDoc = user.documento?.toString().trim() || '';
          return userDoc === doc.trim();
        });
        if (existingUser) {
          setFormData(prev => ({
            ...prev,
            cliente: existingUser.nombre || prev.cliente,
            correo: existingUser.correo || prev.correo,
            tipoDocumento: existingUser.tipo_documento || prev.tipoDocumento
          }));
          const telefono = existingUser.telefono || '';
          const telefonoLimpio = telefono.replace(/[^0-9]/g, '');
          if (telefonoLimpio) {
            setNumero(telefonoLimpio);
          }
        }
      }
    } catch (error) {
      console.error('Error looking up client by document:', error);
    }
  };

  // Validación en tiempo real para campos individuales
  const handleFieldChange = (field, value) => {
    // Actualizar el valor del campo
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error si existe
    clearError(field);

    // Autocompletar al salir del documento
    if (field === 'documento' && value && value.length >= 6) {
      lookupClientByDocument(value);
    }

    // Validar en tiempo real solo si el campo ya fue tocado
    if (touchedFields[field]) {
      // Usar un timeout para no validar en cada keystroke
      setTimeout(() => {
        validateField(field);
      }, 300);
    }
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
    hoy.setHours(0, 0, 0, 0);
    // Normalizar la fecha de la cita para evitar problemas de zona horaria
    // Si la fecha viene como string (YYYY-MM-DD), crear la fecha en hora local
    const fechaCita = new Date(fecha + 'T00:00:00');
    fechaCita.setHours(0, 0, 0, 0);
    // Permitir fecha actual (hoy)
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

  // Generar opciones de hora disponibles para un servicio
  function getHorasDisponibles(idx, profesional, duracion) {
    if (!profesional) return [];
    const horas = [];
    const hoyISO = new Date().toISOString().slice(0, 10);
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
        tipo_documento: toBackendDocCode(formData.tipoDocumento || 'CC'),
        documento: cleanDocument,
        roleId: 3, // Rol de cliente
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

      throw new Error('No se pudo crear el cliente');
    } catch (error) {
      console.error('Error en findOrCreateClient:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  // Guardar cita
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
    try {
      const hoyISO = new Date().toISOString().slice(0, 10);
      if (formData.fecha === hoyISO && formData.servicios.length > 0) {
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
      // Buscar o crear cliente por documento
      console.log('Iniciando búsqueda/creación de cliente para:', formData.cliente, formData.documento);
      let clientId;
      try {
        const clientResult = await findOrCreateClient(
          formData.cliente,
          numero,
          formData.correo,
          formData.documento
        );
        clientId = clientResult;
        console.log('Client ID obtenido:', clientId);
      } catch (error) {
        console.error('Error en findOrCreateClient:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error al buscar o crear el cliente';
        toast.error(errorMessage);
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
      // Al crear una cita nueva, siempre usar "Agendada" como estado inicial
      const appointmentData = {
        cita: {
          id_cliente: Number(clientId),
          fecha_servicio: formData.fecha,
          hora_entrada: horaEntrada,
          estado: formData.estado || 'Agendada',
          // Solo enviar motivo si tiene contenido, de lo contrario no enviarlo (el backend lo manejará como null)
          ...(formData.notas && formData.notas.trim() && { motivo: formData.notas.trim() })
        },
        servicios: serviciosData
      };

      console.log('=== DATOS DE LA CITA A ENVIAR ===');
      console.log('Appointment data to send:', JSON.stringify(appointmentData, null, 2));

      // Crear la cita
      let result;
      try {
        result = await appointmentsService.create(appointmentData);
        toast.success('Cita registrada correctamente');
      } catch (error) {
        console.error('=== ERROR AL GUARDAR LA CITA ===');
        console.error('Error completo:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response data (stringified):', JSON.stringify(error.response?.data, null, 2));
        console.error('Error response status:', error.response?.status);
        console.error('Datos que se intentaron enviar:', JSON.stringify(appointmentData, null, 2));
        
        // Manejar errores del backend
        let errorMessage = 'Ocurrió un error al guardar la cita.';
        const statusCode = error.response?.status;
        
        if (error.response?.data) {
          const errorData = error.response.data;
          
          // Manejar error 409 (Conflict) - Conflicto de disponibilidad
          if (statusCode === 409) {
            let baseMessage = '';
            if (errorData.error) {
              baseMessage = errorData.error;
            } else if (errorData.message) {
              baseMessage = errorData.message;
            } else {
              baseMessage = 'El empleado no tiene disponibilidad para la fecha y hora seleccionadas.';
            }
            
            baseMessage = baseMessage.replace(/\s*}\s*$/, '').trim();
            
            const hoy = new Date().toISOString().slice(0, 10);
            const fechaSolicitada = appointmentData?.cita?.fecha_servicio;
            const esHoy = fechaSolicitada === hoy;
            
            let sugerencia = 'Verifica que el empleado tenga programación asignada para esta fecha en la sección de Programación de Empleados.';
            
            if (esHoy) {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const fechaManana = tomorrow.toISOString().split('T')[0];
              
              sugerencia = `La programación del empleado podría iniciar desde mañana (${fechaManana}).\n\nSugerencias:\n1. Intenta crear la cita para mañana o una fecha futura\n2. Verifica que el empleado tenga programación asignada para hoy en la sección de Programación de Empleados\n3. Si la programación es recurrente, verifica que la fecha de inicio sea hoy o anterior`;
            }
            
            errorMessage = `${baseMessage}\n\n${sugerencia}`;
          }
          // Manejar error 400 (Bad Request) - Errores de validación
          else if (statusCode === 400) {
            if (errorData.message) {
              errorMessage = errorData.message;
            }
            
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
            
            if (errorData.error && !errorMessage.includes(errorData.error)) {
              errorMessage = errorData.error;
            }
          }
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
        
        toast.error(errorMessage, { 
          duration: 8000,
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '500px'
          }
        });
        
        if (statusCode === 409) {
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
              <i className="bi bi-plus-circle text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Crear Cita</h2>
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
            {/* Buscador de servicios */}
            <div className="mb-4 relative">
              <label className="block text-xs font-medium text-text-main mb-1">Buscar Servicio <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={serviceQuery}
                onChange={e => {
                  setServiceQuery(e.target.value);
                  setShowServiceDropdown(true);
                }}
                onFocus={() => {
                  console.log('Campo enfocado, mostrando dropdown');
                  console.log('Servicios disponibles:', services.length);
                  console.log('Servicios filtrados:', filteredServices.length);
                  // Asegurar que filteredServices tenga los primeros 4 si está vacío
                  if (filteredServices.length === 0 && services.length > 0) {
                    setFilteredServices(services.slice(0, 4));
                  }
                  setShowServiceDropdown(true);
                }}
                onBlur={() => {
                  // Delay para permitir click en las opciones
                  setTimeout(() => setShowServiceDropdown(false), 200);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Buscar por nombre de servicio..."
              />
              {showServiceDropdown && services.length > 0 && filteredServices.length > 0 && (
                <div 
                  className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()}
                  style={{ top: '100%' }}
                >
                  {filteredServices.map(service => (
                    <div 
                      key={service.id} 
                      className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-800">{service.name}</div>
                        {service.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{service.description}</div>
                        )}
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">{service.duration} min</span> • <span className="font-medium">${service.price}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark text-sm transition-colors flex-shrink-0 ml-2"
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
                            <option key={opt.hora} value={opt.hora} disabled={!opt.disponible} style={!opt.disponible ? { color: '#aaa' } : {}}>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento <span className="text-red-500">*</span></label>
                <select
                  value={formData.tipoDocumento}
                  onChange={e => handleFieldChange('tipoDocumento', e.target.value)}
                  onFocus={() => clearError('tipoDocumento')}
                  onBlur={() => handleFieldBlur('tipoDocumento')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.tipoDocumento && errors.tipoDocumento ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar</option>
                  {['RC', 'TI', 'CC', 'TE', 'CE', 'NIT', 'PP', 'PEP', 'DIE', 'NUIP', 'FOREIGN_NIT'].map(type => (
                    <option key={type} value={type}>{`${type} - ${{
                      RC: 'Registro civil', TI: 'Tarjeta de identidad', CC: 'Cedula de ciudadania', TE: 'Tarjeta de extranjeria', CE: 'Cedula de extranjeria', NIT: 'Número de identificación tributaria', PP: 'Pasaporte', PEP: 'Permiso especial de permanencia', DIE: 'Documento de identificación extranjero', NUIP: 'NUIP', FOREIGN_NIT: 'NIT de otro país'
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
                  onFocus={() => clearError('cliente')}
                  onBlur={() => handleFieldBlur('cliente')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.cliente && errors.cliente ? 'border-red-500' : 'border-gray-300'}`}
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
                <p className="text-xs text-gray-500 mt-1">
                  Las citas nuevas se crean con estado "Agendada" por defecto
                </p>
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
                Crear cita
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

AppointmentCreateModal.propTypes = {
  fecha: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AppointmentCreateModal;



