import React, { useState } from 'react';
import SeeScheduling from './SeeScheduling';

const tiposDocumento = {
  'Cedula de ciudadania': 'Cédula de Ciudadanía',
  'Tarjeta de identidad': 'Tarjeta de Identidad',
  'Cedula de extranjeria': 'Cédula de Extranjería',
  'Pasaporte': 'Pasaporte',
};

const SeeEmployee = ({ employee, onClose }) => {
  const [activeTab, setActiveTab] = useState('empleado');
  if (!employee) return null;

  return (
    <div className="">
      <div className="flex gap-2 mb-4">
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t transition-colors ${activeTab === 'empleado' ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'}`}
          onClick={() => setActiveTab('empleado')}
          type="button"
        >
          Detalle
        </button>
        <button
          className={`text-lg font-semibold px-3 py-1 rounded-t transition-colors ${activeTab === 'programacion' ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'}`}
          onClick={() => setActiveTab('programacion')}
          type="button"
        >
          Programación
        </button>
      </div>
      {activeTab === 'empleado' && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/10 rounded-full h-14 w-14 flex items-center justify-center">
              <i className="bi bi-person-circle text-4xl text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-main mb-1">Detalle del Empleado</h2>
              <p className="text-sm text-text-main/60">Información general</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-background rounded-lg p-4 border border-accent-light">
              <span className="block text-xs text-text-main/60 mb-1">Nombre</span>
              <span className="block text-base font-semibold text-text-main">{employee.nombre}</span>
            </div>
            <div className="bg-background rounded-lg p-4 border border-accent-light">
              <span className="block text-xs text-text-main/60 mb-1">Tipo de Documento</span>
              <span className="block text-base font-semibold text-text-main">{tiposDocumento[employee.tipoDocumento] || employee.tipoDocumento}</span>
            </div>
            <div className="bg-background rounded-lg p-4 border border-accent-light">
              <span className="block text-xs text-text-main/60 mb-1">Documento</span>
              <span className="block text-base font-semibold text-text-main">{employee.documento}</span>
            </div>
            <div className="bg-background rounded-lg p-4 border border-accent-light">
              <span className="block text-xs text-text-main/60 mb-1">Teléfono</span>
              <span className="block text-base font-semibold text-text-main">{employee.telefono}</span>
            </div>
            <div className="bg-background rounded-lg p-4 border border-accent-light">
              <span className="block text-xs text-text-main/60 mb-1">Correo</span>
              <span className="block text-base font-semibold text-text-main">{employee.correo}</span>
            </div>
            <div className="bg-background rounded-lg p-4 border border-accent-light">
              <span className="block text-xs text-text-main/60 mb-1">Dirección</span>
              <span className="block text-base font-semibold text-text-main">{employee.direccion}</span>
            </div>
            <div className="bg-background rounded-lg p-4 border border-accent-light flex items-center gap-2">
              <span className="block text-xs text-text-main/60 mb-1">Estado</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${employee.estado === 'Activo' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                {employee.estado === 'Activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-600 px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
            >
              Cerrar
            </button>
          </div>
        </>
      )}
      {activeTab === 'programacion' && employee && Array.isArray(employee.schedulings) && employee.schedulings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-text-main">Programaciones</h3>
          <SeeScheduling
            schedulings={employee.schedulings}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
};

export default SeeEmployee;
