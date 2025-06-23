import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Landing;