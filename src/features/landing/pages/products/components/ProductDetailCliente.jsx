import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import { useCart } from '../../../components/CartContext';
import { useNavigate } from 'react-router-dom';
import CartToast from '../../../components/CartToast';
import cartIcon from '../../../../../shared/images/cart.png';
import { useCartToast } from '../../../components/CartToastContext';
import { formatNumber } from '../../../../../shared/utils/formatters';

// Componente para navegación de imágenes
const ImageCarousel = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <img
          src={getDefaultProductImage(productName)}
          alt={productName}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Imagen principal */}
      <img
        src={images[currentImageIndex] || getDefaultProductImage(productName)}
        alt={`${productName} - Imagen ${currentImageIndex + 1}`}
        className="w-full h-full object-cover object-center rounded-lg"
        onError={(e) => {
          e.target.src = getDefaultProductImage(productName);
        }}
      />

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          {/* Botones de navegación */}
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Imagen anterior"
          >
            <i className="bi bi-chevron-left text-lg"></i>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Imagen siguiente"
          >
            <i className="bi bi-chevron-right text-lg"></i>
          </button>

          {/* Indicadores de imagen */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>

          {/* Contador de imágenes */}
          <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=256&bold=true`;
};

const ProductDetailCliente = ({ product, recommended = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  const { showCartToast } = useCartToast();
  const addingRecommendedRef = useRef(new Set()); // Para productos recomendados

  if (!product) return null;

  const handleAddToCart = () => {
    // Prevenir múltiples clics
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    // Agregar al carrito inmediatamente
    addToCart(product, product.tipoProducto === 'Extensiones' ? 1 : quantity);
    setToastProduct(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    
    // Rehabilitar después de un breve delay para evitar spam
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1000);
  };

  return (
    <>
      <CartToast show={showToast} product={toastProduct} onClose={() => setShowToast(false)} />
      <div className="w-full max-w-5xl mx-auto py-10 px-4">
        {/* Migas de pan */}
        <nav className="text-xs text-gray-500 mb-4 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/landing'}>Home</span>
          <span className="mx-1">/</span>
          <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/landing/catalogo'}>Productos</span>
          <span className="mx-1">/</span>
          <span className="text-[#1E1E1E] font-semibold">{product.nombre}</span>
        </nav>
        <div className="flex flex-col md:flex-row gap-0 w-full">
            {/* Carrusel de imágenes */}
          <div className="md:w-1/2 w-full flex items-center justify-center aspect-[4/3] md:aspect-auto p-6">
            <div className="w-full h-full max-h-[60vh] relative">
              <ImageCarousel
                images={product.fotos && product.fotos.length > 0 ? product.fotos : [product.foto].filter(Boolean)}
                productName={product.nombre}
              />
            </div>
          </div>
          {/* Info principal */}
          <div className="flex-1 flex flex-col gap-4 p-6">
            <h1 className="text-3xl font-bold text-[#1E1E1E] mb-2 font-montserrat">{product.nombre}</h1>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl font-bold text-[#FACC15]">${formatNumber(product.precio)}</span>
              <span className="text-xs text-gray-500">{formatNumber(product.cantidad)} disponibles</span>
                </div>
            {/* Selector de cantidad y botón agregar al carrito en la misma fila si NO es extensión */}
            {product.tipoProducto !== 'Extensiones' ? (
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center border border-gray-400 rounded w-[110px] h-10 overflow-hidden">
                  <button
                    className="flex-1 h-full flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Disminuir"
                    type="button"
                    tabIndex={-1}
                  >-</button>
                  <input
                    type="number"
                    min={1}
                    max={product.cantidad || 99}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Math.min(Number(e.target.value), product.cantidad || 99)))}
                    className="w-8 text-center border-0 focus:ring-0 text-base bg-transparent outline-none"
                    style={{ appearance: 'textfield' }}
                  />
                  <button
                    className="flex-1 h-full flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(q => Math.min((product.cantidad || 99), q + 1))}
                    disabled={quantity >= (product.cantidad || 99)}
                    aria-label="Aumentar"
                    type="button"
                    tabIndex={-1}
                  >+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.cantidad === 0}
                  className={`bg-[#FACC15] text-[#1E1E1E] px-8 py-3 rounded-full font-bold text-base shadow hover:bg-yellow-400 transition flex items-center gap-1 w-fit ${isAddingToCart || product.cantidad === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isAddingToCart ? 'Agregando...' : 'Añadir al carrito'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.cantidad === 0}
                className={`bg-[#FACC15] text-[#1E1E1E] px-8 py-3 rounded-full font-bold text-base shadow hover:bg-yellow-400 transition flex items-center gap-1 w-fit ${isAddingToCart || product.cantidad === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isAddingToCart ? 'Agregando...' : 'Añadir al carrito'}
              </button>
            )}
            {/* Descripción */}
            <div className="mt-4 text-gray-700 text-base">
              {product.descripcion}
            </div>
            {/* Características */}
            {product.especificaciones && product.especificaciones.length > 0 && (
              <div className="mt-2">
                <h3 className="text-sm font-semibold text-[#1E1E1E] mb-1">Características:</h3>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  {product.especificaciones.map((esp, idx) => (
                    <li key={idx}><span className="font-semibold text-[#1E1E1E]">{esp.concepto}:</span> {esp.valor}</li>
                  ))}
                </ul>
                </div>
              )}
          </div>
        </div>
        {/* Productos recomendados */}
        {recommended.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4 text-[#1E1E1E]">También te puede interesar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
              {recommended.map(prod => (
                <div
                  key={prod.id}
                  className="flex flex-col cursor-pointer group transition-all"
                  onClick={() => navigate(`/landing/productos/${prod.id}`)}
                >
                  <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        (prod.fotos && prod.fotos.length > 0 && prod.fotos[0])
                          ? prod.fotos[0]
                          : (prod.foto || getDefaultProductImage(prod.nombre))
                      }
                      alt={prod.nombre}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = getDefaultProductImage(prod.nombre);
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                    <h3 className="font-semibold text-base text-[#1E1E1E] mb-1 truncate group-hover:text-[#FACC15] transition-colors">{prod.nombre}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-[#FACC15]">${formatNumber(prod.precio)}</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          // Prevenir múltiples clics
                          if (addingRecommendedRef.current.has(prod.id)) {
                            return;
                          }
                          addingRecommendedRef.current.add(prod.id);
                          addToCart(prod, 1);
                          showCartToast(prod);
                          // Permitir agregar de nuevo después de 1 segundo
                          setTimeout(() => {
                            addingRecommendedRef.current.delete(prod.id);
                          }, 1000);
                        }}
                        className="ml-2 bg-[#FACC15] rounded-full p-2 shadow hover:bg-yellow-400 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Agregar al carrito"
                        disabled={addingRecommendedRef.current.has(prod.id)}
                      >
                        <img src={cartIcon} alt="Carrito" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

ProductDetailCliente.propTypes = {
  product: PropTypes.object,
  recommended: PropTypes.array,
};

export default ProductDetailCliente; 