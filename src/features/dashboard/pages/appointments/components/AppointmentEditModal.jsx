import { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import appointmentsService from '../API/appointmentsService';
import { isValidDocumentByType } from '@/shared/validations';
import usersService from '@/features/dashboard/pages/users/API/usersService';
import { employeesService } from '@/features/dashboard/pages/employees/API/employeesService';
import ServiceSelection from './ServiceSelection';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../users/components/phoneinput-search.css';
import { toBackendDocCode } from '../../../../../shared/constants/documentTypes';

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


const AppointmentEditModal = ({ cita, fecha, onClose, onSave }) => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [numero, setNumero] = useState('');

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
        toast.error('Error al cargar profesionales');
        // En caso de error, usar arrays vacíos
        setProfessionals([]);
      }
    };
    loadData();
  }, []);

  // Si es edición, cargar datos de la cita desde el backend
  useEffect(() => {
    const loadAppointmentData = async () => {
      if (cita && cita.id_cita) {
        try {
          // Obtener la cita completa desde el backend para asegurar que tenemos el estado actualizado
          const response = await appointmentsService.getById(cita.id_cita);
          if (response.success && response.data) {
            const citaCompleta = response.data;
            console.log('Loading appointment data for editing from backend:', citaCompleta);
            
            const telefono = citaCompleta.usuario?.telefono || citaCompleta.cliente?.telefono || '';
            const telefonoLimpio = telefono.replace(/[^0-9]/g, '');
            setNumero(telefonoLimpio);
            setFormData({
              cliente: citaCompleta.usuario?.nombre || citaCompleta.cliente?.nombre || '',
              telefono: telefono,
              correo: citaCompleta.usuario?.correo || citaCompleta.cliente?.correo || '',
              documento: citaCompleta.usuario?.documento || citaCompleta.cliente?.documento || '',
              fecha: citaCompleta.fecha_servicio || fecha || '',
              estado: citaCompleta.estado || 'Agendada', // Usar el estado del backend
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
                  fin: s.hora_finalizacion ? (s.hora_finalizacion.includes(':') ? s.hora_finalizacion.substring(0, 5) : s.hora_finalizacion) : calcularHoraFin(horaInicio, duracion),
                  duracion: duracion,
                  precio: s.precio_unitario || s.precio || 0,
                  cantidad: s.cantidad || 1,
                  observaciones: s.observaciones || ''
                };
              }),
              notas: citaCompleta.motivo || ''
            });
          } else {
            console.error('Error loading appointment:', response);
            toast.error('Error al cargar los datos de la cita');
          }
        } catch (error) {
          console.error('Error loading appointment data:', error);
          toast.error('Error al cargar los datos de la cita');
        }
      }
    };
    
    loadAppointmentData();
  }, [cita?.id_cita, fecha]);

  // useEffect para actualizar la fecha cuando cambia la prop fecha y NO hay cita (modo creación)
  useEffect(() => {
    if (!cita && fecha) {
      setFormData(prev => ({
        ...prev,
        fecha
      }));
    }
  }, [fecha, cita]);


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

  // Función auxiliar para calcular hora fin (usada al cargar datos de la cita)
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

  // Generar opciones de hora disponibles para un servicio (DEPRECATED - ahora en ServiceSelection)
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
    const total = formData.servicios.reduce((acc, s) => acc + (limpiarPrecio(s.precio) * (Number(s.cantidad) || 1)), 0);
    
    return {
      duracion,
      inicio: inicios[0] || '',
      fin: fines[0] || '',
      total
    };
  };
  const resumen = calcularResumen();

  // Verificar si la cita está pagada (no se puede editar)
  const isPagada = cita && (formData.estado === 'Pagada' || cita.estado === 'Pagada');

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
      // El estado "En ejecución" solo se usa cuando se está ejecutando el servicio
      const estadoFinal = cita ? formData.estado : 'Agendada';
      
      const appointmentData = {
        cita: {
          id_cliente: Number(clientId),
          fecha_servicio: formData.fecha,
          hora_entrada: horaEntrada,
          estado: estadoFinal,
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

      // Crear o actualizar la cita
      let result;
      try {
        if (cita) {
          // Para actualización, usar el clientId obtenido de findOrCreateClient
          // Esto permite cambiar el cliente si el documento cambió
          // El clientId ya está en appointmentData.cita.id_cliente desde la línea 720
          result = await appointmentsService.update(cita.id_cita, appointmentData);
          toast.success('Cita editada correctamente');
        } else {
          result = await appointmentsService.create(appointmentData);
          toast.success('Cita registrada correctamente');
        }
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
              <i className={`bi ${cita ? 'bi-pencil-square' : 'bi-plus-circle'} text-lg`}></i>
            </div>
            <h2 className="text-xl font-bold m-0">{cita ? 'Editar' : 'Crear'} Cita</h2>
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
          {isPagada && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <i className="bi bi-exclamation-triangle-fill text-lg"></i>
                <p className="font-semibold m-0">Esta cita está pagada y no puede ser editada.</p>
              </div>
            </div>
          )}
          <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Selección de servicios */}
            <div className="mb-6">
              <ServiceSelection
                servicios={formData.servicios}
                onServicesChange={handleServicesChange}
                fecha={formData.fecha}
                professionals={professionals}
                excludeCitaId={cita?.id_cita || null}
                disabled={isPagada}
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
                  onChange={e => handleFieldChange('tipoDocumento', e.target.value)}
                  onFocus={() => clearError('tipoDocumento')}
                  onBlur={() => handleFieldBlur('tipoDocumento')}
                  disabled={isPagada}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.tipoDocumento && errors.tipoDocumento ? 'border-red-500' : 'border-gray-300'} ${isPagada ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isPagada}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.documento && errors.documento ? 'border-red-500' : 'border-gray-300'} ${isPagada ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isPagada}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.cliente && errors.cliente ? 'border-red-500' : 'border-gray-300'} ${isPagada ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isPagada}
                  inputClass={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.telefono && errors.telefono ? 'border-red-500' : 'border-gray-300'} ${isPagada ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  containerClass="w-full"
                  inputProps={{
                    name: 'telefono',
                    required: true,
                    placeholder: 'Ej: 3001234567',
                    disabled: isPagada
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
                  disabled={isPagada}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.correo && errors.correo ? 'border-red-500' : 'border-gray-300'} ${isPagada ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isPagada}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${touchedFields.fecha && errors.fecha ? 'border-red-500' : 'border-gray-300'} ${isPagada ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {touchedFields.fecha && errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la cita</label>
                <select
                  value={formData.estado}
                  onChange={e => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${isPagada ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!cita || isPagada} // Solo permitir cambiar estado si es edición y no está pagada
                >
                  {APPOINTMENT_STATES
                    .filter(estado => {
                      // Al crear una cita nueva, solo permitir estados iniciales
                      if (!cita) {
                        return ['Agendada', 'Confirmada'].includes(estado.nombre);
                      }
                      // Al editar, mostrar todos los estados (incluyendo Pagada y Finalizada para visualización)
                      return true;
                    })
                    .map(estado => (
                      <option key={estado.nombre} value={estado.nombre}>{estado.nombre}</option>
                    ))}
                </select>
                {!cita && (
                  <p className="text-xs text-gray-500 mt-1">
                    Las citas nuevas se crean con estado "Agendada" por defecto
                  </p>
                )}
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
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || isPagada}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-gray-800 border-t-transparent rounded-full"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle-fill"></i>
                {cita ? 'Guardar cambios' : 'Crear cita'}
              </>
            )}
          </button>
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
