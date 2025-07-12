import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPassword } from '../validations';

const tiposDocumento = ['Cédula', 'Pasaporte', 'RUT', 'DNI'];

const EditProfilePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser')) || {};
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    nombre: user.nombre || '',
    tipoDocumento: user.tipoDocumento || tiposDocumento[0],
    documento: user.documento || '',
    fechaNacimiento: user.fechaNacimiento || '',
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
      tipoDocumento: form.tipoDocumento,
      documento: form.documento,
      fechaNacimiento: form.fechaNacimiento,
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-8 px-2">
      {/* Botón de regresar */}
      <div className="w-full max-w-7xl flex items-center mb-4">
        <button
          type="button"
          className="flex items-center gap-2 text-primary font-semibold hover:underline text-lg"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left text-3xl"></i>
          Editar perfil
        </button>
      </div>
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-4 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Foto de perfil a la izquierda, centrada verticalmente */}
        <div className="flex md:flex-col items-center md:justify-center md:h-full md:min-h-[32rem] md:w-1/3 w-full">
          <div className="relative w-48 h-48 mb-4 flex-shrink-0">
            <img
              src={form.foto || 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=256'}
              alt="Avatar"
              className="w-48 h-48 rounded-full object-cover border-4 border-primary/20 shadow"
            />
            <button
              type="button"
              className="absolute bottom-3 right-3 bg-primary text-white rounded-full p-4 shadow hover:bg-primary-dark transition"
              onClick={() => fileInputRef.current.click()}
              title="Cambiar foto"
            >
              <i className="bi bi-camera text-xl"></i>
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} />
          </div>
          <h1 className="text-2xl font-bold text-text-main text-center md:text-left">Cambiar foto</h1>
        </div>
        {/* Formulario en dos columnas */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-3 w-full">
            {/* Columna 1: Datos personales */}
            <div className="flex flex-col gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-primary mb-4 text-xl">Datos personales</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nombre completo</label>
                  <div className="relative">
                    <i className="bi bi-person absolute left-3 top-3 text-gray-400 text-base"></i>
                    <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-primary outline-none text-base" required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Tipo de documento</label>
                  <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className="w-full border rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary outline-none text-base">
                    {tiposDocumento.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Documento</label>
                  <div className="relative">
                    <i className="bi bi-credit-card-2-front absolute left-3 top-3 text-gray-400 text-base"></i>
                    <input name="documento" value={form.documento} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-primary outline-none text-base" />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-2">Fecha de nacimiento</label>
                  <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} className="w-full border rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary outline-none text-base" />
                </div>
              </div>
            </div>
            {/* Columna 2: Contacto y contraseña */}
            <div className="flex flex-col gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-primary mb-4 text-xl">Información de contacto</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Correo</label>
                  <div className="relative">
                    <i className="bi bi-envelope absolute left-3 top-3 text-gray-400 text-base"></i>
                    <input name="correo" value={form.correo} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-primary outline-none text-base" required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <div className="relative">
                    <i className="bi bi-telephone absolute left-3 top-3 text-gray-400 text-base"></i>
                    <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-primary outline-none text-base" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Dirección</label>
                  <div className="relative">
                    <i className="bi bi-geo-alt absolute left-3 top-3 text-gray-400 text-base"></i>
                    <input name="direccion" value={form.direccion} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-primary outline-none text-base" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Contraseña (opcional)</label>
                  <div className="relative">
                    <i className="bi bi-lock absolute left-3 top-3 text-gray-400 text-base"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full border rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-primary outline-none text-base"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-3 text-gray-400 hover:text-primary"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-xl`}></i>
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-2">*Confirmar contraseña</label>
                  <div className="relative">
                    <i className="bi bi-lock-fill absolute left-3 top-3 text-gray-400 text-base"></i>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full border rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-primary outline-none text-base"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-3 text-gray-400 hover:text-primary"
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
          <div className="flex flex-col md:flex-row justify-end items-center mt-8 gap-2 w-full">
            <div className="flex-1" />
            <div className="flex flex-col items-center md:items-end">
              {error && <div className="text-red-500 text-xs text-center mb-1">{error}</div>}
              {success && <div className="text-green-600 text-xs text-center mb-1">{success}</div>}
              <button type="submit" className="px-8 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition font-bold text-lg mt-1 w-full max-w-xs">Guardar cambios</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage; 