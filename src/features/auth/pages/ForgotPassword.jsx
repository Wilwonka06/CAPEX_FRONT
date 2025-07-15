import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '../../../shared/validations';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isFormValid = isValidEmail(email.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setError('Por favor ingresa un correo válido.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('usuarios')) || [];
    const user = users.find(u => u.correo === trimmedEmail);
    if (!user) {
      setError('No existe un usuario con ese correo.');
      return;
    }
    navigate('/reset-password', { state: { email: trimmedEmail } });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-primary-dark"
          onClick={() => navigate('/login')}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-text-main">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center relative">
            <label className="block font-semibold text-text-main mr-2 w-24 text-right">Correo:</label>
            <i className="bi bi-envelope absolute left-28 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
            <input
              type="email"
              className="flex-1 border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-white border border-primary text-primary rounded shadow hover:bg-primary hover:text-white transition font-semibold"
              disabled={!isFormValid}
            >
              Obtener nueva contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 