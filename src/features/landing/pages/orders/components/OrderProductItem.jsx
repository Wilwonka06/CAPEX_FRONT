import PropTypes from 'prop-types';

// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=128&bold=true`;
};

const OrderProductItem = ({ producto }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Imagen del producto */}
        <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
          <img
            src={
              (producto.fotos && producto.fotos.length > 0 && producto.fotos[0])
                ? producto.fotos[0]
                : (producto.imagen || producto.foto || getDefaultProductImage(producto.nombre))
            }
            alt={producto.nombre}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src = getDefaultProductImage(producto.nombre);
            }}
          />
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[#1E1E1E] font-nunito text-base mb-1 truncate">
            {producto.nombre}
          </h4>
          {producto.color || producto.textura ? (
            <div className="text-sm text-gray-600 font-lato">
              {producto.color && <span>Color: {producto.color}</span>}
              {producto.color && producto.textura && <span> · </span>}
              {producto.textura && <span>Textura: {producto.textura}</span>}
            </div>
          ) : null}
        </div>

        {/* Cantidad y precio */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <div className="text-xs text-gray-500 font-lato mb-1">Cantidad</div>
            <div className="font-bold text-[#1E1E1E] font-poppins text-lg">
              {producto.cantidad}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500 font-lato mb-1">Precio unitario</div>
            <div className="font-bold text-[#FACC15] font-montserrat text-xl">
              ${producto.precioUnitario}
            </div>
          </div>
        </div>
      </div>

      {/* Subtotal */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-600 font-lato">Subtotal</span>
        <span className="font-bold text-[#1E1E1E] font-poppins text-lg">
          ${(parseFloat(producto.precioUnitario) * parseInt(producto.cantidad)).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

OrderProductItem.propTypes = {
  producto: PropTypes.shape({
    id: PropTypes.any,
    nombre: PropTypes.string,
    imagen: PropTypes.string,
    foto: PropTypes.string,
    fotos: PropTypes.array,
    color: PropTypes.string,
    textura: PropTypes.string,
    cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precioUnitario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default OrderProductItem; 