import React, { useState, useEffect } from 'react';
import { getAppointments, addAppointment, updateAppointment, APPOINTMENT_STATES } from '../../../../shared/services/AppointmentsDataService';
import { getServices } from '../../../../shared/services/ServicesDataService';
import { getProfessionals } from '../../../../shared/services/ProfessionalsDataService';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import Paginator from '../../../../shared/Paginator';
import Search from '../../../../shared/Search';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { formatNumber } from '../../../../shared/utils/formatters';

function limpiarPrecio(valor) {
  // Si el valor es null, undefined o vacío, devolver 0
  if (valor === null || valor === undefined || valor === '') return 0;
  // Si ya es número, devolverlo
  if (typeof valor === 'number') return valor;
  // Si es string, limpiar y convertir
  const limpio = String(valor).replace(/[^\d]/g, '');
  return limpio ? Number(limpio) : 0;
}


const ClientAppointments = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('misCitas');
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente: currentUser?.nombre || '',
    telefono: currentUser?.telefono || '',
    tipoDocumento: currentUser?.tipoDocumento || '',
    documento: currentUser?.documento || '',
    fecha: '',
    servicios: [],
    estado: 'Agendada',
    notas: ''
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const APPOINTMENTS_PER_PAGE = 5;

  // Estado para el slider de servicios
  const [servicePage, setServicePage] = useState(0);
  const SERVICES_PER_PAGE = 2;
  const totalServicePages = Math.ceil(services.length / SERVICES_PER_PAGE);
  const paginatedServices = services.slice(servicePage * SERVICES_PER_PAGE, (servicePage + 1) * SERVICES_PER_PAGE);

  // Estado para modal de cancelación y motivo
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelId, setCancelId] = useState(null);

  // Estado para modal de reprogramar
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      const [appointmentsData, servicesData, professionalsData] = await Promise.all([
        getAppointments(),
        getServices(),
        getProfessionals()
      ]);
      setAppointments(appointmentsData);
      setServices(servicesData.filter(s => s.active));
      setProfessionals(professionalsData.filter(p => p.active));
    };
    loadData();
  }, []);

  // useEffect para actualizar datos personales si cambia el usuario logueado
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cliente: currentUser?.nombre || '',
      telefono: currentUser?.telefono || '',
      tipoDocumento: currentUser?.tipoDocumento || '',
      documento: currentUser?.documento || ''
    }));
  }, [currentUser]);

  // Filtrar citas por usuario loggeado
  const myAppointments = appointments.filter(a =>
    a.tipoDocumento === currentUser?.tipoDocumento &&
    a.documento === currentUser?.documento
  );

  // Buscador general (mejorado para incluir servicios)
  const filteredAppointments = myAppointments.filter(a => {
    const citaString = [
      a.cliente,
      a.telefono,
      a.tipoDocumento,
      a.documento,
      a.fecha,
      a.estado,
      a.notas,
      ...(a.servicios ? a.servicios.flatMap(s => [s.nombre, s.profesional, s.inicio, s.fin, s.duracion, s.precio, s.cantidad]) : [])
    ].join(' ').toLowerCase();
    return citaString.includes(searchTerm.toLowerCase());
  });

  // Paginación
  const totalPages = Math.ceil(filteredAppointments.length / APPOINTMENTS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * APPOINTMENTS_PER_PAGE,
    currentPage * APPOINTMENTS_PER_PAGE
  );

  // Validación de solapamiento de servicios para el mismo profesional
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

  // Validaciones igual que admin
  const validateForm = () => {
    const newErrors = {};
    if (!formData.cliente.trim()) newErrors.cliente = 'El nombre del cliente es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (formData.servicios.length === 0) newErrors.servicios = 'Debe agregar al menos un servicio';
    // Validar cada servicio
    formData.servicios.forEach((s, idx) => {
      if (!s.profesional) newErrors[`servicio_${idx}_profesional`] = 'El profesional es obligatorio';
      if (!s.inicio) newErrors[`servicio_${idx}_inicio`] = 'La hora de inicio es obligatoria';
      if (!s.duracion) newErrors[`servicio_${idx}_duracion`] = 'La duración es obligatoria';
    });
    if (haySolapamientoServicios(formData.servicios)) newErrors.servicios = 'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.';
    // Validar que no haya dos servicios con la misma hora de inicio
    const horasInicio = formData.servicios.map(s => s.inicio);
    horasInicio.forEach((hora, idx) => {
      if (hora && horasInicio.filter(h => h === hora).length > 1) {
        newErrors[`servicio_${idx}_inicio`] = 'No puede haber dos servicios con la misma hora de inicio';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await addAppointment(formData);
      setFormData({
        cliente: '',
        telefono: '',
        fecha: '',
        servicios: [],
        estado: 'Agendada',
        notas: ''
      });
      setErrors({});
      toast.success('¡Cita agendada correctamente!');
      // Recargar citas
      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);
      setActiveTab('misCitas');
    } catch (error) {
      toast.error('Ocurrió un error al agendar la cita.');
      console.error('Error al crear la cita:', error);
    } finally {
      setLoading(false);
    }
  };

  const addService = (service) => {
    const precio = limpiarPrecio(service.price ?? service.precio ?? 0);
    const newService = {
      id: Date.now(),
      servicioId: service.id,
      nombre: service.name,
      descripcion: service.descripcion || '',
      profesional: '',
      inicio: '08:00',
      fin: '09:00',
      duracion: service.duracion || 60,
      precio: precio,
      cantidad: 1
    };
    setFormData(prev => ({
      ...prev,
      servicios: [newService, ...prev.servicios]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index, field, value) => {
    setFormData(prev => {
      const newServicios = [...prev.servicios];
      newServicios[index] = { ...newServicios[index], [field]: value };
      // Si cambia hora inicio o duración, recalcular hora fin
      if (field === 'inicio' || field === 'duracion') {
        const inicio = field === 'inicio' ? value : newServicios[index].inicio;
        const duracion = field === 'duracion' ? value : newServicios[index].duracion;
        newServicios[index].fin = calcularHoraFin(inicio, duracion);
      }
      // No modificar nombre ni precio al cambiar profesional
      return { ...prev, servicios: newServicios };
    });
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const updateStartTime = (index, startTime) => {
    const service = formData.servicios[index];
    const endTime = calculateEndTime(startTime, service.duracion);
    updateService(index, 'inicio', startTime);
    updateService(index, 'fin', endTime);
  };

  const updateDuration = (index, duration) => {
    const service = formData.servicios[index];
    const endTime = calculateEndTime(service.inicio, duration);
    updateService(index, 'duracion', duration);
    updateService(index, 'fin', endTime);
  };

  // Modificar cancelAppointment para guardar motivo
  const cancelAppointment = async (appointmentId, motivo) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      await updateAppointment({ ...appointment, estado: 'Cancelada por cliente', motivoCancelacion: motivo });
      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);
    }
  };

  // Función para validar si se puede reprogramar
  const canReschedule = (appointment) => {
    // Permitir reprogramar si el estado es 'Agendada' o 'Reprogramada'
    if (!['Agendada', 'Reprogramada'].includes(appointment.estado)) return false;
    if (!appointment.servicios || appointment.servicios.length === 0) {
      toast.error('La cita no tiene servicios asociados. No se puede reprogramar.');
      return false;
    }
    // Tomar la hora de inicio más temprana de todos los servicios
    const inicios = appointment.servicios.map(s => s.inicio).filter(Boolean);
    if (inicios.length === 0) {
      toast.error('No se encontró una hora de inicio válida para la cita.');
      return false;
    }
    const horaInicio = inicios.sort()[0];
    // Crear la fecha en zona local para evitar desfases
    const [year, month, day] = appointment.fecha.split('-').map(Number);
    const [hour, minute] = horaInicio.split(':').map(Number);
    const citaDate = new Date(year, month - 1, day, hour, minute);
    if (isNaN(citaDate.getTime())) {
      toast.error('La fecha u hora de la cita es inválida.');
      return false;
    }
    const now = new Date();
    const diff = (citaDate - now) / (1000 * 60); // diferencia en minutos
    // Logs de depuración
    console.log('Fecha cita:', appointment.fecha);
    console.log('Hora inicio más temprana:', horaInicio);
    console.log('Fecha/hora combinada:', citaDate);
    console.log('Ahora:', now);
    console.log('Diferencia en minutos:', diff);
    return diff >= 60;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Agendada': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmada': return 'bg-blue-100 text-blue-800';
      case 'Reprogramada': return 'bg-orange-100 text-orange-800';
      case 'En Ejecucion': return 'bg-purple-100 text-purple-800';
      case 'Finalizada': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      case 'Pagada': return 'bg-green-100 text-green-800';
      case 'No asistió': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generar opciones de hora disponibles para un servicio
  function getHorasDisponibles(idx, profesional, duracion, listaServicios = formData.servicios) {
    if (!profesional) return [];
    const horas = [];
    for (let h = 6; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        // Verificar si esta hora se solapa con otro servicio del mismo profesional
        let disponible = true;
        const inicioA = h * 60 + m;
        const finA = inicioA + Number(duracion);
        for (let i = 0; i < listaServicios.length; i++) {
          if (i === idx) continue;
          const s = listaServicios[i];
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

  // Función para calcular la hora de finalización a partir de inicio y duración
  function calcularHoraFin(inicio, duracion) {
    const [h, m] = inicio.split(':').map(Number);
    const totalMin = h * 60 + m + Number(duracion);
    const newH = Math.floor(totalMin / 60);
    const newM = totalMin % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  }

  // Función para abrir modal de cancelación
  const openCancelModal = (id) => {
    setCancelId(id);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // Función para confirmar cancelación
  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Por favor indica el motivo de cancelación.');
      return;
    }
    const result = await Swal.fire({
      title: '¿Estás seguro de cancelar esta cita?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
    });
    if (result.isConfirmed) {
      await cancelAppointment(cancelId, cancelReason);
      setShowCancelModal(false);
      toast('Cita cancelada');
    }
  };

  // Validaciones para reprogramar (igual que agendar)
  const validateReschedule = () => {
    const newErrors = {};
    if (!rescheduleData.cliente.trim()) newErrors.cliente = 'El nombre del cliente es requerido';
    if (!rescheduleData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!rescheduleData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (rescheduleData.servicios.length === 0) newErrors.servicios = 'Debe agregar al menos un servicio';
    // Validar cada servicio
    rescheduleData.servicios.forEach((s, idx) => {
      if (!s.profesional) newErrors[`servicio_${idx}_profesional`] = 'El profesional es obligatorio';
      if (!s.inicio) newErrors[`servicio_${idx}_inicio`] = 'La hora de inicio es obligatoria';
      if (!s.duracion) newErrors[`servicio_${idx}_duracion`] = 'La duración es obligatoria';
    });
    if (haySolapamientoServicios(rescheduleData.servicios)) newErrors.servicios = 'No se puede asignar el mismo profesional a servicios que se solapan en el tiempo.';
    // Validar que no haya dos servicios con la misma hora de inicio
    const horasInicio = rescheduleData.servicios.map(s => s.inicio);
    horasInicio.forEach((hora, idx) => {
      if (hora && horasInicio.filter(h => h === hora).length > 1) {
        newErrors[`servicio_${idx}_inicio`] = 'No puede haber dos servicios con la misma hora de inicio';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar reprogramación
  const handleReschedule = async () => {
    if (!validateReschedule()) return;
    try {
      await updateAppointment({ ...rescheduleData, estado: 'Reprogramada' });
      setShowRescheduleModal(false);
      toast.success('¡Cita reprogramada correctamente!');
      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);
    } catch (error) {
      toast.error('Ocurrió un error al reprogramar la cita.');
      // Recargar citas para evitar inconsistencias visuales
      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);
    }
  };

  // Función para abrir modal de reprogramar
  const openRescheduleModal = (appointment) => {
    if ((appointment.reprogramaciones || 0) >= 3) {
      toast.error('Esta cita ya ha sido reprogramada 3 veces y no puede reprogramarse más.');
      return;
    }
    setRescheduleData({ ...appointment });
    setShowRescheduleModal(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-[#FACC15]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-2xl"></div>

      <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E1E1E] font-montserrat mb-6">
            Mis <span className="text-[#FACC15]">Citas</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-lato">
            Gestiona tus citas y agenda nuevos servicios con nuestros profesionales
          </p>
        </div>

        {/* Tabs superiores */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 font-poppins ${
              activeTab === 'misCitas'
                ? 'bg-[#FACC15] text-[#1E1E1E] shadow-xl transform scale-105'
                : 'bg-white text-gray-600 hover:bg-[#FACC15]/10 hover:text-[#1E1E1E] shadow-lg'
            }`}
            onClick={() => setActiveTab('misCitas')}
          >
            <i className="bi bi-calendar-event mr-2"></i>Mis citas
          </button>
          <button
            className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 font-poppins ${
              activeTab === 'agendar'
                ? 'bg-[#FACC15] text-[#1E1E1E] shadow-xl transform scale-105'
                : 'bg-white text-gray-600 hover:bg-[#FACC15]/10 hover:text-[#1E1E1E] shadow-lg'
            }`}
            onClick={() => setActiveTab('agendar')}
          >
            <i className="bi bi-plus-lg mr-2"></i>Agendar cita
          </button>
        </div>
        {/* Barra de búsqueda */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-md">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-[#FACC15] text-xl"></i>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] bg-white shadow-lg font-lato text-gray-700 placeholder-gray-400"
              placeholder="Buscar citas por cliente, servicio..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      {/* Renderizado de citas */}
      {activeTab === 'misCitas' && (
        <div className="space-y-6">
          {paginatedAppointments.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#FACC15]/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FACC15" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1E1E1E] font-montserrat mb-4">No tienes citas registradas</h3>
              <p className="text-gray-600 font-lato mb-8">Agenda tu primera cita con nuestros profesionales</p>
              <button
                onClick={() => setActiveTab('agendar')}
                className="px-8 py-4 bg-[#FACC15] text-[#1E1E1E] font-bold rounded-full shadow-xl hover:shadow-[#FACC15]/50 transition-all duration-300 transform hover:scale-105 font-poppins"
              >
                <i className="bi bi-plus-lg mr-2"></i>Agendar Primera Cita
              </button>
            </div>
          ) : (
            paginatedAppointments.map((a, idx) => {
              const statusProgress = {
                'Agendada': 20,
                'Confirmada': 40,
                'Reprogramada': 30,
                'En Ejecucion': 70,
                'Finalizada': 100,
                'Pagada': 100,
                'Cancelada': 0,
                'No asistió': 0
              }[a.estado] || 0;

              return (
                <div
                  key={a.id}
                  className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Efecto de fondo al hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Progress bar */}
                  <div className="h-3 bg-gray-200 rounded-full mb-6 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${a.estado === 'Cancelada' || a.estado === 'No asistió' ? 'bg-red-500' : 'bg-[#FACC15]'}`}
                      style={{ width: `${statusProgress}%` }}
                    ></div>
                  </div>

                  <div className="relative z-10 flex flex-col gap-6">
                    {/* Encabezado de la cita */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#FACC15] shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1E1E1E" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#1E1E1E] font-nunito group-hover:text-[#FACC15] transition-colors duration-300 mb-1">
                            {a.cliente}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-600 font-lato">
                            <div className="flex items-center gap-2">
                              <i className="bi bi-calendar-event text-[#FACC15]"></i>
                              <span>{formatDate(a.fecha)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="bi bi-clock text-[#FACC15]"></i>
                              <span>{a.servicios && a.servicios.length > 0 ? `${a.servicios[0].inicio} - ${a.servicios[a.servicios.length-1].fin}` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`px-6 py-3 rounded-full text-sm font-bold border-2 font-poppins ${
                        a.estado === 'Agendada' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        a.estado === 'Confirmada' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        a.estado === 'Reprogramada' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                        a.estado === 'En Ejecucion' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        a.estado === 'Finalizada' || a.estado === 'Pagada' ? 'bg-green-100 text-green-800 border-green-300' :
                        'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {a.estado}
                      </div>
                    </div>
                    {/* Servicios */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 text-[#1E1E1E] font-semibold mb-4 font-nunito">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FACC15" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036a2.121 2.121 0 01-3-3L16.732 3.732z" />
                        </svg>
                        Servicios
                      </div>
                      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                        {a.servicios && a.servicios.map((s, i) => (
                          <div key={s.id || i} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-lg font-bold text-[#1E1E1E] font-nunito">{s.nombre}</h4>
                              <div className="text-2xl font-bold text-[#FACC15] font-montserrat">${formatNumber(Number(s.precio || 0) * (Number(s.cantidad) || 1))}</div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-gray-600 font-lato">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]/10">
                                  <i className="bi bi-person-badge text-[#FACC15]"></i>
                                </div>
                                <span className="text-sm">{s.profesional}</span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-600 font-lato">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]/10">
                                  <i className="bi bi-clock text-[#FACC15]"></i>
                                </div>
                                <span className="text-sm">{s.duracion ? `${Math.floor(s.duracion/60)}h ${s.duracion%60}min` : ''}</span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-600 font-lato">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]/10">
                                  <i className="bi bi-play text-[#FACC15]"></i>
                                </div>
                                <span className="text-sm">Inicio: {s.inicio}</span>
                              </div>
                              {s.cantidad > 1 && (
                                <div className="flex items-center gap-3 text-gray-600 font-lato">
                                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]/10">
                                    <i className="bi bi-hash text-[#FACC15]"></i>
                                  </div>
                                  <span className="text-sm">Cantidad: {s.cantidad}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                   {/* Resumen y acciones */}
                   <div className="bg-gradient-to-r from-[#FACC15]/10 to-[#FACC15]/5 rounded-2xl p-6 border border-[#FACC15]/20">
                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                       <div className="flex flex-col sm:flex-row gap-6">
                         <div className="flex items-center gap-3 text-[#1E1E1E] font-lato">
                           <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FACC15] shadow-lg">
                             <i className="bi bi-clock text-white"></i>
                           </div>
                           <div>
                             <div className="text-sm text-gray-600 font-medium">Duración Total</div>
                             <div className="text-lg font-bold text-[#1E1E1E]">{a.servicios && a.servicios.length > 0 ? `${Math.floor(a.servicios.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0)/60)}h ${a.servicios.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0)%60}min` : ''}</div>
                           </div>
                         </div>
                         <div className="flex items-center gap-3 text-[#1E1E1E] font-lato">
                           <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FACC15] shadow-lg">
                             <i className="bi bi-cash text-white"></i>
                           </div>
                           <div>
                             <div className="text-sm text-gray-600 font-medium">Precio Total</div>
                             <div className="text-2xl font-bold text-[#FACC15] font-montserrat">${formatNumber(a.servicios && a.servicios.reduce((acc, s) => acc + (Number(s.precio || 0) * (Number(s.cantidad) || 1)), 0))}</div>
                           </div>
                         </div>
                       </div>
                       <div className="flex gap-3 justify-end">
                         {a.estado === 'Agendada' && (
                           <>
                             <button
                               onClick={() => openRescheduleModal(a)}
                               className="group relative px-6 py-3 bg-white border-2 border-[#FACC15] text-[#FACC15] font-bold rounded-full shadow-lg hover:shadow-[#FACC15]/50 transition-all duration-300 transform hover:scale-105 font-poppins overflow-hidden"
                             >
                               <span className="relative z-10 flex items-center gap-2">
                                 <i className="bi bi-pencil"></i> Reprogramar
                               </span>
                               <div className="absolute inset-0 bg-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                               <div className="absolute inset-0 bg-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                 <span className="text-white font-bold flex items-center gap-2">
                                   <i className="bi bi-pencil"></i> Reprogramar
                                 </span>
                               </div>
                             </button>
                             <button
                               onClick={() => openCancelModal(a.id)}
                               className="px-6 py-3 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 font-poppins"
                             >
                               <i className="bi bi-x-lg mr-2"></i>Cancelar
                             </button>
                           </>
                         )}
                       </div>
                     </div>
                   </div>

                   {/* Elemento decorativo */}
                   <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-2xl group-hover:bg-[#FACC15]/30 transition-colors duration-500"></div>
                 </div>
               </div>
             );
           })
          )}
          {/* Paginador */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Paginator currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
          </div>
        )}
      {activeTab === 'agendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda: Datos personales + slider */}
          <div className="space-y-4">
            {/* Datos personales */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              {/* Efecto de fondo al hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FACC15] shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1E1E1E" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1E1E1E] font-nunito">Datos Personales</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] bg-white font-lato text-gray-700 placeholder-gray-400 transition-all duration-300"
                      value={formData.cliente}
                      onChange={e => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                      placeholder="Ingresa tu nombre completo"
                      required
                    />
                    {errors.cliente && <p className="text-red-500 text-sm mt-2 font-lato">{errors.cliente}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] bg-white font-lato text-gray-700 placeholder-gray-400 transition-all duration-300"
                      value={formData.telefono}
                      onChange={e => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="Ingresa tu número de teléfono"
                      required
                    />
                    {errors.telefono && <p className="text-red-500 text-sm mt-2 font-lato">{errors.telefono}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                        Tipo de documento <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] bg-gray-50 font-lato text-gray-700 cursor-not-allowed"
                        value={formData.tipoDocumento}
                        disabled
                        readOnly
                      >
                        <option value="">Seleccionar</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="NIT">NIT</option>
                        <option value="PAS">Pasaporte</option>
                      </select>
                      {errors.tipoDocumento && <p className="text-red-500 text-sm mt-2 font-lato">{errors.tipoDocumento}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                        Documento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] bg-gray-50 font-lato text-gray-700 cursor-not-allowed"
                        value={formData.documento}
                        disabled
                        readOnly
                      />
                      {errors.documento && <p className="text-red-500 text-sm mt-2 font-lato">{errors.documento}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                      Fecha de la cita <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] bg-white font-lato text-gray-700 transition-all duration-300"
                      value={formData.fecha}
                      onChange={e => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {errors.fecha && <p className="text-red-500 text-sm mt-2 font-lato">{errors.fecha}</p>}
                  </div>
                </div>
              </div>

              {/* Elemento decorativo */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-2xl group-hover:bg-[#FACC15]/30 transition-colors duration-500"></div>
            </div>
            {/* Servicios disponibles */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              {/* Efecto de fondo al hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FACC15] shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1E1E1E" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036a2.121 2.121 0 01-3-3L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1E1E1E] font-nunito">Servicios Disponibles</h3>
                </div>

                <p className="text-gray-600 font-lato mb-8">Selecciona los servicios que deseas incluir en tu cita</p>

                <div className="relative">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-500 hover:border-[#FACC15] hover:text-[#FACC15] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all duration-300 shadow-lg"
                      onClick={() => setServicePage(p => Math.max(0, p - 1))}
                      disabled={servicePage === 0}
                    >
                      <i className="bi bi-chevron-left text-xl"></i>
                    </button>

                    <div className="flex gap-6 flex-1 justify-center overflow-hidden">
                      {paginatedServices.map((serv, idx) => (
                        <div
                          key={serv.id}
                          className="group/service relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 min-w-[280px] max-w-[320px] overflow-hidden"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          {/* Efecto de fondo al hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/10 to-transparent opacity-0 group-hover/service:opacity-100 transition-opacity duration-500"></div>

                          <div className="relative z-10">
                            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#FACC15] shadow-lg transform group-hover/service:scale-110 transition-transform duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1E1E1E" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036a2.121 2.121 0 01-3-3L16.732 3.732z" />
                              </svg>
                            </div>

                            <h4 className="text-lg font-bold text-[#1E1E1E] text-center font-nunito mb-2 group-hover/service:text-[#FACC15] transition-colors duration-300">
                              {serv.name}
                            </h4>

                            <p className="text-sm text-gray-600 text-center font-lato mb-4 line-clamp-2 leading-relaxed">
                              {serv.descripcion || 'Servicio profesional de alta calidad'}
                            </p>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2 text-gray-600 font-lato">
                                <i className="bi bi-clock text-[#FACC15]"></i>
                                <span className="text-sm">{serv.duracion ? `${Math.floor(serv.duracion/60)}h ${serv.duracion%60}min` : ''}</span>
                              </div>
                              <div className="text-2xl font-bold text-[#FACC15] font-montserrat">
                                ${formatNumber(limpiarPrecio(serv.price ?? serv.precio ?? 0))}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="w-full py-3 bg-[#FACC15] text-[#1E1E1E] font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins"
                              onClick={() => addService(serv)}
                            >
                              <i className="bi bi-plus-lg mr-2"></i>Agregar Servicio
                            </button>
                          </div>

                          {/* Elemento decorativo */}
                          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#FACC15]/20 rounded-full blur-lg group-hover/service:bg-[#FACC15]/30 transition-colors duration-500"></div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-500 hover:border-[#FACC15] hover:text-[#FACC15] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all duration-300 shadow-lg"
                      onClick={() => setServicePage(p => Math.min(totalServicePages - 1, p + 1))}
                      disabled={servicePage === totalServicePages - 1 || totalServicePages === 0}
                    >
                      <i className="bi bi-chevron-right text-xl"></i>
                    </button>
                  </div>

                  <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: totalServicePages }).map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          servicePage === idx ? 'bg-[#FACC15] scale-125' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        onClick={() => setServicePage(idx)}
                      />
                    ))}
                  </div>
                </div>

                {errors.servicios && <p className="text-red-500 text-sm mt-4 font-lato text-center">{errors.servicios}</p>}
              </div>

              {/* Elemento decorativo */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-2xl group-hover:bg-[#FACC15]/30 transition-colors duration-500"></div>
            </div>
          </div>
          {/* Columna derecha: Servicios seleccionados + resumen */}
          <div className="space-y-4">
            {/* Servicios seleccionados */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              {/* Efecto de fondo al hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FACC15] shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1E1E1E" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1E1E1E] font-nunito">Servicios Seleccionados</h3>
                </div>

                {formData.servicios.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9CA3AF" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036a2.121 2.121 0 01-3-3L16.732 3.732z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-lato text-lg">No has seleccionado servicios aún</p>
                    <p className="text-gray-400 font-lato text-sm mt-2">Agrega servicios desde la sección superior</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.servicios.map((serv, idx) => (
                      <div key={serv.id} className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        {/* Botón quitar en la esquina superior derecha */}
                        <button
                          type="button"
                          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg"
                          onClick={() => removeService(idx)}
                          title="Quitar servicio"
                        >
                          <i className="bi bi-x-lg text-sm"></i>
                        </button>

                        <div className="pr-12">
                          {/* Nombre y descripción del servicio */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-[#1E1E1E] font-nunito mb-1">{serv.nombre}</h4>
                              <p className="text-gray-600 font-lato text-sm">{serv.descripcion || 'Servicio profesional'}</p>
                            </div>
                            <div className="text-2xl font-bold text-[#FACC15] font-montserrat">
                              ${formatNumber((Number(serv.precio || 0) * (Number(serv.cantidad) || 1)))}
                            </div>
                          </div>

                          {/* Cantidad */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-3">
                              Cantidad
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-600 hover:border-[#FACC15] hover:text-[#FACC15] transition-all duration-300"
                                onClick={() => updateService(idx, 'cantidad', Math.max(1, (serv.cantidad || 1) - 1))}
                              >
                                <i className="bi bi-dash text-lg"></i>
                              </button>
                              <span className="w-12 text-center text-lg font-bold text-[#1E1E1E] font-montserrat">{serv.cantidad || 1}</span>
                              <button
                                type="button"
                                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-600 hover:border-[#FACC15] hover:text-[#FACC15] transition-all duration-300"
                                onClick={() => updateService(idx, 'cantidad', (serv.cantidad || 1) + 1)}
                              >
                                <i className="bi bi-plus text-lg"></i>
                              </button>
                            </div>
                          </div>

                          {/* Profesional */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-2">
                              Profesional <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] bg-white font-lato text-gray-700 transition-all duration-300"
                              value={serv.profesional}
                              onChange={e => {
                                const selectedProfessional = professionals.find(p => p.name === e.target.value);
                                updateService(idx, 'profesional', e.target.value);
                                if (selectedProfessional) {
                                  updateService(idx, 'id_empleado', selectedProfessional.id);
                                }
                              }}
                              required
                            >
                              <option value="">Seleccionar profesional</option>
                              {professionals.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                            {errors[`servicio_${idx}_profesional`] && <p className="text-red-500 text-sm mt-2 font-lato">{errors[`servicio_${idx}_profesional`]}</p>}
                          </div>

                          {/* Hora */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-[#1E1E1E] font-lato mb-3">
                              Horario <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="block text-xs text-gray-500 font-lato mb-2">Hora de inicio</span>
                                {serv.profesional ? (
                                  (() => {
                                    const horasDisponibles = getHorasDisponibles(idx, serv.profesional, serv.duracion);
                                    const hayDisponibles = horasDisponibles.some(h => h.disponible);
                                    return hayDisponibles ? (
                                      <select
                                        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] bg-white font-lato text-gray-700 transition-all duration-300"
                                        value={serv.inicio}
                                        onChange={e => updateStartTime(idx, e.target.value)}
                                      >
                                        {horasDisponibles.map(h => (
                                          <option key={h.hora} value={h.hora} disabled={!h.disponible}>
                                            {h.hora}{!h.disponible ? ' (No disponible)' : ''}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <div className="w-full border-2 border-red-200 rounded-2xl px-4 py-3 bg-red-50 text-red-600 font-lato text-sm">
                                        No hay horas disponibles para este profesional
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <input
                                    type="time"
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 font-lato text-gray-500 cursor-not-allowed"
                                    value={serv.inicio}
                                    disabled
                                  />
                                )}
                                {errors[`servicio_${idx}_inicio`] && <p className="text-red-500 text-sm mt-2 font-lato">{errors[`servicio_${idx}_inicio`]}</p>}
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500 font-lato mb-2">Hora de finalización</span>
                                <input
                                  type="time"
                                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 font-lato text-gray-500 cursor-not-allowed"
                                  value={serv.fin}
                                  readOnly
                                  tabIndex={-1}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Duración */}
                          <div className="flex items-center gap-3 text-gray-600 font-lato">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]/10">
                              <i className="bi bi-clock text-[#FACC15]"></i>
                            </div>
                            <span className="text-sm">
                              Duración: {serv.duracion ? `${Math.floor(serv.duracion/60)}h ${serv.duracion%60}min` : ''}
                            </span>
                          </div>
                          {errors[`servicio_${idx}_duracion`] && <p className="text-red-500 text-sm mt-2 font-lato">{errors[`servicio_${idx}_duracion`]}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Elemento decorativo */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-2xl group-hover:bg-[#FACC15]/30 transition-colors duration-500"></div>
            </div>
            {/* Resumen y confirmación */}
            <div className="group relative bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              {/* Efecto de fondo al hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FACC15] shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1E1E1E" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-nunito">Resumen de tu Cita</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]">
                          <i className="bi bi-calendar-event text-[#1E1E1E]"></i>
                        </div>
                        <span className="text-white font-semibold font-lato">Fecha</span>
                      </div>
                      <p className="text-white/90 font-lato text-lg">{formData.fecha || 'No seleccionada'}</p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]">
                          <i className="bi bi-clock text-[#1E1E1E]"></i>
                        </div>
                        <span className="text-white font-semibold font-lato">Horario</span>
                      </div>
                      <p className="text-white/90 font-lato text-lg">
                        {formData.servicios[0]?.inicio || 'No definido'} - {formData.servicios[formData.servicios.length-1]?.fin || 'No definido'}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]">
                          <i className="bi bi-stopwatch text-[#1E1E1E]"></i>
                        </div>
                        <span className="text-white font-semibold font-lato">Duración Total</span>
                      </div>
                      <p className="text-white/90 font-lato text-lg">
                        {formData.servicios.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0)} minutos
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FACC15]">
                          <i className="bi bi-cash text-[#1E1E1E]"></i>
                        </div>
                        <span className="text-white font-semibold font-lato">Precio Total</span>
                      </div>
                      <p className="text-2xl font-bold text-[#FACC15] font-montserrat">
                        ${formatNumber(formData.servicios.reduce((acc, s) => acc + (Number(s.precio || 0) * (Number(s.cantidad) || 1)), 0))}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20">
                    <button
                      type="button"
                      className="flex-1 px-8 py-4 bg-white/10 text-white font-semibold rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 font-poppins"
                      onClick={() => setActiveTab('misCitas')}
                    >
                      <i className="bi bi-arrow-left mr-2"></i>Volver a Mis Citas
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-8 py-4 font-bold rounded-full transition-all duration-300 transform hover:scale-105 font-poppins shadow-xl ${
                        loading
                          ? 'bg-gray-500 text-white cursor-not-allowed'
                          : 'bg-[#FACC15] text-[#1E1E1E] hover:bg-yellow-400 shadow-[#FACC15]/50'
                      }`}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="bi bi-arrow-repeat animate-spin mr-2"></i>Procesando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle mr-2"></i>Confirmar Cita
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Elemento decorativo */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-2xl group-hover:bg-[#FACC15]/30 transition-colors duration-500"></div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 select-none">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Cancelar Cita</h2>
              <button className="text-gray-400 hover:text-primary text-2xl font-bold" onClick={() => setShowCancelModal(false)} aria-label="Cerrar">×</button>
            </div>
            <div className="p-6">
              <p className="mb-3">Por favor, indique el motivo por el cual desea cancelar esta cita.</p>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows={3}
                placeholder="Motivo de cancelación"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={() => setShowCancelModal(false)}>Volver</button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold" onClick={confirmCancel}>Confirmar Cancelación</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de reprogramar */}
      {showRescheduleModal && rescheduleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 select-none">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Reprogramar Cita</h2>
              <button className="text-gray-400 hover:text-primary text-2xl font-bold" onClick={() => setShowRescheduleModal(false)} aria-label="Cerrar">×</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de la cita *</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={rescheduleData.fecha} onChange={e => setRescheduleData(prev => ({ ...prev, fecha: e.target.value }))} required />
                {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
              </div>
              {/* Servicios seleccionados (igual que en agendar) */}
              <div>
                <div className="font-semibold mb-2">Servicios:</div>
                {rescheduleData.servicios.map((serv, idx) => (
                  <div key={serv.id} className="relative border rounded-lg p-4 mb-2">
                    <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setRescheduleData(prev => ({ ...prev, servicios: prev.servicios.filter((_, i) => i !== idx) }))} title="Quitar servicio"><i className="bi bi-x-lg"></i></button>
                    <div className="font-bold text-lg mb-1">{serv.nombre}</div>
                    <div className="text-gray-500 text-sm mb-2">{serv.descripcion || ''}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm">Cantidad</span>
                      <button type="button" className="w-7 h-7 flex items-center justify-center border rounded text-lg" onClick={() => setRescheduleData(prev => { const servicios = [...prev.servicios]; servicios[idx].cantidad = Math.max(1, (serv.cantidad || 1) - 1); return { ...prev, servicios }; })}>-</button>
                      <span className="w-6 text-center">{serv.cantidad || 1}</span>
                      <button type="button" className="w-7 h-7 flex items-center justify-center border rounded text-lg" onClick={() => setRescheduleData(prev => { const servicios = [...prev.servicios]; servicios[idx].cantidad = (serv.cantidad || 1) + 1; return { ...prev, servicios }; })}>+</button>
                    </div>
                    <div className="mb-3">
                      <label className="text-sm font-medium">Profesional <span className="text-red-500">*</span></label>
                      <select className="w-full border rounded px-2 py-1 mt-1" value={serv.profesional} onChange={e => {
                        const selectedProfessional = professionals.find(p => p.name === e.target.value);
                        setRescheduleData(prev => { 
                          const servicios = [...prev.servicios]; 
                          servicios[idx].profesional = e.target.value;
                          if (selectedProfessional) {
                            servicios[idx].id_empleado = selectedProfessional.id;
                          }
                          return { ...prev, servicios }; 
                        });
                      }} required>
                        <option value="">Seleccionar</option>
                        {professionals.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                      {errors[`servicio_${idx}_profesional`] && <p className="text-red-500 text-xs mt-1">{errors[`servicio_${idx}_profesional`]}</p>}
                    </div>
                    <div className="mb-3">
                      <label className="text-sm font-medium">Hora <span className="text-red-500">*</span></label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex flex-col flex-1">
                          <span className="text-xs text-gray-500 mb-1">Hora de inicio</span>
                          {serv.profesional ? (
                            (() => {
                              const horasDisponibles = getHorasDisponibles(idx, serv.profesional, serv.duracion, rescheduleData.servicios);
                              const hayDisponibles = horasDisponibles.some(h => h.disponible);
                              return hayDisponibles ? (
                                <select
                                  className="border rounded px-2 py-1"
                                  value={serv.inicio}
                                  onChange={e => setRescheduleData(prev => { const servicios = [...prev.servicios]; servicios[idx].inicio = e.target.value; servicios[idx].fin = calcularHoraFin(e.target.value, servicios[idx].duracion); return { ...prev, servicios }; })}
                                >
                                  {horasDisponibles.map(h => (
                                    <option key={h.hora} value={h.hora} disabled={!h.disponible}>{h.hora}{!h.disponible ? ' (No disponible)' : ''}</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="text-red-500 text-xs">No hay horas disponibles para este profesional.</div>
                              );
                            })()
                          ) : (
                            <input type="time" className="border rounded px-2 py-1" value={serv.inicio} disabled />
                          )}
                          {errors[`servicio_${idx}_inicio`] && <p className="text-red-500 text-xs mt-1">{errors[`servicio_${idx}_inicio`]}</p>}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-xs text-gray-500 mb-1">Hora de finalización</span>
                          <input type="time" className="border rounded px-2 py-1 bg-gray-100" value={serv.fin} readOnly tabIndex={-1} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <i className="bi bi-clock"></i>
                        {serv.duracion ? `${Math.floor(serv.duracion/60)}h ${serv.duracion%60}min` : ''}
                      </div>
                      <div className="font-bold text-lg">${(Number(serv.precio || 0) * (Number(serv.cantidad) || 1)).toLocaleString()}</div>
                    </div>
                    {errors[`servicio_${idx}_duracion`] && <p className="text-red-500 text-xs mt-1">{errors[`servicio_${idx}_duracion`]}</p>}
                  </div>
                ))}
                {/* Agregar servicio */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Agregar servicio</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value=""
                    onChange={e => {
                      const selected = services.find(s => s.id === Number(e.target.value));
                      if (selected) {
                        setRescheduleData(prev => ({
                          ...prev,
                          servicios: [{
                          id: Date.now(),
                          servicioId: selected.id,
                          nombre: selected.name,
                          descripcion: selected.descripcion,
                          profesional: '',
                          inicio: '08:00',
                          fin: '09:00',
                          duracion: selected.duracion || 60,
                            precio: limpiarPrecio(selected.price ?? selected.precio ?? 0),
                          cantidad: 1
                          }, ...prev.servicios]
                        }));
                      }
                    }}
                  >
                    <option value="">Seleccionar servicio para agregar</option>
                    {services.filter(s => !rescheduleData.servicios.some(sel => sel.servicioId === s.id)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={() => setShowRescheduleModal(false)}>Cancelar</button>
                <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark font-semibold" onClick={handleReschedule}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
};

export default ClientAppointments; 
