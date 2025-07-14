import PropTypes from 'prop-types';
import { useState } from 'react';
import { useCart } from '../../../components/CartContext';

const TABS = [
  { key: 'characteristics', label: 'Características' },
  { key: 'description', label: 'Descripción' }
];

const formatNumber = (num) => new Intl.NumberFormat('es-MX').format(num);

const ProductDetailCliente = ({ product, recommended = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

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
        <span className="hover:underline cursor-pointer">Home</span>
        <span className="mx-1">/</span>
        <span className="hover:underline cursor-pointer">{product.categoria || 'Categoría'}</span>
        <span className="mx-1">/</span>
        <span className="text-text-main font-semibold">{product.nombre}</span>
      </nav>
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-10">
        {/* Galería de imágenes */}
        <div className="flex flex-col items-center md:w-1/2 w-full">
          <div className="w-80 h-80 bg-gray-50 rounded-lg flex items-center justify-center mb-4 shadow-lg">
            <img
              src={product.foto}
              alt={product.nombre}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
        {/* Info principal */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-text-main mb-2 font-montserrat">{product.nombre}</h1>
          {/* Selector de cantidad mejorado solo si NO es extensión */}
          {product.tipoProducto !== 'Extensiones' ? (
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-semibold text-gray-700">Cantidad</span>
                <span className="text-xs text-gray-500">{formatNumber(product.cantidad)} disponibles</span>
              </div>
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
                  className="w-12 text-center border border-gray-300 rounded font-semibold text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                  onClick={() => setQuantity(q => Math.min((product.cantidad || 99), q + 1))}
                  disabled={quantity >= (product.cantidad || 99)}
                  aria-label="Aumentar"
                >+</button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-semibold text-gray-700">Cantidad</span>
                <span className="text-xs text-gray-500">Disponible</span>
              </div>
            </div>
          )}
          {/* Precio y botón en extremos */}
          <div className="flex justify-between items-center gap-4 mb-4">
            <span className="text-2xl font-bold text-primary">${formatNumber(product.precio?.toFixed(2))}</span>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.cantidad === 0}
              className={`bg-text-main text-white px-6 py-3 rounded-md font-bold text-base shadow hover:bg-primary-dark transition flex items-center gap-1 ${isAddingToCart || product.cantidad === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {isAddingToCart ? 'Agregando...' : 'Añadir al carrito'}
            </button>
          </div>
          {/* Tabs */}
          <div className="border-b border-gray-200 flex gap-8 mb-2">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`pb-2 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="min-h-[80px] text-sm text-gray-700">
            {activeTab === 'description' && (
              <div>{product.descripcion}</div>
            )}
            {activeTab === 'characteristics' && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 rounded-lg bg-white">
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 font-semibold text-text-main whitespace-nowrap">Tipo</td>
                      <td className="px-4 py-2">{product.tipoProducto}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold text-text-main whitespace-nowrap">Categoría</td>
                      <td className="px-4 py-2">{product.categoria}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold text-text-main whitespace-nowrap">Color</td>
                      <td className="px-4 py-2">{product.color}</td>
                    </tr>
                    {product.volumen && (
                      <tr>
                        <td className="px-4 py-2 font-semibold text-text-main whitespace-nowrap">Volumen</td>
                        <td className="px-4 py-2">{product.volumen ? formatNumber(product.volumen) + ' ml' : ''}</td>
                      </tr>
                    )}
                    {product.textura && (
                      <tr>
                        <td className="px-4 py-2 font-semibold text-text-main whitespace-nowrap">Textura</td>
                        <td className="px-4 py-2">{product.textura}</td>
                      </tr>
                    )}
                    {product.origen && (
                      <tr>
                        <td className="px-4 py-2 font-semibold text-text-main whitespace-nowrap">Origen</td>
                        <td className="px-4 py-2">{product.origen}</td>
                      </tr>
                    )}
                    {product.tipoCabelloIdeal && (
                      <tr>
                        <td className="px-4 py-2 font-semibold text-text-main whitespace-nowrap">Tipo de cabello ideal</td>
                        <td className="px-4 py-2">{product.tipoCabelloIdeal}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-2 font-semibold text-text-main whitespace-nowrap">Largo</td>
                      <td className="px-4 py-2">{product.tamanio ? `${product.tamanio} m` : 'No especificado'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Productos recomendados */}
      {recommended.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4 text-text-main">También te puede interesar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommended.map(prod => (
              <div key={prod.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <img src={prod.foto} alt={prod.nombre} className="w-20 h-20 object-contain mb-2" />
                <div className="text-xs text-center font-semibold mb-1 line-clamp-2">{prod.nombre}</div>
                <div className="text-primary font-bold text-sm mb-1">${formatNumber(prod.precio?.toFixed(2))}</div>
                {prod.descuento && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold mb-1">-{prod.descuento}%</span>
                )}
                <button className="mt-auto bg-primary text-white px-3 py-1 rounded text-xs font-semibold hover:bg-primary-dark transition">Ver producto</button>
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