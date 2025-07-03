const ViewProductCard = ({ children, title, onClose }) => (
  <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-4 md:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto border border-gray-200">
    <button
      className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
      onClick={onClose}
      aria-label="Cerrar"
    >
      ×
    </button>
    <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>
    {children}
  </div>
);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <ViewProductCard title="Detalle del cliente" onClose={onClose}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">ID</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">{customer.id}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Estado</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">
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
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Nombre</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">{customer.firstName} {customer.lastName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Tipo de Documento</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">{getDocumentTypeLabel(customer.documentType)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Número de Documento</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">{customer.documentNumber}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Correo Electrónico</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">{customer.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Teléfono</label>
            <div className="w-full px-3 py-2 border border-accent rounded-md bg-background text-text-main">{customer.phone}</div>
          </div>
        </div>
        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </ViewProductCard>
    </div>
  );
};

export default ViewCustomer; 