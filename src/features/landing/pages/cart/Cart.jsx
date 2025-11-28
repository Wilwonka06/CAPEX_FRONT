import { useMemo } from 'react';
import { useCart } from '../../components/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatNumber } from '../../../../shared/utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

// Imagen por defecto para productos sin imagen (similar a usuarios)
const getDefaultProductImage = (productName = "Product") => {
  const name = encodeURIComponent(productName || "Product");
  return `https://ui-avatars.com/api/?name=${name}&background=9C5B2B&color=fff&size=128&bold=true`;
};

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, isInitializing } = useCart();
  const navigate = useNavigate();

  // Mostrar loading mientras se inicializa el carrito
  if (isInitializing) {
    return <LoadingSpinner message="Cargando carrito..." subMessage="Estamos preparando tus productos" />;
  }

  // Calcular totales
  const subtotal = useMemo(() => cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((acc, p) => acc + p.cantidad, 0), [cart]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col items-center justify-center py-10 px-2">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4 text-[#FACC15]">🛒</div>
          <h2 className="text-2xl font-bold mb-2 text-[#1E1E1E]">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">Agrega productos para verlos aquí y realizar tu compra.</p>
          <Link to="/landing" className="inline-block bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] font-bold py-3 px-8 rounded-full text-lg transition shadow-lg">Ver productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col items-center py-10 px-2">
      {/* Migas de pan */}
      <nav className="w-full max-w-6xl mx-auto text-xs text-gray-500 mb-6 flex items-center gap-2">
        <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/landing'}>Home</span>
        <span className="mx-1">/</span>
        <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/landing/catalogo'}>Productos</span>
        <span className="mx-1">/</span>
        <span className="text-[#FACC15] font-semibold">Carrito</span>
      </nav>
      <h1 className="text-3xl font-bold mb-10 text-[#1E1E1E] font-montserrat">Tu Carrito</h1>
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Lista de productos */}
        <div className="flex-1 bg-white rounded-2xl shadow-2xl p-8 ">
          {/* Desktop: tabla, móvil: cards */}
          <div className="hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                <th className="py-2">Producto</th>
                <th className="py-2">Precio</th>
                <th className="py-2">Cantidad</th>
                <th className="py-2">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 flex items-center gap-4">
                    <Link to={`/landing/productos/${item.id}`} className="group">
                        <img 
                          src={
                            (item.fotos && item.fotos.length > 0 && item.fotos[0])
                              ? item.fotos[0]
                              : (item.foto || item.imagen || getDefaultProductImage(item.nombre))
                          }
                          alt={item.nombre} 
                          className="w-16 h-16 object-cover rounded-xl bg-gray-100 group-hover:ring-2 group-hover:ring-[#FACC15] transition shadow"
                          onError={(e) => {
                            e.target.src = getDefaultProductImage(item.nombre);
                          }}
                        />
                    </Link>
                    <div>
                      <Link to={`/landing/productos/${item.id}`} className="font-semibold text-[#1E1E1E] hover:text-[#FACC15] transition">
                        {item.nombre}
                      </Link>
                      {item.color && <div className="text-xs text-gray-500">{item.color}</div>}
                    </div>
                  </td>
                  <td className="py-3 font-medium text-[#1E1E1E]">${formatNumber(item.precio)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nuevaCantidad = Math.max(1, item.cantidad - 1);
                          updateQuantity(item.id, nuevaCantidad);
                        }}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition text-lg font-semibold"
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.stock ?? item.cantidad ?? 999}
                        value={item.cantidad}
                        onChange={(e) => {
                          const nuevaCantidad = parseInt(e.target.value) || 1;
                          const stockDisponible = item.stock ?? item.cantidad ?? 999;
                          if (nuevaCantidad > stockDisponible) {
                            alert(`No puedes agregar más de ${stockDisponible} unidades. Stock disponible: ${stockDisponible}`);
                            updateQuantity(item.id, stockDisponible);
                          } else {
                            updateQuantity(item.id, nuevaCantidad);
                          }
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm font-semibold"
                      />
                      <button
                        onClick={() => {
                          const stockDisponible = item.stock ?? item.cantidad ?? 999;
                          if (item.cantidad >= stockDisponible) {
                            alert(`No puedes agregar más de ${stockDisponible} unidades. Stock disponible: ${stockDisponible}`);
                            return;
                          }
                          updateQuantity(item.id, item.cantidad + 1);
                        }}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition text-lg font-semibold"
                        disabled={item.cantidad >= (item.stock ?? item.cantidad ?? 999)}
                      >
                        +
                      </button>
                    </div>
                    {(item.stock ?? item.cantidad) && (
                      <div className="text-xs text-gray-500 mt-1">
                        Stock: {item.stock ?? item.cantidad}
                      </div>
                    )}
                  </td>
                  <td className="py-3 font-semibold text-[#FACC15]">${formatNumber(item.precio * item.cantidad)}</td>
                  <td className="py-3">
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-lg"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {/* Cards para móvil */}
          <div className="md:hidden flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 bg-gray-50 rounded-xl shadow p-4 items-center border border-[#FACC15]">
                <Link to={`/landing/productos/${item.id}`} className="shrink-0">
                  <img 
                    src={
                      (item.fotos && item.fotos.length > 0 && item.fotos[0])
                        ? item.fotos[0]
                        : (item.foto || item.imagen || getDefaultProductImage(item.nombre))
                    }
                    alt={item.nombre} 
                    className="w-20 h-20 object-cover rounded-xl bg-white border-2 border-[#FACC15] shadow"
                    onError={(e) => {
                      e.target.src = getDefaultProductImage(item.nombre);
                    }}
                  />
                </Link>
                <div className="flex-1 flex flex-col gap-1">
                  <Link to={`/landing/productos/${item.id}`} className="font-semibold text-[#1E1E1E] hover:text-[#FACC15] transition text-base">
                    {item.nombre}
                  </Link>
                  {item.color && <div className="text-xs text-gray-500">{item.color}</div>}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        const nuevaCantidad = Math.max(1, item.cantidad - 1);
                        updateQuantity(item.id, nuevaCantidad);
                      }}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition text-lg font-semibold"
                      disabled={item.cantidad <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock ?? item.cantidad ?? 999}
                      value={item.cantidad}
                      onChange={(e) => {
                        const nuevaCantidad = parseInt(e.target.value) || 1;
                        const stockDisponible = item.stock ?? item.cantidad ?? 999;
                        if (nuevaCantidad > stockDisponible) {
                          alert(`No puedes agregar más de ${stockDisponible} unidades. Stock disponible: ${stockDisponible}`);
                          updateQuantity(item.id, stockDisponible);
                        } else {
                          updateQuantity(item.id, nuevaCantidad);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm font-semibold"
                    />
                    <button
                      onClick={() => {
                        const stockDisponible = item.stock ?? item.cantidad ?? 999;
                        if (item.cantidad >= stockDisponible) {
                          alert(`No puedes agregar más de ${stockDisponible} unidades. Stock disponible: ${stockDisponible}`);
                          return;
                        }
                        updateQuantity(item.id, item.cantidad + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition text-lg font-semibold"
                      disabled={item.cantidad >= (item.stock ?? item.cantidad ?? 999)}
                    >
                      +
                    </button>
                  </div>
                  {(item.stock ?? item.cantidad) && (
                    <div className="text-xs text-gray-500 mt-1">
                      Stock: {item.stock ?? item.cantidad}
                    </div>
                  )}
                  <div className="text-[#FACC15] font-bold text-lg mt-2">${formatNumber(item.precio * item.cantidad)}</div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-lg ml-2"><i className="bi bi-trash"></i></button>
              </div>
            ))}
          </div>
        </div>
        {/* Resumen de compra */}
        <div className="w-full md:w-96 bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#FACC15] mb-4 flex items-center gap-2"><i className="bi bi-receipt-cutoff"></i> Resumen de compra</h2>
          <div className="flex justify-between text-base mb-2">
            <span>Subtotal</span>
            <span className="font-semibold">${formatNumber(subtotal)}</span>
          </div>
          <div className="flex justify-between text-base mb-2">
            <span>Envío</span>
            <span className="font-semibold text-gray-400">Calculado en checkout</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-[#FACC15]">${formatNumber(subtotal)}</span>
          </div>
          <button
            onClick={() => navigate('/landing/checkout')}
            className="w-full py-3 bg-[#FACC15] text-[#1E1E1E] rounded-full font-bold text-lg shadow hover:bg-yellow-400 transition mt-4 flex items-center justify-center gap-2"
          >
            <i className="bi bi-credit-card"></i> Ir a pagar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 