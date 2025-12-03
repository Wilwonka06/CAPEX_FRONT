import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isValidEmail, validateUserDocument, validateUserPhone } from '../../../../../shared/validations';
import { DOC_TYPES_CODES, DOC_TYPE_LABELS, toBackendDocCode } from '../../../../../shared/constants/documentTypes';
import usersService from '../API/usersService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAuth } from '../../../../../shared/contexts/AuthContext';
 

const ESTADOS = ['Activo', 'Inactivo', 'Vacaciones','Suspendido', 'Enfermo', 'Incapacitado','Luto', 'Fallecido'];
const CONCEPTOS_ESTADO = ['vacaciones', 'enfermo', 'licencia', 'suspensión', 'renuncia', 'Otro'];

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
  const { hasPrivilege } = useAuth();
  // Inicializar roles: usar roles múltiples si están disponibles, sino usar roleId
  const initialRoles = user.roles && Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles.map(role => role.id_rol?.toString() || role.toString())
    : (user.roleId ? [user.roleId.toString()] : []);
  
  const [form, setForm] = useState({
    ...user,
    tipoDocumento: user.tipo_documento, // Map backend field to frontend field
    telefono: user.telefono, // Ensure telefono field is properly set
    roles: initialRoles,
    conceptoEstado: user.concepto_estado || '' // Add concepto_estado field
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [preview, setPreview] = useState(user.avatarCompressed || '');
  const [error, setError] = useState({});
  const canModifyStatus = hasPrivilege('Gestión de Usuarios', 'Editar');

  // Parsear teléfono guardado
  const parseTelefono = (telefono) => {
    return telefono || '';
  };
  const [numero, setNumero] = useState(parseTelefono(user.telefono));

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
        return isValidEmail(value) ? '' : 'Correo inválido';
      case 'telefono':
        return validateUserPhone(value);
      case 'documento':
        return validateUserDocument(form.tipoDocumento, value);
      case 'tipoDocumento':
        if (!value.trim()) return 'Campo obligatorio';
        if (form.documento && users.some(u => (u.tipoDocumento || u.tipo_documento) === value && u.documento === form.documento && (u.id_usuario || u.id) !== (form.id_usuario || form.id))) return 'Ya existe un usuario con ese tipo y número de documento';
        return '';
      case 'roles':
        return value.length > 0 ? '' : 'Selecciona al menos un rol';
      case 'estado':
        return value ? '' : 'Campo obligatorio';
      case 'conceptoEstado':
        if (form.estado === 'Inactivo' && !value) {
          return 'El concepto de estado es obligatorio cuando el estado es Inactivo';
        }
        return '';
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
    // Validar conceptoEstado si es requerido
    if (form.estado === 'Inactivo') {
      const err = validate('conceptoEstado', form.conceptoEstado);
      if (err) {
        newError.conceptoEstado = err;
        valid = false;
      }
    }
    if (!valid) {
      setError(newError);
      return;
    }
    // Procesar imagen si hay
    let foto = form.foto;
    if (form.avatar && form.avatar instanceof File) {
      foto = await compressImageToBase64(form.avatar, 512, 512, 0.8);
    }

    const updatedUser = {
      id_usuario: form.id_usuario || form.id,
      nombre: form.nombre,
      correo: form.correo,
      tipo_documento: toBackendDocCode(form.tipoDocumento),
      documento: form.documento,
      telefono: numero,
      // Enviar array de roles para permitir múltiples roles
      roles: form.roles.map(r => parseInt(r)).filter(id => !isNaN(id) && id > 0),
      // También enviar roleId como el primer rol para compatibilidad
      roleId: form.roles.length > 0 ? parseInt(form.roles[0]) : form.roleId,
      estado: form.estado,
      ...(form.estado === 'Inactivo' && { concepto_estado: form.conceptoEstado }),
      ...(foto && { foto }), //
      ...(form.direccion && { direccion: form.direccion }),
    };

    onEdit(updatedUser);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, avatar: '', avatarCompressed: '' }));
    setPreview('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="bi bi-pencil-square text-lg"></i></div>
            <h2 className="text-xl font-bold m-0">Editar usuario</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-200" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form onSubmit={handleSubmit} id="edit-user-form" className="space-y-4">
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
                  {DOC_TYPES_CODES.map(type => <option key={type} value={type}>{`${type} - ${DOC_TYPE_LABELS[type]}`}</option>)}
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
              <div>
                <label className="block text-xs font-medium text-text-main mb-2">Roles <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
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
              <div>
                <label className="block text-xs font-medium text-text-main mb-1">Correo <span className="text-red-500">*</span></label>
                <input type="email" name="correo" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={form.correo} onChange={handleChange} onBlur={handleBlur} required />
                {error.correo && <span className="text-red-500 text-xs">{error.correo}</span>}
              </div>
              {canModifyStatus && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-text-main mb-1">Estado <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3 mb-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-main">
                        <input
                          type="radio"
                          name="estado"
                          value="Activo"
                          checked={form.estado === 'Activo'}
                          onChange={handleChange}
                          className="accent-green-500"
                        />
                        <span className="flex items-center gap-1">
                          Activo
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-main">
                        <input
                          type="radio"
                          name="estado"
                          value="Inactivo"
                          checked={form.estado === 'Inactivo'}
                          onChange={handleChange}
                          className="accent-gray-500"
                        />
                        <span className="flex items-center gap-1">
                          Inactivo
                        </span>
                      </label>
                    </div>
                    {error.estado && <span className="text-red-500 text-xs">{error.estado}</span>}
                  </div>
                  {form.estado === 'Inactivo' && (
                    <div>
                      <label className="block text-xs font-medium text-text-main mb-1">Concepto de estado <span className="text-red-500">*</span></label>
                      <select
                        name="conceptoEstado"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={form.conceptoEstado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required={form.estado === 'Inactivo'}
                      >
                        <option value="">Seleccionar concepto</option>
                        {CONCEPTOS_ESTADO.map(concepto => (
                          <option key={concepto} value={concepto}>
                            {concepto.charAt(0).toUpperCase() + concepto.slice(1)}
                          </option>
                        ))}
                      </select>
                      {error.conceptoEstado && <span className="text-red-500 text-xs">{error.conceptoEstado}</span>}
                    </div>
                  )}
                </>
              )}
            </div>
            
          </form>
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"><i className="bi bi-x-circle"></i>Cancelar</button>
          <button type="submit" form="edit-user-form" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-800 text-xs font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 ml-2" disabled={Object.values(error).some(Boolean)}><i className="bi bi-check-circle"></i>Guardar Cambios</button>
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
