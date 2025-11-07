import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PasswordEye from '../../../../../shared/components/PasswordEye';
import { isValidEmail, isValidPhone, isValidNumber, isValidPassword, validateUserDocument, validateUserPhone } from '../../../../../shared/validations';
import usersService from '../API/usersService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './phoneinput-search.css';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=128';
const DOC_TYPES = ['Cedula de ciudadania', 'Cedula de extranjeria', 'Tarjeta de identidad', 'Pasaporte', 'NIT'];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImageToBase64(file, maxWidth = 80, maxHeight = 80, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
    reader.readAsDataURL(file);
  });
}

const mergePrivileges = (roles) => {
  // roles: array de objetos de rol
  const merged = {};
  roles.forEach(role => {
    if (role.privileges) {
      Object.entries(role.privileges).forEach(([mod, actions]) => {
        if (!merged[mod]) merged[mod] = {};
        Object.entries(actions).forEach(([act, val]) => {
          merged[mod][act] = merged[mod][act] || val;
        });
      });
    }
  });
  return merged;
};

const CreateUserModal = ({ onClose, onCreate, users }) => {
  const [form, setForm] = useState({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    telefono: '',
    roles: [],
    correo: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    avatarCompressed: '',
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState({});
  const [country, setCountry] = useState({
    countryCode: 'co',
    dialCode: '+57',
  });
  const [numero, setNumero] = useState('');

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await usersService.getAvailableRoles();
        if (response.success) {
          setAvailableRoles(response.data || []);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
        setAvailableRoles([]);
      }
    };
    loadRoles();
  }, []);

  // Validaciones instantáneas
  const validate = (name, value) => {
    switch (name) {
      case 'correo':
        if (!isValidEmail(value)) return 'Correo inválido';
        if (users.some(u => u.correo === value)) return 'Correo ya registrado';
        return '';
      case 'telefono':
        // Validar que el número tenga al menos 7 dígitos (sin contar el código de país)
        if (!numero || numero.trim() === '' || numero.replace(/\D/g, '').length < 7) {
          return 'El teléfono es requerido y debe tener al menos 7 dígitos';
        }
        if (numero.replace(/\D/g, '').length > 15) {
          return 'El teléfono debe tener máximo 15 dígitos';
        }
        return '';
      case 'documento':
        return validateUserDocument(form.tipoDocumento, value);
      case 'tipoDocumento':
        if (!value.trim()) return 'Campo obligatorio';
        if (form.documento && users.some(u => u.tipoDocumento === value && u.documento === form.documento)) return 'Ya existe un usuario con ese tipo y número de documento';
        return '';
      case 'password':
        return value ? (isValidPassword(value) ? '' : 'Contraseña débil') : 'Campo obligatorio';
      case 'confirmPassword':
        return value === form.password ? '' : 'No coincide';
      case 'roles':
        return value.length > 0 ? '' : 'Selecciona al menos un rol';
      default:
        return value.trim() ? '' : 'Campo obligatorio';
    }
  };

  const handleChange = async (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === 'avatar' && files && files[0]) {
      setForm((prev) => ({ ...prev, avatar: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      setError((prev) => ({ ...prev, avatar: '' }));
      return;
    }
    if (name === 'roles') {
      let newRoles = [...form.roles];
      if (checked) {
        newRoles.push(value);
      } else {
        newRoles = newRoles.filter(r => r !== value);
      }
      setForm((prev) => ({ ...prev, roles: newRoles }));
      setError((prev) => ({ ...prev, roles: validate('roles', newRoles) }));
      return;
    }
    // Validación instantánea
    const err = validate(name, value);
    setError((prev) => ({ ...prev, [name]: err }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validate(name, value);
    setError((prev) => ({ ...prev, [name]: err }));
    if (err) setForm((prev) => ({ ...prev, [name]: name === 'roles' ? [] : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validar todos los campos obligatorios
    let valid = true;
    let newError = {};
    for (const key of ['tipoDocumento','documento','nombre','telefono','roles','correo','password','confirmPassword']) {
      const err = validate(key, form[key]);
      if (err) {
        newError[key] = err;
        valid = false;
      }
    }
    if (!valid) {
      setError(newError);
      return;
    }
    let foto = '';
    if (form.avatar && form.avatar instanceof File) {
      // Comprimir a 512x512 para mejor calidad en perfiles
      foto = await compressImageToBase64(form.avatar, 512, 512, 0.8);
    }

    const telefonoFinal = country.dialCode + numero;
    const newUser = {
      nombre: form.nombre,
      correo: form.correo,
      contrasena: form.password,
      tipo_documento: form.tipoDocumento,
      documento: form.documento,
      telefono: telefonoFinal,
      roleId: parseInt(form.roles[0]) || 1, // Asignar el primer rol seleccionado o rol por defecto
      estado: 'Activo',
      ...(foto && { foto }),
      ...(form.direccion && { direccion: form.direccion }),
    };

    onCreate(newUser);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, avatar: '', avatarCompressed: '' }));
    setPreview('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Crear usuario</h2>
          <button className="text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-8 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Foto de perfil</label>
              <div className="space-y-3">
                <div
                  className="relative w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => document.getElementById('create-user-avatar-input').click()}
                >
                  {preview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={preview} alt="Vista previa" className="max-h-20 max-w-full object-contain rounded-lg mx-auto" />
                      <button type="button" onClick={e => { e.stopPropagation(); removeImage(); }} className="absolute top-1 right-1 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors">×</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="bi bi-cloud-upload text-2xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-500 mb-1">Arrastra y suelta una imagen aquí</p>
                      <p className="text-xs text-gray-400">o haz clic para seleccionar</p>
                    </div>
                  )}
                </div>
                <input id="create-user-avatar-input" type="file" accept="image/*" onChange={handleChange} name="avatar" className="hidden" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Tipo de documento <span className="text-red-500">*</span></label>
                <select name="tipoDocumento" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.tipoDocumento} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccionar</option>
                  {DOC_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                {error.tipoDocumento && <span className="text-red-500 text-xs">{error.tipoDocumento}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Documento <span className="text-red-500">*</span></label>
                <input type="text" name="documento" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.documento} onChange={handleChange} onBlur={handleBlur} required />
                {error.documento && <span className="text-red-500 text-xs">{error.documento}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Nombre <span className="text-red-500">*</span></label>
                <input type="text" name="nombre" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.nombre} onChange={handleChange} onBlur={handleBlur} required />
                {error.nombre && <span className="text-red-500 text-xs">{error.nombre}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Teléfono <span className="text-red-500">*</span></label>
                <div className="flex gap-1 items-start">
                  <PhoneInput
                    country={country.countryCode}
                    value={country.dialCode}
                    onChange={(value, data) => {
                      setCountry({
                        countryCode: data.countryCode,
                        dialCode: '+' + data.dialCode
                      });
                    }}
                    inputProps={{
                      name: 'prefijo',
                      readOnly: true,
                      className: 'w-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 cursor-pointer',
                      style: { backgroundColor: '#f9fafb' }
                    }}
                    specialLabel=""
                    containerClass="w-28"
                    inputClass="w-full"
                    buttonClass=""
                    dropdownClass=""
                    enableSearch
                    disableCountryCode={false}
                    disableDropdown={false}
                    countryCodeEditable={false}
                    disableSearchIcon={false}
                    onlyCountries={['co','mx','cl','ar','pe','ve','ec','us','es']}
                  />
                  <input
                    type="text"
                    name="numero"
                    value={numero}
                    onChange={e => {
                      // Solo permitir dígitos
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setNumero(val.slice(0, 15));
                      // Validación en tiempo real del número
                      let err = '';
                      if (val && !/^\d{7,15}$/.test(val)) {
                        err = 'El número debe tener entre 7 y 15 dígitos';
                      }
                      setError(prev => ({ ...prev, telefono: err }));
                    }}
                    onBlur={e => {
                      const val = e.target.value;
                      let err = '';
                      if (!/^\d{7,15}$/.test(val)) {
                        err = 'El número debe tener entre 7 y 15 dígitos';
                      }
                      setError(prev => ({ ...prev, telefono: err }));
                    }}
                    className="w-70 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Número sin prefijo"
                    required
                    autoComplete="off"
                    maxLength={15}
                  />
                </div>
                {error.telefono && <span className="text-red-500 text-xs">{error.telefono}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Roles <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map(role => (
                    <label key={role.id_rol} className="flex items-center gap-2 text-sm font-medium text-text-main">
                      <input
                        type="checkbox"
                        name="roles"
                        value={role.id_rol.toString()}
                        checked={form.roles.includes(role.id_rol.toString())}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="accent-primary-dark"
                      />
                      {role.nombre}
                    </label>
                  ))}
                </div>
                {error.roles && <span className="text-red-500 text-xs">{error.roles}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Correo <span className="text-red-500">*</span></label>
                <input type="email" name="correo" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.correo} onChange={handleChange} onBlur={handleBlur} required />
                {error.correo && <span className="text-red-500 text-xs">{error.correo}</span>}
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-text-main mb-1">Contraseña <span className="text-red-500">*</span></label>
                <input type={showPassword ? 'text' : 'password'} name="password" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10" value={form.password} onChange={handleChange} onBlur={handleBlur} required />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-auto" style={{top: '50%', transform: 'translateY(-50%)'}}>
                <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
                {error.password && <span className="text-red-500 text-xs">{error.password}</span>}
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-text-main mb-1">Confirmar contraseña <span className="text-red-500">*</span></label>
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} required />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-auto" style={{top: '50%', transform: 'translateY(-50%)'}}>
                <PasswordEye visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                </div>
                {error.confirmPassword && <span className="text-red-500 text-xs">{error.confirmPassword}</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition" onClick={onClose}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition">Crear</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CreateUserModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
};

export default CreateUserModal; 