import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPassword } from './validations';
import { authService } from '../features/auth/services/authServices';
import { useAuth } from './contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatNumberInput, formatNumber } from './utils/formatters';

const tiposDocumento = [
  { value: 'RC', label: 'Registro Civil' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PP', label: 'Pasaporte' },
];

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const { currentUser, setCurrentUser } = useAuth();
  const user = currentUser || (JSON.parse(localStorage.getItem('currentUser')) || {});
  
  const [form, setForm] = useState({
    nombre: user.nombre || '',
    tipoDocumento: user.tipo_documento || 'CC',
    documento: user.documento || '',
    correo: user.correo || '',
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    password: '',
    confirmPassword: '',
    foto: user.foto || user.avatar || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = e => {
    const val = e.target.value.replace(/\D/g, '');
    setForm(prev => ({ ...prev, telefono: val }));
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen es muy pesada (máx 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(prev => ({ ...prev, foto: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validaciones básicas
    if (form.documento.length < 5) {
      toast.error('Número de documento muy corto');
      return;
    }

    if (form.password || form.confirmPassword) {
      if (!isValidPassword(form.password)) {
        toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Las contraseñas no coinciden.');
        return;
      }
    }

    setLoading(true);
    const profileData = {
      nombre: form.nombre,
      tipo_documento: form.tipoDocumento,
      documento: form.documento,
      correo: form.correo,
      telefono: form.telefono.startsWith('+') ? form.telefono : `+${form.telefono}`,
      direccion: form.direccion,
      foto: form.foto,
      ...(form.password ? { contrasena: form.password } : {})
    };

    try {
      const response = await authService.editProfile(profileData);
      if (response && response.success) {
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        if (setCurrentUser) setCurrentUser(updatedUser);
        window.dispatchEvent(new Event('user-auth-changed'));
        toast.success('¡Perfil actualizado con éxito!');
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(response?.message || 'No se pudo actualizar el perfil.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      {/* Header Estilizado */}
      <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] h-48 w-full relative">
        <div className="max-w-5xl mx-auto px-6 pt-8 flex items-center justify-between text-white">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-md transition-all font-semibold"
          >
            <i className="bi bi-arrow-left"></i>
            Volver
          </button>
          <h1 className="text-2xl font-bold drop-shadow-md">Mi Perfil</h1>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto -mt-20 px-4 pb-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 md:p-12">
            
            {/* Sección de Foto */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg border-2 border-yellow-400/30">
                  {form.foto ? (
                    <img src={form.foto} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-full h-full flex items-center justify-center">
                      <i className="bi bi-person-fill text-6xl text-gray-500"></i>
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-[#FACC15] hover:bg-yellow-400 text-gray-900 p-2.5 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110"
                >
                  <i className="bi bi-camera-fill"></i>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4 italic">Formato JPG, PNG o WebP. Máx 2MB.</p>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Bloque: Información Personal */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                  <i className="bi bi-person-badge text-yellow-500 text-xl"></i>
                  <h2 className="text-lg font-bold text-gray-800">Información Personal</h2>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5 transition-colors group-focus-within:text-yellow-600">Nombre Completo</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i className="bi bi-person"></i></span>
                    <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#FACC15] focus:bg-white outline-none transition-all" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Tipo Doc.</label>
                    <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-[#FACC15] outline-none">
                      {tiposDocumento.map(tipo => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">N° Documento</label>
                    <input name="documento" value={form.documento} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FACC15] outline-none" />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                    <i className="bi bi-shield-lock text-yellow-500 text-xl"></i>
                    <h2 className="text-lg font-bold text-gray-800">Seguridad</h2>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Nueva Contraseña</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FACC15] outline-none" placeholder="Opcional..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Confirmar Contraseña</label>
                    <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FACC15] outline-none" placeholder="Opcional..." />
                  </div>
                </div>
              </div>

              {/* Bloque: Contacto */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                  <i className="bi bi-telephone text-yellow-500 text-xl"></i>
                  <h2 className="text-lg font-bold text-gray-800">Contacto</h2>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Correo Electrónico</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i className="bi bi-envelope"></i></span>
                    <input type="email" name="correo" value={form.correo} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#FACC15] outline-none" required />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Número de Teléfono</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i className="bi bi-phone"></i></span>
                    <input name="telefono" value={form.telefono} onChange={handlePhoneChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#FACC15] outline-none" placeholder="3001234567" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Dirección de Residencia</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><i className="bi bi-geo-alt"></i></span>
                    <textarea name="direccion" value={form.direccion} onChange={handleChange} rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#FACC15] outline-none resize-none" placeholder="Calle, Carrera, Barrio..."></textarea>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="bg-gray-50 px-8 py-6 flex justify-end items-center gap-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="text-gray-500 hover:text-gray-700 font-semibold px-4 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-900 rounded-xl font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  Actualizar Perfil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile; 
