import React from 'react';

const SchedulingDetailView = ({ selectedEvent }) => {
  return (
    <div className="space-y-4">
      {/* Información Principal */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Información de Programación</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center p-3 bg-white rounded-md shadow-sm">
            <svg className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Empleado</p>
              <p className="font-medium text-gray-900">{selectedEvent?.extendedProps?.empleadoNombre || 'Sin nombre'}</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-white rounded-md shadow-sm">
            <svg className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium text-gray-900">
                {selectedEvent?.start ? new Date(selectedEvent.start).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Fecha no disponible'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Horarios</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-md shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Entrada</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {selectedEvent?.extendedProps?.hora_entrada ? selectedEvent.extendedProps.hora_entrada.substring(0, 5) : '--:--'}
            </p>
          </div>

          <div className="p-3 bg-white rounded-md shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Salida</span>
            </div>
            <p className="text-lg font-bold text-red-600">
              {selectedEvent?.extendedProps?.hora_salida ? selectedEvent.extendedProps.hora_salida.substring(0, 5) : '--:--'}
            </p>
          </div>
        </div>

        {/* Duración calculada */}
        {selectedEvent?.extendedProps?.hora_entrada && selectedEvent?.extendedProps?.hora_salida && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Duración total:</span>
              <span className="text-lg font-bold text-blue-800">
                {(() => {
                  const entrada = selectedEvent.extendedProps.hora_entrada;
                  const salida = selectedEvent.extendedProps.hora_salida;
                  if (entrada && salida) {
                    const [h1, m1] = entrada.split(':').map(Number);
                    const [h2, m2] = salida.split(':').map(Number);
                    const minutosEntrada = h1 * 60 + m1;
                    const minutosSalida = h2 * 60 + m2;
                    const diferencia = minutosSalida - minutosEntrada;
                    const horas = Math.floor(diferencia / 60);
                    const minutos = diferencia % 60;
                    return `${horas}h ${minutos}m`;
                  }
                  return 'N/A';
                })()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Detalles Adicionales</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-white rounded-md">
            <span className="text-sm text-gray-600">ID de Programación:</span>
            <span className="font-mono text-sm text-gray-800">{selectedEvent?.extendedProps?.schedulingId || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-white rounded-md">
            <span className="text-sm text-gray-600">Estado:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingDetailView;