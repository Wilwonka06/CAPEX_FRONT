import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEmail, isValidPassword, isValidCustomerName, validatePasswordConfirmation, isValidPhone } from '../../../shared/validations';
import { toast } from 'react-toastify';
import PasswordEye from '../../../shared/components/PasswordEye';
import authService from '../services/authServices';

const DOC_TYPES = ['Cedula de ciudadania', 'Pasaporte', 'Cedula de extranjeria'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    tipoDocumento: '',
    documento: '',
    telefono: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState({});
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (name, value) => {
    switch (name) {
      case 'nombre':
        return isValidCustomerName(value) ? '' : 'Nombre inválido';
      case 'correo':
        if (!isValidEmail(value)) return 'Correo inválido';
        return '';
      case 'telefono':
        if (!isValidPhone(value)) return 'Teléfono inválido. Usa formato internacional, ej: +573001234567';
        return '';
      case 'documento':
        if (form.tipoDocumento === 'Pasaporte') {
          if (!/^[a-zA-Z0-9]{6,12}$/.test(value)) return 'Pasaporte inválido (6-12 caracteres alfanuméricos)';
        } else if (form.tipoDocumento === 'Cedula de ciudadania' || form.tipoDocumento === 'Cedula de extranjeria') {
          if (!/^[0-9]{5,20}$/.test(value)) return 'Documento inválido (5-20 dígitos, solo números)';
        }
        return '';
      case 'tipoDocumento':
        if (!value.trim()) return 'Campo obligatorio';
        return '';
      case 'password':
        return value ? (isValidPassword(value) ? '' : 'Contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo (@$!%?&)') : 'Campo obligatorio';
      case 'confirmPassword':
        return validatePasswordConfirmation(form.password, value).confirmarContrasena || '';
      default:
        return value.trim() ? '' : 'Campo obligatorio';
    }
  };

  const step1Fields = ['nombre', 'tipoDocumento', 'documento', 'telefono'];
  const step2Fields = ['correo', 'password', 'confirmPassword'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const err = validate(name, value);
    setError(prev => ({ ...prev, [name]: err }));
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validate(name, value);
    setError(prev => ({ ...prev, [name]: err }));
  };

  const validateStep = () => {
    const fields = step === 1 ? step1Fields : step2Fields;
    let valid = true;
    let newError = {};
    for (const key of fields) {
      const err = validate(key, form[key]);
      if (err) {
        newError[key] = err;
        valid = false;
      }
    }
    setError(prev => ({ ...prev, ...newError }));
    return valid;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) setStep(2);
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    try {
      console.log('📝 Registrando nuevo usuario...');

      const userData = {
        nombre: form.nombre.trim(),
        correo: form.correo.trim().toLowerCase(),
        contrasena: form.password,
        tipo_documento: form.tipoDocumento,
        documento: form.documento.trim(),
        telefono: form.telefono.trim()
      };

      const response = await authService.register(userData);

      console.log('✅ Usuario registrado exitosamente:', response);

      toast.success('¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.', {
        position: 'top-right',
        duration: 5000
      });

      // Limpiar formulario
      setForm({
        nombre: '',
        tipoDocumento: '',
        documento: '',
        telefono: '',
        correo: '',
        password: '',
        confirmPassword: ''
      });
      setStep(1);

      // Redirigir al login después de un breve delay
      setTimeout(() => navigate('/login'), 3000);

    } catch (error) {
      console.error('❌ Error en registro:', error);

      let errorMsg = 'Error al registrar usuario. Intenta de nuevo.';

      if (error.response?.status === 409) {
        errorMsg = error.response?.data?.message || 'El correo o documento ya están registrados';
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || 'Datos inválidos. Verifica la información proporcionada.';
      } else if (error.response?.status === 422) {
        errorMsg = 'Datos de registro inválidos. Verifica todos los campos.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Error del servidor. Si el problema persiste, contacta al soporte.';
      }

      toast.error(errorMsg, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-r from-[#f8ede3] via-[#fff6ee] to-[#f8ede3] relative">
      {/* Texto de bienvenida sobre el fondo */}
      <div className="absolute left-0 top-0 h-full w-1/2 flex flex-col justify-center pl-32 z-10">
        <h2 className="text-5xl font-bold text-[#6d3b3b] mb-6">¡Bienvenido de nuevo!</h2>
        <p className="text-lg text-[#6d3b3b] mb-8 max-w-md">Regístrate para acceder a tu cuenta y gestionar tus proyectos de manera eficiente.</p>
        <div className="flex gap-4 mt-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-[#ffb76b] to-[#ff7c7c]"></div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-[#ff7c7c] to-[#ffb76b]"></div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-[#ffb76b] to-[#ff7c7c]"></div>
        </div>
      </div>
      {/* Formulario en tarjeta blanca */}
      <div className="flex justify-end items-center min-h-screen">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-10 z-20 mt-10 mr-32">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#6d3b3b]">Regístrate</h2>
          <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                {/* Nombre completo */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#6d3b3b]">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <i className="bi bi-person absolute left-3 top-9 text-gray-400 text-base"></i>
                  <input type="text" name="nombre" className="w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]" value={form.nombre} onChange={handleChange} onBlur={handleBlur} required disabled={loading} />
                  {error.nombre && <span className="text-red-500 text-xs">{error.nombre}</span>}
                </div>
                {/* Tipo de documento */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#6d3b3b]">
                    Tipo de documento <span className="text-red-500">*</span>
                  </label>
                  <i className="bi bi-card-list absolute left-3 top-9 text-gray-400 text-base"></i>
                  <select name="tipoDocumento" className="w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]" value={form.tipoDocumento} onChange={handleChange} onBlur={handleBlur} required disabled={loading}>
                    <option value="">Seleccionar</option>
                    {DOC_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  {error.tipoDocumento && <span className="text-red-500 text-xs">{error.tipoDocumento}</span>}
                </div>
                {/* Documento */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#6d3b3b]">
                    Documento <span className="text-red-500">*</span>
                  </label>
                  <i className="bi bi-file-earmark-text absolute left-3 top-9 text-gray-400 text-base"></i>
                  <input type="text" name="documento" className="w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]" value={form.documento} onChange={handleChange} onBlur={handleBlur} required disabled={loading} />
                  {error.documento && <span className="text-red-500 text-xs">{error.documento}</span>}
                </div>
                {/* Teléfono */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#6d3b3b]">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <i className="bi bi-telephone absolute left-3 top-9 text-gray-400 text-base"></i>
                  <input type="text" name="telefono" placeholder="+573001234567" className="w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]" value={form.telefono} onChange={handleChange} onBlur={handleBlur} required disabled={loading} />
                  {error.telefono && <span className="text-red-500 text-xs">{error.telefono}</span>}
                </div>
                <button type="submit" className="w-full bg-[#a0522d] text-white py-2 rounded hover:bg-[#7a3a1d] transition font-semibold text-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>Siguiente</button>
              </>
            )}
            {step === 2 && (
              <>
                {/* Correo electrónico */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#6d3b3b]">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <i className="bi bi-envelope absolute left-3 top-9 text-gray-400 text-base"></i>
                  <input type="email" name="correo" className="w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]" value={form.correo} onChange={handleChange} onBlur={handleBlur} required disabled={loading} />
                  {error.correo && <span className="text-red-500 text-xs">{error.correo}</span>}
                </div>
                {/* Contraseña */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#6d3b3b]">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <i className="bi bi-lock absolute left-3 top-9 text-gray-400 text-base"></i>
                  <input type={showPassword ? 'text' : 'password'} name="password" className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]" value={form.password} onChange={handleChange} onBlur={handleBlur} required disabled={loading} />
                  <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                  {error.password && <span className="text-red-500 text-xs">{error.password}</span>}
                </div>
                {/* Confirmar contraseña */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#6d3b3b]">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <i className="bi bi-lock-fill absolute left-3 top-9 text-gray-400 text-base"></i>
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffb76b]" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} required disabled={loading} />
                  <PasswordEye visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
                  {error.confirmPassword && <span className="text-red-500 text-xs">{error.confirmPassword}</span>}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleBack} className="w-1/2 bg-gray-200 text-[#6d3b3b] py-2 rounded font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>Atrás</button>
                  <button type="submit" className="w-1/2 bg-[#a0522d] text-white py-2 rounded hover:bg-[#7a3a1d] transition font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Registrando...
                      </>
                    ) : (
                      'Registrarme'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
      {/* Enlace fuera de la tarjeta, abajo */}
      <div className="w-full flex justify-end pr-32 pb-8 z-30">
        <span className="text-[#6d3b3b]">¿Ya tienes cuenta? <a href="/login" className="font-semibold hover:underline">Inicia sesión</a></span>
      </div>
    </div>
  );
};

export default RegisterPage; 