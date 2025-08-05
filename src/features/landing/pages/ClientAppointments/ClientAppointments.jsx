import React, { useState, useEffect } from 'react';
import { getAppointments, addAppointment, updateAppointment, APPOINTMENT_STATES } from '../../../../shared/services/AppointmentsDataService';
import { getServices } from '../../../../shared/services/ServicesDataService';
import { getProfessionals } from '../../../../shared/services/ProfessionalsDataService';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import Paginator from '../../../../shared/Paginator';
import Search from '../../../../shared/Search';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

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
      toast.success('¡Cita agendada correctamente!', { position: 'top-right' });
      // Recargar citas
      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);
      setActiveTab('misCitas');
    } catch (error) {
      toast.error('Ocurrió un error al agendar la cita.', { position: 'top-right' });
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
      toast.error('La cita no tiene servicios asociados. No se puede reprogramar.', { position: 'top-right' });
      return false;
    }
    // Tomar la hora de inicio más temprana de todos los servicios
    const inicios = appointment.servicios.map(s => s.inicio).filter(Boolean);
    if (inicios.length === 0) {
      toast.error('No se encontró una hora de inicio válida para la cita.', { position: 'top-right' });
      return false;
    }
    const horaInicio = inicios.sort()[0];
    // Crear la fecha en zona local para evitar desfases
    const [year, month, day] = appointment.fecha.split('-').map(Number);
    const [hour, minute] = horaInicio.split(':').map(Number);
    const citaDate = new Date(year, month - 1, day, hour, minute);
    if (isNaN(citaDate.getTime())) {
      toast.error('La fecha u hora de la cita es inválida.', { position: 'top-right' });
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
      toast.error('Por favor indica el motivo de cancelación.', { position: 'top-right' });
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
      toast.info('Cita cancelada', { position: 'top-right' });
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
      toast.success('¡Cita reprogramada correctamente!', { position: 'top-right' });
      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);
    } catch (error) {
      toast.error('Ocurrió un error al reprogramar la cita.', { position: 'top-right' });
      // Recargar citas para evitar inconsistencias visuales
      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);
    }
  };

  // Función para abrir modal de reprogramar
  const openRescheduleModal = (appointment) => {
    if ((appointment.reprogramaciones || 0) >= 3) {
      toast.error('Esta cita ya ha sido reprogramada 3 veces y no puede reprogramarse más.', { position: 'top-right' });
      return;
    }
    setRescheduleData({ ...appointment });
    setShowRescheduleModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 bg-white min-h-screen">
      {/* Tabs superiores */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold text-base border-b-4 ${activeTab === 'misCitas' ? 'bg-white border-[#a0522d] text-[#a0522d]' : 'bg-[#fff6ee] border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('misCitas')}
        >
          <i className="bi bi-calendar-event mr-2"></i>Mis citas
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold text-base border-b-4 ${activeTab === 'agendar' ? 'bg-white border-[#a0522d] text-[#a0522d]' : 'bg-[#fff6ee] border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('agendar')}
        >
          <i className="bi bi-plus-lg mr-2"></i>Agendar cita
        </button>
      </div>
      {/* Barra de búsqueda */}
      <div className="mb-6 flex items-center">
        <div className="relative w-full">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#a0522d] text-lg"></i>
          <input
            type="text"
            className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b] bg-white"
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
            <div className="text-center text-gray-400 py-12">No tienes citas registradas.</div>
          ) : (
            paginatedAppointments.map((a, idx) => (
              <div key={a.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
                {/* Encabezado de la cita */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#fff6ee] rounded-full w-10 h-10 flex items-center justify-center text-[#a0522d] text-xl">
                      <i className="bi bi-person"></i>
                      </div>
                            <div>
                      <div className="font-bold text-lg text-[#6d3b3b]">Cita: {a.cliente}</div>
                      <div className="flex items-center gap-3 text-[#a0522d] text-sm mt-1">
                        <i className="bi bi-calendar-event"></i> {formatDate(a.fecha)}
                        <i className="bi bi-clock ms-2"></i> {a.servicios && a.servicios.length > 0 ? `${a.servicios[0].inicio} - ${a.servicios[a.servicios.length-1].fin}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(a.estado)}`}>{a.estado}</span>
                </div>
                {/* Servicios */}
                <div className="flex items-center gap-2 text-[#a0522d] font-semibold mb-1">
                  <i className="bi bi-scissors"></i> Servicios:
                </div>
                <div className="space-y-2">
                  {a.servicios && a.servicios.map((s, i) => (
                    <div key={s.id || i} className="bg-white rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-100">
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-[#6d3b3b]">{s.nombre}</div>
                        <div className="flex items-center gap-3 text-sm text-[#a0522d]">
                          <i className="bi bi-person-badge"></i> {s.profesional}
                          <span><i className="bi bi-clock"></i> {s.duracion ? `${Math.floor(s.duracion/60)}h ${s.duracion%60}min` : ''}</span>
                          <span>Cantidad: {s.cantidad}</span>
                          <span><i className="bi bi-play"></i> Inicio: {s.inicio}</span>
                        </div>
                        </div>
                      <div className="font-bold text-2xl text-[#a0522d] md:text-right mt-2 md:mt-0">${Number(s.precio || 0).toLocaleString('es-CO')}</div>
                    </div>
                  ))}
                </div>
                {/* Resumen y acciones */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-2">
                  <div className="flex gap-6 text-[#a0522d] text-sm">
                    <span>Duración Total: {a.servicios && a.servicios.length > 0 ? `${Math.floor(a.servicios.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0)/60)}h ${a.servicios.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0)%60}min` : ''}</span>
                    <span>Precio Total: ${a.servicios && a.servicios.reduce((acc, s) => acc + (Number(s.precio || 0) * (Number(s.cantidad) || 1)), 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {a.estado === 'Agendada' && (
                      <>
                        <button onClick={() => openRescheduleModal(a)} className="flex items-center gap-1 border border-[#a0522d] text-[#a0522d] px-4 py-1.5 rounded hover:bg-[#fff6ee] font-semibold"><i className="bi bi-pencil"></i> Reprogramar</button>
                        <button onClick={() => openCancelModal(a.id)} className="flex items-center gap-1 border border-red-400 text-red-500 px-4 py-1.5 rounded hover:bg-red-50 font-semibold"><i className="bi bi-x-lg"></i> Cancelar</button>
                      </>
                )}
              </div>
                </div>
              </div>
            ))
          )}
          {/* Paginador */}
          {totalPages > 1 && paginatedAppointments.length >= 3 && (
            <div className="mt-6 flex justify-center">
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
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Datos Personales</h3>
              <div className="mb-2">
                <label className="block text-sm font-medium">Nombre completo *</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={formData.cliente} onChange={e => setFormData(prev => ({ ...prev, cliente: e.target.value }))} required />
                {errors.cliente && <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>}
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Teléfono *</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={formData.telefono} onChange={e => setFormData(prev => ({ ...prev, telefono: e.target.value }))} required />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Tipo de documento *</label>
                <select className="w-full border rounded px-3 py-2" value={formData.tipoDocumento} disabled readOnly>
                  <option value="">Seleccionar</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="NIT">NIT</option>
                  <option value="PAS">Pasaporte</option>
                </select>
                {errors.tipoDocumento && <p className="text-red-500 text-xs mt-1">{errors.tipoDocumento}</p>}
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Documento *</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={formData.documento} disabled readOnly />
                {errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Fecha de la cita *</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={formData.fecha} onChange={e => setFormData(prev => ({ ...prev, fecha: e.target.value }))} required />
                {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
              </div>
            </div>
            {/* Slider de servicios disponibles */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Servicios Disponibles</h3>
              <p className="text-sm text-gray-500 mb-2">Selecciona los servicios que deseas incluir en tu cita</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 disabled:opacity-30"
                  onClick={() => setServicePage(p => Math.max(0, p - 1))}
                  disabled={servicePage === 0}
                >
                  <i className="bi bi-chevron-left text-lg"></i>
                </button>
                <div className="flex gap-4 flex-1 justify-center">
                  {paginatedServices.map(serv => (
                    <div key={serv.id} className="w-60 min-w-[220px] max-w-xs border rounded p-2 flex flex-col items-center bg-white shadow-sm">
                      <div className="w-28 h-28 mb-2 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                        {serv.imagen
                          ? <img src={serv.imagen} alt={serv.name} className="object-cover w-full h-full" />
                          : <span className="text-gray-400 text-4xl"><i className="bi bi-image"></i></span>
                        }
                      </div>
                      <div className="font-semibold text-center">{serv.name}</div>
                      <div className="text-xs text-gray-500 mb-1 text-center">{serv.descripcion || ''}</div>
                      <div className="text-xs text-gray-500 mb-1">{serv.duracion ? `${Math.floor(serv.duracion/60)}h ${serv.duracion%60}min` : ''}</div>
                      <div className="font-bold mb-2">${limpiarPrecio(serv.price ?? serv.precio ?? 0).toLocaleString()}</div>
                      <button type="button" className="bg-primary text-white px-2 py-1 rounded text-xs" onClick={() => addService(serv)}>Agregar</button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 disabled:opacity-30"
                  onClick={() => setServicePage(p => Math.min(totalServicePages - 1, p + 1))}
                  disabled={servicePage === totalServicePages - 1 || totalServicePages === 0}
                >
                  <i className="bi bi-chevron-right text-lg"></i>
                </button>
              </div>
              <div className="flex justify-center mt-2 gap-1">
                {Array.from({ length: totalServicePages }).map((_, idx) => (
                  <span key={idx} className={`w-2 h-2 rounded-full ${servicePage === idx ? 'bg-primary' : 'bg-gray-300'}`}></span>
                ))}
              </div>
              {errors.servicios && <p className="text-red-500 text-xs mt-1">{errors.servicios}</p>}
            </div>
          </div>
          {/* Columna derecha: Servicios seleccionados + resumen */}
          <div className="space-y-4">
            {/* Servicios seleccionados */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Servicios Seleccionados</h3>
              {formData.servicios.length === 0 ? (
                <p className="text-gray-500 text-sm">No has seleccionado servicios.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {formData.servicios.map((serv, idx) => (
                    <div key={serv.id} className="relative border rounded-lg p-6 min-h-[260px]">
                      {/* Botón quitar en la esquina superior derecha */}
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                        onClick={() => removeService(idx)}
                        title="Quitar servicio"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                      {/* Nombre y descripción del servicio */}
                      <div className="font-bold text-lg mb-1">{serv.nombre}</div>
                      <div className="text-gray-500 text-sm mb-3">{serv.descripcion || ''}</div>
                      {/* Cantidad */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">Cantidad</span>
                        <button type="button" className="w-7 h-7 flex items-center justify-center border rounded text-lg" onClick={() => updateService(idx, 'cantidad', Math.max(1, (serv.cantidad || 1) - 1))}>-</button>
                        <span className="w-6 text-center">{serv.cantidad || 1}</span>
                        <button type="button" className="w-7 h-7 flex items-center justify-center border rounded text-lg" onClick={() => updateService(idx, 'cantidad', (serv.cantidad || 1) + 1)}>+</button>
                      </div>
                      {/* Profesional */}
                      <div className="mb-3">
                        <label className="text-sm font-medium">Profesional <span className="text-red-500">*</span></label>
                        <select className="w-full border rounded px-2 py-1 mt-1" value={serv.profesional} onChange={e => updateService(idx, 'profesional', e.target.value)} required>
                          <option value="">Seleccionar</option>
                          {professionals.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        {errors[`servicio_${idx}_profesional`] && <p className="text-red-500 text-xs mt-1">{errors[`servicio_${idx}_profesional`]}</p>}
                      </div>
                      {/* Hora */}
                      <div className="mb-3">
                        <label className="text-sm font-medium">Hora <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 mt-1">
                          <div className="flex flex-col flex-1">
                            <span className="text-xs text-gray-500 mb-1">Hora de inicio</span>
                            {serv.profesional ? (
                              (() => {
                                const horasDisponibles = getHorasDisponibles(idx, serv.profesional, serv.duracion);
                                const hayDisponibles = horasDisponibles.some(h => h.disponible);
                                return hayDisponibles ? (
                                  <select
                                    className="border rounded px-2 py-1"
                                    value={serv.inicio}
                                    onChange={e => updateStartTime(idx, e.target.value)}
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
                      {/* Duración y precio */}
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
                </div>
              )}
            </div>
            {/* Resumen */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Resumen</h3>
              <div className="text-sm mb-1">Fecha: <span className="font-medium">{formData.fecha || '-'}</span></div>
              <div className="text-sm mb-1">Hora inicio: <span className="font-medium">{formData.servicios[0]?.inicio || '-'}</span> - Hora fin: <span className="font-medium">{formData.servicios[formData.servicios.length-1]?.fin || '-'}</span></div>
              <div className="text-sm mb-1">Duración total: <span className="font-medium">{formData.servicios.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0)} min</span></div>
              <div className="text-sm mb-1">Precio total: <span className="font-medium">${formData.servicios.reduce((acc, s) => acc + (Number(s.precio || 0) * (Number(s.cantidad) || 1)), 0).toLocaleString()}</span></div>
              <div className="flex gap-2 mt-4">
                <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => setActiveTab('misCitas')}>Cancelar</button>
                <button type="button" className="bg-primary text-white px-4 py-2 rounded" onClick={handleSubmit} disabled={loading}>Pedir cita</button>
              </div>
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
                      <select className="w-full border rounded px-2 py-1 mt-1" value={serv.profesional} onChange={e => setRescheduleData(prev => { const servicios = [...prev.servicios]; servicios[idx].profesional = e.target.value; return { ...prev, servicios }; })} required>
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
      <ToastContainer />
    </div>
  );
};

export default ClientAppointments; 