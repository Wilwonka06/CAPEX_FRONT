import PropTypes from 'prop-types';
import { useState } from 'react';
import { useCart } from '../../../components/CartContext';
import { useNavigate } from 'react-router-dom';

const formatNumber = (num) => new Intl.NumberFormat('es-MX').format(num);

const ProductDetailCliente = ({ product, recommended = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!product) return null;

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      addToCart(product, product.tipoProducto === 'Extensiones' ? 1 : quantity);
      setIsAddingToCart(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4">
      {/* Migas de pan */}
      <nav className="text-xs text-gray-500 mb-4 flex items-center gap-2">
        <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/landing'}>Home</span>
        <span className="mx-1">/</span>
        <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/landing/catalogo'}>Productos</span>
        <span className="mx-1">/</span>
        <span className="text-[#1E1E1E] font-semibold">{product.nombre}</span>
      </nav>
      <div className="bg-white rounded-2xl shadow-lg p-0 flex flex-col md:flex-row gap-0 overflow-hidden">
          {/* Imagen principal */}
        <div className="md:w-1/2 w-full  flex items-center justify-center aspect-[4/3] md:aspect-auto p-6 shadow-lg" style={{ maxHeight: '50vh' }}>
            <img
              src={product.fotos && product.fotos.length > 0 ? product.fotos[0] : product.foto}
              alt={product.nombre}
            className="w-full h-full object-cover object-center"
            style={{ maxHeight: '50vh' }}
            loading="lazy"
          />
        </div>
        {/* Info principal */}
        <div className="flex-1 flex flex-col gap-4 p-8 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          <h1 className="text-3xl font-bold text-[#1E1E1E] mb-2 font-montserrat">{product.nombre}</h1>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-2xl font-bold text-[#FACC15]">${formatNumber(product.precio?.toFixed(2))}</span>
            <span className="text-xs text-gray-500">{product.cantidad} disponibles</span>
              </div>
          {/* Selector de cantidad solo si NO es extensión */}
          {product.tipoProducto !== 'Extensiones' && (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir"
                >-</button>
                <input
                  type="number"
                  min={1}
                  max={product.cantidad || 99}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Math.min(Number(e.target.value), product.cantidad || 99)))}
                  className="w-12 text-center border border-gray-300 rounded font-semibold text-base focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                />
                <button
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                  onClick={() => setQuantity(q => Math.min((product.cantidad || 99), q + 1))}
                  disabled={quantity >= (product.cantidad || 99)}
                  aria-label="Aumentar"
                >+</button>
              </div>
            </div>
          )}
          {/* Botón agregar al carrito */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.cantidad === 0}
            className={`bg-[#FACC15] text-[#1E1E1E] px-8 py-3 rounded-full font-bold text-base shadow hover:bg-yellow-400 transition flex items-center gap-1 w-fit ${isAddingToCart || product.cantidad === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {isAddingToCart ? 'Agregando...' : 'Añadir al carrito'}
            </button>
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
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col cursor-pointer group hover:shadow-2xl transition-all"
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
                    <span className="text-xs text-gray-500">{prod.cantidad} disponibles</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ProductDetailCliente.propTypes = {
  product: PropTypes.object,
  recommended: PropTypes.array,
};

export default ProductDetailCliente; 