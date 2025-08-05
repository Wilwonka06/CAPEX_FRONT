import PropTypes from "prop-types";

const ProductDetail = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-[#9C5B2B] m-0">Detalles del Producto</h2>
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
          <div className="flex flex-col md:flex-row gap-8">
            {/* Columna Izquierda: Imagen y nombre */}
            <div className="flex flex-col items-center md:w-1/2 w-full">
              {/* Imagen principal */}
              <div className="w-60 h-60 bg-gray-50 rounded-lg flex items-center justify-center mb-4 shadow-lg p-0">
                <img
                  src={product.fotos && product.fotos.length > 0 ? product.fotos[0] : product.foto}
                  alt={product.nombre}
                  className="w-full h-full object-cover rounded-lg m-0"
                />
              </div>
              
              {/* Galería de imágenes adicionales */}
              {product.fotos && product.fotos.length > 1 && (
                <div className="flex gap-2 mb-4">
                  {product.fotos.slice(1).map((foto, index) => (
                    <div key={index} className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shadow-md">
                      <img
                        src={foto}
                        alt={`${product.nombre} - Imagen ${index + 2}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-lg font-bold text-gray-800 text-center mb-2">{product.nombre}</div>
              
            </div>
            {/* Columna Derecha: Descripción y técnica */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Descripción del producto</span>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                  {product.descripcion}
                </div>
              </div>
              <div>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Categoría</span>
                    <span className="font-semibold text-gray-800 text-sm">{product.categoria}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Color</span>
                    <span className="font-semibold text-gray-800 text-sm">{product.color}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Tipo de producto</span>
                    <span className="font-semibold text-gray-800 text-sm">{product.tipoProducto || 'No especificado'}</span>
                  </div>
                  {/* Especificaciones técnicas dinámicas */}
                  {product.especificaciones && product.especificaciones.length > 0 ? (
                    product.especificaciones.map((esp, idx) => (
                      <div key={idx} className="flex justify-between px-4 py-2">
                        <span className="text-xs text-gray-500">{esp.concepto}</span>
                        <span className="font-semibold text-gray-800 text-sm">{esp.valor}</span>
                    </div>
                    ))
                  ) : (
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-xs text-gray-500">Características</span>
                      <span className="font-semibold text-gray-800 text-sm text-gray-500">No especificadas</span>
                    </div>
                  )}

                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Fecha de Registro</span>
                    <span className="font-semibold text-gray-800 text-sm">{product.fechaRegistro}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Precio</span>
                    <span className="font-semibold text-gray-800 text-sm">${product.precio?.toFixed(2)} </span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Cantidad en Stock</span>
                    <span className="font-semibold text-gray-800 text-sm">{product.cantidad}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer fijo */}
        <div className="rounded-b-lg flex justify-end px-8 py-4">
          <button
            className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProductDetail; 