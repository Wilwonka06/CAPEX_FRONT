const DeleteCustomer = ({ isOpen, onClose, onDelete, customer }) => {
  if (!isOpen || !customer) return null;

  const handleDelete = () => {
    onDelete(customer.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Eliminar Cliente</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="bi bi-x-lg text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <i className="bi bi-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                ¿Estás seguro de que quieres eliminar este cliente?
              </h3>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Información del cliente:</p>
              <p><span className="font-medium">ID:</span> {customer.id}</p>
              <p><span className="font-medium">Nombre:</span> {customer.firstName} {customer.lastName}</p>
              <p><span className="font-medium">Documento:</span> {customer.documentType} {customer.documentNumber}</p>
              <p><span className="font-medium">Email:</span> {customer.email}</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <p>
              Esta acción no se puede deshacer. El cliente será eliminado permanentemente del sistema.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomer; 