import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '../../../shared/validations';
import toast from 'react-hot-toast';
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
        duration: 5000
      });

      // Redirigir al login después de un breve delay
      setTimeout(() => {
        navigate('/iniciar-sesion');
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
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-inter relative overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8ede3] via-[#fff6ee] to-[#f8ede3] animate-gradient-x"></div>

      {/* Contenedor principal */}
      <div className="flex w-full min-h-screen relative z-10">
        {/* Panel izquierdo - Bienvenida */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24 relative">
          {/* Logo superior */}
          <div className="absolute top-8 left-8">
            <div className="text-2xl font-bold text-[#6d3b3b] tracking-wider">CAPEX</div>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl xl:text-6xl font-bold text-[#6d3b3b] mb-6 leading-tight animate-fade-in-up">
              ¡Recupera tu
              <span className="block text-[#a0522d]">cuenta!</span>
            </h1>
            <p className="text-lg text-[#6d3b3b]/80 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            {/* Elementos decorativos */}
            <div className="flex gap-3 mb-8 animate-fade-in-up animation-delay-400">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#ffb76b] to-[#ff7c7c] animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#ff7c7c] to-[#ffb76b] animate-bounce animation-delay-100"></div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#ffb76b] to-[#ff7c7c] animate-bounce animation-delay-200"></div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md animate-fade-in-up">
            {/* Botón de volver */}
            <div className="mb-6">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 text-[#6d3b3b]/70 hover:text-[#6d3b3b] transition-colors duration-200"
              >
                <i className="bi bi-arrow-left"></i>
                <span>Volver al inicio</span>
              </button>
            </div>

            {/* Header del formulario */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#6d3b3b] mb-2">Restablecer Contraseña</h2>
            </div>

            {/* Formulario */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo correo */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#6d3b3b]">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="bi bi-envelope text-gray-400 group-focus-within:text-[#ffb76b] transition-colors"></i>
                    </div>
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffb76b] focus:ring-4 focus:ring-[#ffb76b]/10 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                    <div className="flex items-center gap-2">
                      <i className="bi bi-exclamation-triangle text-red-500"></i>
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Botón de enviar */}
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full bg-gradient-to-r from-[#a0522d] to-[#7a3a1d] text-white py-4 rounded-xl font-semibold text-lg hover:from-[#8b4513] hover:to-[#654321] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-envelope"></i>
                      <span>Enviar instrucciones</span>
                    </>
                  )}
                </button>
              </form>

              {/* Separador */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">o</span>
                </div>
              </div>

              {/* Enlaces */}
              <div className="text-center">
                <span className="text-gray-600">¿Recuerdas tu contraseña? </span>
                <a
                  href="/iniciar-sesion"
                  className="text-[#a0522d] hover:text-[#7a3a1d] font-semibold transition-colors duration-200 hover:underline"
                >
                  Inicia sesión aquí
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-xs text-[#6d3b3b]/50">
              <p>© 2024 CAPEX. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS personalizados */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-180deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animate-pulse-delayed { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default ForgotPassword; 