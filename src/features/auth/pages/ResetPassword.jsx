import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isValidPassword } from '../../../shared/validations';
import PasswordEye from '../../../shared/components/PasswordEye';
import { toast } from 'react-toastify';
import authService from '../services/authServices';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = password.trim() && confirm.trim() && isValidPassword(password.trim()) && password.trim() === confirm.trim() && token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirm.trim();

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

    if (!token) {
      setError('Token de recuperación inválido o expirado.');
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
      toast.success('Contraseña actualizada correctamente', { position: 'top-right' });

      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      console.error('❌ Error al restablecer contraseña:', error);

      let errorMsg = 'Error al restablecer la contraseña. Intenta nuevamente.';

      if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || 'Token inválido o expirado';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-[#6d3b3b] text-center">Restaurar contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center">
            <label className="block font-semibold text-[#6d3b3b] mr-2 w-40 text-right">*Nueva contraseña:</label>
            <div className="relative flex-1">
              <i className="bi bi-lock absolute left-3 top-3 text-gray-400 text-base"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
              <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
          </div>
          <div className="flex items-center">
            <label className="block font-semibold text-[#6d3b3b] mr-2 w-40 text-right">*Confirmar contraseña:</label>
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
                disabled={loading}
              />
              <PasswordEye visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
              {confirmError && (
                <div className="text-red-500 text-xs mt-1">{confirmError}</div>
              )}
            </div>
          </div>
          {error && error !== 'Las contraseñas no coinciden.' && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-[#6d3b3b] rounded shadow hover:bg-gray-300 transition font-semibold"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Volver
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
                'Restaurar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 