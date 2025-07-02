const ViewCustomer = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  const getDocumentTypeLabel = (type) => {
    const types = {
      'CC': 'Cédula de Ciudadanía',
      'CE': 'Cédula de Extranjería',
      'TI': 'Tarjeta de Identidad'
    };
    return types[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Detalles del Cliente</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="bi bi-x-lg text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              ID
            </label>
            <p className="text-sm text-gray-900">{customer.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Nombre Completo
            </label>
            <p className="text-sm text-gray-900">{customer.firstName} {customer.lastName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Tipo de Documento
            </label>
            <p className="text-sm text-gray-900">{getDocumentTypeLabel(customer.documentType)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Número de Documento
            </label>
            <p className="text-sm text-gray-900">{customer.documentNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Correo Electrónico
            </label>
            <p className="text-sm text-gray-900">{customer.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Teléfono
            </label>
            <p className="text-sm text-gray-900">{customer.phone}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Estado
            </label>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                customer.status === "Activo"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {customer.status}
            </span>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer; 