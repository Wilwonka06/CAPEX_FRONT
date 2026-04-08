import { createContext, useContext, useState, useCallback, useRef } from 'react';
import CartToast from './CartToast';

const CartToastContext = createContext();

export const useCartToast = () => useContext(CartToastContext);

export const CartToastProvider = ({ children }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);

  const timeoutRef = useRef(null);

  const showCartToast = useCallback((product) => {
    setToastProduct(product);
    setShowToast(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowToast(false), 2500);
  }, []);

  return (
    <CartToastContext.Provider value={{ showCartToast }}>
      {children}
      <CartToast show={showToast} product={toastProduct} onClose={() => setShowToast(false)} />
    </CartToastContext.Provider>
  );
}; 