import PropTypes from 'prop-types';
import { formatNumber } from "../../../../../shared/utils/formatters";

// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=256&bold=true`;
};

const ProductDetail = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  // Función para formatear precio usando el estándar del proyecto
  const formatPrice = (price) => {
    return formatNumber(price);
  };

  // Obtener características/especificaciones
  const specs = product.caracteristicas || product.especificaciones || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-eye text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">
              Detalles del Producto
            </h2>
          </div>
          <button
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Columna Izquierda: Imagen y nombre */}
            <div className="flex flex-col items-center lg:w-1/2 w-full">
              {/* Imagen principal */}
              <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl p-3 border border-gray-100">
                <img
                  src={
                    (product.fotos && product.fotos.length > 0 && product.fotos[0])
                      ? product.fotos[0]
                      : (product.foto || product.url_foto || getDefaultProductImage(product.nombre))
                  }
                  alt={product.nombre}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = getDefaultProductImage(product.nombre);
                  }}
                />
              </div>

              {/* Galería de imágenes adicionales */}
              {product.fotos && product.fotos.length > 1 && (
                <div className="flex gap-2 mb-4">
                  {product.fotos.slice(1).map((foto, index) => (
                    <div key={index} className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 cursor-pointer">
                      <img
                        src={foto || getDefaultProductImage(product.nombre)}
                        alt={`${product.nombre} - Imagen ${index + 2}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = getDefaultProductImage(product.nombre);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xl font-bold text-gray-800 text-center mb-3">
                {product.nombre}
              </div>
            </div>
            
            {/* Columna Derecha: Descripción y datos técnicos */}
            <div className="flex flex-col gap-6 lg:w-1/2 w-full">
              {/* Descripción */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="bi bi-file-text text-[#FACC15]"></i>
                  Descripción del Producto
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-700 text-xs min-h-[90px] leading-relaxed">
                  {product.descripcion || 'Sin descripción disponible'}
                </div>
              </div>

              {/* Información del producto */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="bi bi-info-circle text-[#FACC15]"></i>
                  Información del Producto
                </h3>
                <div className="space-y-1">
                  {/* Categoría */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs text-gray-600 font-medium">Categoría</span>
                    <span className="font-semibold text-gray-800 text-xs bg-gray-100 px-2.5 py-1 rounded-full">
                      {product.categoria?.nombre || product.categoria || 'Sin categoría'}
                    </span>
                  </div>

                  {/* Precio */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs text-gray-600 font-medium">Precio</span>
                    <span className="font-bold text-base text-[#FACC15]">
                      ${formatPrice(product.precio_venta || product.precio || 0)}
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs text-gray-600 font-medium">Cantidad en Stock</span>
                    <span className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
                      (product.stock || product.cantidad || 0) > 10
                        ? 'bg-green-100 text-green-700'
                        : (product.stock || product.cantidad || 0) > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock || product.cantidad || 0} unidades
                    </span>
                  </div>

                  {/* Costo (si está disponible) */}
                  {product.costo > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-xs text-gray-600 font-medium">Costo</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        ${formatPrice(product.costo)}
                      </span>
                    </div>
                  )}

                  {/* IVA (si está disponible) */}
                  {product.iva > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-xs text-gray-600 font-medium">IVA</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {product.iva}%
                      </span>
                    </div>
                  )}

                  {/* Fecha de Registro */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs text-gray-600 font-medium">Fecha de Registro</span>
                    <span className="font-semibold text-gray-800 text-xs">
                      {product.fecha_registro || product.fechaRegistro || 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Especificaciones técnicas/características */}
              {specs.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="bi bi-gear text-[#FACC15]"></i>
                    Especificaciones Técnicas
                  </h3>
                  <div className="space-y-1">
                    {specs.map((spec, index) => {
                      // Manejar ambos formatos: caracteristicas y especificaciones
                      const nombre = spec.nombre || spec.concepto || 'Sin nombre';
                      const valor = spec.FichaTecnica?.valor || spec.valor || 'Sin valor';

                      return (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-xs text-gray-600 font-medium capitalize">
                            {nombre}
                          </span>
                          <span className="font-semibold text-gray-800 text-xs bg-white px-2.5 py-1 rounded-full border border-gray-200">
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
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            onClick={onClose}
          >
            <i className="bi bi-check-circle"></i>
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