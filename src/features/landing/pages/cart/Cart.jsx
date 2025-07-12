import { useMemo } from 'react';
import { useCart } from '../../components/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const formatNumber = (num) => new Intl.NumberFormat('es-MX').format(num);

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Calcular totales
  const subtotal = useMemo(() => cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((acc, p) => acc + p.cantidad, 0), [cart]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-10 px-2">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2 text-text-main">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">Agrega productos para verlos aquí y realizar tu compra.</p>
          <Link to="/landing" className="inline-block bg-primary hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">Ver productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-2">
      <h1 className="text-3xl font-bold mb-10 text-text-main font-montserrat">Tu Carrito</h1>
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Lista de productos */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
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
                        <img src={item.foto || item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded bg-gray-100 group-hover:ring-2 group-hover:ring-primary transition" />
                      </Link>
                      <div>
                        <Link to={`/landing/productos/${item.id}`} className="font-semibold text-text-main hover:text-primary transition">
                          {item.nombre}
                        </Link>
                        {item.color && <div className="text-xs text-gray-500">{item.color}</div>}
                      </div>
                    </td>
                    <td className="py-3 font-medium text-text-main">${formatNumber(item.precio)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {item.tipoProducto === 'Extensiones' ? (
                          <span className="w-8 text-center">1</span>
                        ) : (
                          <>
                            <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition disabled:opacity-50" disabled={item.cantidad <= 1}>-</button>
                            <span className="w-8 text-center font-semibold">{formatNumber(item.cantidad)}</span>
                            <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition">+</button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-primary">${formatNumber(item.precio * item.cantidad)}</td>
                    <td className="py-3">
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 text-xl font-bold transition-transform hover:scale-125" title="Eliminar producto" aria-label="Eliminar producto">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Móvil: cards */}
          <div className="md:hidden flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 bg-gray-50 rounded-lg shadow p-4 items-center">
                <Link to={`/landing/productos/${item.id}`} className="shrink-0">
                  <img src={item.foto || item.imagen} alt={item.nombre} className="w-20 h-20 object-cover rounded bg-white border border-gray-200" />
                </Link>
                <div className="flex-1 flex flex-col gap-1">
                  <Link to={`/landing/productos/${item.id}`} className="font-semibold text-text-main hover:text-primary transition text-base">
                    {item.nombre}
                  </Link>
                  {item.color && <div className="text-xs text-gray-500">{item.color}</div>}
                  <div className="flex items-center gap-2 mt-2">
                    {item.tipoProducto === 'Extensiones' ? (
                      <span className="w-8 text-center">1</span>
                    ) : (
                      <>
                        <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition disabled:opacity-50" disabled={item.cantidad <= 1}>-</button>
                        <span className="w-8 text-center font-semibold">{formatNumber(item.cantidad)}</span>
                        <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition">+</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-semibold text-primary text-lg">${formatNumber(item.precio * item.cantidad)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-transform hover:scale-125" title="Eliminar producto" aria-label="Eliminar producto">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Resumen de compra */}
        <div className="w-full md:w-80 bg-white rounded-lg shadow p-6 h-fit flex flex-col gap-4">
          <h2 className="text-lg font-bold mb-2 text-text-main flex items-center gap-2"><span>🧾</span> Resumen de compra</h2>
          <div className="flex justify-between text-sm mb-1">
            <span>Productos</span>
            <span>{formatNumber(totalItems)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span>${formatNumber(subtotal)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-4 mb-2">
            <span>Total</span>
            <span>${formatNumber(subtotal)}</span>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg transition shadow-lg" onClick={() => navigate('/landing/checkout')}>Continuar con la compra</button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 