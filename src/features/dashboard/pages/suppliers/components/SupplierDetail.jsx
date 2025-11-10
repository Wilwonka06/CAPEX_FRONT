const SupplierDetail = ({ supplier, isOpen, onClose }) => {
  if (!isOpen || !supplier) return null;

  const getTipoText = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'N':
        return 'Natural';
      case 'J':
        return 'Jurídico';
      default:
        return 'No especificado';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">Detalles del Proveedor</h2>
        <button
            className="text-gray-400 hover:text-primary text-xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        </div>
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1">
        <div className="text-lg font-bold text-gray-800 text-center mb-2">{supplier.nombre}</div>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Columna Izquierda: Icono y nombre */}
            {/* Información de contacto */}
            <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de contacto</span>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <i className="bi bi-person text-primary mr-2"></i>
                      <span className="font-medium">Contacto:</span>
                      <span className="ml-2">{supplier.contacto}</span>
              </div>
                    <div className="flex items-center">
                      <i className="bi bi-envelope text-primary mr-2"></i>
                      <span className="font-medium">Correo:</span>
                      <span className="ml-2">{supplier.correo}</span>
            </div>
                    <div className="flex items-center">
                      <i className="bi bi-telephone text-primary mr-2"></i>
                      <span className="font-medium">Teléfono:</span>
                      <span className="ml-2">{supplier.telefono}</span>
              </div>
            </div>
          </div>
              </div>
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              {/* Información técnica */}
              <div>
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información Técnica</span>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">NIT</span>
                    <span className="font-semibold text-gray-800 text-sm">{supplier.nit}</span>
            </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Tipo</span>
                    <span className="font-semibold text-gray-800 text-sm">{getTipoText(supplier.tipo)}</span>
            </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Dirección</span>
                    <span className="font-semibold text-gray-800 text-sm max-w-[200px] text-right">
                      {supplier.direccion}
                    </span>
          </div>
          </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer fijo */}
        <div className="rounded-b-lg flex justify-end px-8 py-4">
          <button
            className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
