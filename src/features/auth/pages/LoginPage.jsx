import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isValidEmail, isValidPassword } from '../../../shared/validations';
import PasswordEye from '../../../shared/components/PasswordEye';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiRequest } from '../../../shared/config/apiConfig';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener la página anterior desde location.state (si existe)
  const previousPath = location.state?.from?.pathname || null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Validaciones básicas
    if (!isValidEmail(trimmedEmail)) {
      const errorMsg = 'Por favor ingresa un correo válido.';
      setError(errorMsg);
      setEmail('');
      setLoading(false);
      return;
    }

    if (!isValidPassword(trimmedPassword)) {
      const errorMsg = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
      setError(errorMsg);
      setPassword('');
      setLoading(false);
      return;
    }

    const loginPromise = (async () => {
      console.log('🔐 Iniciando login...');
      
      // Normalizar correo a minúsculas para búsqueda case-insensitive
      const normalizedEmail = trimmedEmail.toLowerCase();
      
      // Llamar a la API de autenticación del backend
      const response = await apiRequest.post('/auth/login', {
        correo: normalizedEmail,
        contrasena: trimmedPassword
      });

      console.log('📥 Respuesta del servidor:', response);

      if (response.success && response.data) {
        if (response.data.token) {
          try { localStorage.setItem('authToken', response.data.token); } catch {}
        }
        // Verificar que el usuario tenga rol
        if (!response.data.user?.rol) {
          throw new Error('Usuario sin rol asignado');
        }

        // Verificar que el usuario tenga privilegios (especialmente si es admin)
        const roleName = typeof response.data.user.rol === 'string' 
          ? response.data.user.rol 
          : response.data.user.rol.nombre || '';

        console.log('👤 Rol del usuario:', roleName);

        // Si es administrador pero no tiene privilegios, agregarlos
        if ((roleName.toLowerCase() === 'administrador' || roleName.toLowerCase() === 'admin') 
            && !response.data.user.privileges) {
          console.log('⚠️ Administrador sin privilegios, agregando privilegios completos...');
          
          response.data.user.privileges = {
            'Dashboard': { 'Visualizar': true, 'Crear': true, 'Editar': true, 'Eliminar': true },
            'Gestión de Usuarios': { 'Visualizar': true, 'Crear': true, 'Editar': true, 'Eliminar': true },
            'Gestión de Compras': { 'Visualizar': true, 'Crear': true, 'Editar': true, 'Eliminar': true },
            'Gestión de Servicios': { 'Visualizar': true, 'Crear': true, 'Editar': true, 'Eliminar': true },
            'Ventas': { 'Visualizar': true, 'Crear': true, 'Editar': true, 'Eliminar': true }
          };
        }

        console.log('✅ Privilegios del usuario:', response.data.user.privileges);

        // Preparar datos del usuario para el contexto
        const userData = response.data.user;

        console.log('💾 Guardando datos del usuario:', userData);
        console.log('📍 Página anterior guardada:', previousPath);

        // Login exitoso - delegar al contexto con la página anterior
        const redirectPath = await login(userData, previousPath);

        // Navegar sin recargar toda la página
        navigate(redirectPath, { replace: true });

        return userData;
      } else {
        throw new Error(response.message || 'Error en la autenticación');
      }
    })();

    toast.promise(
      loginPromise,
      {
        loading: 'Iniciando sesión...',
        success: '¡Bienvenido!',
        error: (err) => {
          console.error('❌ Error en login:', err);

          let errorMsg = 'Error al iniciar sesión';

          if (err.response?.status === 401) {
            errorMsg = 'Credenciales inválidas';
          } else if (err.response?.status === 400) {
            errorMsg = err.response?.data?.message || 'Datos incorrectos';
          } else if (err.response?.status === 403) {
            errorMsg = 'No autorizado, por favor inicia sesión nuevamente';
          } else if (err.message) {
            errorMsg = err.message;
          }

          setError(errorMsg);
          return errorMsg;
        },
      },
      {
        id: 'login',
      }
    );

    try {
      await loginPromise;
    } catch (error) {
      // Error ya manejado por toast.promise
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-inter relative overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8ede3] via-[#fff6ee] to-[#f8ede3] animate-gradient-x"></div>

      {/* Elementos decorativos flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#ffb76b]/20 to-[#ff7c7c]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#ff7c7c]/20 to-[#ffb76b]/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-[#ffb76b] rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-[#ff7c7c] rounded-full animate-pulse-delayed"></div>
      </div>

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
              ¡Bienvenido
              <span className="block text-[#a0522d]">de nuevo!</span>
            </h1>
            <p className="text-lg text-[#6d3b3b]/80 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
              Ingresa tus credenciales para acceder a tu cuenta y continuar con tu experiencia.
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
            <h2 className="text-3xl font-bold text-[#6d3b3b] mb-2">Iniciar sesión</h2>
          </div>

            {/* Formulario */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              <form onSubmit={handleLogin} className="space-y-6">
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
                      autoComplete="username"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Campo contraseña */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#6d3b3b]">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="bi bi-lock text-gray-400 group-focus-within:text-[#ffb76b] transition-colors"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffb76b] focus:ring-4 focus:ring-[#ffb76b]/10 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                    </div>
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

                {/* Enlaces */}
                <div className="flex justify-end">
                  <a
                    href="/olvide-contrasena"
                    className="text-[#a0522d] hover:text-[#7a3a1d] font-medium text-sm transition-colors duration-200 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Botón de login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#a0522d] to-[#7a3a1d] text-white py-4 rounded-xl font-semibold text-lg hover:from-[#8b4513] hover:to-[#654321] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right"></i>
                      <span>Entrar</span>
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
                </div>
              </div>

              {/* Registro */}
              <div className="text-center">
                <span className="text-gray-600">¿No tienes cuenta? </span>
                <a
                  href="/registrarse"
                  className="text-[#a0522d] hover:text-[#7a3a1d] font-semibold transition-colors duration-200 hover:underline"
                >
                  Regístrate aquí
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
}