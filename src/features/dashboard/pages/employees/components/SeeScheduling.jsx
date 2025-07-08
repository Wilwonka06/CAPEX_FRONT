import React from 'react';

const diasSemana = [
  'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'
];

const SeeScheduling = ({ scheduling, onClose }) => {
  if (!scheduling) return null;
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
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="bg-primary-dark text-white px-6 py-2 rounded font-semibold hover:bg-primary transition">Cerrar</button>
      </div>
    </div>
  );
};

export default SeeScheduling; 