import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import appointmentsService from '../API/appointmentsService';
import { isValidDocumentByType, formatNIT } from '@/shared/validations';
import usersService from '@/features/dashboard/pages/users/API/usersService';
import { employeesService, recurringSchedulingService } from '@/features/dashboard/pages/employees/API/employeesService';
import ServiceSelection from './ServiceSelection';
import PhoneInput from 'react-phone-input-2';
import { toBackendDocCode } from '../../../../../shared/constants/documentTypes';
import { useAuth } from '@/shared/contexts/AuthContext';

// Estados posibles de la cita (solo para crear)
const APPOINTMENT_STATES = [
  { nombre: 'Agendada', descripcion: 'La cita ha sido creada por el cliente.' },
  { nombre: 'Confirmada', descripcion: 'El establecimiento ha confirmado la disponibilidad.' },
];
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { parseFormattedNumber, formatPrice } from '../../../../../shared/utils/formatters';


const AppointmentCreateModal = ({ fecha, onClose, onSave }) => {
  // Obtener usuario actual
  const { currentUser } = useAuth();
  
  // Estados
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [numero, setNumero] = useState('');
  const dataLoadedRef = useRef(false);

  // Formulario principal
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    correo: '',
    documento: '',
    tipoDocumento: 'CC',
    fecha: fecha || (() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    })(),
    servicios: [],
    estado: 'Agendada',
    notas: ''
  });

  // Cargar datos necesarios desde el backend
  useEffect(() => {
    // Evitar múltiples llamadas
    if (dataLoadedRef.current) {
      return;
    }

    const loadData = async () => {
      try {
        dataLoadedRef.current = true;
        
        // Cargar empleados desde el backend
        let employeesData = [];
        try {
          const response = await employeesService.getAll();
          console.log('📋 Respuesta de employeesService.getAll():', response);
          
          // Manejar diferentes estructuras de respuesta
          if (Array.isArray(response)) {
            employeesData = response;
          } else if (response?.data && Array.isArray(response.data)) {
            employeesData = response.data;
          } else if (response?.success && Array.isArray(response.data)) {
            employeesData = response.data;
          } else {
            console.warn('⚠️ Formato de respuesta inesperado:', response);
            employeesData = [];
          }
          
          console.log('👥 Empleados procesados:', employeesData.length, employeesData);
        } catch (error) {
          console.error('❌ Error al cargar empleados:', error);
          toast.error('Error al cargar empleados. Por favor, intenta nuevamente.');
          employeesData = [];
        }
        
        // Obtener programaciones recurrentes activas
        let employeesWithSchedule = new Set();
        try {
          const allSchedules = await recurringSchedulingService.getAll();
          const schedulesArray = Array.isArray(allSchedules) 
            ? allSchedules 
            : (allSchedules?.data || []);
          
          employeesWithSchedule = new Set(
            schedulesArray
              .filter(schedule => schedule.estado === 'Activa' || schedule.estado === 'Activo')
              .map(schedule => schedule.id_usuario || schedule.idUsuario)
              .filter(Boolean)
          );
          console.log('📅 Empleados con programación:', employeesWithSchedule.size);
        } catch (error) {
          console.warn('⚠️ Error obteniendo programaciones:', error);
          // Si hay error (incluyendo 401), usar Set vacío para mostrar todos los empleados activos
          employeesWithSchedule = new Set();
        }
        
        // Filtrar solo empleados activos
        // Si hay programaciones obtenidas, filtrar solo los que tienen programación
        // Si no se pudieron obtener programaciones, mostrar todos los empleados activos
        const normalizedProfessionals = employeesData
          .filter(emp => {
            if (!emp) return false;
            const isActive = emp.estado === 'Activo' || emp.estado === true;
            if (!isActive) return false;
            
            // Si no se pudieron obtener programaciones, mostrar todos los activos
            if (employeesWithSchedule.size === 0) return true;
            
            // Si se obtuvieron programaciones, filtrar solo los que tienen programación
            const empId = emp.id_empleado ?? emp.id_usuario ?? emp.id;
            return employeesWithSchedule.has(empId);
          })
          .map(emp => ({
            id: emp.id_empleado ?? emp.id_usuario ?? emp.id,
            name: emp.nombre || emp.name || 'Sin nombre',
            active: emp.estado === 'Activo' || emp.estado === true
          }));
        
        console.log('✅ Profesionales normalizados:', normalizedProfessionals.length, normalizedProfessionals);
        setProfessionals(normalizedProfessionals);
      } catch (error) {
        console.error('❌ Error loading data:', error);
        toast.error('Error al cargar profesionales');
        // En caso de error, usar arrays vacíos
        setProfessionals([]);
        dataLoadedRef.current = false; // Permitir reintento en caso de error
      }
    };
    loadData();

    // Cleanup: resetear el ref cuando el componente se desmonte
    return () => {
      dataLoadedRef.current = false;
    };
  }, []);

  // useEffect para actualizar la fecha cuando cambia la prop fecha
  useEffect(() => {
    if (fecha) {
      setFormData(prev => ({
        ...prev,
        fecha
      }));
    } else {
      // Si la prop fecha es null o undefined, asegurar que se use la fecha de hoy
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha: todayStr
      }));
    }
  }, [fecha]);


  // Handler para cambios en servicios desde ServiceSelection
  const handleServicesChange = (newServicios) => {
    setFormData(prev => ({ ...prev, servicios: newServicios }));
    setTouchedFields(prev => ({ ...prev, servicios: true }));
    clearError('servicios');
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
    // Si cambia el tipo de documento, limpiar el documento para evitar conflictos
    if (field === 'tipoDocumento') {
      setFormData(prev => ({ ...prev, [field]: value, documento: '' }));
      clearError('documento');
      clearError('tipoDocumento');
      return;
    }

    // Manejo especial para el campo documento según el tipo
    if (field === 'documento') {
      let processedValue = value;
      
      // Aplicar restricciones según el tipo de documento
      if (formData.tipoDocumento === 'NIT') {
        // Permitir números, guiones y puntos para NIT
        processedValue = value.replace(/[^0-9.-]/g, '');
        // Formatear NIT automáticamente
        processedValue = formatNIT(processedValue);
      } else if (formData.tipoDocumento === 'PP') {
        // Permitir letras y números para pasaporte
        processedValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      } else {
        // Solo números para otros tipos de documento
        processedValue = value.replace(/[^0-9]/g, '');
      }
      
      setFormData(prev => ({ ...prev, [field]: processedValue }));
      clearError(field);
      
      // Autocompletar al tener suficiente longitud
      if (processedValue && processedValue.length >= 6) {
        // Para NIT, usar solo números para la búsqueda
        const searchValue = formData.tipoDocumento === 'NIT' 
          ? processedValue.replace(/[.-]/g, '') 
          : processedValue;
        lookupClientByDocument(searchValue);
      }
      
      // Validar en tiempo real si el campo ya fue tocado
      if (touchedFields[field] && formData.tipoDocumento) {
        setTimeout(() => {
          validateField(field);
        }, 300);
      }
      return;
    }

    // Para otros campos, comportamiento normal
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);

    // Validar en tiempo real solo si el campo ya fue tocado
    if (touchedFields[field]) {
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


  // Función auxiliar para convertir hora a minutos
  const horaAMinutos = (hora) => {
    if (!hora) return 0;
    const [h, m] = hora.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Función para convertir hora de 24h a 12h (AM/PM)
  const convertirHoraA12Horas = (hora24) => {
    if (!hora24 || hora24 === '') return '';
    const [h, m] = hora24.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return hora24;
    const periodo = h >= 12 ? 'PM' : 'AM';
    const hora12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hora12}:${m.toString().padStart(2, '0')} ${periodo}`;
  };

  // Calcular duración total, hora inicio/fin global y valor total
  const calcularResumen = () => {
    if (formData.servicios.length === 0) return { duracion: 0, inicio: '', fin: '', total: 0 };
    
    // Ordenar servicios por hora de inicio (numéricamente)
    const serviciosConHora = formData.servicios
      .filter(s => s.inicio)
      .sort((a, b) => horaAMinutos(a.inicio) - horaAMinutos(b.inicio));
    
    const inicios = serviciosConHora.map(s => s.inicio);
    const fines = formData.servicios
      .filter(s => s.fin)
      .map(s => s.fin)
      .sort((a, b) => horaAMinutos(b) - horaAMinutos(a));
    
    const duracion = formData.servicios.reduce((acc, s) => acc + Number(s.duracion || 0) * (Number(s.cantidad) || 1), 0);
    const total = formData.servicios.reduce((acc, s) => acc + (parseFormattedNumber(s.precio || 0) * (Number(s.cantidad) || 1)), 0);
    
    return {
      duracion,
      inicio: inicios[0] || '',
      fin: fines[0] || '',
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
        // Validar que un empleado no se autoagende
        if (currentUser) {
          const currentUserId = currentUser.id_usuario || currentUser.id;
          const currentUserRoleId = currentUser.roleId || currentUser.role?.id_rol;
          const currentUserRoleName = currentUser.rol?.nombre || currentUser.roleName || '';
          
          // Verificar si el usuario actual es un empleado (roleId === 2 o rol === 'empleado')
          const isEmployee = currentUserRoleId === 2 || 
                           currentUserRoleName.toLowerCase() === 'empleado' ||
                           currentUserRoleName.toLowerCase() === 'employee';
          
          if (isEmployee) {
            // Verificar si está intentando agendarse a sí mismo
            const selfAppointment = formData.servicios.some(s => {
              const empleadoId = s.id_empleado;
              return empleadoId && String(empleadoId) === String(currentUserId);
            });
            
            if (selfAppointment) {
              newErrors.servicios = 'No puedes agendarte una cita a ti mismo. Por favor, selecciona otro profesional.';
            }
          }
        }
        
        const haySolapamiento = haySolapamientoServicios(formData.servicios);
        console.log('Verificando solapamiento:', haySolapamiento, 'Servicios:', formData.servicios);
        if (haySolapamiento) {
          newErrors.servicios = 'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.';
        }
        
        // Validar que los servicios tengan hora de inicio cuando hay profesional
        const serviciosSinHora = formData.servicios.filter(s => s.profesional && s.id_empleado && !s.inicio);
        if (serviciosSinHora.length > 0) {
          newErrors.servicios = 'Todos los servicios deben tener una hora de inicio asignada.';
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
      // Extraer la cita del resultado (puede estar en result.data o result directamente)
      const savedCita = result?.data || result;
      
      // Cerrar el modal inmediatamente para mejor UX
      onClose();
      
      // Refrescar en segundo plano (sin bloquear)
      onSave(savedCita).catch(err => {
        console.error('Error al refrescar citas:', err);
        // El toast de éxito ya se mostró, así que solo logueamos el error
      });
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
        {/* Overlay de carga */}
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-12 w-12 border-4 border-[#FACC15] border-t-transparent rounded-full"></div>
              <p className="text-gray-700 font-semibold text-lg">Guardando cita...</p>
              <p className="text-gray-500 text-sm">Por favor espera, esto puede tardar unos momentos</p>
            </div>
          </div>
        )}
        {/* Header fijo */}
        <div className="flex-none bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-plus-circle text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Crear Cita</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Selección de servicios */}
            <div className="mb-6">
              <ServiceSelection
                servicios={formData.servicios}
                onServicesChange={handleServicesChange}
                fecha={formData.fecha}
                professionals={professionals}
              />
              {touchedFields.servicios && errors.servicios && (
                <span className="text-red-500 text-xs block mt-2">{errors.servicios}</span>
              )}
            </div>

            {/* Datos del cliente y resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento <span className="text-red-500">*</span></label>
                <select
                  value={formData.tipoDocumento}
                  onChange={e => {
                    handleFieldChange('tipoDocumento', e.target.value);
                    // Si ya hay un documento ingresado, validarlo con el nuevo tipo
                    if (formData.documento && touchedFields.documento) {
                      setTimeout(() => {
                        validateField('documento');
                      }, 100);
                    }
                  }}
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
                  onChange={e => handleFieldChange('documento', e.target.value)}
                  onFocus={() => clearError('documento')}
                  onBlur={() => handleFieldBlur('documento')}
                  maxLength={
                    formData.tipoDocumento === 'NIT' ? 20 : 
                    formData.tipoDocumento === 'PP' ? 12 : 
                    formData.tipoDocumento === 'TE' || formData.tipoDocumento === 'CE' ? 20 : 
                    15
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.documento && errors.documento ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={
                    !formData.tipoDocumento || formData.tipoDocumento === '' 
                      ? 'Seleccione primero el tipo de documento' 
                      : formData.tipoDocumento === 'NIT' 
                        ? 'Ej: 800.000.000-9' 
                        : formData.tipoDocumento === 'PP' 
                          ? 'Letras y números (ej: AB123456789)' 
                          : formData.tipoDocumento === 'TE' || formData.tipoDocumento === 'CE'
                            ? '6-20 dígitos'
                            : '6-10 dígitos'
                  }
                  disabled={!formData.tipoDocumento || formData.tipoDocumento === ''}
                />
                {touchedFields.documento && errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
                {formData.tipoDocumento && formData.documento && !errors.documento && (
                  <p className="text-green-600 text-xs mt-1">✓ Formato válido</p>
                )}
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
                <input
                  type="text"
                  value="Agendada"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Las citas nuevas siempre se crean con estado "Agendada"
                </p>
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
                <input type="text" value={formatPrice(resumen.total)} readOnly className="w-full px-2 py-1 border rounded-md bg-gray-100" />
              </div>
            </div>
          </form>
        </div>

        {/* Footer fijo */}
        <div className="flex-none bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={loading}
          >
            <i className="bi bi-x-circle"></i>
            Cancelar
          </button>
          <button
            type="submit"
            form="appointment-form"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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