import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEmail, isValidPassword, isValidCustomerName, validatePasswordConfirmation } from '../../../shared/validations';
import toast from 'react-hot-toast';
import StepIndicator from '../components/StepIndicator';
import FormField from '../components/FormField';
import PasswordRequirements from '../../../shared/components/PasswordRequirements';
import { authService } from '../services/authServices';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { getDocOptions } from '../../../shared/constants/documentTypes';

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
  const [checkingUniqueness, setCheckingUniqueness] = useState({ documento: false, correo: false });
  const [numero, setNumero] = useState('');

  const validate = (name, value) => {
    switch (name) {
      case 'nombre':
        return isValidCustomerName(value) ? '' : 'Nombre inválido';
      case 'correo':
        if (!isValidEmail(value)) return 'Correo inválido';
        return '';
      case 'telefono':
        if (!numero) return 'El teléfono es requerido';
        if (numero.length < 7 || numero.length > 15) return 'El teléfono debe tener entre 7 y 15 dígitos';
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
        return value ? (isValidPassword(value) ? '' : 'Contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo (@$!%?&#)') : 'Campo obligatorio';
      case 'confirmPassword':
        return validatePasswordConfirmation(form.password, value).confirmarContrasena || '';
      default:
        return value.trim() ? '' : 'Campo obligatorio';
    }
  };

  const checkUniqueness = async (field, value) => {
    if (!value || error[field]) return; // Si hay error de formato o vacío, no verificar
    
    setCheckingUniqueness(prev => ({ ...prev, [field]: true }));
    try {
      const isUnique = await authService.checkUniqueness(field, value);
      if (!isUnique) {
        setError(prev => ({ 
          ...prev, 
          [field]: `El ${field === 'documento' ? 'número de documento' : 'correo electrónico'} ya está registrado` 
        }));
      }
    } catch (err) {
      console.error('Error checking uniqueness:', err);
    } finally {
      setCheckingUniqueness(prev => ({ ...prev, [field]: false }));
    }
  };

  const step1Fields = ['nombre', 'tipoDocumento', 'documento'];
  const step2Fields = ['telefono', 'correo'];
  const step3Fields = ['password', 'confirmPassword'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Restricción para documento: solo números si no es pasaporte
    if (name === 'documento' && form.tipoDocumento !== 'Pasaporte') {
      if (/[^0-9]/.test(value)) return; // Ignorar caracteres no numéricos
    }

    const err = validate(name, value);
    setError(prev => ({ ...prev, [name]: err }));
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validate(name, value);
    setError(prev => ({ ...prev, [name]: err }));
    
    if (!err && (name === 'documento' || name === 'correo')) {
      checkUniqueness(name, value);
    }
  };

  const validateStep = () => {
    const fields = step === 1 ? step1Fields : step === 2 ? step2Fields : step3Fields;
    let valid = true;
    let newError = {};
    for (const key of fields) {
      if (key === 'telefono') {
        const err = validate('telefono', numero);
        if (err) {
          newError.telefono = err;
          valid = false;
        }
      } else {
        const err = validate(key, form[key]);
        if (err) {
          newError[key] = err;
          valid = false;
        }
      }
    }
    setError(prev => ({ ...prev, ...newError }));
    return valid;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) setStep(step + 1);
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    const registerPromise = (async () => {
      console.log('📝 Registrando nuevo usuario...');

      const userData = {
        nombre: form.nombre.trim(),
        correo: form.correo.trim().toLowerCase(),
        contrasena: form.password,
        tipo_documento: form.tipoDocumento,
        documento: form.documento.trim(),
        telefono: '+' + numero
      };

      const response = await authService.register(userData);

      console.log('✅ Usuario registrado exitosamente:', response);

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
      setNumero('');
      setStep(1);

      // Redirigir al login después de un breve delay
      setTimeout(() => navigate('/iniciar-sesion'), 3000);

      return response;
    })();

    toast.promise(registerPromise, {
      loading: 'Registrando usuario...',
      success: '¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.',
      error: (err) => {
        console.error('❌ Error en registro:', err);

        let errorMsg = 'Error al registrar usuario. Intenta de nuevo.';

        if (err.response?.status === 409) {
          errorMsg = err.response?.data?.message || 'El correo o documento ya están registrados';
        } else if (err.response?.status === 400) {
          errorMsg = err.response?.data?.message || 'Datos inválidos. Verifica la información proporcionada.';
        } else if (err.response?.status === 422) {
          errorMsg = 'Datos de registro inválidos. Verifica todos los campos.';
        } else if (err.response?.status === 500) {
          errorMsg = 'Error del servidor. Si el problema persiste, contacta al soporte.';
        }

        return errorMsg;
      },
    });

    try {
      await registerPromise;
    } catch {
      // Error ya manejado por toast.promise
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex font-inter relative overflow-hidden register-page-container">
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
                ¡Bienvenido!
              </h1>

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
                <h2 className="text-3xl font-bold text-[#6d3b3b] mb-2">Regístrate</h2>
              </div>

                {/* Formulario */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                  <StepIndicator currentStep={step} totalSteps={3} />
                  <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-6">
                    {step === 1 && (
                      <>
                        <FormField
                          label="Nombre completo"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={error.nombre}
                          icon="bi-person"
                          placeholder="Tu nombre completo"
                          required
                          disabled={loading}
                        />
                        <FormField
                          label="Tipo de documento"
                          name="tipoDocumento"
                          type="select"
                          value={form.tipoDocumento}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={error.tipoDocumento}
                          icon="bi-card-list"
                          required
                          disabled={loading}
                          options={getDocOptions()}
                        />
                        <FormField
                          label="Documento"
                          name="documento"
                          value={form.documento}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={error.documento}
                          icon="bi-file-earmark-text"
                          placeholder="Número de documento"
                          required
                          disabled={loading}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleBack}
                            className="flex-1 bg-gray-200 text-[#6d3b3b] py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={loading}
                          >
                            <i className="bi bi-arrow-left"></i>
                            Atrás
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#a0522d] to-[#7a3a1d] text-white py-4 rounded-xl font-semibold text-lg hover:from-[#8b4513] hover:to-[#654321] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={loading}
                          >
                            <i className="bi bi-arrow-right"></i>
                            Siguiente
                          </button>
                        </div>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#6d3b3b]">
                            Teléfono <span className="text-red-500">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"></div>
                            <PhoneInput
                              country={'co'}
                              value={numero}
                              onChange={(value) => {
                                setNumero(value);
                                const err = validate('telefono', value);
                                setError(prev => ({ ...prev, telefono: err }));
                              }}
                              onBlur={() => {
                                const err = validate('telefono', numero);
                                setError(prev => ({ ...prev, telefono: err }));
                              }}
                              inputClass={`w-full border-2 rounded-xl px-4 py-3 bg-white font-lato text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffb76b] focus:border-[#ffb76b] transition-all duration-200 ${error.telefono ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                              containerClass="w-full"
                              inputProps={{
                                name: 'telefono',
                                required: true,
                                placeholder: 'Ej: 3001234567',
                                disabled: loading,
                                'aria-invalid': error.telefono ? 'true' : 'false',
                                'aria-describedby': error.telefono ? 'telefono-error' : undefined
                              }}
                              specialLabel=""
                            />
                          </div>
                          {error.telefono && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-shake" id="telefono-error">
                              <div className="flex items-center gap-2">
                                <i className="bi bi-exclamation-triangle text-red-500 text-sm"></i>
                                <span className="text-red-700 text-sm">{error.telefono}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <FormField
                          label="Correo electrónico"
                          name="correo"
                          type="email"
                          value={form.correo}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={error.correo}
                          icon="bi-envelope"
                          placeholder="tu@email.com"
                          required
                          disabled={loading}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleBack}
                            className="flex-1 bg-gray-200 text-[#6d3b3b] py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={loading}
                          >
                            <i className="bi bi-arrow-left"></i>
                            Atrás
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#a0522d] to-[#7a3a1d] text-white py-4 rounded-xl font-semibold text-lg hover:from-[#8b4513] hover:to-[#654321] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={loading}
                          >
                            <i className="bi bi-arrow-right"></i>
                            Siguiente
                          </button>
                        </div>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        <FormField
                          label="Contraseña"
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={error.password}
                          icon="bi-lock"
                          placeholder="••••••••"
                          required
                          disabled={loading}
                          showPassword={showPassword}
                          onTogglePassword={() => setShowPassword(v => !v)}
                        />
                        <PasswordRequirements password={form.password} />
                        <FormField
                          label="Confirmar contraseña"
                          name="confirmPassword"
                          type="password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={error.confirmPassword}
                          icon="bi-lock-fill"
                          placeholder="••••••••"
                          required
                          disabled={loading}
                          showPassword={showConfirmPassword}
                          onTogglePassword={() => setShowConfirmPassword(v => !v)}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleBack}
                            className="flex-1 bg-gray-200 text-[#6d3b3b] py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={loading}
                          >
                            <i className="bi bi-arrow-left"></i>
                            Atrás
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#a0522d] to-[#7a3a1d] text-white py-4 rounded-xl font-semibold text-lg hover:from-[#8b4513] hover:to-[#654321] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Registrando...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-person-plus"></i>
                                Registrarme
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>

                {/* Separador */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                </div>

                {/* Registro */}
                <div className="text-center">
                  <span className="text-gray-600">¿Ya tienes cuenta? </span>
                  <a
                    href="/iniciar-sesion"
                    className="text-[#a0522d] hover:text-[#7a3a1d] font-semibold transition-colors duration-200 hover:underline"
                  >
                    Inicia sesión aquí
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-[#6d3b3b]/50">
            <p>© 2024 CAPEX. Todos los derechos reservados.</p>
          </div>

          <style >{`
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
    </>
  );
};

export default RegisterPage;
