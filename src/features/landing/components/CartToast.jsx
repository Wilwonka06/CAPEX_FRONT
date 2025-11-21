// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=128&bold=true`;
};

const CartToast = ({ show, product, onClose }) => {
  if (!show || !product) return null;

  return (
    <div className="fixed top-6 right-6 z-50 bg-white rounded-lg shadow-lg flex items-center gap-4 px-4 py-3 border border-gray-200 animate-fade-in">
      <img
        src={
          (product.fotos && product.fotos.length > 0 && product.fotos[0])
            ? product.fotos[0]
            : (product.foto || getDefaultProductImage(product.nombre))
        }
        alt={product.nombre}
        className="w-12 h-12 object-cover rounded"
        onError={(e) => {
          e.target.src = getDefaultProductImage(product.nombre);
        }}
      />
      <div>
        <div className="font-semibold text-gray-800">{product.nombre}</div>
        <div className="text-sm text-green-600 font-bold">¡Agregado al carrito!</div>
      </div>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
};

export default CartToast; 