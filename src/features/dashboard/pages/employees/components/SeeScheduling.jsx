import React, { useState } from 'react';

const diasSemana = [
  'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'
];

/**
 * schedulings: array de programaciones
 * onClose: función para cerrar el cuadro
 * initialIndex: índice inicial a mostrar (opcional)
 */
const SeeScheduling = ({ schedulings = [], onClose, initialIndex = 0 }) => {
  const [current, setCurrent] = useState(initialIndex);
  if (!schedulings || schedulings.length === 0) return null;
  const scheduling = schedulings[current];

  const handlePrev = () => {
    setCurrent((prev) => (prev > 0 ? prev - 1 : prev));
  };
  const handleNext = () => {
    setCurrent((prev) => (prev < schedulings.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="mt-8 p-6 bg-gray-50 border border-accent-light rounded-lg">
      <h2 className="text-lg font-bold mb-4 text-text-main">Detalle de Programación</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <span className="font-semibold text-text-main">Fecha inicio: </span>
          <span>{scheduling.fechaInicio || '-'}</span>
        </div>
        <div>
          <span className="font-semibold text-text-main">Fecha fin: </span>
          <span>{scheduling.fechaFin || '-'}</span>
        </div>
        <div>
          <span className="font-semibold text-text-main">Repetición: </span>
          <span>{scheduling.repeticion || '-'}</span>
        </div>
        <div>
          <span className="font-semibold text-text-main">Días: </span>
          <span>{(scheduling.dias && scheduling.dias.length > 0) ? scheduling.dias.join(', ') : '-'}</span>
        </div>
        <div>
          <span className="font-semibold text-text-main">Hora inicio: </span>
          <span>{scheduling.horaInicio || '-'}</span>
        </div>
        <div>
          <span className="font-semibold text-text-main">Hora fin: </span>
          <span>{scheduling.horaFin || '-'}</span>
        </div>
      </div>
      <div className="flex justify-end items-center mt-6 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <span className="text-sm text-gray-600">{current + 1} / {schedulings.length}</span>
          <button
            onClick={handleNext}
            disabled={current === schedulings.length - 1}
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
        <button onClick={onClose} className="bg-primary-dark text-white px-6 py-2 rounded font-semibold hover:bg-primary transition">Cerrar</button>
      </div>
    </div>
  );
};

export default SeeScheduling; 