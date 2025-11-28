import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { isValidPassword } from '../../../shared/validations';
import PasswordEye from '../../../shared/components/PasswordEye';
import PasswordRequirements from '../../../shared/components/PasswordRequirements';
import toast from 'react-hot-toast';
import authService from '../services/authServices';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Obtener token de la URL (?token=...) o del state
  const token = searchParams.get('token') || location.state?.token || '';
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar si hay token al cargar el componente
  useEffect(() => {
    if (!token) {
      console.error('❌ No se encontró token de recuperación');
      setError('Token de recuperación no encontrado. Por favor, solicita un nuevo enlace de recuperación.');
      toast.error('Token de recuperación inválido');
    } else {
      console.log('✅ Token de recuperación encontrado');
    }
  }, [token]);

  // Validar formulario
  const isFormValid = 
    password.trim() && 
    confirm.trim() && 
    isValidPassword(password.trim()) && 
    password.trim() === confirm.trim() && 
    token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirm.trim();

    // Validaciones
    if (!token) {
      setError('Token de recuperación inválido o expirado.');
      setLoading(false);
      return;
    }

    if (!isValidPassword(trimmedPassword)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.');
      setLoading(false);
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Restableciendo contraseña...');

      const response = await authService.resetPassword({
        token: token,
        newPassword: trimmedPassword
      });

      console.log('✅ Contraseña restablecida:', response);

      setSuccess('¡Contraseña restablecida exitosamente!');
      toast.success('Contraseña actualizada correctamente');

      // Redirigir al login después de 2 segundos
      setTimeout(() => navigate('/iniciar-sesion'), 2000);

    } catch (error) {
      console.error('❌ Error al restablecer contraseña:', error);

      let errorMsg = 'Error al restablecer la contraseña. Intenta nuevamente.';

      if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || 'Token inválido o expirado';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-[#6d3b3b] text-center">Restaurar contraseña</h2>
        
        {!token && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm text-center">
              No se encontró el token de recuperación. Por favor, solicita un nuevo enlace.
            </p>
            <div className="flex justify-center mt-3">
              <button
                onClick={() => navigate('/forgot-password')}
                className="px-4 py-2 bg-[#a0522d] text-white rounded hover:bg-[#7a3a1d] transition"
              >
                Solicitar nuevo enlace
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center">
            <label className="block font-semibold text-[#6d3b3b] mr-2 w-40 text-right">
              Nueva contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative flex-1">
              <i className="bi bi-lock absolute left-3 top-3 text-gray-400 text-base"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                disabled={loading || !token}
                placeholder="Mínimo 8 caracteres"
              />
              <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
          </div>
          
          <div className="flex items-center">
            <label className="block font-semibold text-[#6d3b3b] mr-2 w-40 text-right">
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative flex-1">
              <i className="bi bi-lock absolute left-3 top-3 text-gray-400 text-base"></i>
              <input
                type={showConfirm ? 'text' : 'password'}
                className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]"
                value={confirm}
                onChange={e => {
                  setConfirm(e.target.value);
                  if (password && e.target.value && password !== e.target.value) {
                    setConfirmError('Las contraseñas no coinciden.');
                  } else {
                    setConfirmError('');
                  }
                }}
                required
                disabled={loading || !token}
                placeholder="Repite la contraseña"
              />
              <PasswordEye visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
              {confirmError && (
                <div className="text-red-500 text-xs mt-1">{confirmError}</div>
              )}
            </div>
          </div>

          {/* Requisitos de contraseña */}
          <PasswordRequirements password={password} />
          
          {error && error !== 'Las contraseñas no coinciden.' && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded">
              {success}
            </div>
          )}
          
          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-[#6d3b3b] rounded shadow hover:bg-gray-300 transition font-semibold"
              onClick={() => navigate('/iniciar-sesion')}
              disabled={loading}
            >
              Volver al login
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#a0522d] text-white rounded shadow hover:bg-[#7a3a1d] transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Restaurando...
                </>
              ) : (
                'Restaurar contraseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;