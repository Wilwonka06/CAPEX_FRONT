import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PasswordEye from '../../../../../shared/components/PasswordEye';
import { isValidEmail, isValidPhone, isValidNumber, isValidPassword, validateUserDocument, validateUserPhone } from '../../../../../shared/validations';
import { API_ENDPOINTS } from '../../../../../shared/config/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Swal from 'sweetalert2';

const mergePrivileges = (roles) => {
  // roles: array de objetos de rol
  const merged = {};
  roles.forEach(role => {
    if (role.privileges) {
      Object.entries(role.privileges).forEach(([mod, actions]) => {
        if (!merged[mod]) merged[mod] = {};
        Object.entries(actions).forEach(([act, val]) => {
          // Usar OR lógico para combinar privilegios - si algún rol tiene el privilegio, se mantiene
          merged[mod][act] = merged[mod][act] || val;
        });
      });
    }
  });
  return merged;
};

// Función para obtener roles desde la API
const fetchRolesFromAPI = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.ROLES, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      // Mapear los datos de la API al formato del frontend
      return data.data.map(role => ({
        id: role.id_rol || role.id,
        name: role.nombre,
        descripcion: role.descripcion,
        estado: role.estado === true || role.estado === 'activo' ? 'Activo' : 'Inactivo',
        privileges: mapPermissionsFromBackend(role.permisos || [], role.privilegios || [])
      }));
    }

    throw new Error(data.message || 'Error al obtener los roles');
  } catch (error) {
    console.error('Error fetching roles from API:', error);
    throw error;
  }
};

// Función auxiliar para mapear permisos del backend
const mapPermissionsFromBackend = (backendPermissions, separatePrivileges) => {
  const frontendPermissions = {};

  if (!backendPermissions || !Array.isArray(backendPermissions) || backendPermissions.length === 0) {
    return frontendPermissions;
  }

  if (backendPermissions[0] && backendPermissions[0].privilegios) {
    backendPermissions.forEach(permiso => {
      const modulo = permiso.nombre;
      frontendPermissions[modulo] = {};

      if (Array.isArray(permiso.privilegios)) {
        permiso.privilegios.forEach(privilegio => {
          frontendPermissions[modulo][privilegio.nombre] = true;
        });
      }
    });
  } else if (Array.isArray(separatePrivileges) && separatePrivileges.length > 0) {
    backendPermissions.forEach(permiso => {
      const modulo = permiso.nombre;
      frontendPermissions[modulo] = {};

      separatePrivileges.forEach(privilegio => {
        frontendPermissions[modulo][privilegio.nombre] = true;
      });
    });

    const allModules = ['Compras', 'Servicios', 'Venta', 'Configuración', 'Usuarios'];
    allModules.forEach(modulo => {
      if (!frontendPermissions[modulo]) {
        frontendPermissions[modulo] = {
          Create: false,
          Read: false,
          Edit: false,
          Delete: false
        };
      }
    });
  } else {
    backendPermissions.forEach(permiso => {
      const modulo = permiso.nombre;
      frontendPermissions[modulo] = {
        Create: false,
        Read: false,
        Edit: false,
        Delete: false
      };
    });
  }

  return frontendPermissions;
};

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

  // Parsear teléfono guardado
  const parseTelefono = (telefono) => {
    if (!telefono) return { countryCode: 'co', dialCode: '+57', number: '' };
    const match = telefono.match(/^(\+\d+)-(\d{4,15})$/);
    if (match) {
      return {
        countryCode: 'co', // puedes mejorar esto si guardas el país
        dialCode: match[1],
        number: match[2]
      };
    }
    return { countryCode: 'co', dialCode: '+57', number: '' };
  };
  const [country, setCountry] = useState({
    countryCode: parseTelefono(user.telefono).countryCode,
    dialCode: parseTelefono(user.telefono).dialCode,
  });
  const [numero, setNumero] = useState(parseTelefono(user.telefono).number);

  useEffect(() => {
    fetchRolesFromAPI().then(roles => {
      setAvailableRoles(roles.filter(r => r.estado === 'Activo'));
    }).catch(error => {
      console.error('Error loading roles:', error);
      // Fallback to empty array if API fails
      setAvailableRoles([]);
    });
  }, []);

  // Validaciones instantáneas
  const validate = (name, value) => {
    switch (name) {
      case 'correo':
        return isValidEmail(value) ? '' : 'Correo inválido';
      case 'telefono':
        return validateUserPhone(numero);
      case 'documento':
        return validateUserDocument(form.tipoDocumento, value);
      case 'tipoDocumento':
        if (!value.trim()) return 'Campo obligatorio';
        if (form.documento && users.some(u => u.tipoDocumento === value && u.documento === form.documento && u.id !== form.id)) return 'Ya existe un usuario con ese tipo y número de documento';
        return '';
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

    // Recalcular privilegios basados en los roles seleccionados
    const allRoles = await fetchRolesFromAPI();
    const userRoles = allRoles.filter(r => form.roles.includes(r.name));
    const privileges = mergePrivileges(userRoles);

    console.log('DEBUG - EditUserModal:');
    console.log('Roles seleccionados:', form.roles);
    console.log('Todos los roles disponibles:', allRoles);
    console.log('Roles filtrados para usuario:', userRoles);
    console.log('Privilegios calculados:', privileges);
    console.log('Privilegios actuales del usuario:', user.privileges);

    // Actualizar usuario
    const telefonoFinal = country.dialCode + '-' + numero;
    const updatedUser = {
      ...form,
      telefono: telefonoFinal,
      avatar,
      avatarCompressed,
      privileges,
    };
    // SweetAlert de confirmación
    const result = await Swal.fire({
      title: '¿Estás seguro de guardar los cambios?',
      text: 'Esta acción actualizará la información del usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      onEdit(updatedUser);
    }
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
                      // Validación en tiempo real
                      let err = '';
                      if (!/^\d{4,15}$/.test(val)) err = 'Debe tener entre 4 y 15 dígitos';
                      setError(prev => ({ ...prev, telefono: err }));
                    }}
                    onBlur={e => {
                      const val = e.target.value;
                      let err = '';
                      if (!/^\d{4,15}$/.test(val)) err = 'Debe tener entre 4 y 15 dígitos';
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
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-auto" style={{top: '50%', transform: 'translateY(-50%)'}}>
                <PasswordEye visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
                {error.password && <span className="text-red-500 text-xs">{error.password}</span>}
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-text-main mb-1">Confirmar contraseña</label>
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-auto" style={{top: '50%', transform: 'translateY(-50%)'}}>
                <PasswordEye visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                </div>
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