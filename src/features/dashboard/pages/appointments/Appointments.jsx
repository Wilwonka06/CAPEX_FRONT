import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getAppointments, addAppointment, updateAppointment } from '../../../../shared/services/AppointmentsDataService';
import { getProfessionals } from '../../../../shared/services/ProfessionalsDataService';
import { getServices } from '../../../../shared/services/ServicesDataService';
import { useOutletContext } from 'react-router-dom';
import esLocale from '@fullcalendar/core/locales/es';

import AppointmentDetailModal from './components/AppointmentDetailModal';
import AppointmentEditModal from './components/AppointmentEditModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Colores personalizados para los estados
const ESTADO_COLORES = {
  'Agendada': { bg: '#FACC15', text: '#7C5700' }, // amarillo
  'Confirmada': { bg: '#60A5FA', text: '#1E3A8A' }, // azul
  'Reprogramada': { bg: '#F59E42', text: '#7C3F00' }, // naranja
  'En Ejecucion': { bg: '#A78BFA', text: '#4B006E' }, // morado
  'Finalizada': { bg: '#34D399', text: '#065F46' }, // verde
  'Cancelada': { bg: '#F87171', text: '#991B1B' }, // rojo
  'Cancelada por cliente': { bg: '#F87171', text: '#991B1B' }, // rojo
  'Pagada': { bg: '#22D3EE', text: '#0E7490' }, // cyan
  'No asistió': { bg: '#D1D5DB', text: '#374151' }, // gris
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
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
    getAppointments().then(setAppointments);
  }, []);

  useEffect(() => {
    setTitle('Citas');
    return () => setTitle('');
  }, [setTitle]);

  // Refrescar citas tras crear/editar/cancelar
  const refreshAppointments = () => {
    getAppointments().then(data => {
      setAppointments(data);
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
      c => String(c.id) === String(info.event.id) || String(c.id) === String(info.event.extendedProps.id)
    );
    setSelectedEvent(citaActualizada || info.event.extendedProps);
    setShowDetailModal(true);
  };

  // Convertir citas a eventos para FullCalendar
  const calendarEvents = appointments.map(cita => {
    // Calcular hora inicio y fin global de la cita (mínimo y máximo de los servicios)
    let horaInicio = '08:00';
    let horaFin = '09:00';
    if (cita.servicios && cita.servicios.length > 0) {
      const inicios = cita.servicios.map(s => s.inicio);
      const fines = cita.servicios.map(s => s.fin);
      horaInicio = inicios.sort()[0];
      horaFin = fines.sort().reverse()[0];
    }
    // Color según estado
    const estadoColor = ESTADO_COLORES[cita.estado] || { bg: '#A0522D', text: '#fff' };
    return {
      id: cita.id,
      title: cita.cliente + ' - ' + (cita.servicios?.map(s => s.nombre).join(', ') || ''),
      start: `${cita.fecha}T${horaInicio}`,
      end: `${cita.fecha}T${horaFin}`,
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
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <button
            className="bg-text-main hover:bg-primary-dark text-white text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 font-semibold transition ml-auto"
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