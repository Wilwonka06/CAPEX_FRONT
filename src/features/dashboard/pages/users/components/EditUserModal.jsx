import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PasswordEye from '../../../../../shared/components/PasswordEye';
import { isValidEmail, isValidPhone, isValidNumber, isValidPassword } from '../../../../../shared/validations';
import { getRoles } from '../../../../../shared/services/ModuleDataService';

const ESTADOS = ['Activo', 'Inactivo', 'Vacaciones','Suspendido', 'Enfermo', 'Incapacitado','Luto', 'Fallecido'];
const DOC_TYPES = ['CC', 'PPT','TI'];

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

const EditUserModal = ({ onClose, onEdit, user, users }) => {
  const [form, setForm] = useState({ ...user, password: '', confirmPassword: '', roles: user.roles || [] });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [preview, setPreview] = useState(user.avatarCompressed || '');
  const [error, setError] = useState({});

  useEffect(() => {
    getRoles().then(roles => {
      setAvailableRoles(roles.filter(r => r.estado === 'Activo'));
    });
  }, []);

  // Validaciones instantáneas
  const validate = (name, value) => {
    switch (name) {
      case 'correo':
        return isValidEmail(value) ? '' : 'Correo inválido';
      case 'telefono':
        return isValidPhone(value) ? '' : 'Teléfono inválido';
      case 'documento':
        return isValidNumber(value) ? '' : 'Documento inválido';
      case 'password':
        return value ? (isValidPassword(value) ? '' : 'Contraseña débil') : '';
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
    for (const key of ['tipoDocumento','documento','nombre','telefono','roles','correo','estado']) {
      const err = validate(key, form[key]);
      if (err) {
        newError[key] = err;
        valid = false;
      }
    }
    // Si se está cambiando la contraseña, validar ambas
    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        newError.confirmPassword = 'Las contraseñas no coinciden';
        valid = false;
      }
      if (!isValidPassword(form.password)) {
        newError.password = 'Contraseña débil';
        valid = false;
      }
    }
    if (!valid) {
      setError(newError);
      return;
    }
    // Procesar imagen si hay
    let avatarCompressed = form.avatarCompressed;
    let avatar = form.avatar;
    if (form.avatar && form.avatar instanceof File) {
      avatarCompressed = await compressImageToBase64(form.avatar, 80, 80, 0.6); // baja calidad
      avatar = await compressImageToBase64(form.avatar, 300, 300, 0.92); // mejor calidad
    }
    // Actualizar usuario
    const updatedUser = {
      ...form,
      avatar,
      avatarCompressed,
    };
    onEdit(updatedUser);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, avatar: '', avatarCompressed: '' }));
    setPreview('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Editar usuario</h2>
          <button className="text-gray-400 hover:text-primary text-xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-8 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">Foto de perfil</label>
              <div className="space-y-3">
                <div
                  className="relative w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => document.getElementById('edit-user-avatar-input').click()}
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
                <input id="edit-user-avatar-input" type="file" accept="image/*" onChange={handleChange} name="avatar" className="hidden" />
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
                <input type="text" name="telefono" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.telefono} onChange={handleChange} onBlur={handleBlur} required />
                {error.telefono && <span className="text-red-500 text-xs">{error.telefono}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Roles <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map(role => (
                    <label key={role.id} className="flex items-center gap-2 text-sm font-medium text-text-main">
                      <input
                        type="checkbox"
                        name="roles"
                        value={role.name}
                        checked={form.roles.includes(role.name)}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="accent-primary-dark"
                      />
                      {role.name}
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
                <label className="block text-xs font-medium text-text-main mb-1">Contraseña</label>
                <input type={showPassword ? 'text' : 'password'} name="password" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10" value={form.password} onChange={handleChange} onBlur={handleBlur} />
                <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                {error.password && <span className="text-red-500 text-xs">{error.password}</span>}
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-text-main mb-1">Confirmar contraseña</label>
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
                <PasswordEye visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                {error.confirmPassword && <span className="text-red-500 text-xs">{error.confirmPassword}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Estado <span className="text-red-500">*</span></label>
                <select name="estado" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.estado} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccionar</option>
                  {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                </select>
                {error.estado && <span className="text-red-500 text-xs">{error.estado}</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition" onClick={onClose}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-text-main text-white text-sm font-semibold hover:bg-primary-dark transition">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditUserModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
};

export default EditUserModal; 