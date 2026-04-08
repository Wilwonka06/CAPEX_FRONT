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
  const [cart, setCart] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Inicializar carrito desde localStorage
  useEffect(() => {
    let timeoutId;
    try {
      const storedCart = getStoredCart();
      setCart(storedCart);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCart([]);
    } finally {
      // Pequeño delay para mostrar el loading si es necesario
      timeoutId = setTimeout(() => {
        setIsInitializing(false);
      }, 100);
    }
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isInitializing]);

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
    setCart(prev => prev.map(p => {
      if (p.id === id) {
        // Obtener stock disponible del producto (puede ser stock, cantidad, o cantidad_disponible)
        const stockDisponible = p.stock ?? p.cantidad ?? p.cantidad_disponible ?? 999;
        // Validar que la cantidad no exceda el stock disponible
        const nuevaCantidad = Math.max(1, Math.min(cantidad, stockDisponible));
        return { ...p, cantidad: nuevaCantidad };
      }
      return p;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, isInitializing }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 