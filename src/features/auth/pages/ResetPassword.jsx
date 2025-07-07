import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isValidPassword } from '../../../shared/validations';
import PasswordEye from '../../../shared/components/PasswordEye';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!isValidPassword(password)) {
      setError('Password is not valid.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('usuarios')) || [];
    const idx = users.findIndex(u => u.correo === email);
    if (idx === -1) {
      setError('User not found.');
      return;
    }
    users[idx].password = password;
    localStorage.setItem('usuarios', JSON.stringify(users));
    setSuccess('Password successfully reset!');
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-text-main text-center">Restaurar contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center">
            <label className="block font-semibold text-text-main mr-2 w-40 text-right">*Nueva contraseña:</label>
            <div className="relative flex-1">
              <i className="bi bi-lock absolute left-3 top-3 text-gray-400 text-base"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
              />
              <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
          </div>
          <div className="flex items-center">
            <label className="block font-semibold text-text-main mr-2 w-40 text-right">*Confirmar contraseña:</label>
            <div className="relative flex-1">
              <i className="bi bi-lock absolute left-3 top-3 text-gray-400 text-base"></i>
              <input
                type={showConfirm ? 'text' : 'password'}
                className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <PasswordEye visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              className="px-6 py-2 bg-white border border-primary text-primary rounded shadow hover:bg-primary hover:text-white transition font-semibold"
              onClick={() => navigate('/login')}
            >
              Volver
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded shadow hover:bg-primary-dark transition font-semibold"
            >
              Restaurar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 