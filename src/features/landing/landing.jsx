import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CartProvider } from './components/CartContext';

const Landing = () => {
  return (
    <CartProvider>
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
    </CartProvider>
  );
};

export default Landing;