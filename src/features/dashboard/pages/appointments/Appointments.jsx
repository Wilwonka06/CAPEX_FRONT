import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getAppointments, addAppointment, updateAppointment } from '../../../../shared/services/AppointmentsDataService';
import { getProfessionals } from '../../../../shared/services/ProfessionalsDataService';
import { getServices } from '../../../../shared/services/ServicesDataService';

import AppointmentDetailModal from './components/AppointmentDetailModal';
import AppointmentEditModal from './components/AppointmentEditModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  // Para pasar datos a los modales
  const [editData, setEditData] = useState(null);

  // Cargar citas al iniciar
  useEffect(() => {
    getAppointments().then(setAppointments);
  }, []);

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
    // Color gris si está cancelada
    const isCancelada = cita.estado === 'Cancelada' || cita.estado === 'Cancelada por cliente';
    return {
      id: cita.id,
      title: cita.cliente + ' - ' + (cita.servicios?.map(s => s.nombre).join(', ') || ''),
      start: `${cita.fecha}T${horaInicio}`,
      end: `${cita.fecha}T${horaFin}`,
      ...cita,
      color: isCancelada ? '#9ca3af' : '#A0522D', // gris-400 o color estándar
      textColor: isCancelada ? '#374151' : '#fff', // gris-700 o blanco
    };
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Citas</h1>
          <button
            className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-primary-dark font-semibold transition"
            onClick={() => setShowCreateModal(true)}
          >
            + Nueva cita
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
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
            locale="es"
            // eventColor="#A0522D" // ahora se maneja por evento
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