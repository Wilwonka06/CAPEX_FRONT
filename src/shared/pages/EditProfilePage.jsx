import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPassword } from '../validations';
import { authService } from '../../features/auth/services/authServices';

const tiposDocumento = ['Cedula de ciudadania', 'Cedula de extranjeria', 'Tarjeta de identidad', 'Pasaporte', 'NIT'];

const EditProfilePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser')) || {};
  const fileInputRef = useRef();

  // Initialize name parts
  const initialName = user.nombre || '';
  const firstSpaceIndex = initialName.indexOf(' ');
  const initialFirstName = firstSpaceIndex === -1 ? initialName : initialName.slice(0, firstSpaceIndex);
  const initialLastName = firstSpaceIndex === -1 ? '' : initialName.slice(firstSpaceIndex + 1);

  const [form, setForm] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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

  const handleRemovePhoto = () => {
    setForm(prev => ({ ...prev, foto: '' }));
  };

  const getRoleRedirect = (role) => {
    const roleRedirects = {
      'administrador': '/dashboard',
      'empleado': '/dashboard',
      'cliente': '/landing',
    };
    return roleRedirects[role?.toLowerCase()] || '/landing';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Validar contraseña si se está cambiando
    if (isChangingPassword && (form.password || form.confirmPassword)) {
      if (!isValidPassword(form.password)) {
        setError('La contraseña no es válida.');
        setIsSubmitting(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Preparar datos para enviar al backend
      const profileData = {
        nombre: `${form.firstName} ${form.lastName}`.trim(),
        tipo_documento: form.tipo_documento,
        documento: form.documento,
        correo: form.correo,
        telefono: form.telefono,
        direccion: form.direccion,
        foto: form.foto,
      };

      // Agregar contraseña solo si se está cambiando
      if (isChangingPassword && form.password) {
        profileData.contrasena = form.password;
      }

      // Llamar al servicio de autenticación para actualizar el perfil
      const response = await authService.editProfile(profileData);

      if (response && response.success && response.data) {
        // Actualizar el usuario en localStorage con los datos del servidor
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        window.dispatchEvent(new Event('user-auth-changed'));
        
        setSuccess('¡Datos actualizados correctamente!');
        
        setTimeout(() => {
          const updatedUser = response.data;
          const role = updatedUser.rol?.nombre || updatedUser.rol || 
                      (Array.isArray(updatedUser.roles) ? updatedUser.roles[0] : updatedUser.roles);
          const redirectPath = getRoleRedirect(role);
          navigate(redirectPath, { replace: true });
        }, 1200);
      } else {
        setError('No se pudo actualizar el perfil.');
      }
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      
      // Extraer mensaje de error del backend
      let errorMessage = 'Error al actualizar el perfil';
      
      if (err?.response?.data) {
        // El backend devolvió una respuesta estructurada
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
      } else if (err?.response?.status === 400) {
        // Error 400 sin datos - puede ser un problema de validación
        errorMessage = 'Error de validación. Verifica que todos los campos sean correctos.';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account</h1>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-gray-100 pb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 ring-4 ring-white shadow-md">
                  {form.foto ? (
                    <img src={form.foto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <i className="bi bi-person-fill text-5xl"></i>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Picture</h3>
                <p className="text-sm text-gray-500 mb-4">We support PNGs, JPEGs and GIFs under 10MB</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <i className="bi bi-upload mr-2"></i>
                    Upload Image
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {form.foto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="First Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Last Name"
                />
              </div>
            </div>

            {/* Email Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex gap-3">
                <div className="relative flex-grow">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-envelope text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    disabled={!isEmailEditable}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                      isEmailEditable 
                        ? 'border-gray-300 focus:ring-primary focus:border-primary' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmailEditable(!isEmailEditable)}
                  className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  {isEmailEditable ? 'Cancel Edit' : 'Edit Email'}
                </button>
              </div>
            </div>

            {/* Additional Information (Preserved but styled) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento</label>
                <select
                  name="tipo_documento"
                  value={form.tipo_documento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                >
                  {tiposDocumento.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                <input
                  name="documento"
                  value={form.documento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-500 mt-1">Log in with your password instead of using temporary login codes</p>
                </div>
                {!isChangingPassword && (
                   <button
                    type="button"
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Change Password
                  </button>
                )}
              </div>
              
              {isChangingPassword && (
                <div className="bg-gray-50 p-4 rounded-md space-y-4 transition-all duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex justify-end">
                     <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
                      }}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Cancel Password Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="bi bi-exclamation-circle text-red-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-sm">
                <div className="flex">
                   <div className="flex-shrink-0">
                    <i className="bi bi-check-circle text-green-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  Guardando...
                </>
              ) : (
                <>
                  Save
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
