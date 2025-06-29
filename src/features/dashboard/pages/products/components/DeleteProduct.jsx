import { useState } from "react";

const DeleteProduct = ({ product, isOpen, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(product.id);
      }
      onClose();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative animate-fade-in">
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
          <h2 className="text-xl font-bold text-red-600">Eliminar Producto</h2>
          <p className="text-sm text-gray-600 mt-2">
            ¿Estás seguro de que quieres eliminar este producto?
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-start space-x-3">
            <img 
              src={product.foto} 
              alt={product.nombre} 
              className="w-12 h-12 object-cover rounded"
            />
            <div>
              <h3 className="font-medium text-red-800 mb-1">{product.nombre}</h3>
              <p className="text-sm text-red-700">{product.descripcion}</p>
              <p className="text-sm text-red-700 font-medium">Precio: ${product.precio?.toFixed(2)}</p>
              <p className="text-sm text-red-700">Stock: {product.cantidad} unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-start space-x-3">
            <i className="bi bi-exclamation-triangle text-yellow-600 mt-0.5"></i>
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Advertencia:</strong> Esta acción no se puede deshacer. 
                El producto será eliminado permanentemente del sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
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

export default DeleteProduct; 