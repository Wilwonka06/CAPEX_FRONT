import React from 'react'

const DetailServices = ({onClose}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-md">
        {/* Imagen o encabezado */}
        <div className="h-40 bg-background relative">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-text-main text-xl font-bold hover:text-primary-dark transition"
          >
            &times;
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 text-text-main">
          <h2 className="text-2xl font-semibold mb-2">Servicio 1</h2>
          <p className="text-sm font-medium text-primary-dark">Categoría</p>
          <p className="text-sm mb-3">Servicio de corte</p>

          <p className="text-sm font-medium text-primary-dark">Descripción</p>
          <p className="text-sm mb-4">
            Este servicio incluye corte, lavado y peinado básico. Ideal para
            mantener un look profesional y limpio.
          </p>

          <div className="flex justify-between text-sm font-semibold">
            <span className="text-primary-dark">20.000</span>
            <span className="text-primary-dark">20 minutos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailServices
