import { useState } from 'react';
import PropTypes from 'prop-types';
import RecurringSchedulingManager from './RecurringSchedulingManager';
import { labelFromAny } from '../../../../../shared/constants/documentTypes';

const EmployeeDetail = ({ employee, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');

  if (!isOpen || !employee) return null;

  // Normalizar tipo_documento para manejar ambos formatos
  const tipoDoc = employee.tipo_documento || employee.tipoDocumento || '';
  const tipoDocumentoLabel = labelFromAny(tipoDoc) || 'No especificado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-person-circle text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Detalles del Empleado</h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 bg-gray-50 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              activeTab === 'info'
                ? 'bg-white text-gray-800 border-t-2 border-x-2 border-[#FACC15]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('info')}
          >
            <i className="bi bi-person mr-2"></i>
            Información Personal
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              activeTab === 'programacion'
                ? 'bg-white text-gray-800 border-t-2 border-x-2 border-[#FACC15]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('programacion')}
          >
            <i className="bi bi-calendar-event mr-2"></i>
            Programaciones
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Nombre destacado */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <i className="bi bi-person-circle text-3xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{employee.nombre}</h3>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                  employee.estado === 'Activo'
                    ? 'bg-green-100 text-green-800 border-2 border-green-200'
                    : 'bg-red-100 text-red-800 border-2 border-red-200'
                }`}>
                  <i className={`bi ${employee.estado === 'Activo' ? 'bi-check-circle' : 'bi-x-circle'} mr-1`}></i>
                  {employee.estado === 'Activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Información del empleado */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="bi bi-info-circle text-[#FACC15]"></i>
                  Información Personal
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de Documento */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">Tipo de Documento</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {tipoDocumentoLabel}
                    </span>
                  </div>

                  {/* Documento */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">Documento</span>
                    <span className="font-semibold text-gray-800 text-sm font-mono">
                      {employee.documento || employee.numero_documento || employee.num_documento || 'No especificado'}
                    </span>
                  </div>

                  {/* Teléfono */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">Teléfono</span>
                    <span className="font-semibold text-gray-800 text-sm font-mono">
                      {employee.telefono || 'No especificado'}
                    </span>
                  </div>

                  {/* Correo */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">Correo</span>
                    <span className="font-semibold text-gray-800 text-sm break-words">
                      {employee.correo || 'No especificado'}
                    </span>
                  </div>

                  {/* Dirección - span completo */}
                  <div className="md:col-span-2 flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">Dirección</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {employee.direccion || 'No especificado'}
                    </span>
                  </div>

                  {/* ID del sistema */}
                  {employee.id && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-xs text-gray-600 font-medium">ID del Sistema</span>
                      <span className="font-semibold text-gray-800 text-sm font-mono">
                        {employee.id}
                      </span>
                    </div>
                  )}

                  {/* Fecha de registro si existe */}
                  {employee.createdAt && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-xs text-gray-600 font-medium">Fecha de Registro</span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {new Date(employee.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'programacion' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <RecurringSchedulingManager empleadoId={employee.id || employee.id_usuario} />
            </div>
          )}
        </div>
        
        {/* Footer fijo */}
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            onClick={onClose}
          >
            <i className="bi bi-check-circle"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

EmployeeDetail.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
    tipo_documento: PropTypes.string,
    tipoDocumento: PropTypes.string,
    documento: PropTypes.string,
    numero_documento: PropTypes.string,
    num_documento: PropTypes.string,
    telefono: PropTypes.string,
    correo: PropTypes.string,
    direccion: PropTypes.string,
    estado: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EmployeeDetail;
