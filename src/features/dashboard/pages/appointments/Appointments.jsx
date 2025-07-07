import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import AppointmentModal from './components/AppointmentModal';

const Appointments = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Eventos de ejemplo
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Lavado de extensiones',
      start: '2024-04-15T08:00:00',
      end: '2024-04-15T09:00:00',
      color: '#A0522D', // primary
      cliente: 'Sara Alvarez',
      telefono: '3103390667',
      estado: 'Agendada',
      servicios: [
        { name: 'Lavado de extensiones', profesional: 'Carlos Rodriguez', inicio: '08:00', fin: '09:00', duration: 60, price: 45 },
      ],
    },
    {
      id: '2',
      title: 'Retoque de extensiones',
      start: '2024-04-16T10:00:00',
      end: '2024-04-16T11:00:00',
      color: '#D2B48C', // accent
      cliente: 'Maria Lopez',
      telefono: '3201234567',
      estado: 'Completada',
      servicios: [
        { name: 'Retoque de extensiones', profesional: 'Maria Lopez', inicio: '10:00', fin: '11:00', duration: 60, price: 50 },
      ],
    },
  ]);

  // Al hacer click en un día/hora
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setShowCreateModal(true);
  };

  // Al hacer click en un evento existente
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowEditModal(true);
  };

  // Extraer datos de la cita seleccionada para el modal de edición
  const getEditModalData = () => {
    if (!selectedEvent) return {};
    const { cliente, telefono, estado, servicios, start, end } = selectedEvent.extendedProps || {};
    return {
      cliente: cliente || '',
      telefono: telefono || '',
      estado: estado || '',
      serviciosSeleccionados: servicios || [],
      fecha: start ? start.toISOString().slice(0, 10) : '',
      horaInicio: start ? start.toTimeString().slice(0, 5) : '',
      horaFin: end ? end.toTimeString().slice(0, 5) : '',
    };
  };

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
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            locale="es"
            eventColor="#A0522D"
          />
        </div>
        {/* Modal de crear cita */}
        <AppointmentModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={() => setShowCreateModal(false)}
          initialData={selectedDate ? { fecha: selectedDate } : {}}
        />
        {/* Modal de editar cita */}
        <AppointmentModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={() => setShowEditModal(false)}
          initialData={getEditModalData()}
        />
      </div>
    </div>
  );
};

export default Appointments; 