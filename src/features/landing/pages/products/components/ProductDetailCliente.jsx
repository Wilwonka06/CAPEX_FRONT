import PropTypes from 'prop-types';
import { useState } from 'react';
import { useCart } from '../../../components/CartContext';
import { useNavigate } from 'react-router-dom';
import CartToast from '../../../components/CartToast';
import cartIcon from '../../../../../shared/images/cart.png';
import { useCartToast } from '../../../components/CartToastContext';
import { formatNumber } from '../../../../../shared/utils/formatters';

const ProductDetailCliente = ({ product, recommended = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  const { showCartToast } = useCartToast();

  if (!product) return null;

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      addToCart(product, product.tipoProducto === 'Extensiones' ? 1 : quantity);
      setIsAddingToCart(false);
      setToastProduct(product);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }, 400);
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
            {/* Imagen principal */}
          <div className="md:w-1/2 w-full flex items-center justify-center aspect-[4/3] md:aspect-auto p-6">
              <img
                src={product.fotos && product.fotos.length > 0 ? product.fotos[0] : product.foto}
                alt={product.nombre}
              className="w-full h-full object-cover object-center"
              style={{ maxHeight: '50vh' }}
              loading="lazy"
            />
          </div>
          {/* Info principal */}
          <div className="flex-1 flex flex-col gap-4 p-6">
            <h1 className="text-3xl font-bold text-[#1E1E1E] mb-2 font-montserrat">{product.nombre}</h1>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl font-bold text-[#FACC15]">${formatNumber(product.precio?.toFixed(2))}</span>
              <span className="text-xs text-gray-500">{product.cantidad} disponibles</span>
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
                      src={prod.fotos && prod.fotos.length > 0 ? prod.fotos[0] : prod.foto}
                      alt={prod.nombre}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                    <h3 className="font-semibold text-base text-[#1E1E1E] mb-1 truncate group-hover:text-[#FACC15] transition-colors">{prod.nombre}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-[#FACC15]">${formatNumber(prod.precio)}</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          addToCart(prod, 1);
                          showCartToast(prod);
                        }}
                        className="ml-2 bg-[#FACC15] rounded-full p-2 shadow hover:bg-yellow-400 transition flex items-center justify-center"
                        title="Agregar al carrito"
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