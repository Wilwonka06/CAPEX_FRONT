import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import appointmentsService from './API/appointmentsService';
import { useOutletContext, useNavigate } from 'react-router-dom';
import esLocale from '@fullcalendar/core/locales/es';

import AppointmentDetailModal from './components/AppointmentDetailModal';
import AppointmentEditModal from './components/AppointmentEditModal';
import AppointmentCreateModal from './components/AppointmentCreateModal';
import toast from 'react-hot-toast';
import Search from '../../../../shared/Search';
import CalendarContentSkeleton from '../../../../shared/components/CalendarContentSkeleton';
import { filterBySearch } from '../../../../shared/utils/searchHelper';
import '../../../../shared/styles/calendar.css';

// Colores personalizados para los estados
const ESTADO_COLORES = {
  'Agendada': { bg: '#FACC15', text: '#7C5700' }, // amarillo
  'Confirmada': { bg: '#60A5FA', text: '#1E3A8A' }, // azul
  'Reprogramada': { bg: '#F59E42', text: '#7C3F00' }, // naranja
  'En ejecución': { bg: '#2196F3', text: '#FFFFFF' }, // azul (cambió de morado)
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
  const [loading, setLoading] = useState(true);
  // Para pasar datos a los modales
  const [editData, setEditData] = useState(null);
  const { setTitle } = useOutletContext();
  const navigate = useNavigate();

  const handleSaveAppointment = async (savedCita) => {
    await refreshAppointments();
    if (savedCita && (savedCita.estado === 'En ejecución')) {
      navigate('/dashboard/ventas-servicios');
    }
  };

  // Cargar citas al iniciar
  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    setTitle('Módulo de Agendamiento de citas');
    return () => setTitle('');
  }, [setTitle]);

  // Sincronizar filteredAppointments con appointments
  useEffect(() => {
    setFilteredAppointments(appointments);
  }, [appointments]);

  // Filtrar citas por término de búsqueda usando la función helper universal
  useEffect(() => {
    setFilteredAppointments(filterBySearch(appointments, searchTerm));
  }, [searchTerm, appointments]);

  // Cargar citas desde la API
  const loadAppointments = async () => {
    setLoading(true);
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
      toast.error('Error al cargar citas. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar citas tras crear/editar/cancelar
  const refreshAppointments = async () => {
    await loadAppointments();
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
    // Usar horas reales del backend (hora_entrada y hora_salida calculadas)
    const horaInicio = cita.hora_entrada || '08:00:00';
    const horaFin = cita.hora_salida || '09:00:00';

    // Color según estado
    const estadoColor = ESTADO_COLORES[cita.estado] || { bg: '#A0522D', text: '#fff' };

    // Nombre del cliente
    const clienteNombre = cita.usuario?.nombre || cita.cliente?.nombre || 'Cliente';

    // Servicios
    const serviciosTexto = cita.servicios?.map(s => s.servicio?.nombre || s.nombre_servicio).join(', ') || 'Sin servicios';

    // Formatear hora para mostrar
    const horaInicioFormato = horaInicio.substring(0, 5);
    const horaFinFormato = horaFin.substring(0, 5);

    return {
      id: cita.id_cita,
      title: `${horaInicioFormato} - ${clienteNombre}: ${serviciosTexto}`,
      start: `${cita.fecha_servicio}T${horaInicio}`,
      end: `${cita.fecha_servicio}T${horaFin}`,
      ...cita,
      backgroundColor: estadoColor.bg,
      borderColor: estadoColor.bg,
      textColor: estadoColor.text,
      classNames: ['custom-event'],
      extendedProps: {
        ...cita,
        estado: cita.estado,
        clienteNombre,
        serviciosTexto,
      }
    };
  });

  return (
    <div className="min-h-screen bg-background p-6 font-inter">
      <div className="w-full">
        {/* Leyenda de estados */}
        <div className="mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-semibold text-gray-700 mr-2">Estados:</span>
              {Object.entries(ESTADO_COLORES).map(([estado, color]) => (
                <div key={estado} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ background: color.bg }}
                  ></span>
                  <span className="text-xs text-gray-600">{estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>


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
            <i className="bi bi-calendar-plus text-sm"></i>
            Crear cita
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 overflow-x-auto">
          {loading ? (
            <CalendarContentSkeleton />
          ) : (
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
                prev: '←',
                next: '→',
              }}
              dayHeaderFormat={{ weekday: 'short' }}
              titleFormat={{ year: 'numeric', month: 'long' }}
              contentHeight="auto"
              handleWindowResize={true}
              dayMaxEventRows={3}
              moreLinkClick="popover"
              slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              dayCellClassNames="hover:bg-gray-50 transition-colors"
              slotLabelClassNames="text-gray-600 font-medium"
              allDayText="Todo el día"
              eventDisplay="block"
              eventTextColor="#ffffff"
              eventBorderColor="transparent"
              eventClassNames="shadow-md hover:shadow-lg"
            />
          )}
        </div>
        {/* Modales */}
        {showDetailModal && (
          <AppointmentDetailModal
            cita={selectedEvent}
            onClose={() => setShowDetailModal(false)}
            onEdit={data => { 
              setEditData(data); 
              setShowDetailModal(false); // Cerrar modal de detalle
              setShowEditModal(true); // Abrir modal de edición
            }}
            onCancel={refreshAppointments}
          />
        )}
        {showEditModal && (
          <AppointmentEditModal
            cita={editData}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveAppointment}
          />
        )}
        {showCreateModal && (
          <AppointmentCreateModal
            fecha={selectedDate}
            onClose={() => setShowCreateModal(false)}
            onSave={handleSaveAppointment}
          />
        )}
      </div>
    </div>
  );
};

export default Appointments; 
