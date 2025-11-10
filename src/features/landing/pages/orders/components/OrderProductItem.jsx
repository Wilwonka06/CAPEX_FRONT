import PropTypes from 'prop-types';

// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=128&bold=true`;
};

const OrderProductItem = ({ producto }) => {
  return (
    <div className="flex items-center gap-4 bg-gray-50 rounded p-2 border border-gray-100">
      <img 
        src={
          (producto.fotos && producto.fotos.length > 0 && producto.fotos[0])
            ? producto.fotos[0]
            : (producto.imagen || producto.foto || getDefaultProductImage(producto.nombre))
        }
        alt={producto.nombre} 
        className="w-12 h-12 object-contain rounded bg-white border"
        onError={(e) => {
          e.target.src = getDefaultProductImage(producto.nombre);
        }}
      />
      <div className="flex-1">
        <div className="font-semibold text-text-main text-sm">{producto.nombre}</div>
        {producto.color || producto.textura ? (
          <div className="text-xs text-gray-500">
            {producto.color && <span>Color: {producto.color} </span>}
            {producto.textura && <span>· Textura: {producto.textura}</span>}
          </div>
        ) : null}
      </div>
      <div className="text-xs text-gray-600">Cantidad: {producto.cantidad}</div>
      <div className="font-bold text-primary text-sm">${producto.precioUnitario}</div>
    </div>
  );
};

OrderProductItem.propTypes = {
  producto: PropTypes.shape({
    id: PropTypes.any,
    nombre: PropTypes.string,
    imagen: PropTypes.string,
    foto: PropTypes.string,
    color: PropTypes.string,
    textura: PropTypes.string,
    cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precioUnitario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default OrderProductItem; 