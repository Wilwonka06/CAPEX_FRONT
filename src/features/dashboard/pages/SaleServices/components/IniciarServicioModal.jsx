import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-play-circle text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Iniciar Servicio</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
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
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <>
            <button className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose} disabled={loading}><i className="bi bi-x-circle"></i>Cancelar</button>
            <button className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors flex items-center disabled:opacity-50 ml-2" onClick={handleIniciarServicio} disabled={loading}>
              {loading ? (<><i className="bi bi-arrow-clockwise animate-spin mr-2"></i>Iniciando...</>) : (<><i className="bi bi-play-circle mr-2"></i>Iniciar Servicio</>)}
            </button>
          </>
        </div>
      </div>
    </div>
  );
};

export default IniciarServicioModal;




