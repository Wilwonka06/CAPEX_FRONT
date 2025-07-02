import { useState } from "react";

const DeleteSupplier = ({ supplier, isOpen, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) await onDelete(supplier.id);
      onClose();
    } catch (error) {
      console.error("Error al eliminar el proveedor:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-red-600 m-0">Eliminar proveedor</h2>
          <button 
            className="text-gray-400 hover:text-red-500 text-xl font-bold" 
            onClick={onClose} 
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-8 flex-1">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-exclamation-triangle text-white text-2xl"></i>
            </div>
            <p className="text-sm text-gray-600">¿Estás seguro de que quieres eliminar este proveedor?</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start space-x-3">
              <i className="bi bi-info-circle text-red-500 mt-0.5"></i>
              <div>
                <h3 className="font-medium text-red-800 mb-1 text-sm">{supplier.nombre}</h3>
                <p className="text-xs text-red-700">{supplier.contacto} - {supplier.correo}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Footer fijo */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-lg flex justify-end px-8 py-4">
          <button 
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition" 
            onClick={onClose} 
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button 
            className="px-4 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition flex items-center ml-2 text-sm" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Eliminando...
              </>
            ) : (
              <>
                <i className="bi bi-trash mr-2"></i>
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSupplier; 