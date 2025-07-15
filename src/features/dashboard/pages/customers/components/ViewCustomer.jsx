"use client"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-fade-in max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-xl font-bold text-accent m-0">Detalle del Cliente</h2>
            <p className="text-sm text-black mt-1">Información completa del cliente</p>
          </div>
          <button className="text-gray-400 hover:text-black text-xl font-bold" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="p-8 bg-white overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">ID</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                {customer.id}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">Estado</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    customer.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {customer.status}
                </span>
              </div>
            </div>

            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">Nombre Completo</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                {customer.firstName} {customer.lastName}
              </div>
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">Tipo de Documento</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                {getDocumentTypeLabel(customer.documentType)}
              </div>
            </div>

            {/* Número de Documento */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">Número de Documento</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                {customer.documentNumber}
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">Correo Electrónico</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                {customer.email}
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-medium text-black mb-1">Teléfono</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
                {customer.phone}
              </div>
            </div>

            {/* Fecha de Registro (si existe) */}
            {customer.createdAt && (
              <div>
                <label className="block text-xs font-medium text-black mb-1">Fecha de Registro</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black text-sm">
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

        {/* Footer */}
        <div className="bg-white rounded-b-lg flex justify-end px-8 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-black text-sm hover:bg-gray-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewCustomer
