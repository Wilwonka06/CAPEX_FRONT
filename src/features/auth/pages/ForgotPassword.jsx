import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '../../../shared/validations';
import { toast } from 'react-toastify';
import authService from '../services/authServices';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isFormValid = isValidEmail(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setError('Por favor ingresa un correo válido.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔑 Solicitando recuperación de contraseña para:', trimmedEmail);

      const response = await authService.forgotPassword(trimmedEmail);

      console.log('✅ Solicitud de recuperación enviada:', response);

      toast.success('Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.', {
        position: 'top-right',
        autoClose: 5000
      });

      // Redirigir al login después de un breve delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('❌ Error en recuperación de contraseña:', error);

      let errorMsg = 'Error al procesar la solicitud. Intenta nuevamente.';

      if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || 'Datos inválidos';
      } else if (error.response?.status === 500) {
        errorMsg = 'Error del servidor. Intenta más tarde.';
      }

      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-2xl font-bold mb-6 text-[#6d3b3b]">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center relative">
            <label className="block font-semibold text-[#6d3b3b] mr-2 w-24 text-right">Correo:</label>
            <i className="bi bi-envelope absolute left-28 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
            <input
              type="email"
              className="flex-1 border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-[#a0522d] text-white rounded shadow hover:bg-[#7a3a1d] transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                'Obtener nueva contraseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 