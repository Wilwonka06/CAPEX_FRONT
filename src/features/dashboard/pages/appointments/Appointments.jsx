import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import appointmentsService from './API/appointmentsService';
import { useOutletContext } from 'react-router-dom';
import esLocale from '@fullcalendar/core/locales/es';

import AppointmentDetailModal from './components/AppointmentDetailModal';
import AppointmentEditModal from './components/AppointmentEditModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Search from '../../../../shared/Search';

// Colores personalizados para los estados
const ESTADO_COLORES = {
  'Agendada': { bg: '#FACC15', text: '#7C5700' }, // amarillo
  'Confirmada': { bg: '#60A5FA', text: '#1E3A8A' }, // azul
  'Reprogramada': { bg: '#F59E42', text: '#7C3F00' }, // naranja
  'En proceso': { bg: '#A78BFA', text: '#4B006E' }, // morado
  'Finalizada': { bg: '#34D399', text: '#065F46' }, // verde
  'Pagada': { bg: '#22D3EE', text: '#0E7490' }, // cyan
  'Cancelada por el usuario': { bg: '#F87171', text: '#991B1B' }, // rojo
  'No asistio': { bg: '#D1D5DB', text: '#374151' }, // gris
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  // Para pasar datos a los modales
  const [editData, setEditData] = useState(null);
  const { setTitle } = useOutletContext();

  // Cargar citas al iniciar
  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    setTitle('Citas');
    return () => setTitle('');
  }, [setTitle]);

  // Sincronizar filteredAppointments con appointments
  useEffect(() => {
    setFilteredAppointments(appointments);
  }, [appointments]);

  // Filtrar citas por término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAppointments(appointments);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    setFilteredAppointments(
      appointments.filter(appointment =>
        // Buscar por nombre del cliente (usuario o cliente)
        ((appointment.usuario?.nombre || appointment.cliente?.nombre) &&
         (appointment.usuario?.nombre || appointment.cliente?.nombre).toLowerCase().includes(lowerTerm)) ||
        // Buscar por fecha
        (appointment.fecha_servicio && appointment.fecha_servicio.includes(searchTerm)) ||
        // Buscar por estado
        (appointment.estado && appointment.estado.toLowerCase().includes(lowerTerm)) ||
        // Buscar por servicios
        (appointment.servicios && appointment.servicios.some(servicio =>
          (servicio.servicio?.nombre || servicio.nombre_servicio) &&
          (servicio.servicio?.nombre || servicio.nombre_servicio).toLowerCase().includes(lowerTerm)
        )) ||
        // Buscar por teléfono del cliente
        ((appointment.usuario?.telefono || appointment.cliente?.telefono) &&
         (appointment.usuario?.telefono || appointment.cliente?.telefono).includes(searchTerm)) ||
        // Buscar por correo del cliente
        ((appointment.usuario?.correo || appointment.cliente?.correo) &&
         (appointment.usuario?.correo || appointment.cliente?.correo).toLowerCase().includes(lowerTerm))
      )
    );
  }, [searchTerm, appointments]);

  // Cargar citas desde la API
  const loadAppointments = async () => {
    try {
      const response = await appointmentsService.getAll();
      if (response.success) {
        // El backend devuelve { success: true, data: { citas: [...] } }
        // pero el frontend espera { success: true, data: [...] }
        const appointmentsData = response.data?.citas || response.data || [];
        setAppointments(appointmentsData);
      } else {
        console.error('API returned error:', response.message);
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error loading appointments from API:', err);
      console.error('Error details:', err.response?.data || err.message);
      // Mostrar datos de ejemplo para desarrollo
      setAppointments([]);
      toast.error('Error al cargar citas. Verifica la conexión con el servidor.', { position: 'top-right' });
    }
  };

  // Refrescar citas tras crear/editar/cancelar
  const refreshAppointments = () => {
    loadAppointments().then(() => {
      toast.success('Citas actualizadas', { position: 'top-right' });
    }).catch(() => {
      toast.error('Error al actualizar citas', { position: 'top-right' });
    });
  };

  // Al hacer clic en un día vacío
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setShowCreateModal(true);
  };

  // Al hacer clic en una cita existente
  const handleEventClick = (info) => {
    // Buscar la cita actualizada por id en appointments (comparación robusta)
    const citaActualizada = appointments.find(
      c => String(c.id_cita) === String(info.event.id) || String(c.id_cita) === String(info.event.extendedProps?.id_cita)
    );
    setSelectedEvent(citaActualizada || info.event.extendedProps);
    setShowDetailModal(true);
  };

  // Convertir citas a eventos para FullCalendar
  const calendarEvents = filteredAppointments.map(cita => {
    // Usar horas de la cita del backend
    const horaInicio = cita.hora_entrada || '08:00:00';
    const horaFin = cita.hora_salida || '09:00:00';

    // Color según estado
    const estadoColor = ESTADO_COLORES[cita.estado] || { bg: '#A0522D', text: '#fff' };
    return {
      id: cita.id_cita,
      title: (cita.usuario?.nombre || cita.cliente?.nombre || 'Cliente') + ' - ' + (cita.servicios?.map(s => s.servicio?.nombre || s.nombre_servicio).join(', ') || 'Sin servicios'),
      start: `${cita.fecha_servicio}T${horaInicio}`,
      end: `${cita.fecha_servicio}T${horaFin}`,
      ...cita,
      color: estadoColor.bg,
      textColor: estadoColor.text,
    };
  });

  return (
    <div className="min-h-screen bg-background p-6 font-inter">
      <div className="w-full">
        {/* Leyenda de estados */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200 flex flex-col items-center">
            <span className="font-semibold text-text-main mb-2 text-center text-sm">¿Qué significa cada color?</span>
            <div className="flex flex-wrap gap-4 justify-center">
              {Object.entries(ESTADO_COLORES).map(([estado, color]) => (
                <span key={estado} className="flex items-center gap-2 text-xs font-medium">
                  <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ background: color.bg, borderColor: color.bg }}></span>
                  <span className="text-text-main">{estado}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Indicador de datos de ejemplo */}
        {appointments.length > 0 && appointments[0]?.id_cita === 1 && (
          <div className="mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
              <i className="bi bi-exclamation-triangle text-yellow-600 text-lg"></i>
              <div className="text-sm">
                <span className="font-semibold text-yellow-800">Modo de desarrollo:</span>
                <span className="text-yellow-700 ml-1">Mostrando datos de ejemplo debido a un error en el servidor.</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Search
            searchTerm={searchTerm}
            handleSearch={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar citas por cliente, fecha, estado o servicio..."
          />
          <button
            className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 font-semibold transition"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-calendar-plus text-lg"></i>
            Nueva cita
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 overflow-x-auto text-xs">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            locale={esLocale}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              list: 'Lista',
              prev: 'Anterior',
              next: 'Siguiente',
            }}
            dayHeaderFormat={{ weekday: 'short' }}
            titleFormat={{ year: 'numeric', month: 'long' }}
            contentHeight="auto"
            handleWindowResize={true}
            dayMaxEventRows={true}
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            dayCellClassNames={() => 'min-w-[90px]'}
            slotLabelClassNames={() => 'whitespace-nowrap'}
            allDayText="Todo el día"
          />
        </div>
        {/* Modales */}
        {showDetailModal && (
          <AppointmentDetailModal
            cita={selectedEvent}
            onClose={() => setShowDetailModal(false)}
            onEdit={data => { setEditData(data); setShowEditModal(true); }}
            onCancel={refreshAppointments}
          />
        )}
        {showEditModal && (
          <AppointmentEditModal
            cita={editData}
            onClose={() => setShowEditModal(false)}
            onSave={refreshAppointments}
          />
        )}
        {showCreateModal && (
          <AppointmentEditModal
            fecha={selectedDate}
            onClose={() => setShowCreateModal(false)}
            onSave={refreshAppointments}
          />
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Appointments; 