import PropTypes from "prop-types";
import { formatNumber } from "../../../../../shared/utils/formatters";

const ProductDetail = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  // Función para formatear precio usando el estándar del proyecto
  const formatPrice = (price) => {
    return formatNumber(price);
  };

  // Obtener características/especificaciones
  const specs = product.caracteristicas || product.especificaciones || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
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
                  src={product.fotos && product.fotos.length > 0 
                    ? product.fotos[0] 
                    : product.foto || product.url_foto || '/placeholder-product.png'
                  }
                  alt={product.nombre}
                  className="w-full h-full object-cover rounded-lg m-0"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.png';
                  }}
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
                        onError={(e) => {
                          e.target.src = '/placeholder-product.png';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-lg font-bold text-gray-800 text-center mb-2">
                {product.nombre}
              </div>
            </div>
            
            {/* Columna Derecha: Descripción y datos técnicos */}
            <div className="flex flex-col gap-4 md:w-1/2 w-full">
              {/* Descripción */}
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                  Descripción del producto
                </span>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm min-h-[80px]">
                  {product.descripcion || 'Sin descripción disponible'}
                </div>
              </div>
              
              {/* Información del producto */}
              <div>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {/* Categoría */}
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Categoría</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {product.categoria?.nombre || product.categoria || 'Sin categoría'}
                    </span>
                  </div>
                  
                  {/* Precio */}
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Precio</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      ${formatPrice(product.precio_venta || product.precio || 0)}
                    </span>
                  </div>
                  
                  {/* Stock */}
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Cantidad en Stock</span>
                    <span className={`font-semibold text-sm ${
                      (product.stock || product.cantidad || 0) > 10
                        ? 'text-green-600'
                        : (product.stock || product.cantidad || 0) > 0
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {product.stock || product.cantidad || 0} unidades
                    </span>
                  </div>
                  
                  {/* Costo (si está disponible) */}
                  {product.costo > 0 && (
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-xs text-gray-500">Costo</span>
                      <span className="font-semibold text-gray-800 text-sm">
                        ${formatPrice(product.costo)}
                      </span>
                    </div>
                  )}
                  
                  {/* IVA (si está disponible) */}
                  {product.iva > 0 && (
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-xs text-gray-500">IVA</span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {product.iva}%
                      </span>
                    </div>
                  )}
                  
                  {/* Fecha de Registro */}
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">Fecha de Registro</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {product.fecha_registro || product.fechaRegistro || 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Especificaciones técnicas/características */}
              {specs.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                    Especificaciones Técnicas
                  </span>
                  <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {specs.map((spec, index) => {
                      // Manejar ambos formatos: caracteristicas y especificaciones
                      const nombre = spec.nombre || spec.concepto || 'Sin nombre';
                      const valor = spec.FichaTecnica?.valor || spec.valor || 'Sin valor';
                      
                      return (
                        <div key={index} className="flex justify-between px-4 py-2">
                          <span className="text-xs text-gray-500 capitalize">
                            {nombre}
                          </span>
                          <span className="font-semibold text-gray-800 text-sm">
                            {valor}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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