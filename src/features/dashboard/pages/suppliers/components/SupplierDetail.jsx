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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-truck text-lg"></i></div>
            <h2 className="text-xl font-bold m-0">Detalles del Proveedor</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <div className="text-lg font-bold text-gray-800 text-center mb-4">{supplier.nombre}</div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información de contacto</span>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                <div className="space-y-2">
                  <div className="flex items-center"><i className="bi bi-person text-primary mr-2"></i><span className="font-medium">Contacto:</span><span className="ml-2">{supplier.contacto}</span></div>
                  <div className="flex items-center"><i className="bi bi-envelope text-primary mr-2"></i><span className="font-medium">Correo:</span><span className="ml-2">{supplier.correo}</span></div>
                  <div className="flex items-center"><i className="bi bi-telephone text-primary mr-2"></i><span className="font-medium">Teléfono:</span><span className="ml-2">{supplier.telefono}</span></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Información Técnica</span>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex justify-between px-4 py-2"><span className="text-xs text-gray-500">NIT</span><span className="font-semibold text-gray-800 text-sm">{supplier.nit}</span></div>
                  <div className="flex justify-between px-4 py-2"><span className="text-xs text-gray-500">Tipo</span><span className="font-semibold text-gray-800 text-sm">{getTipoText(supplier.tipo)}</span></div>
                  <div className="flex justify-between px-4 py-2"><span className="text-xs text-gray-500">Dirección</span><span className="font-semibold text-gray-800 text-sm max-w-[200px] text-right">{supplier.direccion}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-check-circle"></i>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
