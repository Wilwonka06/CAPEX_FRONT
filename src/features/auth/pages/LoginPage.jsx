import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isValidEmail, isValidPassword } from '../../../shared/validations';
import PasswordEye from '../../../shared/components/PasswordEye';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { restoreAdminData, verifyAdminData } from '../../../shared/utils/adminDataRestore';

const roleRedirect = {
  'administrador': '/dashboard',
  'empleado': '/dashboard/citas',
  'cliente': '/landing',
};

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Restaurar datos del administrador al cargar la página
  useEffect(() => {
    console.log('=== INICIALIZANDO LOGIN PAGE ===');
    
    // Verificar si los datos del administrador existen
    const dataExists = verifyAdminData();
    
    if (!dataExists) {
      console.log('Datos del administrador no encontrados, restaurando...');
      restoreAdminData();
    } else {
      console.log('Datos del administrador ya existen');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!isValidEmail(email)) {
      setError('Correo inválido');
      setEmail('');
      return;
    }
    
    if (!isValidPassword(password)) {
      setError('Contraseña inválida');
      setPassword('');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('usuarios')) || [];
    const userByEmail = users.find(u => u.correo === email);
    
    if (!userByEmail) {
      setError('No existe un usuario con ese correo.');
      setPassword('');
      return;
    }
    
    if (userByEmail.password !== password) {
      setError('La contraseña es incorrecta para este correo.');
      setPassword('');
      return;
    }
    
    if (userByEmail.estado !== 'Activo') {
      setError('El usuario está inactivo.');
      return;
    }
    
    console.log('Login exitoso - Usuario:', userByEmail);
    console.log('Privilegios del usuario:', userByEmail.privileges);
    
    // Usar la función de login del contexto
    login(userByEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark to-background">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Columna izquierda: fondo y mensaje */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary-dark to-background p-10">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">¡Bienvenido de nuevo!</h2>
          <p className="text-lg text-white/80 text-center">Inicia sesión para acceder a tu cuenta y gestionar tus proyectos.</p>
        </div>
        {/* Columna derecha: formulario */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary-dark">Iniciar sesión</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <label className="block mb-1 font-semibold text-text-main">Correo <span className="text-red-500">*</span></label>
              <i className="bi bi-envelope absolute left-3 top-9 text-gray-400 text-base"></i>
              <input
                type="email"
                className="w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <label className="block mb-1 font-semibold text-text-main">Contraseña <span className="text-red-500">*</span></label>
              <i className="bi bi-lock absolute left-3 top-9 text-gray-400 text-base"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="mt-4 text-end">
            <Link to="/forgot-password" className="text-primary hover:underline text-sm font-medium">Forgot your password?</Link>
          </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition font-semibold shadow">Entrar</button>
          </form>
          
          {/* Información de prueba */}
          <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700">
            <p className="font-semibold">Datos de prueba:</p>
            <p>Email: admin@admin.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 