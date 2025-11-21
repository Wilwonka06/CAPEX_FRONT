import React, { useState } from 'react';
import ModalShell from '../../../../../shared/components/ModalShell';
import { iniciarServicio } from '../services/CitasService';
import toast from 'react-hot-toast';

const IniciarServicioModal = ({ isOpen, onClose, cita, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !cita) return null;

  const handleIniciarServicio = async () => {
    setLoading(true);
    try {
      await iniciarServicio(cita.id);
      toast.success('Servicio iniciado exitosamente');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al iniciar servicio:', error);
      toast.error('Error al iniciar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <ModalShell
        iconClass="bi bi-play-circle"
        title="Iniciar Servicio"
        onClose={onClose}
        footer={(
          <>
            <button className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose} disabled={loading}><i className="bi bi-x-circle"></i>Cancelar</button>
            <button className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors flex items-center disabled:opacity-50 ml-2" onClick={handleIniciarServicio} disabled={loading}>
              {loading ? (<><i className="bi bi-arrow-clockwise animate-spin mr-2"></i>Iniciando...</>) : (<><i className="bi bi-play-circle mr-2"></i>Iniciar Servicio</>)}
            </button>
          </>
        )}
        maxWidth="max-w-md"
      >
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que quieres iniciar el servicio para la cita #{cita.id}?
          </p>
        </div>

        {/* Información de la cita */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Cliente:</span>
              <p className="text-gray-600">{cita.cliente_nombre || cita.cliente?.nombre || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Fecha:</span>
              <p className="text-gray-600">{cita.fecha_cita || cita.fecha || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Hora:</span>
              <p className="text-gray-600">{cita.hora_cita || cita.hora || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Servicios:</span>
              <p className="text-gray-600">
                {(cita.servicios || []).map(s => s.nombre || s.servicio_nombre).join(', ') || 'No especificados'}
              </p>
            </div>
          </div>
        </div>

      </ModalShell>
    </div>
  );
};

export default IniciarServicioModal;




