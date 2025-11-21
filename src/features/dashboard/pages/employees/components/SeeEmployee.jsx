import { useState } from 'react';
import SeeScheduling from './SeeScheduling';

import { labelFromAny } from '../../../../../shared/constants/documentTypes';

const SeeEmployee = ({ employee, onClose }) => {
  const [activeTab, setActiveTab] = useState('empleado');
  if (!employee) return null;

  // Normalizar tipo_documento para manejar ambos formatos
  const tipoDoc = employee.tipo_documento || employee.tipoDocumento || '';
  const tipoDocumentoLabel = labelFromAny(tipoDoc) || 'No especificado';

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      {/* Header with employee info */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] rounded-2xl h-16 w-16 flex items-center justify-center shadow-lg">
          <i className="bi bi-person-circle text-3xl text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-nunito">Detalle del Empleado</h2>
          <p className="text-sm text-gray-600 font-lato">Información completa del empleado</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
        <button
          className={`flex-1 text-base font-semibold px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'empleado'
              ? 'bg-[#FACC15] text-gray-800 shadow-md'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('empleado')}
          type="button"
        >
          <i className="bi bi-person mr-2"></i>
          Información Personal
        </button>
        <button
          className={`flex-1 text-base font-semibold px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'programacion'
              ? 'bg-[#FACC15] text-gray-800 shadow-md'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('programacion')}
          type="button"
        >
          <i className="bi bi-calendar-event mr-2"></i>
          Programación
        </button>
      </div>

      {activeTab === 'empleado' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 font-nunito mb-2 flex items-center gap-2">
              <i className="bi bi-person text-[#FACC15]"></i>
              Información Personal
            </h3>
            <p className="text-sm text-gray-600 font-lato">Datos básicos del empleado</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                  <i className="bi bi-person text-white text-sm"></i>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</span>
              </div>
              <span className="block text-base font-bold text-gray-800">
                {employee.nombre || 'No especificado'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                  <i className="bi bi-card-text text-white text-sm"></i>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo de Documento</span>
              </div>
              <span className="block text-base font-bold text-gray-800">
                {tipoDocumentoLabel}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                  <i className="bi bi-hash text-white text-sm"></i>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Documento</span>
              </div>
              <span className="block text-base font-bold text-gray-800 font-mono">
                {employee.documento || employee.numero_documento || employee.num_documento || 'No especificado'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                  <i className="bi bi-telephone text-white text-sm"></i>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</span>
              </div>
              <span className="block text-base font-bold text-gray-800 font-mono">
                {employee.telefono || 'No especificado'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                  <i className="bi bi-envelope text-white text-sm"></i>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo</span>
              </div>
              <span className="block text-base font-bold text-gray-800 break-words">
                {employee.correo || 'No especificado'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                  <i className="bi bi-geo-alt text-white text-sm"></i>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dirección</span>
              </div>
              <span className="block text-base font-bold text-gray-800">
                {employee.direccion || 'No especificado'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200 md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                  <i className="bi bi-toggle-on text-white text-sm"></i>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${
                    employee.estado === 'Activo'
                      ? 'bg-green-100 text-green-800 border-2 border-green-200'
                      : 'bg-red-100 text-red-800 border-2 border-red-200'
                  }`}
                >
                  <i className={`bi ${employee.estado === 'Activo' ? 'bi-check-circle' : 'bi-x-circle'} mr-2`}></i>
                  {employee.estado === 'Activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl text-xs"
            >
              <i className="bi bi-check-circle"></i>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {activeTab === 'programacion' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 font-nunito mb-2 flex items-center gap-2">
              <i className="bi bi-calendar-event text-[#FACC15]"></i>
              Programaciones del Empleado
            </h3>
            <p className="text-sm text-gray-600 font-lato">Horarios de trabajo asignados</p>
          </div>
          <SeeScheduling
            empleadoId={employee.id || employee.id_usuario}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
};

export default SeeEmployee;