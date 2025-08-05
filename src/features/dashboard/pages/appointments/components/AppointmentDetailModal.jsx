import { useState } from 'react';
import PropTypes from 'prop-types';
import { updateAppointment, APPOINTMENT_STATES } from '../../../../../shared/services/AppointmentsDataService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function limpiarPrecio(valor) {
  return Number(String(valor).replace(/[^\d]/g, '')) || 0;
}

// Colores personalizados para los estados (debe coincidir con Appointments.jsx)
const ESTADO_COLORES = {
  'Agendada': { bg: '#FACC15', text: '#7C5700' },
  'Confirmada': { bg: '#60A5FA', text: '#1E3A8A' },
  'Reprogramada': { bg: '#F59E42', text: '#7C3F00' },
  'En Ejecucion': { bg: '#A78BFA', text: '#4B006E' },
  'Finalizada': { bg: '#34D399', text: '#065F46' },
  'Cancelada': { bg: '#F87171', text: '#991B1B' },
  'Cancelada por cliente': { bg: '#F87171', text: '#991B1B' },
  'Pagada': { bg: '#22D3EE', text: '#0E7490' },
  'No asistió': { bg: '#D1D5DB', text: '#374151' },
};

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'Agendada': return 'text-yellow-600';
    case 'Confirmada': return 'text-blue-600';
    case 'Reprogramada': return 'text-orange-600';
    case 'En Ejecucion': return 'text-purple-600';
    case 'Finalizada': return 'text-green-600';
    case 'Cancelada': return 'text-red-600';
    case 'Pagada': return 'text-green-800';
    case 'No asistió': return 'text-gray-500';
    default: return 'text-gray-700';
  }
};

const AppointmentDetailModal = ({ cita, onClose, onEdit, onCancel }) => {
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [errorCancel, setErrorCancel] = useState(null);
  if (!cita) return null;
  // const estadoObj = APPOINTMENT_STATES.find(e => e.nombre === cita.estado); // Eliminado para no mostrar descripción
  const fechaStr = cita.fecha ? new Date(cita.fecha).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  // Calcular hora inicio y fin global
  let horaInicio = '08:00', horaFin = '09:00', duracionTotal = 0, valorTotal = 0;
  if (cita.servicios && cita.servicios.length > 0) {
    const inicios = cita.servicios.map(s => s.inicio);
    const fines = cita.servicios.map(s => s.fin);
    horaInicio = inicios.sort()[0];
    horaFin = fines.sort().reverse()[0];
    duracionTotal = cita.servicios.reduce((acc, s) => acc + (parseInt(s.duracion) || 0), 0);
    valorTotal = cita.servicios.reduce((acc, s) => acc + (limpiarPrecio(s.precio) * (parseInt(s.cantidad) || 1)), 0);
  }
  

  const handleCancelar = async () => {
    setLoadingCancel(true);
    setErrorCancel(null);
    console.log('Intentando cancelar cita...');
    try {
      await updateAppointment({ ...cita, id: cita.id, estado: 'Cancelada' });
      console.log('Cita cancelada en storage');
      if (onCancel) await onCancel();
      onClose();
      toast.info('Cita cancelada', { position: 'top-right' });
    } catch (err) {
      setErrorCancel('Error al cancelar la cita. Intenta de nuevo.');
      console.error('Error al cancelar:', err);
      toast.error('Error al cancelar la cita', { position: 'top-right' });
    } finally {
      setLoadingCancel(false);
    }
  };

  // Determinar si la cita está cancelada
  const esCancelada = cita.estado === 'Cancelada' || cita.estado === 'Cancelada por cliente';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 select-none font-inter">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-xl relative animate-fade-in max-h-[90vh] flex flex-col mt-8`}>
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl flex items-center justify-between px-8 py-5">
          <h2 className="text-2xl font-bold text-primary m-0">Detalles de la cita</h2>
          <div className="flex items-center gap-2">
            {/* Ícono de editar solo si no está cancelada */}
            {!esCancelada && (
              <button
                className="text-gray-400 hover:text-primary text-xl mr-2"
                onClick={() => { onEdit(cita); onClose(); }}
                title="Editar cita"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 013.182 3.182L7.5 19.213l-4.182.545.545-4.182 12.999-12.09z" />
                </svg>
              </button>
            )}
            <button className="text-gray-400 hover:text-primary text-2xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
          </div>
        </div>
        <div className="overflow-y-auto p-8 flex-1 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-xs px-2 py-1 rounded-full" style={{ background: (ESTADO_COLORES[cita.estado]?.bg || '#e5e7eb'), color: (ESTADO_COLORES[cita.estado]?.text || '#374151'), border: '1px solid #e5e7eb' }}>{cita.estado}</span>
            <span className="text-xs text-gray-400">{fechaStr}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="font-semibold mb-2 text-text-main">Información del Cliente</div>
            <div className="flex gap-8 text-sm">
              <div><span className="font-medium">Nombre:</span> {cita.cliente}</div>
              <div><span className="font-medium">Teléfono:</span> {cita.telefono}</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="font-semibold mb-2 text-text-main">Servicios</div>
            {cita.servicios && cita.servicios.map((s, idx) => (
              <div key={idx} className="border-b border-gray-200 py-2 flex flex-col md:flex-row md:items-center md:gap-8">
                <div className="flex-1">
                  <span className="font-semibold">{s.nombre}</span> <span className="text-xs text-gray-500">{s.duracion} min ${s.precio}</span>
                  <div className="text-xs text-gray-500">Profesional: {s.profesional} | Cantidad: {s.cantidad || 1}</div>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>Hora inicio: <span className="font-semibold">{s.inicio}</span></div>
                  <div>Hora finalización: <span className="font-semibold">{s.fin}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="font-semibold mb-2 text-text-main">Horario</div>
            <div className="flex gap-8 text-sm">
              <div>Hora inicio: <span className="font-semibold">{horaInicio} h</span></div>
              <div>Hora finalización: <span className="font-semibold">{horaFin} h</span></div>
              <div>Duración total: <span className="font-semibold">{duracionTotal} min</span></div>
            </div>
          </div>
          <div className="flex justify-end items-center gap-8">
            <div className="text-lg font-bold text-text-main">Valor Total: <span className="text-primary">${valorTotal}</span></div>
          </div>
        </div>
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-2xl flex justify-end gap-2 px-8 py-5">
          {/* Botón cancelar solo si !esCancelada */}
          {!esCancelada && (
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded shadow hover:bg-gray-300 font-semibold" onClick={handleCancelar} disabled={loadingCancel}>
              {loadingCancel ? 'Cancelando...' : 'Cancelar cita'}
            </button>
          )}
          {errorCancel && <span className="text-xs text-red-500 ml-2">{errorCancel}</span>}
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded shadow hover:bg-gray-300 font-semibold" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

AppointmentDetailModal.propTypes = {
  cita: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default AppointmentDetailModal; 