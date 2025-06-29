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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Detalles del proveedor</h2>
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
          <div className="text-center mb-6">
            
            <h3 className="text-lg font-semibold text-text-main">{supplier.nombre}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">NIT</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-main text-sm">
                  {supplier.nit}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Tipo</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-main text-sm">
                  {getTipoText(supplier.tipo)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Nombre</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-main text-sm">
                  {supplier.nombre}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Contacto</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-main text-sm">
                  {supplier.contacto}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Dirección</label>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-main text-sm">
                {supplier.direccion}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Teléfono</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-main text-sm">
                  {supplier.telefono}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Correo</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-main text-sm">
                  {supplier.correo}
                </div>
              </div>
            </div>
            
          </div>
        </div>
        {/* Footer fijo */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-lg flex justify-end px-8 py-4">
          <button
            className="px-4 py-2 rounded-md bg-text-main text-white font-semibold hover:bg-primary-dark transition text-sm"
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
