import React, { useState } from 'react';
import { iniciarServicio } from '../services/CitasService';
import { toast } from 'react-toastify';

const IniciarServicioModal = ({ isOpen, onClose, cita, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !cita) return null;

  const handleIniciarServicio = async () => {
    setLoading(true);
    try {
      await iniciarServicio(cita.id);
      toast.success('Servicio iniciado exitosamente', { position: 'top-right' });
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al iniciar servicio:', error);
      toast.error('Error al iniciar el servicio', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative animate-fade-in">
        <button 
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold" 
          onClick={onClose} 
          aria-label="Cerrar"
        >
          ×
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-play-circle text-white text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-primary">Iniciar Servicio</h2>
          <p className="text-sm text-gray-600 mt-2">
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

        <div className="flex justify-end gap-3">
          <button 
            className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors flex items-center disabled:opacity-50" 
            onClick={handleIniciarServicio}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Iniciando...
              </>
            ) : (
              <>
                <i className="bi bi-play-circle mr-2"></i>
                Iniciar Servicio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IniciarServicioModal;

