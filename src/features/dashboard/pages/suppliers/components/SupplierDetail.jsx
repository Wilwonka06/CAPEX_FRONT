const SupplierDetail = ({ supplier, isOpen, onClose }) => {
  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-person-badge text-white text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-primary">
            Detalles del Proveedor
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">NIT</label>
            <div className="px-3 py-2 border rounded-md bg-background">
              {supplier.nit}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <div className="px-3 py-2 border rounded-md bg-background">
                {supplier.nombre}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contacto</label>
              <div className="px-3 py-2 border rounded-md bg-background">
                {supplier.contacto}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <div className="px-3 py-2 border rounded-md bg-background">
              {supplier.direccion}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <div className="px-3 py-2 border rounded-md bg-background">
                {supplier.telefono}
              </div>
            </div>
            <div>
            <label className="block text-sm font-medium mb-1">Correo</label>
            <div className="px-3 py-2 border rounded-md bg-background">
              {supplier.correo}
            </div>
          </div>
          </div>
          
          

          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <div className="flex items-center space-x-3">
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  supplier.isActive ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    supplier.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  supplier.isActive
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                {supplier.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button
            className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition"
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
