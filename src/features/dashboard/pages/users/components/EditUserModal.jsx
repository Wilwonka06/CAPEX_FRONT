import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isValidEmail, isValidPhone, isValidNumber, validateUserDocument, validateUserPhone } from '../../../../../shared/validations';
import usersService from '../API/usersService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../../shared/contexts/AuthContext';

const ESTADOS = ['Activo', 'Inactivo', 'Vacaciones','Suspendido', 'Enfermo', 'Incapacitado','Luto', 'Fallecido'];
const DOC_TYPES = ['Cedula de ciudadania', 'Cedula de extranjeria', 'Tarjeta de identidad', 'Pasaporte', 'NIT'];
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
  const [form, setForm] = useState({
    ...user,
    tipoDocumento: user.tipo_documento, // Map backend field to frontend field
    telefono: user.telefono, // Ensure telefono field is properly set
    roles: user.roleId ? [user.roleId.toString()] : [],
    conceptoEstado: user.concepto_estado || '' // Add concepto_estado field
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [preview, setPreview] = useState(user.avatarCompressed || '');
  const [error, setError] = useState({});
  const canModifyStatus = hasPrivilege('Gestión de Usuarios', 'Editar');

  // Parsear teléfono guardado
  const parseTelefono = (telefono) => {
    if (!telefono) return { countryCode: 'co', dialCode: '+57', number: '' };

    // Primero intentar el formato con guion (legacy)
    const matchWithDash = telefono.match(/^(\+\d+)-(\d{4,15})$/);
    if (matchWithDash) {
      return {
        countryCode: 'co', // puedes mejorar esto si guardas el país
        dialCode: matchWithDash[1],
        number: matchWithDash[2]
      };
    }

    // Si no tiene guion, intentar extraer código de país y número
    // Ejemplo: "+57123456789" -> dialCode: "+57", number: "123456789"
    const matchWithoutDash = telefono.match(/^(\+\d{1,3})(\d{4,15})$/);
    if (matchWithoutDash) {
      return {
        countryCode: 'co', // puedes mejorar esto si guardas el país
        dialCode: matchWithoutDash[1],
        number: matchWithoutDash[2]
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
        // Validar el teléfono completo (código de país + número)
        const telefonoCompleto = country.dialCode + numero;
        return validateUserPhone(telefonoCompleto);
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
      const err = validate(key, form[key]);
      if (err) {
        newError[key] = err;
        valid = false;
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

    const telefonoFinal = country.dialCode + numero;
    const updatedUser = {
      id_usuario: form.id_usuario || form.id,
      nombre: form.nombre,
      correo: form.correo,
      tipo_documento: form.tipoDocumento,
      documento: form.documento,
      telefono: telefonoFinal,
      roleId: parseInt(form.roles[0]) || form.roleId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
                      // Validación en tiempo real del número
                      let err = '';
                      if (val && !/^\d{4,15}$/.test(val)) {
                        err = 'El número debe tener entre 4 y 15 dígitos';
                      } else if (val && val.length >= 4) {
                        // Validar teléfono completo si tenemos suficientes dígitos
                        const telefonoCompleto = country.dialCode + val;
                        err = validateUserPhone(telefonoCompleto);
                      }
                      setError(prev => ({ ...prev, telefono: err }));
                    }}
                    onBlur={e => {
                      const val = e.target.value;
                      let err = '';
                      if (!/^\d{4,15}$/.test(val)) {
                        err = 'El número debe tener entre 4 y 15 dígitos';
                      } else {
                        // Validar teléfono completo
                        const telefonoCompleto = country.dialCode + val;
                        err = validateUserPhone(telefonoCompleto);
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