import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const { currentUser, getRoleRedirect } = useAuth();

  const handleGoHome = () => {
    if (currentUser) {
      window.location.href = getRoleRedirect(currentUser.rol);
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
        <div className="mb-4">
          <i className="bi bi-exclamation-triangle text-6xl text-yellow-500"></i>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Página no encontrada</h2>
        <p className="text-gray-700 mb-4">La página que buscas no existe o ha sido movida.</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={handleGoHome}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          >
            Ir al inicio
          </button>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 