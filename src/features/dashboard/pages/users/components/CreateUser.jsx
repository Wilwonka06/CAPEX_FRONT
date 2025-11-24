import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isValidEmail, validateUserDocument } from '../../../../../shared/validations';
import usersService from '../API/usersService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './phoneinput-search.css';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=128';
const ESTADOS = ['Activo', 'Inactivo', 'Vacaciones','Suspendido', 'Enfermo', 'Incapacitado','Luto', 'Fallecido'];
const DOC_TYPES = ['RC','TI','CC','TE','CE','NIT','PP','PEP','DIE','NUIP','FOREIGN_NIT'];

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
    avatar: '',
    avatarCompressed: '',
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState({});
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
        if (!numero) return 'El teléfono es requerido';
        if (numero.length < 7 || numero.length > 15) return 'El teléfono debe tener entre 7 y 15 dígitos';
        return '';
      case 'documento':
        return validateUserDocument(form.tipoDocumento, value);
      case 'tipoDocumento':
        if (!value.trim()) return 'Campo obligatorio';
        if (form.documento && users.some(u => u.tipoDocumento === value && u.documento === form.documento)) return 'Ya existe un usuario con ese tipo y número de documento';
        return '';
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
    for (const key of ['tipoDocumento','documento','nombre','telefono','roles','correo']) {
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
    if (!valid) {
      setError(newError);
      return;
    }
    let foto = '';
    if (form.avatar && form.avatar instanceof File) {
      // Comprimir a 512x512 para mejor calidad en perfiles
      foto = await compressImageToBase64(form.avatar, 512, 512, 0.8);
    }

    const newUser = {
      nombre: form.nombre,
      correo: form.correo,
      tipo_documento: form.tipoDocumento,
      documento: form.documento,
      telefono: '+' + numero,
      roleId: parseInt(form.roles[0]) || 1,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className=" shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-person-plus text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Crear usuario</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form onSubmit={handleSubmit} id="create-user-form" className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Foto de perfil</label>
              <div className="space-y-3">
                <div
                  className="relative w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => document.getElementById('create-user-avatar-input').click()}
                >
                  {preview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={preview} alt="Vista previa" className="max-h-24 max-w-full object-contain rounded-lg mx-auto" />
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
                <label className="block text-sm font-medium text-text-main mb-1">Tipo de documento <span className="text-red-500">*</span></label>
                <select name="tipoDocumento" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.tipoDocumento} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccionar</option>
                  {DOC_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                {error.tipoDocumento && <span className="text-red-500 text-xs">{error.tipoDocumento}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Documento <span className="text-red-500">*</span></label>
                <input type="text" name="documento" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.documento} onChange={handleChange} onBlur={handleBlur} required />
                {error.documento && <span className="text-red-500 text-xs">{error.documento}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Nombre <span className="text-red-500">*</span></label>
                <input type="text" name="nombre" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.nombre} onChange={handleChange} onBlur={handleBlur} required />
                {error.nombre && <span className="text-red-500 text-xs">{error.nombre}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Teléfono <span className="text-red-500">*</span></label>
                <PhoneInput
                  country={'co'}
                  value={numero}
                  onChange={(value) => {
                    setNumero(value);
                    const error = validate('telefono', value);
                    setError(prev => ({ ...prev, telefono: error }));
                  }}
                  inputClass={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-text-main text-sm ${error.telefono ? 'border-red-500' : 'border-gray-300'}`}
                  containerClass="w-full"
                  inputProps={{
                    name: 'telefono',
                    required: true,
                    placeholder: 'Ej: 3001234567',
                  }}
                  specialLabel=""
                />
                {error.telefono && <span className="text-red-500 text-xs mt-1 block">{error.telefono}</span>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main mb-2">Roles <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {availableRoles.map(role => (
                    <label
                      key={role.id_rol}
                      className="flex items-center gap-2 text-sm font-medium text-text-main cursor-pointer hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-white border border-transparent hover:border-gray-300"
                    >
                      <input
                        type="checkbox"
                        name="roles"
                        value={role.id_rol.toString()}
                        checked={form.roles.includes(role.id_rol.toString())}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="accent-primary-dark w-4 h-4 cursor-pointer"
                      />
                      <span>{role.nombre}</span>
                    </label>
                  ))}
                </div>
                {error.roles && <span className="text-red-500 text-xs mt-1 block">{error.roles}</span>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main mb-1">Correo <span className="text-red-500">*</span></label>
                <input type="email" name="correo" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.correo} onChange={handleChange} onBlur={handleBlur} required />
                {error.correo && <span className="text-red-500 text-xs">{error.correo}</span>}
              </div>
            </div>
            </div>
          
          </form>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <>
            <button type="button" className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2" onClick={onClose}><i className="bi bi-x-circle"></i>Cancelar</button>
            <button type="submit" form="create-user-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-sm font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2"><i className="bi bi-check-circle"></i>Crear</button>
          </>
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