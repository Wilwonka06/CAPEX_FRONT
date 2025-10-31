import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPassword } from '../../../shared/validations';

const tiposDocumento = ['Cédula', 'Pasaporte', 'RUT', 'DNI'];

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const user = JSON.parse(localStorage.getItem('currentUser')) || {};
  const [form, setForm] = useState({
    nombre: user.nombre || '',
    apellido: user.apellido || '',
    tipoDocumento: user.tipoDocumento || tiposDocumento[0],
    documento: user.documento || '',
    fechaNacimiento: user.fechaNacimiento || '',
    correo: user.correo || '',
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    password: '',
    confirmPassword: '',
    foto: user.foto || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(prev => ({ ...prev, foto: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Validar documento según tipo
    if (form.tipoDocumento === 'Pasaporte') {
      if (!/^[a-zA-Z0-9]{6,12}$/.test(form.documento)) {
        setError('Pasaporte inválido (6-12 caracteres alfanuméricos)');
        return;
      }
    } else {
      if (!/^[0-9]{1,12}$/.test(form.documento)) {
        setError('Documento inválido (máx 12 dígitos, solo números)');
        return;
      }
    }
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
      apellido: form.apellido,
      tipoDocumento: form.tipoDocumento,
      documento: form.documento,
      fechaNacimiento: form.fechaNacimiento,
      correo: form.correo,
      telefono: form.telefono,
      direccion: form.direccion,
      foto: form.foto,
      avatarCompressed: form.foto || usuarios[idx].avatarCompressed,
    };
    if (form.password) {
      updatedUser.password = form.password;
    }
    usuarios[idx] = updatedUser;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('user-auth-changed'));
    setSuccess('¡Datos actualizados correctamente!');
    setTimeout(() => navigate(-1), 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center p-4">
        <button onClick={() => navigate(-1)} className="text-2xl text-primary mr-2">&lt;</button>
        <h1 className="text-xl font-bold text-text-main font-montserrat">Editar perfil</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 overflow-hidden">
            {form.foto ? (
              <img src={form.foto} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <i className="bi bi-person text-6xl text-gray-400"></i>
            )}
          </div>
          <button type="button" className="text-primary hover:underline text-sm font-lato" onClick={() => fileInputRef.current.click()}>
            Cambiar foto
          </button>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} />
        </div>
        <div className="flex w-full flex-col md:flex-row gap-8">
          {/* Datos personales */}
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="font-semibold text-text-main mb-2 font-nunito">Datos personales</h2>
            <div>
              <label className="block text-sm font-medium font-lato">Nombre completo</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato" required />
            </div>
            <div>
              <label className="block text-sm font-medium font-lato">Tipo de documento</label>
              <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato">
                {tiposDocumento.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium font-lato">Documento</label>
              <input name="documento" value={form.documento} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato" />
            </div>
            <div>
              <label className="block text-sm font-medium font-lato">Fecha de nacimiento</label>
              <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato" />
            </div>
            <div>
              <label className="block text-sm font-medium font-lato">Contraseña (opcional)</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato" autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium font-lato">*Confirmar contraseña</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato" autoComplete="new-password" />
            </div>
          </div>
          {/* Información de contacto */}
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="font-semibold text-text-main mb-2 font-nunito">Información de contacto</h2>
            <div>
              <label className="block text-sm font-medium font-lato">Correo</label>
              <input name="correo" value={form.correo} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato" required />
            </div>
            <div>
              <label className="block text-sm font-medium font-lato">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato" />
            </div>
            <div>
              <label className="block text-sm font-medium font-lato">Dirección</label>
              <input name="direccion" value={form.direccion} onChange={handleChange} className="w-full border rounded px-3 py-2 font-lato" />
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm text-center mt-4 font-lato">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center mt-4 font-lato">{success}</div>}
        <div className="w-full flex justify-end mt-6">
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded shadow hover:bg-primary-dark transition font-semibold font-poppins">Actualizar datos</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile; 