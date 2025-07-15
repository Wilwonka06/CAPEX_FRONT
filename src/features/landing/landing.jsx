import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CartProvider } from './components/CartContext';

const Landing = () => {
  return (
    <CartProvider>
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      <Outlet />
    </div>
    </CartProvider>
  );
};

export default Landing;