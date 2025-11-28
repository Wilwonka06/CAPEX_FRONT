import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPassword } from '../validations';

const tiposDocumento = ['Cedula de ciudadania', 'Cedula de extranjeria', 'Tarjeta de identidad', 'Pasaporte', 'NIT'];

const EditProfilePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser')) || {};
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    nombre: user.nombre || '',
    tipo_documento: user.tipo_documento || user.tipoDocumento || tiposDocumento[0],
    documento: user.documento || '',
    correo: user.correo || '',
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    password: '',
    confirmPassword: '',
    foto: user.foto || user.avatar || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Comprime una imagen a base64 con tamaño y calidad limitados
  const compressImage = (file, maxSize = 200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = ev => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height *= maxSize / width));
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width *= maxSize / height));
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async e => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 200, 0.7);
        setForm(prev => ({ ...prev, foto: compressed }));
      } catch (err) {
        setError('No se pudo procesar la imagen. Usa otro archivo.');
        err
      }
    }
  };

  // Función para obtener la ruta de redirección basada en el rol
  const getRoleRedirect = (role) => {
    const roleRedirects = {
      'administrador': '/dashboard',
      'empleado': '/dashboard',
      'cliente': '/landing',
    };
    return roleRedirects[role?.toLowerCase()] || '/landing';
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password || form.confirmPassword) {
      if (!isValidPassword(form.password)) {
        setError('La contraseña no es válida.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }
    // Actualizar usuario en localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const idx = usuarios.findIndex(u => u.correo === user.correo);
    if (idx === -1) {
      setError('Usuario no encontrado.');
      return;
    }
    const updatedUser = {
      ...usuarios[idx],
      nombre: form.nombre,
      tipo_documento: form.tipo_documento,
      documento: form.documento,
      correo: form.correo,
      telefono: form.telefono,
      direccion: form.direccion,
      foto: form.foto,
    };
    if (form.password) {
      updatedUser.password = form.password;
    }
    usuarios[idx] = updatedUser;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('user-auth-changed'));
    setSuccess('¡Datos actualizados correctamente!');
    setTimeout(() => {
      const role = updatedUser.rol || (Array.isArray(updatedUser.roles) ? updatedUser.roles[0] : updatedUser.roles);
      const redirectPath = getRoleRedirect(role);
      navigate(redirectPath, { replace: true });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center py-8 px-2">
      {/* Botón de regresar */}
      <div className="w-full max-w-7xl flex items-center mb-6">
        <button
          type="button"
          className="flex items-center gap-3 text-primary font-semibold hover:text-primary-dark transition-colors duration-200 text-lg group"
          onClick={() => navigate(-1)}
        >
          <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
            <i className="bi bi-arrow-left text-2xl"></i>
          </div>
          <span>Editar perfil</span>
        </button>
      </div>
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-yellow-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-primary-dark/5 rounded-full translate-y-12 -translate-x-12"></div>
        {/* Foto de perfil a la izquierda, centrada verticalmente */}
        <div className="flex md:flex-col items-center md:justify-center md:h-full md:min-h-[32rem] md:w-1/3 w-full relative z-10">
          <div className="relative w-56 h-56 mb-6 flex-shrink-0 group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <img
              src={form.foto || 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=256'}
              alt="Avatar"
              className="relative w-56 h-56 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-yellow-400/20"
            />
            <button
              type="button"
              className="absolute bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group/btn"
              onClick={() => fileInputRef.current.click()}
              title="Cambiar foto"
            >
              <i className="bi bi-camera text-xl group-hover/btn:scale-110 transition-transform duration-200"></i>
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} />

            {/* Indicador de estado online */}
            <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg">
              <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-text-main mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Cambiar foto
            </h1>
            <p className="text-gray-500 text-sm">Haz clic en el ícono de cámara para actualizar tu imagen</p>
          </div>
        </div>
        {/* Formulario en dos columnas */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-3 w-full">
            {/* Columna 1: Datos personales */}
            <div className="flex flex-col gap-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <i className="bi bi-person-fill text-white text-xl"></i>
                  </div>
                  <h2 className="font-bold text-primary text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Datos personales</h2>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Nombre completo</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                      <i className="bi bi-person-fill text-lg"></i>
                    </div>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      required
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Tipo de documento</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10">
                      <i className="bi bi-card-text text-lg"></i>
                    </div>
                    <select
                      name="tipo_documento"
                      value={form.tipo_documento}
                      onChange={(e) => setForm(prev => ({ ...prev, tipo_documento: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md appearance-none"
                    >
                      {tiposDocumento.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <i className="bi bi-chevron-down text-lg"></i>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Documento</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                      <i className="bi bi-credit-card-fill text-lg"></i>
                    </div>
                    <input
                      name="documento"
                      value={form.documento}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="Ingresa tu número de documento"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Columna 2: Contacto y contraseña */}
            <div className="flex flex-col gap-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                    <i className="bi bi-envelope-fill text-white text-xl"></i>
                  </div>
                  <h2 className="font-bold text-primary text-2xl bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Información de contacto</h2>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Correo electrónico</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200">
                      <i className="bi bi-envelope-fill text-lg"></i>
                    </div>
                    <input
                      name="correo"
                      value={form.correo}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-base bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Teléfono</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200">
                      <i className="bi bi-telephone-fill text-lg"></i>
                    </div>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-base bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Dirección</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200">
                      <i className="bi bi-geo-alt-fill text-lg"></i>
                    </div>
                    <input
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-base bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Contraseña (opcional)</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200">
                      <i className="bi bi-lock-fill text-lg"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-12 py-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-base bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      autoComplete="new-password"
                      placeholder="Nueva contraseña"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors duration-200"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-xl`}></i>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Confirmar contraseña</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200">
                      <i className="bi bi-shield-lock-fill text-lg"></i>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-12 py-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-base bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      autoComplete="new-password"
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(v => !v)}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} text-xl`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Botón de guardar */}
          <div className="flex flex-col md:flex-row justify-end items-center mt-12 gap-4 w-full">
            <div className="flex-1" />
            <div className="flex flex-col items-center md:items-end">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-3 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm mb-3 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>{success}</span>
                </div>
              )}
              <button
                type="submit"
                className="group relative px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <i className="bi bi-check-circle-fill text-xl group-hover:scale-110 transition-transform duration-200"></i>
                  Guardar cambios
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage; 