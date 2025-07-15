import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const getStoredCart = () => {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(getStoredCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, cantidad = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        // Si ya existe, sumar cantidad (excepto extensiones, que solo permiten 1)
        if (product.tipoProducto === 'Extensiones') {
          return prev;
        }
        const updated = [...prev];
        updated[idx].cantidad += cantidad;
        return updated;
      }
      return [...prev, { ...product, cantidad: product.tipoProducto === 'Extensiones' ? 1 : cantidad }];
    });
  };

  const updateQuantity = (id, cantidad) => {
    setCart(prev => prev.map(p => p.id === id ? { ...p, cantidad: Math.max(1, cantidad) } : p));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 