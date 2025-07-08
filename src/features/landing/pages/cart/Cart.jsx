import { useMemo } from 'react';
import { useCart } from '../../components/CartContext';
import { Link } from 'react-router-dom';

const formatNumber = (num) => new Intl.NumberFormat('es-MX').format(num);

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  // Calcular totales
  const subtotal = useMemo(() => cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((acc, p) => acc + p.cantidad, 0), [cart]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-2">
      <h1 className="text-3xl font-bold mb-10 text-text-main font-montserrat">Tu Carrito</h1>
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Lista de productos */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
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
                      <img src={item.foto || item.imagen} alt={item.nombre} className="w-14 h-14 object-contain rounded bg-gray-100 group-hover:ring-2 group-hover:ring-primary transition" />
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
                          <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100" disabled={item.cantidad <= 1}>-</button>
                          <span className="w-8 text-center">{formatNumber(item.cantidad)}</span>
                          <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100">+</button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-primary">${formatNumber(item.precio * item.cantidad)}</td>
                  <td className="py-3">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-10">Tu carrito está vacío.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Resumen de compra */}
        <div className="w-full md:w-80 bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-bold mb-4 text-text-main">Resumen de compra</h2>
          <div className="flex justify-between text-sm mb-2">
            <span>Productos</span>
            <span>{formatNumber(totalItems)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>${formatNumber(subtotal)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-4 mb-6">
            <span>Total</span>
            <span>${formatNumber(subtotal)}</span>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg transition">Continuar con la compra</button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 