"use client"

import PropTypes from 'prop-types';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Cliente&background=eee&color=888&size=256';

const ViewCustomer = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null

  const getDocumentTypeLabel = (type) => {
    const types = {
      CC: "Cédula de Ciudadanía",
      CE: "Cédula de Extranjería",
      TI: "Tarjeta de Identidad",
    }
    return types[type] || type
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl flex items-center justify-between px-8 py-4">
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Detalle del cliente</h2>
          <button className="text-gray-400 hover:text-primary text-2xl font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-8 flex-1">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar y nombre */}
            <div className="flex flex-col justify-center items-center md:w-1/2 w-full">
              <div className="w-36 h-36 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4 shadow-sm overflow-hidden">
                <img
                  src={DEFAULT_AVATAR}
                  alt={customer.firstName}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="text-lg font-bold text-gray-800 text-center mb-2">{customer.firstName} {customer.lastName}</div>
              <div className="text-sm text-gray-500 text-center">{customer.email}</div>
              <div className="mt-2">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm transition-all duration-200
                  ${customer.status === "Activo" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}
                `}>
                  {customer.status}
                </span>
              </div>
            </div>
            {/* Información detallada */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full mx-5">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Datos generales</span>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <i className="bi bi-credit-card-2-front text-primary mr-2"></i>
                      <span className="font-medium">Tipo de documento:</span>
                      <span className="ml-2">{getDocumentTypeLabel(customer.documentType)}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="bi bi-hash text-primary mr-2"></i>
                      <span className="font-medium">Número de documento:</span>
                      <span className="ml-2">{customer.documentNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Contacto</span>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[60px]">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <i className="bi bi-envelope text-primary mr-2"></i>
                      <span className="font-medium">Correo:</span>
                      <span className="ml-2">{customer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="bi bi-telephone text-primary mr-2"></i>
                      <span className="font-medium">Teléfono:</span>
                      <span className="ml-2">{customer.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              {customer.createdAt && (
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Fecha de registro</span>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm">
                    {new Date(customer.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-2xl flex justify-end px-8 py-4">
          <button className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

ViewCustomer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    documentType: PropTypes.string,
    documentNumber: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default ViewCustomer
