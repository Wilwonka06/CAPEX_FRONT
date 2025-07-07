import { useState } from "react";

const DeleteRole = ({ isOpen, onClose, onDelete, role }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) await onDelete(role.id);
      onClose();
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl border-2 border-red-500 w-full max-w-md p-8 relative animate-fade-in">
        <button 
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold" 
          onClick={onClose} 
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-red-600">Eliminar Rol</h2>
          <p className="text-sm text-gray-600 mt-2">¿Estás seguro de que quieres eliminar este rol?</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-start space-x-3">
            <i className="bi bi-info-circle text-red-500 mt-0.5"></i>
            <div>
              <h3 className="font-medium text-red-800 mb-1">{role.name}</h3>
              <p className="text-sm text-red-700">{role.description}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200" 
            onClick={onClose} 
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button 
            className="px-4 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition flex items-center" 
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

export default DeleteRole; 