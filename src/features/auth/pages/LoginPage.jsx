import { useState } from 'react';
import { isValidEmail, isValidPassword } from '../../../shared/validations';
import PasswordEye from '../../../shared/components/PasswordEye';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiRequest } from '../../../shared/config/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const { login } = useAuth();
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
      toast.error(errorMsg, { position: 'top-right' });
      setLoading(false);
      return;
    }

    if (!isValidPassword(trimmedPassword)) {
      const errorMsg = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
      setError(errorMsg);
      setPassword('');
      toast.error(errorMsg, { position: 'top-right' });
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Iniciando login...');
      
      // Llamar a la API de autenticación del backend
      const response = await apiRequest.post('/auth/login', {
        correo: trimmedEmail,
        contrasena: trimmedPassword
      });

      console.log('📥 Respuesta del servidor:', response);

      if (response.success && response.data) {
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

        // Login exitoso - delegar al contexto
        await login(userData);
        
        toast.success('¡Bienvenido!', { position: 'top-right', autoClose: 1000 });
      } else {
        throw new Error(response.message || 'Error en la autenticación');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);

      let errorMsg = 'Error al iniciar sesión';

      if (error.response?.status === 401) {
        errorMsg = 'Credenciales inválidas';
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || 'Datos incorrectos';
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right' });
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-r from-[#f8ede3] via-[#fff6ee] to-[#f8ede3] relative">
      {/* Texto de bienvenida sobre el fondo */}
      <div className="absolute left-0 top-0 h-full w-1/2 flex flex-col justify-center pl-32 z-10">
        <h2 className="text-5xl font-bold text-[#6d3b3b] mb-6">¡Bienvenido de nuevo!</h2>
        <p className="text-lg text-[#6d3b3b] mb-8 max-w-md">Ingresa tus datos para continuar.</p>
        <div className="flex gap-4 mt-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-[#ffb76b] to-[#ff7c7c]"></div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-[#ff7c7c] to-[#ffb76b]"></div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-[#ffb76b] to-[#ff7c7c]"></div>
        </div>
      </div>
      
      {/* Formulario en tarjeta blanca */}
      <div className="flex justify-end items-center min-h-screen">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-10 z-20 mt-10 mr-32">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#6d3b3b]">Iniciar sesión</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Campo correo */}
            <div className="relative">
              <label className="block text-sm font-medium text-[#6d3b3b]">
                Correo <span className="text-red-500">*</span>
              </label>
              <i className="bi bi-envelope absolute left-3 top-9 text-gray-400 text-base"></i>
              <input
                type="email"
                className="w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
            
            {/* Campo contraseña */}
            <div className="relative">
              <label className="block text-sm font-medium text-[#6d3b3b]">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <i className="bi bi-lock absolute left-3 top-9 text-gray-400 text-base"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <a href="/forgot-password" className="text-[#a0522d] hover:underline text-sm">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#a0522d] text-white py-2 rounded hover:bg-[#7a3a1d] transition font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a href="/register" className="text-[#a0522d] hover:underline">
              ¿No tienes cuenta? Regístrate
            </a>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}