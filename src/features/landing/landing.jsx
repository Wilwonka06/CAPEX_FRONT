import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CartProvider } from './components/CartContext';
import { CartToastProvider } from './components/CartToastContext';

const Landing = () => {
  return (
    <CartProvider>
      <CartToastProvider>
        <div className="min-h-screen bg-background font-inter">
          {/* Navbar */}
          <Navbar />
          <main>
            <Outlet />
          </main>
        </div>
      </CartToastProvider>
    </CartProvider>
  );
};

export default Landing;